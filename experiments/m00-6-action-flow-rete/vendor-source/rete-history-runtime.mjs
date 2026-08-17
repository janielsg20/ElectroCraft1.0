// Runtime-only transpilation of rete-history-plugin v2.2.0 and BaseAreaPlugin v2.3.2 for offline evidence.
import { NodeEditor, Scope } from './rete-runtime.mjs'

export class BaseAreaPlugin extends Scope {}

class History {
  active = false; produced = []; reserved = []
  constructor({ limit } = {}) { if (limit && typeof limit === 'number') this.limit = limit }
  add(action) { if (this.active) return; this.produced.push({ time: Date.now(), action }); if (this.limit && this.produced.length > this.limit) this.produced.shift(); this.reserved = [] }
  getRecent(ms) {
    const threshold = Date.now() - ms, list = []
    for (let i = this.produced.length - 1; i >= 0; i -= 1) { const record = this.produced[i]; if (record.time <= threshold || record.separated) break; list.push(record) }
    return list
  }
  removeRecent(predicate, ms) {
    const threshold = Date.now() - ms
    for (let i = this.produced.length - 1; i >= 0; i -= 1) { const record = this.produced[i]; if (record.time <= threshold || record.separated) break; if (predicate(record)) return this.produced.splice(i, 1)[0] }
  }
  async move(from, to, type) { const record = from.pop(); if (!record) return; this.active = true; await record.action[type](); to.push(record); this.active = false; return record }
  undo() { return this.move(this.produced, this.reserved, 'undo') }
  redo() { return this.move(this.reserved, this.produced, 'redo') }
  clear() { this.active = false; this.produced = []; this.reserved = [] }
}

export class HistoryPlugin extends Scope {
  history = new History({}); presets = []
  constructor(props) { super('history'); this.timing = props?.timing ?? 200 }
  setParent(scope) {
    super.setParent(scope); this.area = this.parentScope(BaseAreaPlugin); this.editor = this.area.parentScope(NodeEditor)
    this.presets.forEach(preset => preset.connect(this))
    this.editor.addPipe(context => { if (context.type === 'cleared') this.history.clear(); return context })
  }
  addPreset(preset) { this.presets.push(preset); if (this.area && this.editor) preset.connect(this) }
  add(action) { this.history.add(action) }
  getHistorySnapshot() { return [...this.history.produced] }
  getRecent(ms) { return this.history.getRecent(ms) }
  removeRecent(predicate, ms) { return this.history.removeRecent(predicate, ms ?? this.timing * 2) }
  clear() { this.history.clear() }
  separate() { const latest = this.history.produced.at(-1); if (latest) latest.separated = true }
  async undo() { const record = await this.history.undo(); if (record) { const latest = this.history.produced.at(-1); if (latest && !latest.separated && latest.time + this.timing > record.time) await this.undo() } }
  async redo() { const record = await this.history.redo(); if (record) { const latest = this.history.reserved.at(-1); if (latest && !record.separated && record.time + this.timing > latest.time) await this.redo() } }
}

class AddNodeAction {
  constructor(editor, area, nodeId) { this.editor = editor; this.area = area; this.nodeId = nodeId }
  async undo() { this.node = this.editor.getNode(this.nodeId); this.position = this.area.nodeViews.get(this.nodeId)?.position; await this.editor.removeNode(this.nodeId) }
  async redo() { if (this.node) await this.editor.addNode(this.node); if (this.node && this.position) await this.area.translate(this.node.id, this.position) }
}
class RemoveNodeAction {
  constructor(editor, area, node, position) { this.editor = editor; this.area = area; this.node = node; this.position = position }
  async undo() { await this.editor.addNode(this.node); await this.area.translate(this.node.id, this.position) }
  async redo() { await this.editor.removeNode(this.node.id) }
}
class AddConnectionAction {
  constructor(editor, connection) { this.editor = editor; this.connection = connection }
  async undo() { await this.editor.removeConnection(this.connection.id) }
  async redo() { await this.editor.addConnection(this.connection) }
}
class RemoveConnectionAction {
  constructor(editor, connection) { this.editor = editor; this.connection = connection }
  async undo() { await this.editor.addConnection(this.connection) }
  async redo() { await this.editor.removeConnection(this.connection.id) }
}

function classicSetup(props) {
  return { connect(history) {
    const nodes = new Map(), positions = new Map()
    const area = history.parentScope(BaseAreaPlugin), editor = area.parentScope(NodeEditor)
    editor.addPipe(context => {
      if (context.type === 'nodecreated') { const { id } = context.data; history.add(new AddNodeAction(editor, area, id)); nodes.set(id, editor.getNode(id)) }
      if (context.type === 'noderemoved') { const { id } = context.data; const node = nodes.get(id); const position = positions.get(id); if (!node) throw new Error('node'); if (!position) throw new Error('position' + id); history.add(new RemoveNodeAction(editor, area, node, position)); positions.delete(id); nodes.delete(id) }
      return context
    })
    area.addPipe(context => { if (context?.type === 'nodetranslated') positions.set(context.data.id, context.data.position); return context })
    const connections = new Map()
    editor.addPipe(context => {
      if (context.type === 'connectioncreated') { const connection = editor.getConnection(context.data.id); history.add(new AddConnectionAction(editor, connection)); connections.set(context.data.id, connection) }
      if (context.type === 'connectionremoved') { const connection = connections.get(context.data.id); if (connection) history.add(new RemoveConnectionAction(editor, connection)) }
      return context
    })
  } }
}
export const Presets = { classic: { setup: classicSetup } }

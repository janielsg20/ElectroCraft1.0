// Runtime-only transpilation of official Rete v2.0.6 source for offline evidence.
// Product code MUST import npm package `rete`; this file is an evidence harness only.
export function getUID() {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export class Signal {
  pipes = []
  addPipe(pipe) { this.pipes.push(pipe) }
  async emit(context) {
    let current = context
    for (const pipe of this.pipes) {
      current = await pipe(current)
      if (typeof current === 'undefined') return
    }
    return current
  }
}

export class Scope {
  signal = new Signal()
  parent
  constructor(name) { this.name = name }
  addPipe(middleware) { this.signal.addPipe(middleware) }
  use(scope) {
    if (!(scope instanceof Scope)) throw new Error('cannot use non-Scope instance')
    scope.setParent(this)
    this.addPipe(context => scope.signal.emit(context))
    return { debug() {} }
  }
  setParent(scope) { this.parent = scope }
  emit(context) { return this.signal.emit(context) }
  hasParent() { return Boolean(this.parent) }
  parentScope(type) {
    if (!this.parent) throw new Error('cannot find parent')
    if (type && this.parent instanceof type) return this.parent
    if (type) throw new Error('actual parent is not instance of type')
    return this.parent
  }
}

export class NodeEditor extends Scope {
  nodes = []
  connections = []
  constructor() { super('NodeEditor') }
  getNode(id) { return this.nodes.find(node => node.id === id) }
  getNodes() { return this.nodes.slice() }
  getConnections() { return this.connections.slice() }
  getConnection(id) { return this.connections.find(connection => connection.id === id) }
  async addNode(data) {
    if (this.getNode(data.id)) throw new Error('node has already been added')
    if (!await this.emit({ type: 'nodecreate', data })) return false
    this.nodes.push(data)
    await this.emit({ type: 'nodecreated', data })
    return true
  }
  async addConnection(data) {
    if (this.getConnection(data.id)) throw new Error('connection has already been added')
    if (!await this.emit({ type: 'connectioncreate', data })) return false
    this.connections.push(data)
    await this.emit({ type: 'connectioncreated', data })
    return true
  }
  async removeNode(id) {
    const node = this.nodes.find(n => n.id === id)
    if (!node) throw new Error('cannot find node')
    if (!await this.emit({ type: 'noderemove', data: node })) return false
    this.nodes.splice(this.nodes.indexOf(node), 1)
    await this.emit({ type: 'noderemoved', data: node })
    return true
  }
  async removeConnection(id) {
    const connection = this.connections.find(c => c.id === id)
    if (!connection) throw new Error('cannot find connection')
    if (!await this.emit({ type: 'connectionremove', data: connection })) return false
    this.connections.splice(this.connections.indexOf(connection), 1)
    await this.emit({ type: 'connectionremoved', data: connection })
    return true
  }
  async clear() {
    if (!await this.emit({ type: 'clear' })) { await this.emit({ type: 'clearcancelled' }); return false }
    for (const connection of this.connections.slice()) await this.removeConnection(connection.id)
    for (const node of this.nodes.slice()) await this.removeNode(node.id)
    await this.emit({ type: 'cleared' })
    return true
  }
}

class Socket { constructor(name) { this.name = name } }
class Port {
  constructor(socket, label, multipleConnections) { this.socket = socket; this.label = label; this.multipleConnections = multipleConnections; this.id = getUID() }
}
class Input extends Port {
  control = null; showControl = true
  constructor(socket, label, multipleConnections) { super(socket, label, multipleConnections) }
  addControl(control) { if (this.control) throw new Error('control already added for this input'); this.control = control }
  removeControl() { this.control = null }
}
class Output extends Port { constructor(socket, label, multipleConnections) { super(socket, label, multipleConnections !== false) } }
class Control { constructor() { this.id = getUID() } }
class Node {
  inputs = {}; outputs = {}; controls = {}
  constructor(label) { this.label = label; this.id = getUID() }
  hasInput(key) { return Object.prototype.hasOwnProperty.call(this.inputs, key) }
  addInput(key, input) { if (this.hasInput(key)) throw new Error(`input with key '${String(key)}' already added`); Object.defineProperty(this.inputs, key, { value: input, enumerable: true, configurable: true }) }
  removeInput(key) { delete this.inputs[key] }
  hasOutput(key) { return Object.prototype.hasOwnProperty.call(this.outputs, key) }
  addOutput(key, output) { if (this.hasOutput(key)) throw new Error(`output with key '${String(key)}' already added`); Object.defineProperty(this.outputs, key, { value: output, enumerable: true, configurable: true }) }
  removeOutput(key) { delete this.outputs[key] }
  hasControl(key) { return Object.prototype.hasOwnProperty.call(this.controls, key) }
  addControl(key, control) { if (this.hasControl(key)) throw new Error(`control with key '${String(key)}' already added`); Object.defineProperty(this.controls, key, { value: control, enumerable: true, configurable: true }) }
  removeControl(key) { delete this.controls[key] }
}
class Connection {
  constructor(source, sourceOutput, target, targetInput) {
    if (!source.outputs[sourceOutput]) throw new Error(`source node doesn't have output with a key ${String(sourceOutput)}`)
    if (!target.inputs[targetInput]) throw new Error(`target node doesn't have input with a key ${String(targetInput)}`)
    this.id = getUID(); this.source = source.id; this.target = target.id; this.sourceOutput = sourceOutput; this.targetInput = targetInput
  }
}
export const ClassicPreset = { Socket, Port, Input, Output, Control, Node, Connection }

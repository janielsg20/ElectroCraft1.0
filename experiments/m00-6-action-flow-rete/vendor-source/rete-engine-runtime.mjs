// Runtime-only transpilation of rete-engine v2.1.1 source for offline evidence.
import { NodeEditor, Scope } from './rete-runtime.mjs'

class ControlFlow {
  setups = new Map()
  constructor(editor) { this.editor = editor }
  add(node, setup) { if (this.setups.get(node.id)) throw new Error('already processed'); this.setups.set(node.id, setup) }
  remove(nodeId) { this.setups.delete(nodeId) }
  execute(nodeId, input) {
    const setup = this.setups.get(nodeId)
    if (!setup) throw new Error('node is not initialized')
    const inputKeys = setup.inputs()
    if (input && !inputKeys.includes(input)) throw new Error("inputs don't have a key")
    setup.execute(input, output => {
      const outputKeys = setup.outputs()
      if (!outputKeys.includes(output)) throw new Error("outputs don't have a key")
      const cons = this.editor.getConnections().filter(c => c.source === nodeId && c.sourceOutput === output)
      cons.forEach(con => this.execute(con.target, con.targetInput))
    })
  }
}

export class ControlFlowEngine extends Scope {
  constructor(configure) {
    super('control-flow-engine'); this.configure = configure
    this.addPipe(context => {
      if (context.type === 'nodecreated') this.add(context.data)
      if (context.type === 'noderemoved') this.remove(context.data)
      return context
    })
  }
  setParent(scope) { super.setParent(scope); this.editor = this.parentScope(NodeEditor); this.controlflow = new ControlFlow(this.editor) }
  add(node) {
    const options = this.configure ? this.configure(node) : { inputs: () => Object.keys(node.inputs), outputs: () => Object.keys(node.outputs) }
    this.controlflow.add(node, { inputs: options.inputs, outputs: options.outputs, execute: (input, forward) => node.execute(String(input), forward) })
  }
  remove(node) { this.controlflow.remove(node.id) }
  execute(nodeId, input) { this.controlflow.execute(nodeId, input) }
}

class Dataflow {
  setups = new Map()
  constructor(editor) { this.editor = editor }
  add(node, setup) { if (this.setups.get(node.id)) throw new Error('already processed'); this.setups.set(node.id, setup) }
  remove(nodeId) { this.setups.delete(nodeId) }
  async fetchInputs(nodeId) {
    const result = this.setups.get(nodeId)
    if (!result) throw new Error('node is not initialized')
    const inputKeys = result.inputs()
    const cons = this.editor.getConnections().filter(c => c.target === nodeId && inputKeys.includes(c.targetInput))
    const inputs = {}
    const consWithSourceData = await Promise.all(cons.map(async c => ({ c, sourceData: await this.fetch(c.source) })))
    for (const { c, sourceData } of consWithSourceData) {
      const previous = inputs[c.targetInput] ? inputs[c.targetInput] : []
      inputs[c.targetInput] = [...previous, sourceData[c.sourceOutput]]
    }
    return inputs
  }
  async fetch(nodeId) {
    const result = this.setups.get(nodeId)
    if (!result) throw new Error('node is not initialized')
    const outputKeys = result.outputs()
    const data = await result.data(() => this.fetchInputs(nodeId))
    const returningKeys = Object.keys(data)
    if (!outputKeys.every(key => returningKeys.includes(key))) throw new Error(`dataflow node "${nodeId}" doesn't return all of required properties`)
    return data
  }
}

export class DataflowEngine extends Scope {
  cache = new Map()
  constructor(configure) {
    super('dataflow-engine'); this.configure = configure
    this.addPipe(context => {
      if (context.type === 'nodecreated') this.add(context.data)
      if (context.type === 'noderemoved') this.remove(context.data)
      return context
    })
  }
  setParent(scope) { super.setParent(scope); this.editor = this.parentScope(NodeEditor); this.dataflow = new Dataflow(this.editor) }
  add(node) {
    const options = this.configure ? this.configure(node) : { inputs: () => Object.keys(node.inputs), outputs: () => Object.keys(node.outputs) }
    this.dataflow.add(node, { inputs: options.inputs, outputs: options.outputs, data: async fetchInputs => {
      if (this.cache.has(node.id)) return this.cache.get(node.id)
      const inputs = await fetchInputs(); const value = await node.data(inputs); this.cache.set(node.id, value); return value
    } })
  }
  remove(node) { this.dataflow.remove(node.id); this.cache.delete(node.id) }
  reset(nodeId) {
    if (nodeId) {
      const setup = this.dataflow.setups.get(nodeId); if (!setup) throw new Error('setup')
      const outputKeys = setup.outputs(); this.cache.delete(nodeId)
      this.editor.getConnections().filter(c => c.source === nodeId && outputKeys.includes(c.sourceOutput)).forEach(c => this.reset(c.target))
    } else this.cache.clear()
  }
  fetchInputs(node) { return this.dataflow.fetchInputs(typeof node === 'object' ? node.id : node) }
  fetch(node) { return this.dataflow.fetch(typeof node === 'object' ? node.id : node) }
}

import { applyOperation, evaluatePredicate, validateActionGraph } from './action-graph.mjs'
import { createHeadlessAreaClass } from './headless-area.mjs'

export async function createActionFlowHarness(deps, graphInput, initialPayload = {}) {
  const graph = validateActionGraph(graphInput)
  const { rete, engine, history, area } = deps
  assertDeps(rete, engine, history, area)
  const { NodeEditor, ClassicPreset } = rete
  const { ControlFlowEngine, DataflowEngine } = engine
  const { HistoryPlugin, Presets } = history
  const HeadlessAreaPlugin = createHeadlessAreaClass(area.BaseAreaPlugin)

  const editor = new NodeEditor()
  const dataflow = new DataflowEngine(node => ({
    inputs: () => node.dataInputs ?? [],
    outputs: () => node.dataOutputs ?? []
  }))
  const controlflow = new ControlFlowEngine(node => ({
    inputs: () => node.controlInputs ?? [],
    outputs: () => node.controlOutputs ?? []
  }))
  const headlessArea = new HeadlessAreaPlugin()
  const historyPlugin = new HistoryPlugin({ timing: 1 })
  historyPlugin.addPreset(Presets.classic.setup({ timing: 1 }))

  editor.use(dataflow)
  editor.use(controlflow)
  editor.use(headlessArea)
  headlessArea.use(historyPlugin)

  const runtime = {
    input: structuredClone(initialPayload),
    output: undefined,
    toasts: [],
    trace: [],
    errors: [],
    pending: 0
  }
  const socketControl = new ClassicPreset.Socket('electrocraft-control')
  const socketData = new ClassicPreset.Socket('electrocraft-data')
  const nodeByCanonical = new Map()
  const canonicalByRete = new Map()

  for (const nodeDef of graph.nodes) {
    const node = makeNode({ ClassicPreset, nodeDef, runtime, dataflow, socketControl, socketData })
    await editor.addNode(node)
    await headlessArea.translate(node.id, { x: 0, y: 0 })
    nodeByCanonical.set(nodeDef.id, node)
    canonicalByRete.set(node.id, nodeDef.id)
  }

  const generatedConnections = []
  for (const edge of graph.edges) {
    const source = nodeByCanonical.get(edge.source)
    const target = nodeByCanonical.get(edge.target)
    const control = new ClassicPreset.Connection(source, controlOutputFor(edge), target, 'exec')
    await editor.addConnection(control)
    generatedConnections.push({ canonicalEdgeId: edge.id, channel: 'control', reteId: control.id })

    if (source.outputs.payload && target.inputs.payload) {
      const data = new ClassicPreset.Connection(source, 'payload', target, 'payload')
      await editor.addConnection(data)
      generatedConnections.push({ canonicalEdgeId: edge.id, channel: 'data', reteId: data.id })
    }
  }

  historyPlugin.clear()

  async function execute(payload = runtime.input) {
    runtime.input = structuredClone(payload)
    runtime.output = undefined
    runtime.toasts.length = 0
    runtime.trace.length = 0
    runtime.errors.length = 0
    runtime.pending = 0
    dataflow.reset()
    const trigger = nodeByCanonical.get(graph.triggerNodeId)
    controlflow.execute(trigger.id)
    await waitUntilSettled(runtime)
    return snapshotRuntime(runtime)
  }

  return {
    graph,
    editor,
    dataflow,
    controlflow,
    history: historyPlugin,
    area: headlessArea,
    runtime,
    nodeByCanonical,
    canonicalByRete,
    generatedConnections,
    execute,
    snapshotCanonical() { return JSON.parse(JSON.stringify(graph)) }
  }
}

function makeNode({ ClassicPreset, nodeDef, runtime, dataflow, socketControl, socketData }) {
  const node = new ClassicPreset.Node(`${nodeDef.kind}:${nodeDef.id}`)
  node.canonicalId = nodeDef.id
  node.kind = nodeDef.kind
  node.controlInputs = nodeDef.kind === 'trigger' ? [] : ['exec']
  node.controlOutputs = nodeDef.kind === 'condition' ? ['true', 'false'] : nodeDef.kind === 'toast' ? [] : ['next']
  node.dataInputs = nodeDef.kind === 'trigger' ? [] : ['payload']
  node.dataOutputs = ['payload']

  if (nodeDef.kind !== 'trigger') node.addInput('exec', new ClassicPreset.Input(socketControl, 'exec'))
  if (nodeDef.kind !== 'trigger') node.addInput('payload', new ClassicPreset.Input(socketData, 'payload'))
  for (const key of node.controlOutputs) node.addOutput(key, new ClassicPreset.Output(socketControl, key))
  node.addOutput('payload', new ClassicPreset.Output(socketData, 'payload'))

  node.data = async inputs => {
    const payload = nodeDef.kind === 'trigger'
      ? structuredClone(runtime.input)
      : structuredClone(inputs.payload?.[0] ?? {})
    if (nodeDef.kind === 'condition') return { payload, match: evaluatePredicate(nodeDef.predicate, payload) }
    if (nodeDef.kind === 'data') return { payload: applyOperation(nodeDef.operation, payload) }
    return { payload }
  }

  node.execute = (_input, forward) => {
    runtime.trace.push(nodeDef.id)
    if (nodeDef.kind === 'trigger') {
      forward('next')
      return
    }
    runtime.pending += 1
    void dataflow.fetch(node).then(result => {
      if (nodeDef.kind === 'condition') {
        forward(result.match ? 'true' : 'false')
        return
      }
      if (nodeDef.kind === 'data') {
        runtime.output = structuredClone(result.payload)
        forward('next')
        return
      }
      if (nodeDef.kind === 'toast') {
        runtime.output = structuredClone(result.payload)
        runtime.toasts.push({ type: 'info', message: nodeDef.message })
      }
    }).catch(error => {
      runtime.errors.push(String(error?.message ?? error))
    }).finally(() => {
      runtime.pending -= 1
    })
  }
  return node
}

function controlOutputFor(edge) {
  if (edge.branch === 'next') return 'next'
  return edge.branch
}

async function waitUntilSettled(runtime) {
  let zeroTicks = 0
  for (let attempt = 0; attempt < 500; attempt += 1) {
    await new Promise(resolve => setTimeout(resolve, 1))
    if (runtime.errors.length) throw new Error(runtime.errors.join(';'))
    if (runtime.pending === 0 && runtime.trace.length > 0) {
      zeroTicks += 1
      if (zeroTicks >= 2) return
    } else {
      zeroTicks = 0
    }
  }
  throw new Error('ACTION_FLOW_TIMEOUT')
}

function snapshotRuntime(runtime) {
  return {
    output: runtime.output === undefined ? undefined : structuredClone(runtime.output),
    toasts: structuredClone(runtime.toasts),
    trace: [...runtime.trace],
    errors: [...runtime.errors]
  }
}

function assertDeps(rete, engine, history, area) {
  const checks = [
    [rete?.NodeEditor, 'rete.NodeEditor'],
    [rete?.ClassicPreset?.Node, 'rete.ClassicPreset.Node'],
    [engine?.ControlFlowEngine, 'rete-engine.ControlFlowEngine'],
    [engine?.DataflowEngine, 'rete-engine.DataflowEngine'],
    [history?.HistoryPlugin, 'rete-history-plugin.HistoryPlugin'],
    [history?.Presets?.classic?.setup, 'rete-history-plugin.Presets.classic.setup'],
    [area?.BaseAreaPlugin, 'rete-area-plugin.BaseAreaPlugin']
  ]
  for (const [value, name] of checks) if (!value) throw new Error(`RETE_DEPENDENCY_MISSING:${name}`)
}

const NODE_KINDS = new Set(['trigger', 'condition', 'data', 'toast'])
const BRANCHES = new Set(['next', 'true', 'false'])

function plainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype
}

export function cloneCanonicalGraph(graph) {
  return JSON.parse(JSON.stringify(graph))
}

export function validateActionGraph(input) {
  if (!plainObject(input)) throw new Error('ACTION_GRAPH_NOT_OBJECT')
  const graph = cloneCanonicalGraph(input)
  if (graph.schemaVersion !== 1) throw new Error('ACTION_GRAPH_VERSION_UNSUPPORTED')
  if (typeof graph.id !== 'string' || !graph.id) throw new Error('ACTION_GRAPH_ID_REQUIRED')
  if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) throw new Error('ACTION_GRAPH_COLLECTIONS_REQUIRED')
  if (graph.nodes.length < 2) throw new Error('ACTION_GRAPH_TOO_SMALL')

  const ids = new Set()
  for (const node of graph.nodes) {
    if (!plainObject(node) || typeof node.id !== 'string' || !node.id) throw new Error('ACTION_NODE_ID_REQUIRED')
    if (ids.has(node.id)) throw new Error(`ACTION_NODE_DUPLICATE:${node.id}`)
    ids.add(node.id)
    if (!NODE_KINDS.has(node.kind)) throw new Error(`ACTION_NODE_KIND_UNSUPPORTED:${node.kind}`)
    if (node.kind === 'trigger' && typeof node.event !== 'string') throw new Error('TRIGGER_EVENT_REQUIRED')
    if (node.kind === 'condition') validatePredicate(node.predicate)
    if (node.kind === 'data') validateOperation(node.operation)
    if (node.kind === 'toast' && typeof node.message !== 'string') throw new Error('TOAST_MESSAGE_REQUIRED')
  }

  if (!ids.has(graph.triggerNodeId)) throw new Error('TRIGGER_NODE_NOT_FOUND')
  const trigger = graph.nodes.find(node => node.id === graph.triggerNodeId)
  if (trigger.kind !== 'trigger') throw new Error('TRIGGER_NODE_KIND_INVALID')

  const edgeIds = new Set()
  for (const edge of graph.edges) {
    if (!plainObject(edge) || typeof edge.id !== 'string' || !edge.id) throw new Error('ACTION_EDGE_ID_REQUIRED')
    if (edgeIds.has(edge.id)) throw new Error(`ACTION_EDGE_DUPLICATE:${edge.id}`)
    edgeIds.add(edge.id)
    if (!ids.has(edge.source) || !ids.has(edge.target)) throw new Error(`ACTION_EDGE_NODE_MISSING:${edge.id}`)
    if (!BRANCHES.has(edge.branch)) throw new Error(`ACTION_EDGE_BRANCH_UNSUPPORTED:${edge.branch}`)
    const source = graph.nodes.find(node => node.id === edge.source)
    if (source.kind === 'trigger' && edge.branch !== 'next') throw new Error(`TRIGGER_BRANCH_INVALID:${edge.id}`)
    if (source.kind === 'data' && edge.branch !== 'next') throw new Error(`DATA_BRANCH_INVALID:${edge.id}`)
    if (source.kind === 'toast') throw new Error(`TOAST_CANNOT_FORWARD:${edge.id}`)
  }

  assertPortableGraph(graph)
  return graph
}

export function validatePredicate(predicate) {
  if (!plainObject(predicate)) throw new Error('CONDITION_PREDICATE_REQUIRED')
  if (predicate.operator !== 'eq') throw new Error(`CONDITION_OPERATOR_UNSUPPORTED:${predicate.operator}`)
  if (typeof predicate.field !== 'string' || !predicate.field) throw new Error('CONDITION_FIELD_REQUIRED')
  if (!['string', 'number', 'boolean'].includes(typeof predicate.value) && predicate.value !== null) {
    throw new Error('CONDITION_VALUE_UNSUPPORTED')
  }
  return predicate
}

export function validateOperation(operation) {
  if (!plainObject(operation)) throw new Error('DATA_OPERATION_REQUIRED')
  if (operation.type !== 'set') throw new Error(`DATA_OPERATION_UNSUPPORTED:${operation.type}`)
  if (typeof operation.path !== 'string' || !operation.path || operation.path.includes('__proto__') || operation.path.includes('constructor')) {
    throw new Error('DATA_PATH_UNSAFE')
  }
  return operation
}

export function evaluatePredicate(predicate, payload) {
  validatePredicate(predicate)
  const value = getPath(payload, predicate.field)
  return value === predicate.value
}

export function applyOperation(operation, payload) {
  validateOperation(operation)
  const next = structuredClone(payload ?? {})
  setPath(next, operation.path, structuredClone(operation.value))
  return next
}

export function assertPortableGraph(graph) {
  const seen = new WeakSet()
  const visit = (value, path = '$') => {
    if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return
    if (typeof value === 'undefined' || typeof value === 'function' || typeof value === 'symbol' || typeof value === 'bigint') {
      throw new Error(`ACTION_GRAPH_NON_PORTABLE:${path}`)
    }
    if (typeof value !== 'object') return
    if (seen.has(value)) throw new Error(`ACTION_GRAPH_CYCLE:${path}`)
    seen.add(value)
    if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype) {
      throw new Error(`ACTION_GRAPH_ENGINE_INTERNAL:${path}`)
    }
    for (const [key, child] of Object.entries(value)) visit(child, `${path}.${key}`)
  }
  visit(graph)
  const text = JSON.stringify(graph)
  for (const token of ['ClassicPreset', 'NodeEditor', 'HistoryPlugin', 'ControlFlowEngine', 'DataflowEngine']) {
    if (text.includes(token)) throw new Error(`ACTION_GRAPH_ENGINE_TOKEN:${token}`)
  }
  return true
}

function getPath(object, path) {
  return path.split('.').reduce((value, key) => value == null ? undefined : value[key], object)
}

function setPath(object, path, value) {
  const parts = path.split('.')
  let cursor = object
  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = parts[index]
    if (!plainObject(cursor[key])) cursor[key] = {}
    cursor = cursor[key]
  }
  cursor[parts.at(-1)] = value
}

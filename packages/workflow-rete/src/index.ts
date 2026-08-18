import {
  electroCraftActionGraphSchema,
  type ElectroCraftActionGraph,
  type ElectroCraftObjectId,
} from '@electrocraft/domain';
import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { packageDescriptor as dep1 } from '@electrocraft/application';
import { NodeEditor } from 'rete';

type ReteActionNode = {
  id: string;
  canonicalNodeRef: ElectroCraftObjectId;
  kind: string;
  type: string;
};

type ReteActionConnection = {
  id: string;
  source: string;
  target: string;
  canonicalEdgeRef: ElectroCraftObjectId;
  sourcePort: string;
  targetPort: string;
};

type ReteActionSchemes = {
  Node: ReteActionNode;
  Connection: ReteActionConnection;
};

export interface ReteActionGraphRuntime {
  graph: ElectroCraftActionGraph;
  editor: NodeEditor<ReteActionSchemes>;
  nodeIdByCanonicalRef: ReadonlyMap<ElectroCraftObjectId, string>;
}

export async function createReteActionGraphRuntime(input: unknown): Promise<ReteActionGraphRuntime> {
  const graph = electroCraftActionGraphSchema.parse(input);
  const editor = new NodeEditor<ReteActionSchemes>();
  const nodeIdByCanonicalRef = new Map<ElectroCraftObjectId, string>();

  for (const node of graph.nodes) {
    const runtimeNode: ReteActionNode = {
      id: `rete:${node.id}`,
      canonicalNodeRef: node.id,
      kind: node.kind,
      type: node.type,
    };
    await editor.addNode(runtimeNode);
    nodeIdByCanonicalRef.set(node.id, runtimeNode.id);
  }

  for (const edge of graph.edges) {
    const source = nodeIdByCanonicalRef.get(edge.sourceNodeRef);
    const target = nodeIdByCanonicalRef.get(edge.targetNodeRef);
    if (!source || !target) throw new TypeError('canonical ActionGraph contains an unresolved edge');
    await editor.addConnection({
      id: `rete:${edge.id}`,
      source,
      target,
      canonicalEdgeRef: edge.id,
      sourcePort: edge.sourcePort,
      targetPort: edge.targetPort,
    });
  }

  return { graph, editor, nodeIdByCanonicalRef };
}

export function snapshotCanonicalActionGraph(runtime: ReteActionGraphRuntime): ElectroCraftActionGraph {
  return electroCraftActionGraphSchema.parse(structuredClone(runtime.graph));
}

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/workflow-rete',
  responsibility: 'adapter de workflows Rete',
  dependencies: [dep0.name, dep1.name] as const,
});

export type WorkflowRetePackageDescriptor = typeof packageDescriptor;

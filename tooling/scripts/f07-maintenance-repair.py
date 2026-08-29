from pathlib import Path


def replace_exact(path_str: str, old: str, new: str) -> None:
    path = Path(path_str)
    text = path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path_str}: expected one exact replacement, found {count}')
    path.write_text(text.replace(old, new, 1), encoding='utf-8')


def replace_between(path_str: str, start_marker: str, end_marker: str, replacement: str) -> None:
    path = Path(path_str)
    text = path.read_text(encoding='utf-8')
    start = text.find(start_marker)
    if start < 0:
        raise SystemExit(f'{path_str}: start marker not found')
    end = text.find(end_marker, start)
    if end < 0:
        raise SystemExit(f'{path_str}: end marker not found')
    path.write_text(text[:start] + replacement + text[end:], encoding='utf-8')


replace_exact(
    'apps/studio/src/features/navigation/navigation-builder.tsx',
    "  const parent = selectedParent && selectedParent.kind !== 'screen'\n    ? selectedParent\n    : navigation.nodes.find((node) => node.id === navigation.rootNodeRef && node.kind !== 'screen') ?? null;",
    "  const parent =\n    selectedParent ??\n    navigation.nodes.find((node) => node.id === navigation.rootNodeRef && node.kind !== 'screen') ??\n    null;",
)
replace_exact(
    'apps/studio/src/features/navigation/navigation-builder.tsx',
    "  const nodesById = new Map(navigation.nodes.map((node) => [node.id, node] as const));",
    "  const nodesById = new Map<string, ElectroCraftNavigationNode>(\n    navigation.nodes.map((node) => [node.id, node] as const),\n  );",
)
replace_exact(
    'apps/studio/src/features/navigation/navigation-builder.tsx',
    "    const draggedIndex = parent.childRefs.indexOf(draggedId as never);\n    const targetIndex = parent.childRefs.indexOf(targetId as never);",
    "    const draggedIndex = parent.childRefs.findIndex((childRef) => childRef === draggedId);\n    const targetIndex = parent.childRefs.findIndex((childRef) => childRef === targetId);",
)
replace_exact(
    'apps/studio/src/features/navigation/route-action-editor.tsx',
    "  const [destinationRouteId, setDestinationRouteId] = useState(routes[0]?.id ?? sourceRoute.id);",
    "  const [destinationRouteId, setDestinationRouteId] = useState<string>(routes[0]?.id ?? sourceRoute.id);",
)

replace_between(
    'packages/application/src/navigation/navigation-action-service.ts',
    "  if (config.mode === 'back' || config.destination === null) return null;",
    "  const matching = routes.filter(({ screenRef }) => screenRef === screen.id);",
    """  if (config.mode === 'back' || config.destination === null) return null;
  const destination = config.destination;
  if (destination.kind === 'route') {
    const route = routes.find(({ id }) => id === destination.routeRef);
    if (!route) diagnostics.push({ code: 'destination-route-missing', ref: destination.routeRef });
    return route ?? null;
  }

  const screen = documents.find(({ id, kind }) => id === destination.screenRef && kind === 'screen');
  if (!screen) {
    diagnostics.push({ code: 'destination-screen-missing', ref: destination.screenRef });
    return null;
  }
""",
)

export_replacement = r'''/**
 * ExportIR keeps formatVersion=1 while Route/Navigation evolve independently.
 * The F02 object shape is reused, while Route/Navigation move to the M07
 * schemas and the original forbidden-internals validation is preserved.
 */
const forbiddenIrKeyNames = new Set([
  'workspacestate',
  'puckhistory',
  'retehistory',
  'tanstackcache',
  'aihistory',
  'aiprompts',
  'prompts',
  'slimroutes',
  'wpblocks',
  'wordpressblocks',
  'exporoutefiles',
  'capacitorconfig',
  'secretvalue',
  'password',
  'passwd',
  'clientsecret',
  'accesstoken',
  'refreshtoken',
  'apikey',
  'authorization',
  'credential',
]);

function normalizeKey(key: string): string {
  return key.replace(/[-_.\s]/g, '').toLowerCase();
}

function findForbiddenIrPath(value: unknown, path: Array<string | number> = []): Array<string | number> | null {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findForbiddenIrPath(value[index], [...path, index]);
      if (found) return found;
    }
    return null;
  }
  if (value === null || typeof value !== 'object') return null;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (forbiddenIrKeyNames.has(normalizeKey(key))) return [...path, key];
    const found = findForbiddenIrPath(child, [...path, key]);
    if (found) return found;
  }
  return null;
}

export const electroCraftExportIrSchema = z
  .strictObject({
    ...legacyElectroCraftExportIrSchema.shape,
    routes: z.array(electroCraftRouteDefinitionSchema),
    navigations: z.array(electroCraftNavigationDefinitionSchema),
  })
  .superRefine((ir, context) => {
    const forbiddenPath = findForbiddenIrPath(ir);
    if (forbiddenPath) {
      context.addIssue({
        code: 'custom',
        path: forbiddenPath,
        message:
          'ExportIR cannot contain Studio/engine history, target-specific internals, prompts, caches, or secret values',
      });
    }
  });
'''
replace_between(
    'packages/domain/src/navigation/export-ir.ts',
    '/**\n * ExportIR keeps formatVersion=1 while Route/Navigation evolve independently.',
    'export type ElectroCraftExportIR',
    export_replacement,
)

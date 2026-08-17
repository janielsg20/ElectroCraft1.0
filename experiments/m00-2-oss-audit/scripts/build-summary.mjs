import fs from 'node:fs';
const audit = JSON.parse(fs.readFileSync(new URL('../engine-audit.json', import.meta.url), 'utf8'));
const licenseCounts = {}; let gated = 0;
for (const engine of audit.engines) {
  licenseCounts[engine.license] = (licenseCounts[engine.license] || 0) + 1;
  if (/preview|experimental|alpha|beta|model-dependent|transition/i.test(engine.stability)) gated++;
}
const summary = {
  verifiedAt: audit.verifiedAt,
  engineCount: audit.engines.length,
  coreTargetCount: audit.coreTargets.length,
  capabilityGatedCount: gated,
  licenseCounts,
  representativeRuntimeEvidence: 'SQLite via Node node:sqlite; package-specific PGlite/Drizzle runtime is owned by F00/M00.4 POC Studio DB genérica',
  assertions: {
    puckOwnsVisualAuthoring: true,
    puckAiDoesNotOwnAi: true,
    shadcnBase: 'Radix (explicit; Base UI is default upstream)',
    i18nFallback: 'es',
    queryCacheOwner: 'TanStack Query',
    adminOwner: 'Refine',
    formStateOwner: 'React Hook Form',
    schemaOwner: 'Zod',
    workflowOwner: 'Rete',
    richTextOwner: 'Tiptap',
    runtimeStateOwner: 'Zustand',
    geminiInteractionsLane: 'GA v1; preview features capability-gated',
    aiDraftApply: true
  }
};
fs.mkdirSync(new URL('../dist/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../dist/audit-summary.json', import.meta.url), JSON.stringify(summary, null, 2) + '\n');
console.log(`Built dist/audit-summary.json (${summary.engineCount} engines).`);

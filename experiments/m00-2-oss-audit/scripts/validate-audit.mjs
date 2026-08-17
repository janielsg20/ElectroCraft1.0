import fs from 'node:fs';
const audit = JSON.parse(fs.readFileSync(new URL('../engine-audit.json', import.meta.url), 'utf8'));
const required = ['id','name','packages','responsibility','publicApis','stability','license','targets','boundary','sources'];
const ids = new Set();
for (const engine of audit.engines) {
  for (const key of required) if (!(key in engine)) throw new Error(`${engine.id || '?'} missing ${key}`);
  if (ids.has(engine.id)) throw new Error(`duplicate engine ${engine.id}`);
  ids.add(engine.id);
  if (!Array.isArray(engine.publicApis) || engine.publicApis.length === 0) throw new Error(`${engine.id}: public API missing`);
  if (!Array.isArray(engine.sources) || engine.sources.length === 0 || engine.sources.some((s) => !s.startsWith('https://'))) throw new Error(`${engine.id}: primary source missing`);
  if (!engine.boundary.trim() || !engine.license.trim() || !engine.stability.trim()) throw new Error(`${engine.id}: incomplete audit contract`);
  for (const target of engine.targets) if (!audit.coreTargets.includes(target)) throw new Error(`${engine.id}: unknown target ${target}`);
}
if (audit.coreTargets.length !== 9 || new Set(audit.coreTargets).size !== 9) throw new Error('Core targets must be exactly nine');
for (const id of ['puck','shadcn-radix','ai-elements','i18next','react-i18next','pglite','drizzle','refine','tanstack-query','tanstack-table','rhf','zod','rqb','rete','tiptap','zustand','ai-sdk','ai-sdk-google','google-genai','gemini-interactions','gemini-images','expo','expo-router','expo-sqlite','lucide','echarts','victory-native','fullcalendar','rn-calendars','dnd-kit']) {
  if (!ids.has(id)) throw new Error(`required engine missing: ${id}`);
}
console.log(`OK: ${audit.engines.length} audited engine decisions, ${audit.coreTargets.length} Core targets.`);

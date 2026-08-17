import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
export const data = JSON.parse(fs.readFileSync(path.join(root, 'capability-ownership-matrix.json'), 'utf8'));
export const expectedTargets = ['local-project','react-web','static-web','pwa','android-expo','ios-expo','capacitor','lamp','wordpress'];
export function validateMatrix() {
  const errors=[];
  const ids=data.requirements.map(r=>r.requirement);
  if (data.requirements.length!==84) errors.push(`expected 84 requirements, got ${data.requirements.length}`);
  if (new Set(ids).size!==ids.length) errors.push('duplicate requirement IDs');
  for (let i=1;i<=84;i++) { const id=`R${String(i).padStart(3,'0')}`; if(!ids.includes(id)) errors.push(`missing ${id}`); }
  for (const r of data.requirements) {
    if (!r.mentalModel || r.mentalModel==='UNMAPPED') errors.push(`${r.requirement}: missing mental model`);
    if (!r.canonicalOwner || r.canonicalOwner==='UNMAPPED') errors.push(`${r.requirement}: missing canonical owner`);
    if (!r.phase || r.phase==='UNMAPPED') errors.push(`${r.requirement}: missing phase`);
    if (!Array.isArray(r.targetApplicability) || r.targetApplicability.length===0) errors.push(`${r.requirement}: missing target applicability`);
  }
  if (JSON.stringify(data.coreTargets)!==JSON.stringify(expectedTargets)) errors.push('core target list differs from canonical nine');
  const exportReqs = data.requirements.filter(r=>['R047','R048','R049','R050','R051','R052','R053','R054','R055'].includes(r.requirement));
  const explicit = exportReqs.flatMap(r=>r.targetApplicability);
  for (const t of expectedTargets) if (!explicit.includes(t)) errors.push(`no explicit exporter owner for ${t}`);
  const serialized=JSON.stringify(data).toLowerCase();
  if (serialized.includes('optional target') || serialized.includes('secondary target')) errors.push('forbidden lower-priority target classification');
  return errors;
}
if (process.argv[1]===fileURLToPath(import.meta.url)) {
  const errors=validateMatrix();
  if(errors.length){ console.error(errors.join('\n')); process.exit(1); }
  console.log(`OK: ${data.requirements.length} requirements, ${data.coreTargets.length} Core targets, ownership completo.`);
}

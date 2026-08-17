import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { data, validateMatrix } from './validate-matrix.mjs';
const errors=validateMatrix(); if(errors.length){ console.error(errors.join('\n')); process.exit(1); }
const here=path.dirname(fileURLToPath(import.meta.url)); const root=path.resolve(here,'..');
const byPhase={}; for(const r of data.requirements) byPhase[r.phase]=(byPhase[r.phase]||0)+1;
const out={microphase:'M00.1',status:'green',requirements:data.requirements.length,coreTargets:data.coreTargets,requirementsByPhase:byPhase,generatedAt:new Date().toISOString()};
fs.mkdirSync(path.join(root,'dist'),{recursive:true}); fs.writeFileSync(path.join(root,'dist','summary.json'),JSON.stringify(out,null,2)+'\n');
console.log('Built dist/summary.json');

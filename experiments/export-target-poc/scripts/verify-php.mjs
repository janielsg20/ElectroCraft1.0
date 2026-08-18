import { execFileSync } from 'node:child_process'; import { readdir } from 'node:fs/promises'; import { join } from 'node:path';
const roots=['lamp-poc','wordpress-plugin-poc']; const php=[];
async function walk(dir){ for(const e of await readdir(dir,{withFileTypes:true})){ const p=join(dir,e.name); if(e.isDirectory()) await walk(p); else if(p.endsWith('.php')) php.push(p); } }
for(const root of roots) await walk(root);
for(const file of php){ execFileSync('php',['-l',file],{stdio:'pipe'}); }
console.log(`PASS_PHP_SYNTAX ${php.length} files`);

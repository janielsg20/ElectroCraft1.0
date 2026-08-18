import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exportIrPoc, assertCanonicalIr } from '../src/export-ir.js';
import { compileCapacitor } from '../src/compile-capacitor.js';
import { compileLamp } from '../src/compile-lamp.js';
import { compileWordPress } from '../src/compile-wordpress.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
assertCanonicalIr(exportIrPoc);
const capacitor = compileCapacitor(exportIrPoc);
const lamp = compileLamp(exportIrPoc);
const wordpress = compileWordPress(exportIrPoc);

async function materialize(dir, files) {
  await rm(resolve(root, dir), { recursive: true, force: true });
  for (const [path, content] of Object.entries(files)) {
    const out = resolve(root, dir, path);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, content, 'utf8');
  }
}

await materialize('capacitor-poc', capacitor.files);
await materialize('lamp-poc', lamp.files);
await materialize('wordpress-theme-poc', wordpress.files.theme);
await materialize('wordpress-plugin-poc', wordpress.files.plugin);
await writeFile(resolve(root, 'capability-report.json'), `${JSON.stringify([capacitor.capability, lamp.capability, wordpress.capability], null, 2)}\n`);
await writeFile(resolve(root, 'ir-fingerprint.txt'), `${capacitor.irFingerprint}\n`);
console.log(`PASS_GENERATE ir=${capacitor.irFingerprint} capacitor=${Object.keys(capacitor.files).length} lamp=${Object.keys(lamp.files).length} wpTheme=${Object.keys(wordpress.files.theme).length} wpPlugin=${Object.keys(wordpress.files.plugin).length}`);

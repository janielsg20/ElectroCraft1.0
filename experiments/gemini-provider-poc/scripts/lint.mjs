import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roots = ['src', 'scripts', 'test'];
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.(?:ts|mjs)$/.test(entry.name)) files.push(full);
  }
}
for (const rel of roots) await walk(path.join(root, rel));
for (const file of files) {
  const source = await readFile(file, 'utf8');
  if (/\bTODO\b|\bFIXME\b/.test(source)) throw new Error(`unfinished marker in ${path.relative(root, file)}`);
  if (/console\.log\([^\n]*(?:apiKey|GEMINI_API_KEY|GOOGLE_GENERATIVE_AI_API_KEY)/.test(source)) {
    throw new Error(`possible secret logging in ${path.relative(root, file)}`);
  }
}
console.log(`PASS_LINT ${files.length} source/test/script modules`);

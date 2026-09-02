import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const studioDist = path.join(root, 'apps/studio/dist');
const evidenceDirectory = path.join(root, '.ai/evidence/F08/M08.5');

const secretCanaries = [
  'blocked-secret',
  'gateway-only-token',
  'must-never-leave',
  'must-not-persist',
  'plaintext-secret',
  'rotated-token',
  'super-secret-value',
];
const credentialPatterns = [
  { name: 'bearer-token', pattern: /Bearer\s+[A-Za-z0-9._~+/=-]{12,}/g },
  {
    name: 'assigned-secret',
    pattern: /(?:api[_-]?key|access[_-]?token|client[_-]?secret)\s*[:=]\s*["'][^"']{8,}["']/gi,
  },
];
const scannedExtensions = new Set(['.css', '.html', '.js', '.json', '.map', '.webmanifest']);

function collectFiles(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolute = path.join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(absolute) : [absolute];
    })
    .filter((file) => scannedExtensions.has(path.extname(file)));
}

if (!fs.existsSync(studioDist)) {
  throw new Error('M08.5 requiere el bundle de Studio antes de ejecutar el secret leak scan.');
}

const files = collectFiles(studioDist).sort();
if (files.length === 0) throw new Error('M08.5 no encontró artefactos de Studio para inspeccionar.');
const diagnostics = [];
let bytesScanned = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  bytesScanned += Buffer.byteLength(content);
  const relativePath = path.relative(root, file);

  for (const canary of secretCanaries) {
    if (content.includes(canary)) diagnostics.push({ file: relativePath, kind: 'secret-canary', match: canary });
  }
  for (const { name, pattern } of credentialPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) diagnostics.push({ file: relativePath, kind: name });
  }
}

const report = {
  schemaVersion: 1,
  microphase: 'M08.5',
  status: diagnostics.length === 0 ? 'passed' : 'failed',
  scopes: ['studio-production-bundle', 'source-maps', 'pwa-artifacts'],
  filesScanned: files.length,
  bytesScanned,
  secretCanariesChecked: secretCanaries.length,
  credentialPatternsChecked: credentialPatterns.map(({ name }) => name),
  diagnostics,
};

fs.mkdirSync(evidenceDirectory, { recursive: true });
fs.writeFileSync(path.join(evidenceDirectory, 'secret-leak-scan.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (diagnostics.length > 0) {
  for (const diagnostic of diagnostics) console.error(`M08.5 secret leak: ${JSON.stringify(diagnostic)}`);
  process.exitCode = 1;
} else {
  console.log(`PASS_M08_5_SECRET_LEAK_SCAN files=${files.length} bytes=${bytesScanned}`);
}

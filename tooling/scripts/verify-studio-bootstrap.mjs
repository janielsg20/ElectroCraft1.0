import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const dist = path.join(root, 'apps/studio/dist');

const requiredFiles = ['index.html', 'manifest.webmanifest', 'sw.js'];
for (const file of requiredFiles) {
  const absolute = path.join(dist, file);
  if (!fs.existsSync(absolute)) throw new Error(`M01.4 missing generated Studio artifact: ${file}`);
}

const indexHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (!indexHtml.includes('id="root"')) throw new Error('M01.4 built index.html lost the React root.');
if (!indexHtml.includes('manifest.webmanifest')) throw new Error('M01.4 built index.html does not reference the PWA manifest.');

const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.webmanifest'), 'utf8'));
if (manifest.name !== 'ElectroCraft — Desarrollo') throw new Error('M01.4 manifest name mismatch.');
if (manifest.start_url !== '/' || manifest.scope !== '/') throw new Error('M01.4 manifest route contract mismatch.');
if (manifest.display !== 'standalone') throw new Error('M01.4 manifest must remain standalone.');
if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) throw new Error('M01.4 manifest requires an install icon.');

const viteConfig = fs.readFileSync(path.join(root, 'apps/studio/vite.config.ts'), 'utf8');
for (const requiredFragment of ['globPatterns: []', 'runtimeCaching: []', 'enabled: false']) {
  if (!viteConfig.includes(requiredFragment)) {
    throw new Error(`M01.4 PWA technical-shell invariant missing: ${requiredFragment}`);
  }
}

const report = {
  schemaVersion: 1,
  microphase: 'M01.4',
  status: 'generated-studio-pwa-artifact-verified',
  route: '/',
  helpId: 'help.architecture.repository',
  generatedArtifacts: requiredFiles.map((file) => `apps/studio/dist/${file}`),
  cachePolicy: 'technical-shell-no-runtime-or-precache-globs',
  nextMicrophase: 'M01.5',
};

const out = path.join(root, 'tooling/dist');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'm01-4-studio-bootstrap-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`PASS_M01_4_STUDIO_ARTIFACT files=${requiredFiles.length} route=${report.route}`);

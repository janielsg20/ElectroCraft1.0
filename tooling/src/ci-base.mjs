export const CI_BASE_NODE_VERSION = '22.16.0';
export const CI_BASE_NPM_VERSION = '10.9.2';

const REQUIRED_WORKFLOW_FRAGMENTS = [
  'push:',
  'pull_request:',
  'permissions:',
  'contents: read',
  'uses: actions/checkout@v6',
  'uses: actions/setup-node@v7',
  'cache: npm',
  'cache-dependency-path: package-lock.json',
  'npm ci --ignore-scripts --no-audit --no-fund',
  'npm run lint',
  'npm run typecheck',
  'npm run test',
  'npm run build',
  'npm run test:e2e',
];

const addDiagnostic = (diagnostics, code, message) => diagnostics.push(Object.freeze({ code, message }));

export function evaluateCiBaseContract({ workflow, packageJson, lockfile, npmrc }) {
  const diagnostics = [];

  for (const fragment of REQUIRED_WORKFLOW_FRAGMENTS) {
    if (!workflow.includes(fragment)) {
      addDiagnostic(diagnostics, 'missing-workflow-contract', `Falta en CI base: ${fragment}`);
    }
  }

  if (!/push:\s*\n\s*branches:\s*\[main\]/m.test(workflow)) {
    addDiagnostic(diagnostics, 'missing-main-push', 'El CI base debe ejecutar push sobre main.');
  }

  if (/\bsecrets\./.test(workflow)) {
    addDiagnostic(diagnostics, 'forbidden-secret', 'M01.5 no permite cloud/deploy secrets.');
  }

  if (/\b(statuses|deployments|packages):\s*write\b/.test(workflow)) {
    addDiagnostic(diagnostics, 'excessive-permissions', 'El CI base debe conservar permisos de solo lectura.');
  }

  if (/\b(wrangler|vercel|npm publish|docker push)\b/i.test(workflow)) {
    addDiagnostic(diagnostics, 'forbidden-deploy', 'M01.5 no puede desplegar ni publicar artifacts de release.');
  }

  if (packageJson.version !== '0.0.0-m01.5') {
    addDiagnostic(diagnostics, 'wrong-root-version', 'package.json debe identificar M01.5.');
  }

  if (packageJson.packageManager !== `npm@${CI_BASE_NPM_VERSION}`) {
    addDiagnostic(diagnostics, 'wrong-package-manager', `packageManager debe ser npm@${CI_BASE_NPM_VERSION}.`);
  }

  if (lockfile.lockfileVersion !== 3) {
    addDiagnostic(diagnostics, 'wrong-lockfile-version', 'package-lock.json debe usar lockfileVersion 3.');
  }

  if (lockfile.version !== packageJson.version || lockfile.packages?.['']?.version !== packageJson.version) {
    addDiagnostic(diagnostics, 'lockfile-root-mismatch', 'package.json y package-lock.json no coinciden en la versión raíz.');
  }

  const workspaces = lockfile.packages?.['']?.workspaces ?? [];
  for (const workspace of ['apps/*', 'packages/*']) {
    if (!workspaces.includes(workspace)) {
      addDiagnostic(diagnostics, 'missing-workspace-lock', `El lockfile no registra ${workspace}.`);
    }
  }

  const npmrcLines = npmrc
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!npmrcLines.includes('legacy-peer-deps=true')) {
    addDiagnostic(diagnostics, 'missing-peer-policy', 'La política legacy-peer-deps debe estar fijada para reproducir el lockfile.');
  }

  return Object.freeze({
    status: diagnostics.length === 0 ? 'ready' : 'blocked',
    diagnostics: Object.freeze(diagnostics),
  });
}

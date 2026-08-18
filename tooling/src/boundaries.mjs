import fs from 'node:fs';
import path from 'node:path';

const IMPORT_RE = /(?:from\s+|import\s*\(\s*|^\s*import\s*)['"]([^'"]+)['"]/gm;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function walkSourceFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkSourceFiles(full));
    else if (entry.isFile() && /\.(?:ts|tsx|js|mjs)$/.test(entry.name)) out.push(full);
  }
  return out.sort();
}

export function listImports(file) {
  const text = fs.readFileSync(file, 'utf8');
  const imports = [];
  for (const match of text.matchAll(IMPORT_RE)) imports.push(match[1]);
  return imports;
}

function packageDirFromName(rootDir, name) {
  const short = name.replace('@electrocraft/', '');
  if (short === 'studio' || short === 'native-preview') return path.join(rootDir, 'apps', short);
  return path.join(rootDir, 'packages', short);
}

function importRecordsForDir(rootDir, ownerDir) {
  const records = [];
  for (const file of walkSourceFiles(path.join(ownerDir, 'src'))) {
    for (const specifier of listImports(file)) {
      records.push({ file: path.relative(rootDir, file).replaceAll(path.sep, '/'), specifier });
    }
  }
  return records;
}

export function collectWorkspace(rootDir) {
  const boundaries = readJson(path.join(rootDir, 'tooling/package-boundaries.json'));
  const rootManifest = readJson(path.join(rootDir, 'package.json'));
  const tsconfigBase = readJson(path.join(rootDir, 'tsconfig.base.json'));
  const tsconfig = readJson(path.join(rootDir, 'tsconfig.json'));
  const domainTsconfig = readJson(path.join(rootDir, 'packages/domain/tsconfig.json'));
  const manifests = {};
  const imports = {};
  const importRecords = {};
  const ownerDirs = {};

  for (const name of [...Object.keys(boundaries.packages), ...Object.keys(boundaries.apps)]) {
    const dir = packageDirFromName(rootDir, name);
    ownerDirs[name] = dir;
    const manifest = readJson(path.join(dir, 'package.json'));
    manifests[name] = manifest;
    const records = importRecordsForDir(rootDir, dir);
    importRecords[name] = records;
    imports[name] = records.map((record) => record.specifier);
  }

  return { rootDir, boundaries, rootManifest, tsconfigBase, tsconfig, domainTsconfig, manifests, imports, importRecords, ownerDirs };
}

function ownInternalDependencies(manifest) {
  const groups = [manifest.dependencies ?? {}, manifest.peerDependencies ?? {}, manifest.devDependencies ?? {}];
  return [...new Set(groups.flatMap((group) => Object.keys(group).filter((name) => name.startsWith('@electrocraft/'))))].sort();
}

function hasCycle(graph) {
  const active = new Set();
  const done = new Set();
  const visit = (node) => {
    if (active.has(node)) return true;
    if (done.has(node)) return false;
    active.add(node);
    for (const next of graph[node] ?? []) if (visit(next)) return true;
    active.delete(node);
    done.add(node);
    return false;
  };
  return Object.keys(graph).some(visit);
}

function isInside(parent, candidate) {
  const rel = path.relative(parent, candidate);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

export function validateImportRecords(ownerName, records, snapshot) {
  const errors = [];
  const { boundaries, ownerDirs, rootDir } = snapshot;
  const allowed = boundaries.packages[ownerName] ?? boundaries.apps[ownerName] ?? [];
  const ownerDir = ownerDirs[ownerName] ?? packageDirFromName(rootDir, ownerName);

  for (const record of records) {
    const { specifier } = record;
    if (specifier.startsWith('@electrocraft/')) {
      const exactOwner = Object.keys({ ...boundaries.packages, ...boundaries.apps }).find((name) => specifier === name);
      if (!exactOwner) {
        errors.push(`${ownerName} uses deep/unknown workspace import ${specifier}`);
        continue;
      }
      if (!allowed.includes(specifier)) errors.push(`${ownerName} imports undeclared/forbidden ${specifier}`);
      continue;
    }

    if ((specifier.startsWith('./') || specifier.startsWith('../')) && boundaries.invariants.forbidCrossPackageRelativeImports) {
      const sourceAbsolute = path.join(rootDir, record.file);
      const resolved = path.resolve(path.dirname(sourceAbsolute), specifier);
      if (!isInside(ownerDir, resolved)) errors.push(`${ownerName} crosses package boundary via relative import ${specifier}`);
    }
  }

  if (ownerName === '@electrocraft/domain') {
    for (const forbidden of boundaries.invariants.domainForbiddenImports) {
      if (records.some(({ specifier }) => specifier === forbidden || specifier.startsWith(`${forbidden}/`))) {
        errors.push(`domain imports forbidden engine/runtime ${forbidden}`);
      }
    }
  }
  return errors;
}

function validateTsConfig(snapshot) {
  const errors = [];
  const { boundaries, tsconfigBase, tsconfig, domainTsconfig } = snapshot;
  const options = tsconfigBase.compilerOptions ?? {};
  if (options.strict !== true) errors.push('TypeScript strict must be true');
  if (options.moduleResolution !== 'Bundler') errors.push('TypeScript moduleResolution must be Bundler');
  if (options.noEmit !== true) errors.push('TypeScript base config must use noEmit');
  if (options.baseUrl !== '.') errors.push('TypeScript baseUrl must be repository root');
  if (tsconfig.extends !== './tsconfig.base.json') errors.push('root tsconfig must extend tsconfig.base.json');
  if (domainTsconfig.extends !== '../../tsconfig.base.json') errors.push('domain tsconfig must extend root strict base');
  if (JSON.stringify(domainTsconfig.compilerOptions?.lib) !== JSON.stringify(['ES2024'])) errors.push('domain TypeScript lib must exclude DOM');
  if (JSON.stringify(domainTsconfig.compilerOptions?.types) !== JSON.stringify([])) errors.push('domain TypeScript ambient types must be empty');

  const expected = boundaries.publicAliases ?? {};
  const actual = options.paths ?? {};
  for (const [name, target] of Object.entries(expected)) {
    const value = actual[name];
    if (!Array.isArray(value) || value.length !== 1 || value[0].replace(/^\.\//, '') !== target) {
      errors.push(`TypeScript alias ${name} must point only to ${target}`);
    }
  }
  for (const alias of Object.keys(actual)) {
    if (!(alias in expected)) errors.push(`unexpected TypeScript alias ${alias}`);
    if (alias.includes('*')) errors.push(`wildcard workspace alias forbidden ${alias}`);
  }
  return errors;
}

export function validateWorkspaceSnapshot(snapshot) {
  const { boundaries, rootManifest, manifests, importRecords } = snapshot;
  const errors = [];
  const allExpected = { ...boundaries.packages, ...boundaries.apps };

  if (Object.keys(boundaries.packages).length !== 17) errors.push('expected exactly 17 stable owner packages');
  if (JSON.stringify(rootManifest.workspaces) !== JSON.stringify(['apps/*', 'packages/*'])) {
    errors.push('root workspaces must be apps/* and packages/*');
  }

  for (const [name, allowed] of Object.entries(allExpected)) {
    const manifest = manifests[name];
    if (!manifest) {
      errors.push(`missing manifest ${name}`);
      continue;
    }
    if (manifest.name !== name) errors.push(`${name} manifest name mismatch`);
    const exportsKeys = Object.keys(manifest.exports ?? {});
    if (JSON.stringify(exportsKeys) !== JSON.stringify(['.'])) errors.push(`${name} must expose only one public root export`);
    const rootExport = manifest.exports?.['.'];
    if (rootExport !== './src/index.ts') errors.push(`${name} public root export must be ./src/index.ts`);
    const actual = ownInternalDependencies(manifest);
    const expected = [...allowed].sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      errors.push(`${name} internal dependencies mismatch: ${actual.join(',')}`);
    }
    errors.push(...validateImportRecords(name, importRecords[name] ?? [], snapshot));
  }

  const appAllowed = new Set(boundaries.invariants.applicationAllowedPackages ?? []);
  for (const dep of boundaries.packages['@electrocraft/application'] ?? []) {
    if (!appAllowed.has(dep)) errors.push(`application depends on forbidden package ${dep}`);
  }

  const nativeDeps = new Set(boundaries.packages['@electrocraft/runtime-native'] ?? []);
  const nativeAppDeps = new Set(boundaries.apps['@electrocraft/native-preview'] ?? []);
  for (const forbidden of boundaries.invariants.nativeForbiddenPackages) {
    if (nativeDeps.has(forbidden) || nativeAppDeps.has(forbidden)) errors.push(`native boundary depends on forbidden ${forbidden}`);
  }

  const exporterDeps = new Set(boundaries.packages['@electrocraft/exporters'] ?? []);
  for (const forbidden of boundaries.invariants.exportersForbiddenPackages) {
    if (exporterDeps.has(forbidden)) errors.push(`exporters depend on Studio/runtime-specific ${forbidden}`);
  }

  if (hasCycle(boundaries.packages)) errors.push('package dependency graph contains a cycle');
  errors.push(...validateTsConfig(snapshot));

  return { ok: errors.length === 0, errors };
}

export function validateWorkspace(rootDir) {
  return validateWorkspaceSnapshot(collectWorkspace(rootDir));
}

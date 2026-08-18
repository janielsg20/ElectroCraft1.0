import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const source = path.join(root, 'tooling/fixtures/empty-repo');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'electrocraft-m01-3-empty-'));
fs.cpSync(source, temp, { recursive: true });
fs.symlinkSync(path.join(root, 'node_modules'), path.join(temp, 'node_modules'), 'dir');
const bin = path.join(root, 'node_modules', '.bin');
const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH ?? ''}` };

function run(command, args) {
  const result = spawnSync(command, args, { cwd: temp, env, encoding: 'utf8' });
  process.stdout.write(result.stdout ?? '');
  process.stderr.write(result.stderr ?? '');
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}

try {
  run('eslint', ['script.mjs']);
  run('prettier', ['--check', '.']);
  run('tsc', ['-p', 'tsconfig.json', '--noEmit']);
  run('vitest', ['run', '--config', 'vitest.config.ts']);
  run('vite', ['build', '--config', 'vite.config.ts']);
  run('playwright', ['test', '--config', 'playwright.config.ts']);
  console.log('PASS_M01_3_EMPTY_REPO_TOOLCHAIN engines=eslint,prettier,tsc,vitest,vite,playwright');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

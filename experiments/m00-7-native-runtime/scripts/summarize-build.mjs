import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
async function summarize(dir) {
  let files = 0;
  let bytes = 0;
  async function walk(path) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const full = join(path, entry.name);
      if (entry.isDirectory()) await walk(full);
      else { files += 1; bytes += (await stat(full)).size; }
    }
  }
  await walk(dir);
  return { files, bytes };
}
const root = new URL('..', import.meta.url).pathname;
const android = await summarize(join(root, '.generated', 'export-android'));
const ios = await summarize(join(root, '.generated', 'export-ios'));
const result = { status: 'PASS_EXPO_TARGET_EXPORTS', android, ios, note: 'JS/native-target bundles only; Android binary/runtime is a separate CI gate; iOS Xcode binary is not claimed on Linux.' };
await mkdir(join(root, 'artifacts'), { recursive: true });
await writeFile(join(root, 'artifacts', 'build-summary.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('root uses stable Expo Router Stack and test group uses JS Tabs', async () => {
  const root = await read('app/_layout.tsx');
  const tabs = await read('app/(tabs)/_layout.tsx');
  assert.match(root, /import \{ Stack \} from "expo-router"/);
  assert.match(tabs, /import \{ Tabs \} from "expo-router"/);
  assert.doesNotMatch(root + tabs, /unstable-native-tabs/);
  assert.doesNotMatch(root + tabs, /@react-navigation\//);
});
test('native DB is Expo SQLite plus Drizzle generic tables', async () => {
  const runtime = await read('src/db/runtime.ts');
  const schema = await read('src/db/schema.ts');
  assert.match(runtime, /drizzle-orm\/expo-sqlite/);
  assert.match(runtime, /openDatabaseSync/);
  for (const table of ['content_records', 'relation_edges', 'record_field_index']) assert.match(schema, new RegExp(table));
});
test('Zustand persistence uses expo-sqlite kv-store', async () => {
  const store = await read('src/state/runtime-store.ts');
  assert.match(store, /expo-sqlite\/kv-store/);
  assert.match(store, /createJSONStorage/);
  assert.match(store, /persist\(/);
});
test('Refine is headless and native UI does not use DOM table', async () => {
  const root = await read('app/_layout.tsx');
  const list = await read('app/(tabs)/index.tsx');
  assert.match(root, /<Refine/);
  assert.match(list, /useList/);
  assert.match(list, /FlatList/);
  assert.doesNotMatch(root + list, /TanStack|<table|@refinedev\/antd|@refinedev\/mui/);
});
test('canonical renderer includes Container Text Button List', async () => {
  const renderer = await read('src/render/native-renderer.tsx');
  for (const kind of ['Container', 'Text', 'Button', 'List']) assert.match(renderer, new RegExp(`type: "${kind}"`));
});

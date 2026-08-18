import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('Vite build exists', () => {
  expect(fs.existsSync(path.join(process.cwd(), 'dist'))).toBeTruthy();
});

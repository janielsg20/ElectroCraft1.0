import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    target: 'baseline-widely-available',
    lib: {
      entry: resolve(here, 'src/index.ts'),
      formats: ['es'],
      fileName: 'studio-architecture',
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLogger, defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const here = dirname(fileURLToPath(import.meta.url));
const studioLogger = createLogger();
const warn = studioLogger.warn.bind(studioLogger);
studioLogger.warn = (message, options) => {
  const knownPgliteEval = message.includes('direct `eval`') && message.includes('@electric-sql/pglite');
  if (!knownPgliteEval) warn(message, options);
};

export default defineConfig({
  customLogger: studioLogger,
  root: here,
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
  worker: {
    format: 'es',
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      injectRegister: 'script',
      registerType: 'prompt',
      includeAssets: ['electrocraft-dev.svg'],
      manifest: {
        id: '/',
        name: 'ElectroCraft — Desarrollo',
        short_name: 'ElectroCraft',
        description: 'Bootstrap técnico de ElectroCraft Studio.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#111318',
        background_color: '#0c0e12',
        icons: [
          {
            src: '/electrocraft-dev.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: [],
        runtimeCaching: [],
        cleanupOutdatedCaches: false,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    target: 'baseline-widely-available',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    // PGlite ships its PostgreSQL compatibility runtime as an isolated lazy
    // chunk. Its size is expected and remains below this explicit budget.
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      // Direct eval belongs to the audited PGlite dependency, not repository
      // code. Rolldown otherwise repeats the same dependency warning for the
      // browser and worker graphs on every build.
      checks: { pluginTimings: false },
    },
  },
});

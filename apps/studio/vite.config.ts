import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
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
  },
});

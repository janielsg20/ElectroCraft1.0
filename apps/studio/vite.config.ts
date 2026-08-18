import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      injectRegister: 'script',
      registerType: 'prompt',
      includeAssets: ['electrocraft-dev.svg'],
      manifest: {
        id: '/',
        name: 'ElectroCraft — Desarrollo',
        short_name: 'ElectroCraft',
        description: 'Studio de ElectroCraft.',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#17191f',
        background_color: '#111318',
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

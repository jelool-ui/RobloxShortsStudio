import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Deux pages :
//  - index.html  : tableau de bord mobile (React)
//  - render.html : page de rendu 3D pilotée image par image par Playwright
export default defineConfig({
  base: './', // chemins relatifs → compatible GitHub Pages et serveur local
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        render: resolve(import.meta.dirname, 'render.html'),
      },
    },
  },
  server: { host: true },
});

import path from 'node:path';
import svgr from '@svgr/rollup';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        connect: path.resolve(__dirname, 'connect/index.html'),
      },
    },
  },

  plugins: [react({ jsxImportSource: '@emotion/react' }), svgr({ svgo: false })],
  publicDir: path.resolve(__dirname, 'public'),
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    allowedHosts: ['nenw-akebi.tailff05df.ts.net'],
  },
});

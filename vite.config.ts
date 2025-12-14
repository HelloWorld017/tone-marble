import path from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        connect: path.resolve(__dirname, 'connect/index.html'),
      },
    },
  },

  plugins: [react({ jsxImportSource: '@emotion/react' }), svgr({ svgrOptions: { svgo: false } })],
  publicDir: path.resolve(__dirname, 'public'),
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    allowedHosts: ['nenw-akebi.tailff05df.ts.net'],
  },
});

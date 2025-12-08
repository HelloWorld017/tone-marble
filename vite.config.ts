import path from 'node:path';
import svgr from '@svgr/rollup';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), svgr({ svgo: false })],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});

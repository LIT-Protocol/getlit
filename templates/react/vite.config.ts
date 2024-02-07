import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import mkcert from 'vite-plugin-mkcert';
import { Plugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: {},
  },
  resolve: {
    alias: {},
  },
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
    ,
    react(),
    { ...mkcert() as Plugin, apply: 'serve' },
  ],
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:5005';

export default defineConfig({
  server: {
    host: '::',
    port: 8080,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
      },
      '/hubs': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react()],
});

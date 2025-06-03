import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      port: 80,
      host: true,
      proxy: {
        '/admin': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
        },
        '/api': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
        },
        '/static': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
        },
      }
    }
  },
  devToolbar: {
    enabled: false
  },
  integrations: [react()]
});
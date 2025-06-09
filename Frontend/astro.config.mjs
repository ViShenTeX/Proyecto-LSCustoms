import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind()],
  vite: {
    server: {
      port: 80,
      host: true,
      proxy: {
        '^/api/.*': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    css: {
      postcss: {},
    },
    envPrefix: 'PUBLIC_'
  },
  devToolbar: {
    enabled: false
  },
  style: {
    css: {
      minify: false
    }
  }
});

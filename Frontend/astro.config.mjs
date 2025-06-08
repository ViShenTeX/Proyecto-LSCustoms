import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind()],
  vite: {
    server: {
      port: 80,
      host: true,
    },
    css: {
      postcss: {},
    }
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

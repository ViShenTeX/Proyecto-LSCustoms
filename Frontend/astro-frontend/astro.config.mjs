import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
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
  integrations: [react()],
  style: {
    css: {
      minify: false
    }
  }
});

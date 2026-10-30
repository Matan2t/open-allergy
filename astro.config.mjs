// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import yaml from '@rollup/plugin-yaml';

// https://astro.build/config
export default defineConfig({
  site: 'https://openallergy.org',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [yaml()],
  },
});

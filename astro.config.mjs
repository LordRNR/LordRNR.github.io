// @ts-check
import { defineConfig } from 'astro/config';

// Static output, designed for GitHub Pages user site (LordRNR.github.io, served from the root).
// NOTHING here deploys anything: the `site` value only builds canonical URLs and the sitemap.
export default defineConfig({
  site: 'https://lordrnr.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
  devToolbar: { enabled: false },
  // Instant-feeling navigation without a client router: prefetch on hover/focus only.
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});

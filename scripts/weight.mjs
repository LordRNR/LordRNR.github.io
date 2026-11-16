#!/usr/bin/env node
/**
 * Page weight from dist/ (gzip sizes), reproducible without a browser. Reports facts, not scores.
 * "Initial" = HTML + linked CSS + linked JS + the Latin web fonts + eager images (what blocks first paint/LCP).
 * Lazy images are counted but not added to "initial".
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const kb = (n) => (n / 1024).toFixed(1).padStart(7) + ' kB';
const gz = (file) => (existsSync(file) ? gzipSync(readFileSync(file)).length : 0);
const abs = (href) => join(dist, href.split('?')[0].replace(/^\//, ''));
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const pages = walk(dist).filter((f) => f.endsWith('.html'));

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const name = '/' + page.slice(dist.length).replace(/index\.html$/, '');
  const css = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
  const js = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  // Inline <style> is counted as part of the HTML (already in its size).
  const fonts = new Set();
  for (const c of css) {
    const text = existsSync(abs(c)) ? readFileSync(abs(c), 'utf8') : '';
    for (const m of text.matchAll(/url\(([^)]+\.woff2)\)/g)) if (/latin(?!-ext)/.test(m[1])) fonts.add(m[1].replace(/['"]/g, ''));
  }
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const eager = imgs.filter((t) => !/loading="lazy"/.test(t));
  const src = (t) => (t.match(/\ssrc="([^"]+)"/) || [])[1];

  const rows = {
    html: gz(page),
    css: css.reduce((a, c) => a + gz(abs(c)), 0),
    js: js.reduce((a, c) => a + gz(abs(c)), 0),
    fonts: [...fonts].reduce((a, f) => a + gz(abs(f.startsWith('/') ? f : '/' + f)), 0),
    eagerImgs: eager.reduce((a, t) => a + (src(t) ? gz(abs(src(t))) : 0), 0),
  };
  const initial = Object.values(rows).reduce((a, b) => a + b, 0);
  console.log(`\n${name}`);
  console.log(`  HTML ${kb(rows.html)}   CSS ${kb(rows.css)} (${css.length})   JS ${kb(rows.js)} (${js.length})   fonts ${kb(rows.fonts)} (${fonts.size} latin)   eager images ${kb(rows.eagerImgs)} (${eager.length}; ${imgs.length - eager.length} lazy)`);
  console.log(`  initial transfer ≈ ${kb(initial)} (gzip; images are already compressed)`);
}

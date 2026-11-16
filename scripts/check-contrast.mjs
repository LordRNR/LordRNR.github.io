#!/usr/bin/env node
/**
 * WCAG 2.x contrast check for the design tokens in src/styles/tokens.css (both themes) plus the
 * always-dark "console" island. Fails if any text pair is below 4.5:1 (AA, normal text).
 * It computes ratios; it does not claim an overall accessibility score.
 */
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

const block = (selector) => {
  const start = css.indexOf(selector);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
};
const vars = (b) => Object.fromEntries([...b.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{3,8})\s*;/gi)].map((m) => [m[1], m[2]]));

const dark = vars(block(':root {'));
const light = { ...dark, ...vars(block(":root[data-theme='light']")) };
// The research "console" island keeps these tokens in both themes (see sections/FeatureResearch.astro).
const island = { ink: '#ede9e0', muted: '#98a4b0', faint: '#7f8b97', accent: '#8db2ff', ok: '#5fe3cf', signal: '#ff8a68', bg: '#05070a', surface: '#0d131a' };

const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const textTokens = ['ink', 'muted', 'faint', 'accent', 'ok', 'signal'];
const surfaces = ['bg', 'bg-2', 'surface', 'surface-2'];
let failed = 0;
const report = (name, tokens, text, surf) => {
  console.log(`\n${name}`);
  for (const t of text) {
    const row = surf
      .filter((s) => tokens[s])
      .map((s) => {
        const r = ratio(tokens[t], tokens[s]);
        const ok = r >= 4.5;
        if (!ok) failed++;
        return `${s} ${r.toFixed(2)}${ok ? '' : ' FAIL'}`;
      });
    console.log(`  ${t.padEnd(7)} ${tokens[t]}  ${row.join(' | ')}`);
  }
};
// Research console, light variant: warm card (#fbf8f2) with white panels (see sections/FeatureResearch.astro).
const islandLight = { ink: '#10161d', muted: '#55616d', faint: '#5e6872', accent: '#2d56d1', ok: '#0b6e70', signal: '#b8321b', bg: '#fbf8f2', surface: '#ffffff' };

report('Dark theme (default)', dark, textTokens, surfaces);
report('Light theme', light, textTokens, surfaces);
report('Research console, dark palette', island, textTokens, ['bg', 'surface']);
report('Research console, light palette', islandLight, textTokens, ['bg', 'surface']);

// Interactive states: primary button hover uses --bg text on an --accent background, in both themes.
console.log('\nButton hover (text --bg on --accent)');
for (const [name, t] of [['dark', dark], ['light', light]]) {
  const r = ratio(t.bg, t.accent);
  if (r < 4.5) failed++;
  console.log(`  ${name.padEnd(6)} ${r.toFixed(2)}${r >= 4.5 ? '' : ' FAIL'}`);
}
console.log(failed ? `\n${failed} pair(s) below 4.5:1` : '\nAll text pairs are >= 4.5:1.');
process.exit(failed ? 1 : 0);

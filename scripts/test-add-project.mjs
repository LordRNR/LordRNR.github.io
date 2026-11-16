#!/usr/bin/env node
/**
 * Proves that adding a project needs ONE Markdown file and no component edits.
 * It copies the site to a fresh temporary directory (the real site is not touched), adds docs/example-project.md
 * (a fictional project) as src/content/projects/example-weather-dashboard.md, builds, and checks the result.
 * The temporary directory is left in place (this script never deletes anything); its path is printed.
 */
import { cpSync, mkdtempSync, symlinkSync, readFileSync, existsSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'site-add-project-'));
for (const item of ['src', 'public', 'scripts', 'package.json', 'astro.config.mjs', 'tsconfig.json', '.npmrc']) {
  if (existsSync(join(root, item))) cpSync(join(root, item), join(tmp, item), { recursive: true });
}
symlinkSync(join(root, 'node_modules'), join(tmp, 'node_modules'), 'dir');
copyFileSync(join(root, 'docs/example-project.md'), join(tmp, 'src/content/projects/example-weather-dashboard.md'));

execFileSync('npx', ['astro', 'build'], { cwd: tmp, stdio: 'pipe', encoding: 'utf8' });
const read = (p) => readFileSync(join(tmp, 'dist', p), 'utf8');
const checks = [];
const check = (name, ok) => { checks.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); };

check('own page exists at /projects/example-weather-dashboard/', existsSync(join(tmp, 'dist/projects/example-weather-dashboard/index.html')));
const list = read('projects/index.html');
check('appears in /projects/', list.includes('Example Weather Dashboard'));
check('its category appears as a filter option', /<button[^>]*data-value="web"[^>]*>\s*Web/.test(list));
check('appears in the sitemap', read('sitemap.xml').includes('/projects/example-weather-dashboard/'));
check('is labelled as planned, not as built', /planned/i.test(read('projects/example-weather-dashboard/index.html')));
check('does NOT appear on the home page (featured: false)', !read('index.html').includes('Example Weather Dashboard'));
check('the two real projects are unchanged in the list', list.includes('Junk to Luxury Simulator') && list.includes('xauscalp'));
console.log('\ntemporary copy kept at:', tmp);
process.exit(checks.every(Boolean) ? 0 : 1);

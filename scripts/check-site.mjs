#!/usr/bin/env node
/**
 * Post-build checks on dist/. No dependencies.
 *   node scripts/check-site.mjs            -> quality checks (fail on errors)
 *   node scripts/check-site.mjs --publish  -> also fail on PUBLICATION BLOCKERS (draft pages, unconfirmed data)
 * It never prints scores it did not measure: it only reports facts about the generated HTML.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const publish = process.argv.includes('--publish');
const site = JSON.parse(readFileSync(new URL('../src/data/site.json', import.meta.url), 'utf8'));
const media = JSON.parse(readFileSync(new URL('../src/data/media.json', import.meta.url), 'utf8'));

if (!existsSync(dist)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(2);
}

const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const files = walk(dist);
const pages = files.filter((f) => f.endsWith('.html'));
const route = (f) => '/' + relative(dist, f).replace(/index\.html$/, '').replace(/\.html$/, '');

const errors = [];
const warnings = [];
const blockers = [];
const err = (page, msg) => errors.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

// Pre-index ids per page for anchor checks.
const html = Object.fromEntries(pages.map((f) => [route(f), readFileSync(f, 'utf8')]));
const ids = Object.fromEntries(Object.entries(html).map(([r, h]) => [r, new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
const routes = new Set(Object.keys(html));
const stripTags = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');

const externalHosts = new Set();
let internalLinks = 0;
let images = 0;

for (const [page, h] of Object.entries(html)) {
  // Document basics
  if (!/<html[^>]*\slang="/.test(h)) err(page, 'missing <html lang>');
  if (!/<title>[^<]{3,}<\/title>/.test(h)) err(page, 'missing or empty <title>');
  if (page !== '/404.html' && !/<meta name="description" content="[^"]{20,}"/.test(h)) err(page, 'missing meta description');
  const h1s = [...h.matchAll(/<h1[\s>]/g)].length;
  if (h1s !== 1) err(page, `expected exactly 1 <h1>, found ${h1s}`);

  // Heading order: no jumps greater than one level
  const levels = [...h.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i++) if (levels[i] - levels[i - 1] > 1) err(page, `heading level jumps from h${levels[i - 1]} to h${levels[i]}`);

  // Images: alt present and dimensions set
  for (const m of h.matchAll(/<img\b[^>]*>/g)) {
    images++;
    const tag = m[0];
    // Astro prints an empty alt as a bare attribute (`<img … alt …>`), which is valid and equals alt="".
    if (!/\salt(\s|=|>)/.test(tag)) err(page, `<img> without alt: ${tag.slice(0, 80)}`);
    if (!/\swidth=/.test(tag) || !/\sheight=/.test(tag)) warn(page, `<img> without width/height: ${tag.slice(0, 80)}`);
  }

  // Links
  for (const m of h.matchAll(/<a\b[^>]*\shref="([^"]*)"[^>]*>/g)) {
    const [tag, href] = m;
    if (href === '#' || href === '') err(page, 'dead link (href="#")');
    else if (/^https?:\/\//.test(href)) {
      externalHosts.add(new URL(href).host);
      if (/target="_blank"/.test(tag) && !/noopener/.test(tag)) err(page, `target=_blank without noopener: ${href}`);
    } else if (/^(mailto:|tel:)/.test(href)) {
      /* ok */
    } else {
      internalLinks++;
      const [path, hash] = href.split('#');
      const target = path === '' ? page : path;
      const normalised = target.endsWith('/') || target === '' ? target : target + '/';
      if (path !== '' && !routes.has(normalised) && !files.some((f) => '/' + relative(dist, f) === path)) err(page, `broken internal link: ${href}`);
      if (hash && routes.has(normalised) && !ids[normalised].has(hash)) err(page, `anchor #${hash} not found on ${normalised}`);
    }
  }

  // Keyboard and assistive-tech basics: every control has an accessible name, charts have labels, skip link first
  for (const m of h.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    if (!stripTags(m[2]).trim() && !/aria-label=/.test(m[1])) err(page, 'button without an accessible name');
  }
  for (const m of h.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    if (!stripTags(m[2]).trim() && !/aria-label=/.test(m[1])) err(page, `link without an accessible name: ${m[1].slice(0, 70)}`);
  }
  for (const m of h.matchAll(/<(\w+)\b[^>]*role="img"[^>]*>/g)) {
    if (!/aria-label=/.test(m[0])) err(page, `role="img" without aria-label: ${m[0].slice(0, 70)}`);
  }
  const firstLink = h.slice(h.indexOf('<body')).match(/<a\b[^>]*>/);
  if (!firstLink || !/class="skip"/.test(firstLink[0])) err(page, 'the skip link is not the first focusable element');
  if (!/<main[^>]*id="main"/.test(h)) err(page, 'missing <main id="main"> for the skip link');

  // Placeholders and leaks
  const text = stripTags(h);
  for (const bad of [/\[confirm/i, /\[surname/i, /\[years/i, /\[your wording/i, /\blorem ipsum\b/i, /\bTODO\b/, /\bundefined\b/, /\[object Object\]/]) {
    if (bad.test(text)) err(page, `placeholder or leak in visible text: ${bad}`);
  }
  if (/\/Users\/[a-z]+/i.test(h)) err(page, 'a local file-system path appears in the HTML');
  if (/onclick=|onerror=|javascript:/i.test(h)) err(page, 'inline event handler or javascript: URL');
}

// Required files
for (const f of ['robots.txt', 'sitemap.xml', 'favicon.svg']) if (!existsSync(join(dist, f))) err(f, 'missing from dist');

// Media registry vs files on disk
for (const m of media) {
  if (m.kind !== 'video' && !existsSync(new URL(`../src/assets/media/${m.src}`, import.meta.url).pathname)) err('media.json', `${m.id}: file missing (${m.src})`);
}

// ---- Publication readiness, in three classes ----
//  A. CRITICAL: security, privacy or rights problems. These fail `--publish`.
//  B. PENDING INFORMATION: things only the owner can confirm. They never block: unknown data is hidden, not shown.
//  C. OPTIONAL: improvements that do not need to delay a first public version.
const critical = blockers; // kept name: A
const pending = [];
const optional = [];

// A. critical
if (site.links.email && !site.show.email) critical.push('An email address is stored in src/data/site.json while show.email is false: a public repository would expose it. Keep links.email null until it is approved.');
if (site.resume.pdf && !existsSync(new URL(`../public${site.resume.pdf}`, import.meta.url).pathname)) critical.push(`resume.pdf points to ${site.resume.pdf}, which does not exist in public/.`);
const emailRe = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[a-z]{2,}/g;
const secretRes = [/AKIA[0-9A-Z]{16}/, /ghp_[A-Za-z0-9]{30,}/, /github_pat_[A-Za-z0-9_]{30,}/, /sk-[A-Za-z0-9]{20,}/, /xox[baprs]-[A-Za-z0-9-]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/];
for (const [page, h] of Object.entries(html)) {
  const found = [...new Set((stripTags(h).match(emailRe) || []).concat([...h.matchAll(/mailto:([^"'?]+)/g)].map((m) => m[1])))];
  if (found.length && !site.show.email) critical.push(`${page}: an email address is present in the output while show.email is false (${found.length} found).`);
  if (secretRes.some((r) => r.test(h))) critical.push(`${page}: something that looks like a secret or private key is present in the HTML.`);
}
for (const f of files.filter((p) => /\.(js|css|json|xml|txt)$/.test(p))) {
  const t = readFileSync(f, 'utf8');
  if (secretRes.some((r) => r.test(t))) critical.push(`${relative(dist, f)}: something that looks like a secret or private key is present.`);
}

// B. pending information (hidden until confirmed; none of these blocks publishing)
for (const [key, val] of Object.entries({ location: site.location, availability: site.availability, 'links.linkedin': site.links.linkedin, 'links.email (professional, approved)': site.links.email })) {
  if (val == null) pending.push(`${key} is not set: it is simply not shown.`);
}
let unverifiedClaims = 0;
for (const f of readdirSync(new URL('../src/content/projects/', import.meta.url).pathname)) {
  const md = readFileSync(new URL(`../src/content/projects/${f}`, import.meta.url), 'utf8');
  unverifiedClaims += (md.match(/verified: false/g) || []).length;
}
if (unverifiedClaims) pending.push(`${unverifiedClaims} claim(s) have verified: false (never rendered), e.g. the originality of every asset: confirm provenance to publish them.`);
if (site.show.email) pending.push(`The email address (${site.links.email}) is rendered publicly: confirm that is intended (spam risk).`);

// C. optional improvements
const provisional = media.filter((m) => m.verification !== 'verified');
if (provisional.length) optional.push(`${provisional.length} image(s) are provisional Studio captures (${provisional.map((m) => m.id).join(', ')}): replace with final captures or a video when ready. They are labelled as captures and are not misleading.`);
if (!existsSync(join(dist, 'og-image.png')) && !existsSync(join(dist, 'og-image.jpg'))) optional.push('No Open Graph image: shared links will show no preview picture.');
if (!site.links.linkedin) optional.push('No LinkedIn link yet: the button is hidden until a URL is set.');
optional.push('No custom domain: the site would be served at https://lordrnr.github.io.');

// ---- Report ----
console.log(`Checked ${pages.length} pages, ${internalLinks} internal links, ${images} images. External hosts: ${[...externalHosts].join(', ') || 'none'}.`);
if (warnings.length) console.log(`\nWarnings (${warnings.length}):\n  - ${warnings.join('\n  - ')}`);
if (errors.length) console.log(`\nERRORS (${errors.length}):\n  - ${errors.join('\n  - ')}`);
else console.log('\nNo errors.');
const section = (title, list) => console.log(`\n${title} (${list.length}):${list.length ? '\n  - ' + list.join('\n  - ') : ' none'}`);
section('A. CRITICAL blockers (fail --publish)', critical);
section('B. Pending information (do not block)', pending);
section('C. Optional improvements (do not block)', optional);

process.exit(errors.length || (publish && critical.length) ? 1 : 0);

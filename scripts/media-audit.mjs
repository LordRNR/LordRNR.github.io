#!/usr/bin/env node
/**
 * Lists every registered medium with its type and verification state, and checks the files exist.
 *   node scripts/media-audit.mjs           -> report
 *   node scripts/media-audit.mjs --strict  -> exit 1 if anything is not "verified"
 */
import { readFileSync, existsSync } from 'node:fs';

const media = JSON.parse(readFileSync(new URL('../src/data/media.json', import.meta.url), 'utf8'));
const strict = process.argv.includes('--strict');
let missing = 0;
let pending = 0;

console.log('id'.padEnd(26), 'kind'.padEnd(15), 'verification'.padEnd(13), 'file');
for (const m of media) {
  const path = m.kind === 'video' ? new URL(`../public/media/video/${m.src}`, import.meta.url).pathname : new URL(`../src/assets/media/${m.src}`, import.meta.url).pathname;
  const ok = existsSync(path);
  if (!ok) missing++;
  if (m.verification !== 'verified') pending++;
  console.log(m.id.padEnd(26), m.kind.padEnd(15), m.verification.padEnd(13), ok ? m.src : `MISSING ${m.src}`);
  if (m.notes) console.log(' '.repeat(26), '→', m.notes);
}
console.log(`\n${media.length} items · ${pending} not verified · ${missing} missing files`);
process.exit(missing || (strict && pending) ? 1 : 0);

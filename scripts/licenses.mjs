#!/usr/bin/env node
/**
 * Lists the licences of every PRODUCTION dependency of the site (what could end up in a public build).
 * Exits 1 if a licence is not on the allow-list, so a risky licence cannot slip in unnoticed.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ALLOWED = /^(MIT|ISC|BSD-2-Clause|BSD-3-Clause|Apache-2\.0|0BSD|BlueOak-1\.0\.0|OFL-1\.1|CC0-1\.0|Unlicense|Python-2\.0|CC-BY-4\.0|MIT-0|\(MIT OR [^)]+\)|\([^)]*MIT[^)]*\)|\(BSD-2-Clause OR [^)]+\)|\(Apache-2\.0 AND [^)]+\))$/;
const tree = JSON.parse(execFileSync('npm', ['ls', '--omit=dev', '--all', '--json', '--long'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
// Copyleft-style licences that are acceptable ONLY because the package is a build-time tool (image/CSS processing)
// whose code is not included in the published site. Anything else outside the allow-list fails.
const BUILD_ONLY = /^(lightningcss|@img\/sharp-libvips|@img\/sharp-)/;
const seen = new Map();
let notInstalled = 0;
(function walk(deps) {
  for (const [name, d] of Object.entries(deps || {})) {
    if (!d.version) { notInstalled++; continue; } // optional platform binaries for other systems are not installed
    const pkgPath = d.path ? join(d.path, 'package.json') : null;
    const lic = pkgPath && existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, 'utf8')).license : null;
    seen.set(`${name}@${d.version}`, typeof lic === 'object' && lic ? lic.type : lic || 'UNKNOWN');
    walk(d.dependencies);
  }
})(tree.dependencies);

const byLicense = {};
for (const [pkg, lic] of seen) (byLicense[lic] ||= []).push(pkg);
console.log(`${seen.size} installed production packages (${notInstalled} optional platform binaries for other systems are not installed)`);
let bad = 0;
for (const [lic, pkgs] of Object.entries(byLicense).sort((a, b) => b[1].length - a[1].length)) {
  const ok = ALLOWED.test(lic);
  const buildOnly = !ok && pkgs.every((p) => BUILD_ONLY.test(p));
  if (!ok && !buildOnly) bad += pkgs.length;
  const tag = ok ? 'ok        ' : buildOnly ? 'build-only' : 'CHECK     ';
  console.log(`${tag} ${lic.padEnd(24)} ${pkgs.length}${ok ? '' : '  → ' + pkgs.slice(0, 4).join(', ')}`);
}
process.exit(bad ? 1 : 0);

// The published folder: every file the page needs is cached for offline use, and every file it links exists.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = fileURLToPath(new URL('../site/', import.meta.url));
const read = (file) => readFileSync(join(SITE, file), 'utf8');

const filesIn = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
  entry.isDirectory() ? filesIn(join(dir, entry.name)) : [relative(SITE, join(dir, entry.name)).replaceAll('\\', '/')]);

// Files the service worker does not need to cache: itself, the font licence, and the extended-Latin
// font subset (only downloaded when a name uses those characters).
const NOT_CACHED = new Set(['sw.js', 'fonts/OFL.txt', 'fonts/manrope-latin-ext.woff2']);

test('the service worker caches every file of the site', () => {
  const assets = [...read('sw.js').matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter(Boolean);
  const expected = filesIn(SITE).filter((file) => !NOT_CACHED.has(file));
  assert.deepEqual([...assets].sort(), [...expected].sort());
});

test('everything index.html links to exists', () => {
  const html = read('index.html');
  const links = [...html.matchAll(/(?:href|src)="([^":#]+)"/g)].map((m) => m[1]);
  assert.ok(links.length > 0);
  for (const link of links) assert.ok(existsSync(join(SITE, link)), link);
});

test('every id the scripts look up exists in index.html', () => {
  const html = read('index.html');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const file of ['js/app.js', 'js/editor.js']) {
    for (const [, id] of read(file).matchAll(/\$\('([^']+)'\)/g)) {
      // ids inside markup the scripts build themselves are fine
      if (read(file).includes(`id="${id}"`)) continue;
      assert.ok(ids.has(id), `${file} looks up #${id}`);
    }
  }
});

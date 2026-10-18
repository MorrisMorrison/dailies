// The published folder: every file the page needs is cached for offline use, and every file it links exists.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SITE, NOT_CACHED, siteFiles } from '../scripts/site-files.js';

const read = (file) => readFileSync(join(SITE, file), 'utf8');
const filesIn = () => siteFiles();

// `npm run release` keeps sw.js and index.html in step with the files; these tests catch a forgotten run.
test('the service worker caches every file of the site', () => {
  const assets = [...read('sw.js').matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]).filter(Boolean);
  const expected = filesIn().filter((file) => !NOT_CACHED.has(file));
  assert.deepEqual([...assets].sort(), [...expected].sort());
});

test('everything index.html links to exists', () => {
  const html = read('index.html');
  const links = [...html.matchAll(/(?:href|src)="([^":#]+)"/g)].map((m) => m[1].split('?')[0]);
  assert.ok(links.length > 0);
  for (const link of links) assert.ok(existsSync(join(SITE, link)), link);
});

// ---- Versioned URLs: a page must never mix scripts and styles from two releases out of a cache.

const VERSION = read('sw.js').match(/const CACHE = 'dailies-v(\d+)'/)[1];
const importMap = () => JSON.parse(read('index.html').match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;

test('every stylesheet and script in index.html carries the release version from sw.js', () => {
  const html = read('index.html');
  const assets = [...html.matchAll(/(?:href|src)="((?:css|js)\/[^"]+)"/g)].map((m) => m[1]);
  assert.ok(assets.length >= 3);
  for (const url of assets) assert.match(url, new RegExp(`\\?v=${VERSION}$`), url);
});

test('the import map sends every module to its versioned URL', () => {
  const modules = filesIn().filter((f) => /^js\/.*\.js$/.test(f));
  const map = importMap();
  assert.deepEqual(Object.keys(map).sort(), modules.map((f) => `./${f}`).sort(), 'one entry per module');
  for (const [from, to] of Object.entries(map)) assert.equal(to, `${from}?v=${VERSION}`, from);
});

test('modules import each other by plain relative paths, which the import map can version', () => {
  for (const file of filesIn().filter((f) => /^js\/.*\.js$/.test(f))) {
    for (const [, path] of read(file).matchAll(/^import [^'"]*['"]([^'"]+)['"]/gm)) {
      assert.match(path, /^\.\/[\w-]+\.js$/, `${file} imports ${path}`);
    }
  }
});

test('every id the scripts look up exists in index.html', () => {
  const html = read('index.html');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const file of ['js/app.js', 'js/editor.js', 'js/share.js', 'js/celebrate.js']) {
    for (const [, id] of read(file).matchAll(/\$\('([^']+)'\)/g)) {
      // ids inside markup the scripts build themselves are fine
      if (read(file).includes(`id="${id}"`)) continue;
      assert.ok(ids.has(id), `${file} looks up #${id}`);
    }
  }
});

test('the Edit dialog never sizes its column from a 0% flex basis', () => {
  // The dialog only has a max-height. Older Safari engines (iPad/iOS) take a 0% basis (`flex: 1`) on
  // its form and list literally, collapse the dialog to zero height and show only the backdrop.
  const css = read('css/editor.css');
  const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const selector of ['.editor form', '.editor-list']) {
    const rule = css.match(new RegExp(`^${escape(selector)} \\{([^}]*)\\}`, 'm'))?.[1];
    assert.ok(rule, `${selector} rule exists`);
    assert.match(rule, /flex: 1 1 auto;/, `${selector} grows from its content`);
  }
});

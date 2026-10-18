// What's in the published site, shared by the release script and the tests, so the list of files the
// service worker caches and the import map are worked out in one place.
import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITE = fileURLToPath(new URL('../site/', import.meta.url));

// Files the service worker doesn't cache: itself, the font licence, the extended-Latin font subset
// (only downloaded when a name uses those characters), and the images only link previews and install
// screens fetch.
export const NOT_CACHED = new Set(['sw.js', 'fonts/OFL.txt', 'fonts/manrope-latin-ext.woff2',
  'img/og.png', 'img/screenshot-day.png', 'img/screenshot-done.png']);

/** Every file under site/, as paths like "js/app.js". */
export const siteFiles = (dir = SITE) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
  entry.isDirectory() ? siteFiles(join(dir, entry.name)) : [relative(SITE, join(dir, entry.name)).replaceAll('\\', '/')]);

const FOLDERS = ['', 'css', 'js', 'img', 'fonts'];
const folder = (file) => (file.includes('/') ? file.split('/')[0] : '');

/** The service worker's ASSETS: the page first, then the files folder by folder. */
export function cachedFiles() {
  const files = siteFiles().filter((file) => !NOT_CACHED.has(file));
  const rank = (file) => (file === 'index.html' ? -2 : file === 'manifest.webmanifest' ? -1 : FOLDERS.indexOf(folder(file)) + 1 || 99);
  return ['./', ...files.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b)).map((file) => `./${file}`)];
}

/** The modules the import map has to cover. */
export const modules = () => siteFiles().filter((file) => /^js\/[^/]+\.js$/.test(file)).sort();

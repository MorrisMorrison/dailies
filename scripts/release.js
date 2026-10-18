// Prepares a release after changing anything under site/: bumps the service worker's CACHE, gives every
// script and stylesheet URL in index.html the same version (?v=N), and rebuilds the service worker's
// ASSETS list and the import map from the files actually in site/.
// Usage: npm run release
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE, cachedFiles, modules } from './site-files.js';

const swPath = join(SITE, 'sw.js');
const htmlPath = join(SITE, 'index.html');
let sw = readFileSync(swPath, 'utf8');
let html = readFileSync(htmlPath, 'utf8');

const current = Number(sw.match(/const CACHE = 'dailies-v(\d+)';/)?.[1]);
if (!current) throw new Error('No "const CACHE = \'dailies-vN\'" in site/sw.js');
const next = current + 1;

// Keep each file's own line endings (CRLF in a Windows checkout).
const eol = (text) => (text.includes('\r\n') ? '\r\n' : '\n');
const lines = (text, list) => list.join(eol(text));

sw = sw.replace(/const CACHE = 'dailies-v\d+';/, `const CACHE = 'dailies-v${next}';`);
sw = sw.replace(/const ASSETS = \[[\s\S]*?\];/, lines(sw, ['const ASSETS = [', ...cachedFiles().map((file) => `  '${file}',`), '];']));

const map = modules().map((file, i, all) => `    "./${file}": "./${file}?v=${next}"${i < all.length - 1 ? ',' : ''}`);
html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/, lines(html, ['<script type="importmap">', '{', '  "imports": {', ...map, '  }', '}', '</script>']));
html = html.replace(/\?v=\d+/g, `?v=${next}`);

writeFileSync(swPath, sw);
writeFileSync(htmlPath, html);
console.log(`Release v${next}: CACHE dailies-v${next}, ${cachedFiles().length} cached files, ${modules().length} modules in the import map.`);

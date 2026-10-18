// Turns the raw browser coverage the tests wrote (COVERAGE=1) into one lcov report of site/js/, for
// Codecov. Usage: node tests/browser/coverage-report.js
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { CoverageReport } from 'monocart-coverage-reports';

const root = fileURLToPath(new URL('../../', import.meta.url));
const raw = path.join(root, 'coverage/browser-raw');
const files = (await readdir(raw).catch(() => [])).filter((f) => f.endsWith('.json'));
if (!files.length) {
  console.log('no browser coverage collected (run the browser tests with COVERAGE=1)');
  process.exit(0);
}

const report = new CoverageReport({
  name: 'Dailies browser tests',
  outputDir: path.join(root, 'coverage/browser'),
  reports: ['lcovonly', 'console-summary'],
  // https://dailies.local/js/app.js?v=13 → site/js/app.js
  // (the version query arrives as "?v=13" or, already flattened, "-v=13")
  sourcePath: (file) => file.replace(/^dailies\.local\//, 'site/').replace(/[?-]v=\d+$/, ''),
  cleanCache: true,
});
for (const file of files) await report.add(JSON.parse(await readFile(path.join(raw, file), 'utf8')));
await report.generate();

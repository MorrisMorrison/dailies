// Shared set-up for the browser tests: real WebKit (iPhone) and Chromium (Android, desktop), with the
// site served straight from disk at https://dailies.local and a seeded state and clock.
import { chromium, webkit, devices } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE = fileURLToPath(new URL('../../site/', import.meta.url));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

export const DEFAULTS = ['outside', 'move', 'hydrate', 'nourish', 'rest', 'connect'];
export const UA = {
  instagram: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 389.0.0.20.86',
};

// Chromium as Playwright downloads it (CI); locally it falls back to an installed Microsoft Edge.
async function launchChromium() {
  try { return await chromium.launch(); } catch { return chromium.launch({ channel: 'msedge' }); }
}

/** The three kinds of visitor: an iPhone (WebKit), an Android phone and a desktop (Chromium). */
export const PLATFORMS = {
  iphone: { launch: () => webkit.launch(), device: devices['iPhone 13'] },
  android: { launch: launchChromium, device: devices['Pixel 7'] },
  desktop: { launch: launchChromium, device: { viewport: { width: 1200, height: 800 } } },
};

const browsers = {};
/** One browser per engine for the whole test file; call closeAll() in `after`. */
export async function browserFor(platform) {
  const key = platform === 'iphone' ? 'webkit' : 'chromium';
  browsers[key] ??= PLATFORMS[platform].launch();
  return browsers[key];
}
export async function closeAll() {
  for (const b of Object.values(browsers)) await (await b).close();
  for (const key of Object.keys(browsers)) delete browsers[key];
  await saveCoverage();
}

// ---- Coverage (COVERAGE=1): Chromium reports which parts of the site's scripts ran (WebKit can't).
// Each test file writes its raw V8 coverage to coverage/browser-raw/; coverage-report.js turns them
// into one lcov report.
const COVERAGE = Boolean(process.env.COVERAGE);
const collected = [];

async function trackCoverage(platform, page, context) {
  if (!COVERAGE || platform === 'iphone') return;
  await page.coverage.startJSCoverage({ resetOnNavigation: false });
  const close = context.close.bind(context);
  context.close = async (...args) => {
    const entries = await page.coverage.stopJSCoverage();
    collected.push(...entries.filter((e) => /^https:\/\/dailies\.local\/js\//.test(e.url)));
    return close(...args);
  };
}

async function saveCoverage() {
  if (!COVERAGE || !collected.length) return;
  const dir = fileURLToPath(new URL('../../coverage/browser-raw/', import.meta.url));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${process.pid}-${Date.now()}.json`), JSON.stringify(collected.splice(0)));
}

const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Opens Dailies on `platform` with a seeded state. The state is written on the first load only, so
 * reloads keep what the page saved. Returns { page, context, errors } (errors collects page errors).
 * - date: the clock (default 9 June 2026, 19:30)
 * - done, enabled, history, custom, quotes: the stored state
 * - ua: a user agent instead of the device's
 * - reducedMotion, viewport, standalone (iOS home-screen mode), dismissed (the home-screen card)
 */
export async function open(platform, {
  date = new Date(2026, 5, 9, 19, 30), done = [], enabled = DEFAULTS, history = [], custom = [], quotes,
  ua, reducedMotion = 'no-preference', viewport, standalone = false, dismissed = true, vibrate = true,
} = {}) {
  const browser = await browserFor(platform);
  const { device } = PLATFORMS[platform];
  const context = await browser.newContext({
    ...device, ...(viewport ? { viewport } : {}), ...(ua ? { userAgent: ua } : {}),
    serviceWorkers: 'block', reducedMotion, timezoneId: 'Europe/Berlin', locale: 'en-GB',
  });
  await context.route('https://dailies.local/**', async (route) => {
    let file = new URL(route.request().url()).pathname;
    if (file.endsWith('/')) file += 'index.html';
    try { await route.fulfill({ body: await readFile(path.join(SITE, file)), contentType: TYPES[path.extname(file)] }); }
    catch { await route.fulfill({ status: 404 }); }
  });
  const state = { day: dayKey(date), enabled, done, history, custom, ...(quotes ? { quotes } : {}) };
  await context.addInitScript(([state, dismissed, standalone, vibrate]) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('dailies:v1', JSON.stringify(state));
      if (dismissed) localStorage.setItem('dailies:install-dismissed', '2026-01-01');
      sessionStorage.setItem('seeded', '1');
    }
    if (standalone) Object.defineProperty(navigator, 'standalone', { value: true });
    // Count vibrations (Safari has none of its own; Chromium's needs a real device).
    window.__vibrations = 0;
    if (vibrate) navigator.vibrate = () => { window.__vibrations++; return true; };
  }, [state, dismissed, standalone, vibrate]);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.clock.setFixedTime(date);
  await trackCoverage(platform, page, context);
  await page.goto('https://dailies.local/');
  await page.waitForSelector('.card');
  return { page, context, errors };
}

/** Ticks the first daily that isn't done yet. */
export const tickNext = (page) => page.$eval('.card[aria-pressed="false"]', (card) => card.click());
/** The number of shooting stars in the air, and whether the resting star is there. */
export const sky = (page) => page.evaluate(() => ({
  meteors: document.querySelectorAll('#meteors .meteor').length,
  wish: document.querySelectorAll('#meteors .wish').length,
}));

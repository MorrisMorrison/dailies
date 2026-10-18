// The home-screen button and its sheet, per kind of browser, and the reminder card.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { open, closeAll, UA } from './harness.js';

after(closeAll);

const buttonShown = (page) => page.$eval('#install-open', (b) => !b.hidden);
const sheet = async (page) => {
  await page.click('#install-open');
  return page.evaluate(() => ({
    open: document.getElementById('install-sheet').open,
    steps: [...document.querySelectorAll('#install-steps li')].map((li) => li.textContent),
    copy: !document.getElementById('install-copy').hidden,
  }));
};

test('iphone: the download button opens the Share → Add to Home Screen steps', async () => {
  const { page, context, errors } = await open('iphone');
  assert.equal(await buttonShown(page), true);
  const s = await sheet(page);
  assert.equal(s.open, true);
  assert.match(s.steps.join(' '), /Add to Home Screen/);
  assert.equal(s.copy, false);
  await page.click('#install-sheet .button-primary');
  assert.equal(await page.$eval('#install-sheet', (d) => d.open), false);
  assert.deepEqual(errors, []);
  await context.close();
});

test('in-app browser (Instagram): the sheet says to open Safari or Chrome, with Copy link', async () => {
  const { page, context } = await open('iphone', { ua: UA.instagram });
  const s = await sheet(page);
  assert.match(s.steps.join(' '), /Open in browser/);
  assert.equal(s.copy, true);
  await context.close();
});

test('android without an install prompt: the sheet points to the browser menu', async () => {
  const { page, context } = await open('android');
  const s = await sheet(page);
  assert.match(s.steps.join(' '), /Install app/);
  await context.close();
});

test('android with an install prompt: the button opens it, and hides once installed', async () => {
  const { page, context } = await open('android');
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt', { cancelable: true });
    event.prompt = () => { window.__prompted = true; };
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    dispatchEvent(event);
  });
  await page.click('#install-open');
  await page.waitForFunction(() => document.getElementById('install-open').hidden);
  assert.equal(await page.evaluate(() => window.__prompted), true);
  assert.equal(await page.$eval('#install-sheet', (d) => d.open), false, 'no sheet when the browser can install');
  await context.close();
});

test('no button on desktop, or when Dailies already runs from the home screen', async () => {
  const desktop = await open('desktop');
  assert.equal(await buttonShown(desktop.page), false);
  await desktop.context.close();
  const installed = await open('iphone', { standalone: true });
  assert.equal(await buttonShown(installed.page), false);
  await installed.context.close();
});

test('the reminder card shows after an earlier finished day, and "No thanks" keeps it away', async () => {
  const first = await open('iphone', { dismissed: false, history: [] });
  assert.equal(await first.page.$eval('#install', (c) => c.hidden), true, 'not on a first visit');
  await first.context.close();

  const { page, context } = await open('iphone', { dismissed: false, history: ['2026-06-08'] });
  assert.equal(await page.$eval('#install', (c) => c.hidden), false);
  await page.click('#install-dismiss');
  assert.equal(await page.$eval('#install', (c) => c.hidden), true);
  await page.reload(); await page.waitForSelector('.card');
  assert.equal(await page.$eval('#install', (c) => c.hidden), true, 'stays dismissed');
  await context.close();
});

test('the footer Share button copies the link where there is no share sheet', async () => {
  const { page, context } = await open('desktop');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.evaluate(() => { delete Navigator.prototype.share; });
  await page.click('#share');
  await page.waitForFunction(() => document.getElementById('share').textContent === 'Link copied');
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'https://dailies.local/');
  await context.close();
});


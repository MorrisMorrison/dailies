// The home-screen button and its sheet, per kind of browser, and the reminder card.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { open, closeAll, UA, DEFAULTS, tickNext } from './harness.js';

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

test('in-app browsers get a line at the top with a way out to the real browser, and no card', async () => {
  const PINTEREST_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Pinterest/iOS';
  const ios = await open('iphone', { ua: PINTEREST_IOS, dismissed: false, done: DEFAULTS.slice(0, 5) });
  await tickNext(ios.page); // a finished day would bring the card elsewhere
  assert.equal(await ios.page.$eval('#inapp', (s) => s.hidden), false);
  assert.match(await ios.page.textContent('#inapp-text'), /Pinterest’s browser.*Safari/);
  assert.deepEqual(await ios.page.$eval('#inapp-open', (a) => [a.textContent, a.getAttribute('href')]), ['Open in Safari', 'x-safari-https://dailies.local/']);
  assert.equal(await ios.page.$eval('#install', (c) => c.hidden), true, 'the line takes over from the card');
  await ios.context.close();

  const android = await open('android', { ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 8 Build/AP3A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/155.0.0.0 Mobile Safari/537.36 [Pinterest/Android]' });
  assert.equal(await android.page.$eval('#inapp-open', (a) => a.getAttribute('href')), 'intent://dailies.local/#Intent;scheme=https;end');
  await android.context.close();

  const safari = await open('iphone');
  assert.equal(await safari.page.$eval('#inapp', (s) => s.hidden), true, 'not in Safari itself');
  await safari.context.close();
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

test('the home-screen card comes with the first finished day, at the top, and "No thanks" keeps it away', async () => {
  const { page, context } = await open('iphone', { dismissed: false, done: DEFAULTS.slice(0, 5) });
  assert.equal(await page.$eval('#install', (c) => c.hidden), true, 'not before the day is finished');
  await tickNext(page);
  await page.waitForFunction(() => !document.getElementById('install').hidden);
  assert.equal(await page.$eval('#install', (c) => c.nextElementSibling.matches('header.top')), true, 'at the top, where the in-app line goes');
  assert.match(await page.textContent('#install-text'), /Add to Home Screen/);
  assert.doesNotMatch(await page.textContent('#install-text'), /like an app/);
  await page.click('.card[data-id="move"]'); // unticking: the day isn't finished any more
  assert.equal(await page.$eval('#install', (c) => c.hidden), true, 'gone with the finished day');
  await page.click('.card[data-id="move"]');
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


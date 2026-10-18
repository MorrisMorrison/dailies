// Finishing the day: the shooting stars, scrolling to the sky, the vibration and the kept quote.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { open, closeAll, tickNext, sky, DEFAULTS } from './harness.js';

after(closeAll);
const wait = (page, ms) => page.waitForTimeout(ms);

for (const platform of ['iphone', 'android']) {
  test(`${platform}: the last tick brings the shooting stars, then only the resting star stays`, async () => {
    const { page, context, errors } = await open(platform, { done: DEFAULTS.slice(0, 5) });
    assert.deepEqual(await sky(page), { meteors: 0, wish: 0 });
    await tickNext(page);
    await wait(page, 2200);
    const during = await sky(page);
    assert.ok(during.meteors >= 5, `${during.meteors} shooting stars`);
    assert.equal(during.wish, 1);
    await wait(page, 4800);
    assert.deepEqual(await sky(page), { meteors: 0, wish: 1 }, 'streaks remove themselves');
    assert.deepEqual(errors, []);
    await context.close();
  });
}

test('unticking clears the sky, and finishing again plays it again', async () => {
  const { page, context } = await open('android', { done: DEFAULTS.slice(0, 5) });
  await tickNext(page);
  await wait(page, 1600);
  await page.$eval('.card[aria-pressed="true"]', (c) => c.click());
  assert.deepEqual(await sky(page), { meteors: 0, wish: 0 });
  await tickNext(page);
  await wait(page, 2200);
  assert.ok((await sky(page)).meteors >= 5);
  await context.close();
});

test('no shooting stars when the page opens on a finished day, or with reduced motion', async () => {
  const done = await open('android', { done: DEFAULTS, history: ['2026-06-09'] });
  await wait(done.page, 2200);
  assert.deepEqual(await sky(done.page), { meteors: 0, wish: 0 });
  assert.equal(await done.page.evaluate(() => window.__vibrations), 0, 'no vibration on load either');
  await done.context.close();

  const calm = await open('iphone', { done: DEFAULTS.slice(0, 5), reducedMotion: 'reduce' });
  await tickNext(calm.page);
  await wait(calm.page, 2200);
  assert.deepEqual(await sky(calm.page), { meteors: 0, wish: 0 });
  await calm.context.close();
});

for (const platform of ['iphone', 'android']) {
  test(`${platform}: finishing far down a long list scrolls back to the sky and vibrates once`, async () => {
    const enabled = [...DEFAULTS, 'breathe', 'gratitude', 'play', 'tidy'];
    const { page, context } = await open(platform, { enabled, done: enabled.slice(0, 9), viewport: { width: 375, height: 812 } });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    assert.ok(await page.evaluate(() => scrollY) > 300, 'starts scrolled down');
    await tickNext(page);
    await wait(page, 1200);
    assert.equal(await page.evaluate(() => Math.round(scrollY)), 0);
    assert.equal(await page.evaluate(() => window.__vibrations), 1);
    await wait(page, 1000);
    assert.ok((await sky(page)).meteors >= 5, 'the shower is in view');
    await context.close();
  });
}

test('the quote earned on finishing stays after changing collections and reloading', async () => {
  const { page, context } = await open('iphone', { done: DEFAULTS.slice(0, 5) });
  await tickNext(page);
  const quote = await page.textContent('#quote-text');
  await page.click('#edit');
  for (const id of ['nature', 'stoics', 'poetry', 'stories']) await page.click(`input[value="${id}"]`);
  await page.click('#editor footer .button-primary');
  assert.equal(await page.textContent('#quote-text'), quote);
  await page.reload(); await page.waitForSelector('.card');
  assert.equal(await page.textContent('#quote-text'), quote);
  await context.close();
});

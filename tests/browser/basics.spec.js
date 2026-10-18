// The page itself: it loads cleanly, ticking works, and the Edit dialog never collapses in WebKit.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { open, closeAll, tickNext } from './harness.js';

after(closeAll);

for (const platform of ['iphone', 'android', 'desktop']) {
  test(`${platform}: loads without errors, and ticking moves the count and the sun`, async () => {
    const { page, context, errors } = await open(platform, { date: new Date(2026, 5, 9, 9, 0) });
    assert.equal(await page.textContent('#count'), '0/6');
    const sunBefore = await page.$eval('#sun', (s) => s.style.transform);
    await tickNext(page);
    assert.equal(await page.textContent('#count'), '1/6');
    assert.equal(await page.$eval('.card', (c) => c.getAttribute('aria-pressed')), 'true');
    assert.notEqual(await page.$eval('#sun', (s) => s.style.transform), sunBefore);
    await page.reload(); await page.waitForSelector('.card');
    assert.equal(await page.textContent('#count'), '1/6', 'the tick is kept on the device');
    assert.deepEqual(errors, []);
    await context.close();
  });
}

test('iphone: the Edit dialog opens at full height (the iPad flex-basis bug)', async () => {
  const { page, context } = await open('iphone');
  await page.click('#edit');
  const height = await page.$eval('#editor', (d) => d.getBoundingClientRect().height);
  assert.ok(height > 300, `dialog is ${height}px tall`);
  await context.close();
});

// The Edit dialog: switching dailies, adding and removing your own, quote collections, Reset.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { open, closeAll, DEFAULTS } from './harness.js';

after(closeAll);

const cards = (page) => page.$$eval('.card strong', (s) => s.map((x) => x.textContent));
const openEdit = async (page) => { await page.click('#edit'); await page.waitForSelector('#editor[open]'); };
const done = (page) => page.click('#editor footer .button-primary');

test('switching dailies on and off changes the cards, and one always stays on', async () => {
  const { page, context, errors } = await open('iphone');
  await openEdit(page);
  await page.click('.editor-row[data-id="breathe"] input');
  await page.click('.editor-row[data-id="outside"] input');
  await done(page);
  const shown = await cards(page);
  assert.ok(shown.includes('Breathe') && !shown.includes('Get outside'), shown.join());

  await openEdit(page);
  for (const id of DEFAULTS.slice(1)) await page.click(`.editor-row[data-id="${id}"] input`);
  await page.click('.editor-row[data-id="breathe"] input'); // the last one: must stay on
  assert.equal(await page.$eval('.editor-row[data-id="breathe"] input', (b) => b.checked), true);
  await done(page);
  assert.deepEqual(await cards(page), ['Breathe']);
  assert.deepEqual(errors, []);
  await context.close();
});

test('adding your own daily with an icon, and removing it again', async () => {
  const { page, context } = await open('android');
  await openEdit(page);
  await page.fill('#editor-name', 'Stretch');
  await page.click('.editor-icons input[value="leaf"]');
  await page.click('[data-add]');
  assert.equal(await page.textContent('[data-add]'), 'Added ✓');
  await done(page);
  assert.ok((await cards(page)).includes('Stretch'));

  await openEdit(page);
  await page.click('.editor-row:has(.editor-remove) .editor-remove');
  await done(page);
  assert.ok(!(await cards(page)).includes('Stretch'));
  await context.close();
});

test('Reset to defaults brings back the six', async () => {
  const { page, context } = await open('iphone', { enabled: ['breathe', 'play'] });
  await openEdit(page);
  await page.click('#editor-reset');
  await done(page);
  assert.equal((await cards(page)).length, 6);
  await context.close();
});

test('quote collections: Classic by default, a new choice changes the quote and is kept', async () => {
  const { page, context } = await open('iphone', { done: [] });
  await openEdit(page);
  const chosen = () => page.$$eval('input[name="editor-quotes"]:checked', (b) => b.map((x) => x.value));
  assert.deepEqual(await chosen(), ['classic']);
  await page.click('input[value="stories"]');
  await page.click('input[value="classic"]');
  await page.click('input[value="stories"]'); // the last one: must stay chosen
  assert.deepEqual(await chosen(), ['stories']);
  await done(page);
  await page.reload(); await page.waitForSelector('.card');
  await openEdit(page);
  assert.deepEqual(await chosen(), ['stories'], 'kept on the device');
  await context.close();
});

test('the quote follows the chosen collection until the day is finished', async () => {
  const { page, context } = await open('android', { done: DEFAULTS.slice(0, 5), quotes: ['stories'] });
  await page.$eval('.card[aria-pressed="false"]', (c) => c.click());
  const by = await page.textContent('#quote-by');
  const storybook = /Montgomery|Burnett|Porter|Grahame|Alcott|Barrie|Williams|Carroll|Baum|Dickens/;
  assert.match(by, storybook, by);
  await context.close();
});

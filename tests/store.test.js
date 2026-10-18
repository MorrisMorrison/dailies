// On-device state: custom dailies, ticks, validation of stored data, and finished-day history.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// A localStorage stand-in. store.js reads it when imported, so it has to exist first.
const saved = new Map();
globalThis.localStorage = {
  getItem: (key) => saved.get(key) ?? null,
  setItem: (key, value) => saved.set(key, value),
};
const store = await import('../site/js/store.js');
const { DEFAULT_ENABLED, MAX_CUSTOM, MAX_LABEL } = await import('../site/js/dailies.js');

const KEY = 'dailies:v1';
const stored = () => JSON.parse(saved.get(KEY));
const useStored = (value) => {
  saved.set(KEY, JSON.stringify(value));
  store.reload();
};
const today = store.dayKey();

beforeEach(() => {
  saved.clear();
  store.reload();
});

test('starts with the six defaults switched on', () => {
  assert.deepEqual(store.enabledDailies().map((d) => d.id), DEFAULT_ENABLED);
  assert.deepEqual(store.progress(), { done: 0, total: 6, ratio: 0 });
});

test('adds a custom daily: cleaned name, chosen icon, switched on', () => {
  const id = store.addCustom('  Water   the plants  ', 'leaf');
  assert.match(id, /^c-[a-z0-9]+$/);
  const daily = store.enabledDailies().find((d) => d.id === id);
  assert.equal(daily.label, 'Water the plants');
  assert.equal(daily.icon, 'leaf');
  assert.equal(daily.custom, true);
});

test('rejects empty names, caps length, falls back to the default icon', () => {
  assert.equal(store.addCustom('   ', 'leaf'), null);
  const id = store.addCustom('x'.repeat(50), 'no-such-icon');
  const daily = store.allDailies().find((d) => d.id === id);
  assert.equal(daily.label.length, MAX_LABEL);
  assert.equal(daily.icon, 'star');
});

test(`allows at most ${MAX_CUSTOM} custom dailies`, () => {
  for (let i = 0; i < MAX_CUSTOM + 5; i++) store.addCustom(`Daily ${i}`, 'cup');
  assert.equal(store.customCount(), MAX_CUSTOM);
});

test('removing a custom daily also removes its tick', () => {
  const id = store.addCustom('Stretch', 'dumbbell');
  store.toggle(id);
  assert.equal(store.isDone(id), true);
  store.removeCustom(id);
  assert.equal(store.isDone(id), false);
  assert.equal(store.allDailies().some((d) => d.id === id), false);
});

test('keeps at least one daily switched on', () => {
  store.setEnabled([]);
  assert.deepEqual(store.enabledDailies().map((d) => d.id), DEFAULT_ENABLED);
});

test('drops ticks from another day but keeps the list', () => {
  useStored({ day: '2020-01-01', enabled: ['outside', 'move'], done: ['outside'] });
  assert.deepEqual(store.enabledDailies().map((d) => d.id), ['outside', 'move']);
  assert.equal(store.isDone('outside'), false);
});

test('cleans tampered storage: bad ids, empty names, unknown icons and references', () => {
  useStored({
    day: today,
    enabled: ['outside', 'c-evil<', 'bogus'],
    done: ['c-evil<'],
    custom: [
      { id: 'c-evil<', label: '<b>x</b>', icon: 'star' },
      { id: 'c-empty1', label: '   ', icon: 'star' },
      { id: 'c-good12', label: '<b>hi</b>', icon: 'nope' },
    ],
    history: ['2026-01-02', 'junk', '2026-01-02', 42],
  });
  const custom = store.allDailies().filter((d) => d.custom);
  assert.deepEqual(custom.map((d) => [d.id, d.label, d.icon]), [['c-good12', '<b>hi</b>', 'star']]);
  assert.deepEqual(store.enabledDailies().map((d) => d.id), ['outside']);
  assert.equal(store.finishedDays(), 1);
});

test('today becomes a finished day only while everything is ticked', () => {
  useStored({ day: today, enabled: ['outside', 'move'], done: [], history: ['2026-01-01'] });
  store.toggle('outside');
  assert.equal(store.finishedDays(), 1);
  store.toggle('move');
  assert.equal(store.finishedDays(), 2);
  assert.ok(stored().history.includes(today));
  store.toggle('move');
  assert.equal(store.finishedDays(), 1, 'unticking takes the star back');
  store.toggle('move');
  store.addCustom('Read', 'learn');
  assert.equal(store.finishedDays(), 1, 'a new unticked daily takes it back too');
});

test('tells listeners about every change', () => {
  let calls = 0;
  const stop = store.subscribe(() => calls++);
  store.toggle('outside');
  store.toggle('outside');
  stop();
  store.toggle('outside');
  assert.equal(calls, 2);
});

test('counts finished days before today separately', () => {
  useStored({ day: today, enabled: ['outside'], done: ['outside'], history: ['2020-01-01', today] });
  assert.equal(store.finishedDays(), 2);
  assert.equal(store.earlierFinishedDays(), 1);
});

test('quote collections: Classic by default, cleaned on load, at least one kept', () => {
  assert.deepEqual(store.quoteCollections(), ['classic']);
  useStored({ day: today, quotes: ['nature', 'nope', 'nature', 'stories'] });
  assert.deepEqual(store.quoteCollections(), ['nature', 'stories']);
  store.setQuoteCollections([]);
  assert.deepEqual(store.quoteCollections(), ['nature', 'stories'], 'an empty choice is ignored');
  store.setQuoteCollections(['poetry']);
  assert.deepEqual(stored().quotes, ['poetry']);
});

test('the quote kept on finishing stays for today only', () => {
  assert.equal(store.keptQuote(), null);
  store.keepQuote('A quote.');
  assert.equal(store.keptQuote(), 'A quote.');
  assert.equal(stored().keptQuote, 'A quote.');
  store.setQuoteCollections(['poetry']);
  assert.equal(store.keptQuote(), 'A quote.', 'changing collections keeps it');
  useStored({ ...stored(), day: '2020-01-01' });
  assert.equal(store.keptQuote(), null, 'a new day drops it');
});

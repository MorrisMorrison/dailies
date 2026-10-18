// Content rules: quotes rotate without repeats, constellations fill up correctly, icons and dailies line up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUOTES, COLLECTIONS, DEFAULT_COLLECTIONS, isCollection, quoteFor, quotesIn } from '../site/js/quotes.js';
import { CONSTELLATIONS, CYCLE, skyFor } from '../site/js/constellations.js';
import { ICONS, isIcon } from '../site/js/icons.js';
import { BUILTIN } from '../site/js/dailies.js';
import { greeting, dayLine } from '../site/js/greeting.js';

const day = (offset) => new Date(Date.UTC(2026, 0, 1) + offset * 864e5).toISOString().slice(0, 10);
const author = (quote) => quote.by.split(',')[0];

// Every choice someone can make in Edit: each non-empty combination of collections.
const CHOICES = [];
for (let mask = 1; mask < 1 << COLLECTIONS.length; mask++) CHOICES.push(COLLECTIONS.filter((_, i) => mask & (1 << i)).map((c) => c.id));

test('every quote has text, an author, a source and at least one collection', () => {
  for (const q of QUOTES) assert.ok(q.text && q.by && q.from && q.sets.length && q.sets.every(isCollection), JSON.stringify(q));
  assert.equal(new Set(QUOTES.map((q) => q.text)).size, QUOTES.length, 'no duplicates');
});

test('every collection has enough quotes for weeks without a repeat', () => {
  for (const { id } of COLLECTIONS) assert.ok(quotesIn([id]).length >= 20, `${id}: ${quotesIn([id]).length}`);
  assert.equal(quotesIn(DEFAULT_COLLECTIONS).length, 36, 'Classic keeps its 36');
});

test('no quote repeats until every quote of the chosen collections has shown', () => {
  for (const choice of CHOICES) {
    const size = quotesIn(choice).length;
    for (let start = 0; start < 60; start++) {
      const shown = new Set();
      for (let i = 0; i < size; i++) shown.add(quoteFor(day(start + i), choice).text);
      assert.equal(shown.size, size, `${choice} from ${day(start)}`);
    }
  }
});

test('the same author never comes up two days running, whatever is chosen', () => {
  for (const choice of CHOICES) {
    for (let i = 0; i < 200; i++) assert.notEqual(author(quoteFor(day(i), choice)), author(quoteFor(day(i + 1), choice)), `${choice} on ${day(i)}`);
  }
});

test('unknown or no collections fall back to Classic', () => {
  assert.deepEqual(quotesIn([]), quotesIn(DEFAULT_COLLECTIONS));
  assert.deepEqual(quotesIn(['nope']), quotesIn(DEFAULT_COLLECTIONS));
});

test('constellations fill one star at a time and wrap around', () => {
  assert.deepEqual(skyFor(0), { constellation: CONSTELLATIONS[0], lit: 0, completed: 0 });
  for (let n = 1; n < CYCLE * 2 + 5; n++) {
    const a = skyFor(n);
    const b = skyFor(n + 1);
    const completesIt = b.lit === b.constellation.stars.length ? 1 : 0;
    const nextStar = b.constellation === a.constellation && b.lit === a.lit + 1 && b.completed === a.completed + completesIt;
    const nextConstellation = a.lit === a.constellation.stars.length && b.lit === 1 && b.completed === a.completed;
    assert.ok(nextStar || nextConstellation, `from ${n} to ${n + 1} finished days`);
  }
  assert.equal(skyFor(CYCLE).completed, CONSTELLATIONS.length);
});

test('constellation data stays inside its box and links real stars', () => {
  for (const { name, stars, links } of CONSTELLATIONS) {
    for (const [x, y] of stars) assert.ok(x >= 0 && x <= 300 && y >= 0 && y <= 120, `${name} star at ${x},${y}`);
    for (const [a, b] of links) assert.ok(stars[a] && stars[b] && a !== b, `${name} link ${a}-${b}`);
  }
});

test('every built-in daily has an icon, and icon labels are unique', () => {
  for (const daily of BUILTIN) assert.ok(isIcon(daily.icon), daily.id);
  const labels = Object.values(ICONS).map((i) => i.label);
  assert.equal(new Set(labels).size, labels.length);
});

test('the greeting follows the clock, not progress', () => {
  assert.equal(greeting(3), 'Still up?');
  assert.equal(greeting(8), 'Good morning.');
  assert.equal(greeting(13), 'Good afternoon.');
  assert.equal(greeting(19), 'Good evening.');
  assert.equal(greeting(23), 'Good night.');
});

test('the line under the count combines time of day and progress', () => {
  assert.equal(dayLine(9, 6, 6), 'All done before noon.');
  assert.equal(dayLine(9, 0, 6), 'Fresh start.');
  assert.equal(dayLine(14, 2, 6), 'Keep going.');
  assert.equal(dayLine(20, 6, 6), 'All done. Rest well.');
  assert.equal(dayLine(1, 0, 6), "A quiet day. That's ok.", 'late night reads as evening');
  for (let hour = 0; hour < 24; hour++) for (const done of [0, 3, 6]) assert.ok(dayLine(hour, done, 6), `${hour}h ${done}/6`);
});

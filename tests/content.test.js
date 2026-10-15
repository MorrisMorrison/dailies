// Content rules: quotes rotate without repeats, constellations fill up correctly, icons and dailies line up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUOTES, quoteFor } from '../site/js/quotes.js';
import { CONSTELLATIONS, CYCLE, skyFor } from '../site/js/constellations.js';
import { ICONS, isIcon } from '../site/js/icons.js';
import { BUILTIN } from '../site/js/dailies.js';

const day = (offset) => new Date(Date.UTC(2026, 0, 1) + offset * 864e5).toISOString().slice(0, 10);
const author = (quote) => quote.by.split(',')[0];

test('every quote has text, an author and a source', () => {
  for (const q of QUOTES) assert.ok(q.text && q.by && q.from, JSON.stringify(q));
  assert.equal(new Set(QUOTES.map((q) => q.text)).size, QUOTES.length, 'no duplicates');
});

test('no quote repeats until every quote has shown', () => {
  for (let start = 0; start < 400; start++) {
    const shown = new Set();
    for (let i = 0; i < QUOTES.length; i++) shown.add(quoteFor(day(start + i)).text);
    assert.equal(shown.size, QUOTES.length, `window starting ${day(start)}`);
  }
});

test('the same author never comes up two days running', () => {
  for (let i = 0; i < 400; i++) assert.notEqual(author(quoteFor(day(i))), author(quoteFor(day(i + 1))), day(i));
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

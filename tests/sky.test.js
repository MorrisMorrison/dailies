// The sky: seasons blend smoothly, the hemisphere guess works, and white text always stays readable.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { skyAt, seasonalSky, seasonWeights, hemisphereOf, MIN_CONTRAST, COLOURS } from '../site/js/sky.js';
import { contrast, toRgb } from '../site/js/colour.js';

const day = (n) => new Date(2026, 0, 1 + n);
const RATIOS = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1];

test('season weights always sum to 1 and peak mid-season', () => {
  for (let n = 0; n < 365; n++) {
    const sum = Object.values(seasonWeights(day(n))).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `day ${n}`);
  }
  assert.ok(seasonWeights(new Date(2026, 1, 5)).winter > 0.99, 'early February is full winter');
  assert.ok(seasonWeights(new Date(2026, 7, 6)).summer > 0.99, 'early August is full summer');
  assert.ok(Math.abs(seasonWeights(new Date(2026, 2, 20)).winter - 0.5) < 0.1, 'the March equinox is half winter, half spring');
});

test('the south gets the opposite season', () => {
  assert.ok(seasonWeights(new Date(2026, 1, 5), 'south').summer > 0.99, 'February is summer in the south');
  assert.equal(hemisphereOf('Australia/Sydney'), 'south');
  assert.equal(hemisphereOf('America/Argentina/Buenos_Aires'), 'south');
  assert.equal(hemisphereOf('Europe/Berlin'), 'north');
  assert.equal(hemisphereOf(undefined), 'north');
});

test('colours never jump from one day to the next', () => {
  const distance = (a, b) => Math.max(...toRgb(a).map((v, i) => Math.abs(v - toRgb(b)[i])));
  for (const hemisphere of ['north', 'south']) {
    for (const ratio of [0, 0.5, 1]) {
      for (let n = 0; n < 366; n++) {
        const [a, b] = [seasonalSky(ratio, day(n), hemisphere), seasonalSky(ratio, day(n + 1), hemisphere)];
        for (const key of COLOURS) assert.ok(distance(a[key], b[key]) <= 6, `${hemisphere} ${ratio} day ${n} ${key}`);
      }
    }
  }
});

test('white greeting and count stay readable on every day, at every point of progress', () => {
  for (const hemisphere of ['north', 'south']) {
    for (let n = 0; n < 365; n += 3) {
      for (const ratio of RATIOS) {
        const sky = seasonalSky(ratio, day(n), hemisphere);
        for (const key of ['top', 'middle']) assert.ok(contrast('#ffffff', sky[key]) >= MIN_CONTRAST, `${hemisphere} day ${n} ratio ${ratio} ${key}`);
      }
    }
  }
});

test('the season only nudges the sky', () => {
  const distance = (a, b) => Math.max(...toRgb(a).map((v, i) => Math.abs(v - toRgb(b)[i])));
  for (const ratio of RATIOS) {
    const base = skyAt(ratio);
    for (const date of [new Date(2026, 1, 4), new Date(2026, 7, 6)]) {
      const sky = seasonalSky(ratio, date);
      for (const key of ['top', 'horizon', 'deep']) assert.ok(distance(base[key], sky[key]) <= 60, `${key} at ${ratio}`);
    }
  }
});

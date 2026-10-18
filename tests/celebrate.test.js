// Where the shooting stars fly when the day is finished: across the sky, never over the header buttons.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plan, restingPoint } from '../site/js/celebrate.js';

// Phone widths and sky bands (top of the screen to the horizon line) worth covering.
const SCREENS = [];
for (let width = 320; width <= 430; width += 10) for (let band = 250; band <= 400; band += 25) SCREENS.push([width, band]);

// The header's two round buttons sit in the top-right corner: 16px gutter, 2 × 40px, 8px gap,
// 24px from the top. With a little margin around them.
const overButtons = (width, { x, y }) => x > width - 112 && x < width - 8 && y > 18 && y < 70;

test('six shooting stars, then the wish, all heading left and down', () => {
  const stars = plan(390, 330);
  assert.equal(stars.length, 7);
  for (const { start, end } of stars) {
    assert.ok(end.x < start.x, 'heads left');
    assert.ok(end.y > start.y, 'heads down');
  }
  assert.deepEqual(stars[6].end, restingPoint(390, 330));
});

test('no shooting star, head or tail, crosses the header buttons on a phone', () => {
  for (const [width, band] of SCREENS) {
    for (const { start, end, length } of plan(width, band)) {
      const dx = end.x - start.x, dy = end.y - start.y, d = Math.hypot(dx, dy);
      for (let f = 0; f <= 1; f += 0.02) {
        const head = { x: start.x + dx * f, y: start.y + dy * f };
        // The tail trails back along the path, up and to the right of the head.
        for (const k of [0, 0.5, 1]) {
          const point = { x: head.x - (dx / d) * length * k, y: head.y - (dy / d) * length * k };
          assert.ok(!overButtons(width, point), `${width}×${band}: (${point.x.toFixed(0)}, ${point.y.toFixed(0)})`);
        }
      }
    }
  }
});

test('the wish comes to rest in the free strip between the date and the greeting', () => {
  for (const [width, band] of SCREENS) {
    const { x, y } = restingPoint(width, band);
    assert.ok(y > 64 && y < 86, `y = ${y}`); // header ends at 64px, the greeting starts at ~86px
    assert.ok(x > 16 && x < width - 112, `x = ${x}`);
  }
});

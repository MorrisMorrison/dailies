// The celebration when the day gets finished: a shower of shooting stars across the sky, from the top
// of the screen down to the sun's horizon line, then one slower shooting star that comes to rest as a
// new star between the date and the greeting. Only transform and opacity animate, so it stays smooth
// on slow phones. Skipped for people who prefer reduced motion.
import { $ } from './html.js';

// Each shooting star heads left and down. Start and end are fractions of the screen width and of the
// sky band (top of the screen to the horizon line); length and thickness in pixels, times in ms.
const SHOWER = [
  { from: [1.02, 0.30], to: [0.45, 0.55], delay: 1300, duration: 850, length: 110, thickness: 2 },
  { from: [0.70, -0.02], to: [0.38, 0.16], delay: 1650, duration: 650, length: 70, thickness: 1.5 },
  { from: [1.02, 0.45], to: [0.55, 0.78], delay: 2000, duration: 800, length: 100, thickness: 2 },
  { from: [0.40, 0.05], to: [0.05, 0.28], delay: 2350, duration: 700, length: 70, thickness: 1.5 },
  { from: [0.95, 0.62], to: [0.62, 0.92], delay: 2700, duration: 650, length: 60, thickness: 1 },
  { from: [0.60, 0.50], to: [0.20, 0.76], delay: 3000, duration: 750, length: 80, thickness: 1.5 },
];
// The wish starts at the top edge, left of the header buttons, and slows down to rest.
const WISH = { from: [0.55, -0.04], delay: 3700, duration: 1300, length: 130, thickness: 2.5 };

/** Where the last shooting star comes to rest: the free strip of sky between the date and the greeting. */
// (The header ends 64px from the top and the greeting starts at about 86px, whatever the screen.)
export const restingPoint = (width, band) => ({ x: 0.28 * width, y: Math.min(75, band * 0.5) });

/** Every shooting star in pixels for a sky band `band` px tall on a screen `width` px wide; the wish is last. */
export function plan(width, band) {
  const px = ([fx, fy]) => ({ x: fx * width, y: fy * band });
  const shower = SHOWER.map(({ from, to, ...rest }) => ({ ...rest, start: px(from), end: px(to) }));
  const { from, ...wish } = WISH;
  return [...shower, { ...wish, start: px(from), end: restingPoint(width, band) }];
}

// ---- Drawing.

// The sky band ends at the sun's horizon line, wherever it is on screen now (the layer is fixed, like
// the sky), or at 45% of the screen when the arc is scrolled out of the way.
function skyBand() {
  const arc = document.querySelector('.arc svg').getBoundingClientRect();
  const horizon = arc.top + (arc.height * 170) / 180; // the horizon line in the arc's 320×180 viewBox
  return horizon > innerHeight * 0.25 && horizon < innerHeight * 0.6 ? horizon : innerHeight * 0.45;
}

function shootingStar(layer, { start, end, delay, duration, length, thickness }) {
  const el = document.createElement('div');
  el.className = 'meteor';
  el.style.cssText = `left:${start.x}px;top:${start.y}px;width:${length}px;height:${thickness}px`;
  layer.append(el);
  const dx = end.x - start.x, dy = end.y - start.y;
  const angle = (Math.atan2(dy, -dx) * 180) / Math.PI; // below the horizontal, heading left
  // The tail points back along the path; it stretches a little as the star speeds up.
  const at = (f, stretch) => `translate(${dx * f}px, ${dy * f}px) rotate(${-angle}deg) scaleX(${stretch})`;
  el.animate([
    { transform: at(0, 0.3), opacity: 0 },
    { transform: at(0.15, 0.8), opacity: 1, offset: 0.15 },
    { transform: at(0.75, 1), opacity: 1, offset: 0.75 },
    { transform: at(1, 0.6), opacity: 0 },
  ], { duration, delay, easing: 'cubic-bezier(.3, .1, .6, 1)', fill: 'both' })
    .finished.then(() => el.remove(), () => {}); // cancelled when the sky is cleared
}

/** Plays the shower. Starts over if it's already playing. */
export function celebrate() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = $('meteors');
  clearSky();
  const band = skyBand();
  layer.style.height = `${band}px`;
  const stars = plan(innerWidth, band);
  for (const star of stars) shootingStar(layer, star);

  const wish = stars[stars.length - 1];
  const rest = document.createElement('div');
  rest.className = 'wish';
  rest.style.cssText = `left:${wish.end.x}px;top:${wish.end.y}px`;
  layer.append(rest);
  rest.animate([
    { transform: 'scale(0)', opacity: 0 },
    { transform: 'scale(3)', opacity: 1, offset: 0.35 },
    { transform: 'scale(1)', opacity: 0.9 },
  ], { duration: 1100, delay: wish.delay + wish.duration - 250, easing: 'ease-out', fill: 'both' });
}

/** Removes the shooting stars and the resting star, e.g. when a daily gets unticked. */
export function clearSky() {
  const layer = $('meteors');
  for (const el of layer.children) for (const animation of el.getAnimations()) animation.cancel();
  layer.replaceChildren();
}

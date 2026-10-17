// The page. The sun follows your progress and the sky follows the sun: sunrise when nothing is done,
// noon halfway, sunset when everything is. The greeting follows the clock. Finishing the day shows a
// quote and lights a star.
import { $, esc } from './html.js';
import { greeting, dayLine } from './greeting.js';
import { icon } from './icons.js';
import { quoteFor } from './quotes.js';
import { skyFor } from './constellations.js';
import { openEditor } from './editor.js';
import * as store from './store.js';

// ---- Sky colours along the sun's path: top, middle, horizon, the sun's glow, and the ink on cards.

const SKY = [
  { at: 0.0, top: '#27306b', middle: '#7d6aa6', horizon: '#f39a68', glow: '#ffb36b', deep: '#3a3577' }, // sunrise
  { at: 0.25, top: '#2563c2', middle: '#6b9fdc', horizon: '#f6c79b', glow: '#ffe0a8', deep: '#1f4d94' }, // morning
  { at: 0.5, top: '#1d6ccd', middle: '#4f9ae6', horizon: '#cbe5f8', glow: '#fff6d6', deep: '#17488a' }, // noon
  { at: 0.75, top: '#2a5fb4', middle: '#7f93cf', horizon: '#f5b98a', glow: '#ffd39a', deep: '#2b4688' }, // afternoon
  { at: 1.0, top: '#2a2461', middle: '#9c4d7c', horizon: '#f0844f', glow: '#ff9a5c', deep: '#452a66' }, // sunset
];
const COLOURS = ['top', 'middle', 'horizon', 'glow', 'deep'];

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => toHex(toRgb(a).map((v, i) => v + (toRgb(b)[i] - v) * t));

/** The sky at a point of the day, 0 (sunrise) to 1 (sunset), blended between the two nearest keyframes. */
function skyAt(ratio) {
  const i = Math.min(SKY.length - 2, Math.floor(ratio * (SKY.length - 1)));
  const [a, b] = [SKY[i], SKY[i + 1]];
  const t = (ratio - a.at) / (b.at - a.at);
  return Object.fromEntries(COLOURS.map((key) => [key, mix(a[key], b[key], t)]));
}

// ---- The sun's arc. Must match the <svg viewBox="0 0 320 180"> arc in index.html.

const ARC = { width: 320, height: 180, cx: 160, cy: 170, r: 140 };

function sunPosition(ratio) {
  const angle = Math.PI * ratio;
  return { x: ARC.cx - ARC.r * Math.cos(angle), y: ARC.cy - ARC.r * Math.sin(angle) };
}

// ---- Painting.

const cards = $('cards');
const themeColor = document.querySelector('meta[name="theme-color"]');
const TICK = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7"/></svg>';

function renderCards() {
  cards.innerHTML = store.enabledDailies().map((daily) => `
    <li><button class="card" type="button" data-id="${daily.id}" aria-pressed="${store.isDone(daily.id)}">
      ${icon(daily.icon)}<strong>${esc(daily.label)}</strong>${daily.hint ? `<small>${esc(daily.hint)}</small>` : ''}<span class="check">${TICK}</span>
    </button></li>`).join('');
}

function paintCards() {
  for (const card of cards.querySelectorAll('.card')) card.setAttribute('aria-pressed', store.isDone(card.dataset.id));
}

function paintSky(ratio) {
  const sky = skyAt(ratio);
  for (const key of COLOURS) document.documentElement.style.setProperty(`--${key}`, sky[key]);
  themeColor.content = sky.top;
}

function paintSun(ratio) {
  const { x, y } = sunPosition(ratio);
  $('sun').style.transform = `translate(${x}px, ${y}px)`;
  $('halo').style.left = `${(x / ARC.width) * 100}%`;
  $('halo').style.top = `${(y / ARC.height) * 100}%`;
  $('trail').style.strokeDashoffset = 1 - ratio;
}

// The greeting and the line under the count depend on the clock as well, so they repaint every minute.
function paintWords({ done, total }) {
  const hour = new Date().getHours();
  $('greeting').textContent = greeting(hour);
  $('count').textContent = `${done}/${total}`;
  $('count-line').textContent = dayLine(hour, done, total);
}

function announce({ done, total }, finished, quote) {
  $('live').textContent = finished ? `All ${total} dailies done. ${quote.text} ${quote.by}.` : `${done} of ${total} dailies done.`;
}

function paintQuote(finished, quote) {
  $('quote').hidden = !finished;
  if (!finished) return;
  $('quote-text').textContent = quote.text;
  $('quote-by').textContent = `${quote.by}, ${quote.from}`;
}

let lastFinishedDays = null;

function paintYourSky() {
  const days = store.finishedDays();
  const { constellation, lit, completed } = skyFor(days);
  const { name, stars, links } = constellation;
  const twinkle = lastFinishedDays !== null && days > lastFinishedDays; // only for a star earned on this visit
  lastFinishedDays = days;

  const lines = links
    .filter(([a, b]) => a < lit && b < lit)
    .map(([a, b]) => `<line class="link" x1="${stars[a][0]}" y1="${stars[a][1]}" x2="${stars[b][0]}" y2="${stars[b][1]}"/>`);
  const points = stars.map(([x, y], i) => (i < lit
    ? `<circle class="star${twinkle && i === lit - 1 ? ' new' : ''}" cx="${x}" cy="${y}" r="3.2"/>`
    : `<circle class="dot" cx="${x}" cy="${y}" r="1.6"/>`));
  const svg = $('constellation');
  svg.innerHTML = lines.join('') + points.join('');
  svg.setAttribute('aria-label', `${name}: ${lit} of ${stars.length} stars lit`);

  $('your-sky-count').textContent = `${name} · ${lit}/${stars.length}`;
  $('your-sky-note').textContent =
    days === 0 ? 'Finish all your dailies to light your first star.'
    : lit === stars.length ? `${name} complete. ${completed === 1 ? 'Your first constellation.' : `That makes ${completed}.`}`
    : `Every day you finish lights a star. ${stars.length - lit} more to complete ${name}.`;
}

function paint() {
  const progress = store.progress();
  const finished = progress.total > 0 && progress.done === progress.total;
  const quote = quoteFor(store.today());
  paintCards();
  paintSky(progress.ratio);
  paintSun(progress.ratio);
  paintWords(progress);
  announce(progress, finished, quote);
  paintQuote(finished, quote);
  paintYourSky();
  document.body.classList.toggle('finished', finished);
}

function paintClock() {
  $('date').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  paintWords(store.progress());
}

// ---- Wiring.

cards.addEventListener('click', (event) => {
  const card = event.target.closest('.card');
  if (card) store.toggle(card.dataset.id);
});
$('edit').addEventListener('click', openEditor);

// Rebuild the cards only when the set of dailies changes, so ticking one can animate.
const cardIds = () => store.enabledDailies().map((d) => d.id).join();
let shownIds = cardIds();
store.subscribe(() => {
  if (cardIds() !== shownIds) {
    shownIds = cardIds();
    renderCards();
  }
  paint();
});

renderCards();
paint();
paintClock();
setInterval(paintClock, 60 * 1000);
store.watch();

// Offline support. Service workers only run over http(s), not from a file opened on disk.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

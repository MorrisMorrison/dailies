// The page. The sun follows your progress and the sky follows the sun: sunrise when nothing is done,
// noon halfway, sunset when everything is. The season tints the sky's light, and the greeting follows
// the clock. Finishing the day shows a quote and lights a star.
import { $, esc } from './html.js';
import { greeting, dayLine } from './greeting.js';
import { icon } from './icons.js';
import { quoteFor } from './quotes.js';
import { skyFor } from './constellations.js';
import { COLOURS, seasonalSky, hemisphereOf } from './sky.js';
import { openEditor } from './editor.js';
import { setupSharing } from './share.js';
import { celebrate, clearSky } from './celebrate.js';
import * as store from './store.js';

const hemisphere = hemisphereOf(Intl.DateTimeFormat().resolvedOptions().timeZone);

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
  const sky = seasonalSky(ratio, new Date(), hemisphere);
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

// Shooting stars each time the day becomes finished during this visit (not when the page opens on a
// finished day). Unticking clears the sky again.
let wasFinished = null;

function paintCelebration(finished) {
  if (finished && wasFinished === false) celebrate();
  if (!finished && wasFinished) clearSky();
  wasFinished = finished;
}

function paint() {
  const progress = store.progress();
  const finished = progress.total > 0 && progress.done === progress.total;
  paintCelebration(finished);
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
setupSharing(store.earlierFinishedDays);

// Offline support. Service workers only run over http(s), not from a file opened on disk.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

/* Dailies — Daylight. The sun follows your progress and the sky follows the sun:
   sunrise at 0, noon halfway, sunset when everything's done. */
(() => {
  'use strict';
  const D = window.Dailies;

  // Sky keyframes along the sun's path: top, middle, horizon, sun glow, and the ink used on cards.
  const SKY = [
    { at: 0.0, s1: '#27306b', s2: '#7d6aa6', s3: '#f39a68', glow: '#ffb36b', deep: '#3a3577' }, // sunrise
    { at: 0.25, s1: '#2563c2', s2: '#6b9fdc', s3: '#f6c79b', glow: '#ffe0a8', deep: '#1f4d94' }, // morning
    { at: 0.5, s1: '#1d6ccd', s2: '#4f9ae6', s3: '#cbe5f8', glow: '#fff6d6', deep: '#17488a' }, // noon
    { at: 0.75, s1: '#2a5fb4', s2: '#7f93cf', s3: '#f5b98a', glow: '#ffd39a', deep: '#2b4688' }, // afternoon
    { at: 1.0, s1: '#2a2461', s2: '#9c4d7c', s3: '#f0844f', glow: '#ff9a5c', deep: '#452a66' }, // sunset
  ];
  const KEYS = ['s1', 's2', 's3', 'glow', 'deep'];

  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => {
    const [x, y] = [rgb(a), rgb(b)];
    return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
  };
  function skyAt(r) {
    const i = Math.min(SKY.length - 2, Math.floor(r * (SKY.length - 1)));
    const a = SKY[i], b = SKY[i + 1];
    const t = (r - a.at) / (b.at - a.at);
    return Object.fromEntries(KEYS.map((k) => [k, mix(a[k], b[k], t)]));
  }

  const $ = (id) => document.getElementById(id);
  const cards = $('cards');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const TICK = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7"/></svg>';

  // Headline and subline follow the sun too: how many are done, not the clock.
  function words(done, total, ratio) {
    if (total && done === total) return ['Good evening.', 'All done. Enjoy the evening.'];
    if (!done) return ['Rise and shine.', 'Start anywhere'];
    if (ratio < 0.4) return ['Good morning.', 'The sun is up.'];
    if (ratio <= 0.6) return ['High noon.', 'Halfway there.'];
    return ['Good afternoon.', 'Past noon. Keep going.'];
  }
  function clock() {
    $('date').textContent = D.date({ weekday: 'long', month: 'long', day: 'numeric' });
  }

  function render() {
    cards.innerHTML = D.list.map((d) => `
      <li><button class="card" type="button" data-id="${d.id}" aria-pressed="${D.isDone(d.id)}">
        ${D.icon(d.id)}<strong>${d.label}</strong><small>${d.hint}</small><span class="check">${TICK}</span>
      </button></li>`).join('');
    paint();
  }

  function paint() {
    const { done, total, ratio } = D.progress;
    cards.querySelectorAll('.card').forEach((c) => c.setAttribute('aria-pressed', D.isDone(c.dataset.id)));

    const sky = skyAt(ratio);
    const root = document.documentElement.style;
    KEYS.forEach((k) => root.setProperty(`--${k}`, sky[k]));
    themeColor.content = sky.s1;

    // Sun position on the arc (viewBox 320×180, centre 160,170, radius 140).
    const a = Math.PI * ratio;
    const x = 160 - 140 * Math.cos(a), y = 170 - 140 * Math.sin(a);
    $('sun').style.transform = `translate(${x}px, ${y}px)`;
    $('halo').style.left = `${(x / 320) * 100}%`;
    $('halo').style.top = `${(y / 180) * 100}%`;
    $('trail').style.strokeDashoffset = 1 - ratio;

    const complete = total > 0 && done === total;
    document.body.classList.toggle('complete', complete);
    $('num').textContent = `${done}/${total}`;
    const [headline, sub] = words(done, total, ratio);
    $('greet').textContent = headline;
    $('sub').textContent = sub;
    $('live').textContent = complete ? `All ${total} dailies done.` : `${done} of ${total} dailies done.`;
  }

  cards.addEventListener('click', (e) => {
    const c = e.target.closest('.card');
    if (c) D.toggle(c.dataset.id);
  });
  $('edit').addEventListener('click', D.openEditor);

  // Only rebuild the cards when the set of dailies changes, so toggles can animate.
  let shown = '';
  const ids = () => D.list.map((d) => d.id).join();
  D.onChange(() => (ids() === shown ? paint() : ((shown = ids()), render())));
  shown = ids();
  render();
  clock();
  setInterval(clock, 60 * 1000);

  // Offline support once served over http(s); opening the file directly skips it.
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();

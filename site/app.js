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
        ${D.icon(d.id)}<strong>${D.esc(d.label)}</strong>${d.hint ? `<small>${D.esc(d.hint)}</small>` : ''}<span class="check">${TICK}</span>
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
    const q = D.quote();
    $('live').textContent = complete ? `All ${total} dailies done. ${q.text} ${q.by}.` : `${done} of ${total} dailies done.`;
    paintReward(complete, q);
  }

  // ---- Reward: the quote of the day once everything is done, and a star for every day you finish.
  // Ten stars make a constellation; the shapes take turns (viewBox 300×90).
  const PER = 10;
  const CONSTELLATIONS = [
    [[18, 62], [52, 48], [86, 56], [118, 36], [150, 46], [182, 24], [214, 34], [246, 58], [270, 44], [288, 18]],
    [[16, 30], [48, 64], [80, 28], [112, 62], [144, 26], [176, 58], [208, 34], [240, 66], [268, 40], [288, 70]],
    [[16, 70], [40, 50], [70, 34], [104, 24], [140, 20], [176, 22], [210, 30], [240, 44], [266, 60], [286, 74]],
  ];
  let lastStars = null;

  function paintReward(complete, q) {
    if (complete) {
      $('quote').textContent = q.text;
      $('quote-by').textContent = q.by;
    }
    $('reward').hidden = !complete;

    const stars = D.stars;
    const lit = stars === 0 ? 0 : ((stars - 1) % PER) + 1; // a finished constellation stays full until the next star
    const finished = Math.floor(stars / PER);
    const pts = CONSTELLATIONS[Math.floor(Math.max(stars - 1, 0) / PER) % CONSTELLATIONS.length];
    const fresh = lastStars !== null && stars > lastStars; // twinkle only for a star earned on this visit
    lastStars = stars;

    const path = lit > 1 ? `<path class="link" d="M${pts.slice(0, lit).map((p) => p.join(' ')).join('L')}"/>` : '';
    const dots = pts.map(([x, y], i) => (i < lit
      ? `<circle class="star${fresh && i === lit - 1 ? ' new' : ''}" cx="${x}" cy="${y}" r="3.2"/>`
      : `<circle class="dot" cx="${x}" cy="${y}" r="1.6"/>`)).join('');
    const svg = $('constellation');
    svg.innerHTML = path + dots;
    svg.setAttribute('aria-label', `${lit} of ${PER} stars lit`);

    $('night-count').textContent = `${lit}/${PER}`;
    $('night-note').textContent = stars === 0 ? 'Finish all your dailies to light your first star.'
      : lit === PER ? `Constellation complete. ${finished === 1 ? 'Your first one.' : `That makes ${finished}.`}`
      : `Every day you finish lights a star. ${PER - lit} more to complete this one.`;
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

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
  // Real constellations, one after another; each takes as many finished days as it has stars.
  // Positions are the real stars projected onto a 300×120 box (north up, east left, as seen looking up);
  // stars are listed in the order they light. Line figures from d3-celestial © Olaf Frohn (BSD-3-Clause),
  // Orion trimmed to its classic eight stars.
  const CONSTELLATIONS = [
    { name: 'Cassiopeia', stars: [[72,12],[107,61],[152,57],[180,108],[228,69]], links: [[0,1],[1,2],[2,3],[3,4]] },
    { name: 'Big Dipper', stars: [[169,61],[235,12],[250,53],[195,86],[126,68],[91,71],[50,108]], links: [[0,1],[1,2],[2,3],[0,3],[0,4],[4,5],[5,6]] },
    { name: 'Orion', stars: [[143,70],[148,66],[153,62],[162,30],[150,12],[125,24],[134,108],[175,101]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[0,5],[0,6],[2,7]] },
    { name: 'Lyra', stars: [[160,40],[161,12],[181,23],[133,50],[119,108],[145,99]], links: [[0,1],[1,2],[0,2],[0,3],[3,4],[4,5],[0,5]] },
    { name: 'Cygnus', stars: [[108,97],[132,85],[151,63],[176,45],[183,19],[189,12],[139,44],[170,82],[192,108]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[2,6],[2,7],[7,8]] },
    { name: 'Crux', stars: [[117,54],[183,39],[159,108],[150,12]], links: [[0,1],[2,3]] },
    { name: 'Leo', stars: [[218,108],[218,76],[198,55],[112,49],[50,85],[110,83],[202,31],[238,12],[250,26]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[0,5],[2,6],[6,7],[7,8]] },
    { name: 'Corona Borealis', stars: [[195,12],[216,52],[190,96],[157,104],[130,108],[98,93],[84,38]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]] },
    { name: 'Delphinus', stars: [[182,108],[161,43],[151,16],[118,12],[133,33]], links: [[0,1],[1,2],[2,3],[3,4],[1,4]] },
    { name: 'Ursa Minor', stars: [[146,78],[136,88],[156,108],[165,94],[135,55],[138,31],[145,12]], links: [[0,1],[1,2],[2,3],[0,3],[0,4],[4,5],[5,6]] },
    { name: 'Aquila', stars: [[141,29],[135,38],[129,51],[109,87],[133,78],[167,67],[191,12],[191,108]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[1,6],[1,5],[5,7]] },
    { name: 'Gemini', stars: [[201,58],[192,59],[167,47],[137,21],[112,12],[99,31],[109,37],[126,62],[144,70],[176,90],[167,108],[127,90]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[7,11]] },
    { name: 'Canis Major', stars: [[187,44],[159,37],[137,74],[131,87],[139,95],[142,101],[186,108],[113,104],[145,39],[135,31],[148,12]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[3,7],[1,8],[8,9],[9,10],[8,10]] },
    { name: 'Scorpius', stars: [[196,39],[196,24],[192,12],[175,35],[167,39],[161,46],[149,70],[147,85],[146,103],[132,107],[113,108],[104,97],[107,92],[114,83]], links: [[0,1],[1,2],[1,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13]] },
    { name: 'Pegasus', stars: [[188,12],[163,24],[147,31],[96,21],[84,72],[145,76],[160,87],[165,91],[193,108],[216,94],[158,43],[161,47],[192,40],[210,37]], links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[2,5],[2,10],[10,11],[11,12],[12,13]] },
  ];
  const CYCLE = CONSTELLATIONS.reduce((n, c) => n + c.stars.length, 0);

  // Where a total of finished days lands: which constellation, how many of its stars are lit, and how
  // many constellations are complete. A finished constellation stays full until the next star.
  function skyFor(stars) {
    if (stars === 0) return { c: CONSTELLATIONS[0], lit: 0, finished: 0 };
    let rest = (stars - 1) % CYCLE + 1, finished = Math.floor((stars - 1) / CYCLE) * CONSTELLATIONS.length;
    for (const c of CONSTELLATIONS) {
      if (rest <= c.stars.length) return { c, lit: rest, finished: finished + (rest === c.stars.length ? 1 : 0) };
      rest -= c.stars.length;
      finished++;
    }
  }
  let lastStars = null;

  function paintReward(complete, q) {
    if (complete) {
      $('quote').textContent = q.text;
      $('quote-by').textContent = `${q.by}, ${q.from}`;
    }
    $('reward').hidden = !complete;

    const stars = D.stars;
    const { c, lit, finished } = skyFor(stars);
    const total = c.stars.length;
    const fresh = lastStars !== null && stars > lastStars; // twinkle only for a star earned on this visit
    lastStars = stars;

    const links = c.links.filter(([a, b]) => a < lit && b < lit)
      .map(([a, b]) => `<line class="link" x1="${c.stars[a][0]}" y1="${c.stars[a][1]}" x2="${c.stars[b][0]}" y2="${c.stars[b][1]}"/>`).join('');
    const dots = c.stars.map(([x, y], i) => (i < lit
      ? `<circle class="star${fresh && i === lit - 1 ? ' new' : ''}" cx="${x}" cy="${y}" r="3.2"/>`
      : `<circle class="dot" cx="${x}" cy="${y}" r="1.6"/>`)).join('');
    const svg = $('constellation');
    svg.innerHTML = links + dots;
    svg.setAttribute('aria-label', `${c.name}: ${lit} of ${total} stars lit`);

    $('night-count').textContent = `${c.name} · ${lit}/${total}`;
    $('night-note').textContent = stars === 0 ? 'Finish all your dailies to light your first star.'
      : lit === total ? `${c.name} complete. ${finished === 1 ? 'Your first constellation.' : `That makes ${finished}.`}`
      : `Every day you finish lights a star. ${total - lit} more to complete ${c.name}.`;
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

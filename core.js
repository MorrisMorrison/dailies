/* Dailies — shared core for every design: the dailies, their icons, and on-device state.
   A plain script (no modules, no build) so pages also work when opened straight from disk.
   State lives in localStorage only and resets at local midnight. */
(() => {
  'use strict';

  // 48×48 line icons drawn with currentColor; designs tune stroke width / roughness in CSS.
  const ICONS = {
    outside: '<circle cx="24" cy="24" r="6.5"/><path d="M24 6.5v8M24.4 33.5v8M6.5 24h8M33.5 23.6h8M11.6 11.8l5.6 5.4M30.8 30.6l5.8 5.8M36.4 11.6l-5.6 5.6M17.2 30.8l-5.4 5.8"/>',
    move: '<path d="M5 19c4.5-5 9-5 13.5 0s9 5 13.5 0 7-4.5 11-1.5"/><path d="M5 29c4.5-5 9-5 13.5 0s9 5 13.5 0 7-4.5 11-1.5"/>',
    hydrate: '<path d="M24 7c-5 7.5-10.5 14-10.5 21a10.5 10.5 0 0 0 21 0C34.5 21 29 14.5 24 7z"/><path d="M19 29.5a5 5 0 0 0 4 5"/>',
    nourish: '<path d="M24 17c-3-2.6-7.5-3.4-10.8-1.4C9.4 18 8.6 23.8 10.3 29.2 12.3 35.6 16.6 41 20.6 41c1.5 0 2.3-.8 3.4-.8s1.9.8 3.4.8c4 0 8.3-5.4 10.3-11.8 1.7-5.4.9-11.2-2.9-13.6C31.5 13.6 27 14.4 24 17z"/><path d="M24 17c0-4 .8-7 3-9.5"/><path d="M26.5 11.5c2.5-3.6 6.5-4.4 9.5-3.4-1.4 3.4-5.4 5-9.5 3.4z"/>',
    rest: '<path d="M31 8.5A16 16 0 1 0 39.5 31 12.5 12.5 0 0 1 31 8.5z"/>',
    connect: '<circle cx="24" cy="24" r="16"/><path d="M19 20.5v1.5M29 20.5v1.5"/><path d="M18.5 28.5c3 3.5 8 3.5 11 0"/>',
    breathe: '<path d="M7 18h22c3.5 0 5-2.4 4.5-4.6-.6-2.6-4.4-3-5.6-.6"/><path d="M7 26h29c3 0 4.6 2.2 4 4.4-.6 2.4-4 2.8-5.2.8"/><path d="M7 34h15c2.6 0 4 1.8 3.4 3.6"/>',
    unplug: '<path d="M17 20h14v6a7 7 0 0 1-14 0z"/><path d="M20.5 20v-7M27.5 20v-7M24 33v7"/><path d="M10 38 38 10"/>',
    create: '<path d="M11 37l2.5-8.5L31 11a3.5 3.5 0 0 1 5 0l1 1a3.5 3.5 0 0 1 0 5L19.5 34.5z"/><path d="M28 14l6 6M13.5 28.5l6 6"/>',
    learn: '<path d="M24 14c-4-3-10-3.6-16-2.6v25c6-1 12-.4 16 2.6 4-3 10-3.6 16-2.6v-25c-6-1-12-.4-16 2.6z"/><path d="M24 14v25"/>',
    tidy: '<path d="M21 9c1 8 4.5 11.5 12.5 12.5C25.5 22.5 22 26 21 34c-1-8-4.5-11.5-12.5-12.5C16.5 20.5 20 17 21 9z"/><path d="M35 29c.5 3.5 2 5 5.5 5.5-3.5.5-5 2-5.5 5.5-.5-3.5-2-5-5.5-5.5 3.5-.5 5-2 5.5-5.5z"/>',
    gratitude: '<path d="M24 39C14 32 8 26 8 18.5 8 13.5 11.5 10 16 10c3.6 0 6.4 2.2 8 5.4 1.6-3.2 4.4-5.4 8-5.4 4.5 0 8 3.5 8 8.5C40 26 34 32 24 39z"/>',
    play: '<path d="M24 6l11 13-11 13-11-13z"/><path d="M13 19h22M24 6v26"/><path d="M24 32c-3 3 3 5 0 8s3 4 1 6"/>',
    give: '<path d="M9 19h30v7H9z"/><path d="M11.5 26v14h25V26M24 19v21"/><path d="M24 19c-2.5-5-8-7-9.5-4.2-1.4 2.8 3.6 4.2 9.5 4.2zM24 19c2.5-5 8-7 9.5-4.2 1.4 2.8-3.6 4.2-9.5 4.2z"/>',
  };

  // The first six are the defaults; the rest can be switched on in the editor.
  const ALL = [
    { id: 'outside', label: 'Get outside', short: 'Outside', hint: 'Ten minutes under open sky.', core: true },
    { id: 'move', label: 'Move', short: 'Move', hint: 'Walk, stretch, dance. It all counts.', core: true },
    { id: 'hydrate', label: 'Hydrate', short: 'Hydrate', hint: 'Keep a glass of water close.', core: true },
    { id: 'nourish', label: 'Eat well', short: 'Nourish', hint: 'Something real, something green.', core: true },
    { id: 'rest', label: 'Rest', short: 'Rest', hint: 'Wind down. Protect your sleep.', core: true },
    { id: 'connect', label: 'Connect', short: 'Connect', hint: 'Reach out to someone you care about.', core: true },
    { id: 'breathe', label: 'Breathe', short: 'Breathe', hint: 'Five slow minutes, nothing else.' },
    { id: 'unplug', label: 'Unplug', short: 'Unplug', hint: 'An hour with the screens off.' },
    { id: 'create', label: 'Create', short: 'Create', hint: 'Make something. Anything.' },
    { id: 'learn', label: 'Learn', short: 'Learn', hint: 'Read a few pages. Learn one thing.' },
    { id: 'tidy', label: 'Tidy', short: 'Tidy', hint: 'Reset one small space.' },
    { id: 'gratitude', label: 'Be grateful', short: 'Gratitude', hint: 'Name one good thing about today.' },
    { id: 'play', label: 'Play', short: 'Play', hint: 'Do something just for the fun of it.' },
    { id: 'give', label: 'Be kind', short: 'Kindness', hint: 'One small kindness, no reason needed.' },
  ];

  const KEY = 'dailies:v1';
  const byId = Object.fromEntries(ALL.map((d) => [d.id, d]));
  const DEFAULT_ENABLED = ALL.filter((d) => d.core).map((d) => d.id);

  const pad = (n) => String(n).padStart(2, '0');
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  let fallback = null; // used when localStorage is unavailable (private mode, blocked storage)

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(s) {
    fallback = s;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* memory only */
    }
  }

  // Anything from a previous day is dropped: the list resets every morning.
  function load() {
    const s = read() || {};
    const enabled = Array.isArray(s.enabled) ? s.enabled.filter((id) => byId[id]) : [];
    const sameDay = s.day === dayKey();
    return {
      enabled: enabled.length ? enabled : DEFAULT_ENABLED.slice(),
      day: dayKey(),
      done: sameDay && Array.isArray(s.done) ? s.done.filter((id) => byId[id]) : [],
    };
  }

  let state = load();
  const listeners = new Set();

  function emit() {
    listeners.forEach((fn) => fn(api));
  }

  function commit(next) {
    state = next;
    write(state);
    emit();
  }

  // Midnight rollover while the page stays open.
  function refresh() {
    if (state.day !== dayKey()) commit(load());
  }
  setInterval(refresh, 30 * 1000);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && refresh());

  // Keep other open tabs (and the gallery previews) in step.
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = load();
      emit();
    }
  });

  function icon(id, cls = '') {
    return `<svg class="dd-icon ${cls}" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[id] || ''}</g></svg>`;
  }

  // ---- Editor: pick which dailies show up. Themed per design via --dd-* custom properties.
  const EDITOR_CSS = `
.dd-editor{--_bg:var(--dd-bg,#fbfaf7);--_fg:var(--dd-fg,#1d1d1b);--_muted:var(--dd-muted,#6b6a65);--_accent:var(--dd-accent,#1d1d1b);--_line:var(--dd-line,rgba(0,0,0,.08));
  border:0;padding:0;border-radius:var(--dd-radius,18px);background:var(--_bg);color:var(--_fg);font-family:var(--dd-font,system-ui,sans-serif);
  width:min(440px,calc(100vw - 32px));max-height:min(720px,calc(100dvh - 48px));box-shadow:0 30px 80px rgba(0,0,0,.35)}
.dd-editor[open]{display:flex;flex-direction:column}
.dd-editor::backdrop{background:rgba(10,12,14,.55);backdrop-filter:blur(3px)}
.dd-editor form{display:flex;flex-direction:column;flex:1;min-height:0;margin:0}
.dd-editor header{padding:22px 24px 12px}
.dd-editor h2{margin:0;font-size:21px;letter-spacing:-.01em}
.dd-editor header p{margin:6px 0 0;color:var(--_muted);font-size:14px;line-height:1.4}
.dd-editor ul{list-style:none;margin:0;padding:4px 10px;overflow:auto;flex:1;min-height:0}
.dd-editor label{display:grid;grid-template-columns:20px 30px 1fr;gap:12px;align-items:center;padding:9px 12px;border-radius:12px;cursor:pointer}
.dd-editor label:hover{background:var(--_line)}
.dd-editor input{accent-color:var(--_accent);width:18px;height:18px;margin:0}
.dd-editor .dd-icon{width:30px;height:30px}
.dd-editor strong{display:block;font-size:15px}
.dd-editor small{display:block;color:var(--_muted);font-size:13px;line-height:1.35}
.dd-editor footer{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 24px 20px;border-top:1px solid var(--_line)}
.dd-editor button{font:inherit;font-size:14px;border-radius:999px;padding:9px 18px;cursor:pointer;border:1px solid var(--_line);background:transparent;color:var(--_fg)}
.dd-editor button[value=done]{background:var(--_accent);border-color:var(--_accent);color:var(--_bg);font-weight:600}
`;

  function openEditor() {
    if (!document.getElementById('dd-editor-css')) {
      const style = document.createElement('style');
      style.id = 'dd-editor-css';
      style.textContent = EDITOR_CSS;
      document.head.prepend(style); // first, so each design's own rules win
    }
    let dlg = document.getElementById('dd-editor');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'dd-editor';
      dlg.className = 'dd-editor';
      dlg.addEventListener('click', (e) => e.target === dlg && dlg.close()); // backdrop click
      document.body.append(dlg);
    }
    dlg.innerHTML = `
      <form method="dialog">
        <header><h2>Your dailies</h2><p>Choose what you want to show up for. Everything stays on this device and resets at midnight.</p></header>
        <ul>${ALL.map((d) => `
          <li><label><input type="checkbox" value="${d.id}"${state.enabled.includes(d.id) ? ' checked' : ''}>${icon(d.id)}
            <span><strong>${d.label}</strong><small>${d.hint}</small></span></label></li>`).join('')}
        </ul>
        <footer><button type="button" data-reset>Back to the six</button><button value="done">Done</button></footer>
      </form>`;
    const boxes = [...dlg.querySelectorAll('input')];
    const sync = () => boxes.forEach((b) => (b.checked = state.enabled.includes(b.value)));
    boxes.forEach((box) =>
      box.addEventListener('change', () => {
        const enabled = boxes.filter((b) => b.checked).map((b) => b.value);
        if (!enabled.length) return void (box.checked = true); // keep at least one
        commit({ ...state, enabled });
      }),
    );
    dlg.querySelector('[data-reset]').addEventListener('click', () => {
      commit({ ...state, enabled: DEFAULT_ENABLED.slice() });
      sync();
    });
    dlg.showModal();
  }

  const api = {
    all: ALL,
    get list() {
      return ALL.filter((d) => state.enabled.includes(d.id));
    },
    isDone: (id) => state.done.includes(id),
    toggle(id) {
      const done = state.done.includes(id) ? state.done.filter((x) => x !== id) : [...state.done, id];
      commit({ ...state, done });
      return done.includes(id);
    },
    get progress() {
      const list = api.list;
      const done = list.filter((d) => state.done.includes(d.id)).length;
      return { done, total: list.length, ratio: list.length ? done / list.length : 0 };
    },
    icon,
    openEditor,
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    date: (opts) => new Date().toLocaleDateString(undefined, opts),
  };

  window.Dailies = api;
})();

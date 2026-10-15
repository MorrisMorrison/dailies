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
    // generic shapes, only offered for custom dailies
    star: '<path d="M24 7.5l4.9 10.4 11.4 1.4-8.4 7.8 2.2 11.3L24 32.8l-10.1 5.6 2.2-11.3-8.4-7.8 11.4-1.4z"/>',
    leaf: '<path d="M38 9C22 9 10 17.5 10 30.5c0 3.6 1.2 6.4 2.6 7.9C26 38.4 38 27 38 9z"/><path d="M13 38.5c5.5-8.5 11.5-14.5 19.5-21"/>',
    music: '<path d="M19 34.5V12.5l18-4v22"/><circle cx="14.5" cy="34.5" r="4.5"/><circle cx="32.5" cy="30.5" r="4.5"/>',
    dumbbell: '<path d="M15 24h18M8.5 18.5v11M13.5 14v20M34.5 14v20M39.5 18.5v11"/>',
    cup: '<path d="M11 19h22v7a11 11 0 0 1-22 0z"/><path d="M33 22h2.5a4.5 4.5 0 0 1 0 9H32M9 41h26M18 9c-1.6 1.6 1.6 3.4 0 5M24 9c-1.6 1.6 1.6 3.4 0 5"/>',
    pill: '<g transform="rotate(-40 24 24)"><rect x="8.5" y="17.5" width="31" height="13" rx="6.5"/><path d="M24 17.5v13"/></g>',
    donut: '<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="5.5"/><path d="M25.7 12.5l2.4 1.4M33.9 22.2l1.8-2.1M31.7 30.5l0.5 2.8M19.7 34.6l2.8 0.5M11.9 27.4l2.6-1M15.4 14.9l1.4 2.4"/>',
    bed: '<path d="M8 12v26M40 24v14M8 24h32M8 32h32"/><path d="M15 17h4a3 3 0 0 1 3 3v4H12v-4a3 3 0 0 1 3-3z"/>',
    church: '<path d="M24 6v8M20.5 9.5h7M13 41V27l11-9 11 9v14M7 41h34"/><path d="M20 41v-6a4 4 0 0 1 8 0v6"/>',
  };

  // Icons a custom daily can use, generic shapes first. Names are for screen readers.
  const ICON_NAMES = {
    star: 'Star', leaf: 'Leaf', music: 'Music note', dumbbell: 'Dumbbell', cup: 'Cup', pill: 'Pill', donut: 'Donut', bed: 'Bed', church: 'Church',
    outside: 'Sun', move: 'Waves', hydrate: 'Drop', nourish: 'Apple', rest: 'Moon', connect: 'Smile',
    breathe: 'Wind', unplug: 'Plug', create: 'Pencil', learn: 'Book', tidy: 'Sparkle', gratitude: 'Heart',
    play: 'Kite', give: 'Gift',
  };

  // The first six are the defaults; the rest can be switched on in the editor.
  const BUILTIN = [
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
  const BUILTIN_IDS = new Set(BUILTIN.map((d) => d.id));
  const DEFAULT_ENABLED = BUILTIN.filter((d) => d.core).map((d) => d.id);
  const MAX_CUSTOM = 10;
  const MAX_LABEL = 32;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const cleanLabel = (s) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_LABEL);

  // Custom dailies are stored as { id, label, icon } and shaped like the built-ins when read.
  function cleanCustom(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    return list
      .filter((c) => c && /^c-[a-z0-9]{4,24}$/.test(c.id) && !seen.has(c.id) && seen.add(c.id))
      .map((c) => ({ id: c.id, label: cleanLabel(c.label), icon: ICON_NAMES[c.icon] ? c.icon : 'star' }))
      .filter((c) => c.label)
      .slice(0, MAX_CUSTOM);
  }
  const asDaily = (c) => ({ id: c.id, label: c.label, short: c.label, hint: '', icon: c.icon, custom: true });
  const allDailies = () => [...BUILTIN, ...state.custom.map(asDaily)];
  const known = (custom) => new Set([...BUILTIN_IDS, ...custom.map((c) => c.id)]);

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
    const custom = cleanCustom(s.custom);
    const ids = known(custom);
    const enabled = Array.isArray(s.enabled) ? s.enabled.filter((id) => ids.has(id)) : [];
    const sameDay = s.day === dayKey();
    return {
      enabled: enabled.length ? enabled : DEFAULT_ENABLED.slice(),
      day: dayKey(),
      done: sameDay && Array.isArray(s.done) ? s.done.filter((id) => ids.has(id)) : [],
      custom,
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

  // Accepts a daily id or an icon name; a custom daily draws the icon it was given.
  function icon(id, cls = '') {
    const custom = state.custom.find((c) => c.id === id);
    const shape = ICONS[custom ? custom.icon : id] || '';
    return `<svg class="dd-icon ${cls}" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${shape}</g></svg>`;
  }

  function addCustom(label, iconName) {
    const name = cleanLabel(label);
    if (!name || state.custom.length >= MAX_CUSTOM) return null;
    const id = 'c-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const entry = { id, label: name, icon: ICON_NAMES[iconName] ? iconName : 'star' };
    commit({ ...state, custom: [...state.custom, entry], enabled: [...state.enabled, id] });
    return id;
  }

  function removeCustom(id) {
    const enabled = state.enabled.filter((x) => x !== id);
    commit({
      ...state,
      custom: state.custom.filter((c) => c.id !== id),
      enabled: enabled.length ? enabled : DEFAULT_ENABLED.slice(),
      done: state.done.filter((x) => x !== id),
    });
  }

  // ---- Editor: pick which dailies show up. Themed per design via --dd-* custom properties.
  const EDITOR_CSS = `
.dd-editor{--_bg:var(--dd-bg,#fbfaf7);--_fg:var(--dd-fg,#1d1d1b);--_muted:var(--dd-muted,#6b6a65);--_accent:var(--dd-accent,#1d1d1b);--_line:var(--dd-line,rgba(0,0,0,.08));
  border:0;padding:0;border-radius:var(--dd-radius,18px);background:var(--_bg);color:var(--_fg);font-family:var(--dd-font,system-ui,sans-serif);
  width:min(440px,calc(100vw - 32px));max-height:min(720px,calc(100dvh - 48px));box-shadow:0 30px 80px rgba(0,0,0,.35)}
.dd-editor[open]{display:flex;flex-direction:column}
.dd-editor:focus{outline:none}
.dd-editor ul:focus-visible{outline:2px solid var(--_accent);outline-offset:-2px;border-radius:8px}
.dd-editor::backdrop{background:rgba(10,12,20,.6)}
html:has(.dd-editor[open]){overflow:hidden}
.dd-editor form{display:flex;flex-direction:column;flex:1;min-height:0;margin:0}
.dd-editor header{padding:22px 24px 12px}
.dd-editor h2{margin:0;font-size:21px;letter-spacing:-.01em}
.dd-editor header p{margin:6px 0 0;color:var(--_muted);font-size:14px;line-height:1.4}
.dd-editor ul{list-style:none;margin:0;padding:4px 10px;overflow:auto;flex:1;min-height:0;overscroll-behavior:contain;contain:content}
.dd-editor .dd-row{display:flex;align-items:center;gap:4px}
.dd-editor .dd-pick{flex:1;min-width:0;display:grid;grid-template-columns:20px 30px 1fr;gap:12px;align-items:center;padding:9px 12px;border-radius:12px;cursor:pointer}
.dd-editor .dd-pick strong{overflow-wrap:anywhere}
@media (hover:hover){.dd-editor .dd-pick:hover{background:var(--_line)}}
.dd-editor .dd-pick input{accent-color:var(--_accent);width:18px;height:18px;margin:0}
.dd-editor .dd-remove{flex:none;width:36px;height:36px;padding:0;display:grid;place-items:center;border-color:transparent;color:var(--_muted)}
.dd-editor .dd-remove svg{width:18px;height:18px}
@media (hover:hover){.dd-editor .dd-remove:hover{background:var(--_line);color:var(--_fg)}}
.dd-editor .dd-add{margin:10px 2px 8px;padding:16px 10px 4px;border-top:1px solid var(--_line)}
.dd-editor .dd-add h3{margin:0 0 10px;font-size:15px}
.dd-editor .dd-name{box-sizing:border-box;width:100%;font:inherit;font-size:16px;padding:10px 12px;border-radius:12px;border:1px solid var(--_line);background:transparent;color:var(--_fg)}
.dd-editor .dd-name:focus{outline:2px solid var(--_accent);outline-offset:1px}
.dd-editor .dd-icons{border:0;margin:12px 0 10px;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(42px,1fr));gap:6px}
.dd-editor .dd-icons legend{font-size:13px;color:var(--_muted);margin-bottom:8px;padding:0}
.dd-editor .dd-icons label{position:relative;display:grid;place-items:center;aspect-ratio:1;border-radius:12px;border:1.5px solid transparent;cursor:pointer;color:var(--_muted)}
.dd-editor .dd-icons input{position:absolute;inset:0;opacity:0;margin:0;cursor:pointer}
.dd-editor .dd-icons .dd-icon{width:26px;height:26px}
.dd-editor .dd-icons label:has(input:checked){border-color:var(--_accent);background:var(--_line);color:var(--_fg)}
.dd-editor .dd-icons label:has(input:focus-visible){outline:2px solid var(--_accent);outline-offset:2px}
.dd-editor .dd-add-row{display:flex;justify-content:space-between;align-items:center;gap:12px}
.dd-editor .dd-add-btn{background:var(--_accent);border-color:var(--_accent);color:var(--_bg);font-weight:600}
.dd-editor .dd-add-btn:disabled{opacity:.4;cursor:default}
.dd-editor .dd-icon{width:30px;height:30px}
.dd-editor strong{display:block;font-size:15px}
.dd-editor small{display:block;color:var(--_muted);font-size:13px;line-height:1.35}
.dd-editor footer{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 24px 20px;border-top:1px solid var(--_line)}
.dd-editor button{font:inherit;font-size:14px;border-radius:999px;padding:9px 18px;cursor:pointer;border:1px solid var(--_line);background:transparent;color:var(--_fg)}
.dd-editor button[value=done]{background:var(--_accent);border-color:var(--_accent);color:var(--_bg);font-weight:600}
@media (max-height:480px){.dd-editor{max-height:calc(100dvh - 16px)}.dd-editor header{padding:14px 20px 6px}.dd-editor header p{display:none}.dd-editor .dd-pick{padding:6px 12px}.dd-editor footer{padding:10px 20px 12px}}
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
      dlg.tabIndex = -1;
      dlg.addEventListener('click', (e) => e.target === dlg && dlg.close()); // backdrop click
      document.body.append(dlg);
    }
    let picked = 'star';

    function row(d) {
      const remove = d.custom
        ? `<button type="button" class="dd-remove" data-remove="${d.id}" aria-label="Remove ${esc(d.label)}">${REMOVE_ICON}</button>`
        : '';
      return `<li class="dd-row"><label class="dd-pick"><input type="checkbox" value="${d.id}"${state.enabled.includes(d.id) ? ' checked' : ''}>${icon(d.id)}
        <span><strong>${esc(d.label)}</strong>${d.hint ? `<small>${esc(d.hint)}</small>` : ''}</span></label>${remove}</li>`;
    }

    function addForm() {
      if (state.custom.length >= MAX_CUSTOM) {
        return `<li class="dd-add"><h3>Add your own</h3><small>You have ${MAX_CUSTOM} of your own. Remove one to add another.</small></li>`;
      }
      const icons = Object.keys(ICON_NAMES)
        .map((k) => `<label title="${ICON_NAMES[k]}"><input type="radio" name="dd-icon" value="${k}" aria-label="${ICON_NAMES[k]}"${k === picked ? ' checked' : ''}>${icon(k)}</label>`)
        .join('');
      return `<li class="dd-add">
        <h3>Add your own</h3>
        <input class="dd-name" id="dd-name" type="text" maxlength="${MAX_LABEL}" placeholder="e.g. Water the plants" aria-label="Name of your daily" autocomplete="off">
        <fieldset class="dd-icons"><legend>Icon</legend>${icons}</fieldset>
        <div class="dd-add-row"><small>Stays on this device.</small><button type="button" class="dd-add-btn" data-add disabled>Add</button></div>
      </li>`;
    }

    // The body is re-rendered when custom dailies change; the listeners below are delegated, so they survive that.
    function render(focusAdd) {
      const scroll = dlg.querySelector('ul')?.scrollTop ?? 0;
      dlg.innerHTML = `
        <form method="dialog">
          <header><h2>Your dailies</h2><p>Choose what you want to show up for. Everything stays on this device and resets at midnight.</p></header>
          <ul>${allDailies().map(row).join('')}${addForm()}</ul>
          <footer><button type="button" data-reset>Back to the six</button><button value="done">Done</button></footer>
        </form>`;
      const list = dlg.querySelector('ul');
      list.scrollTop = focusAdd ? list.scrollHeight : scroll;
      if (focusAdd) dlg.querySelector('#dd-name')?.focus();
    }

    if (!dlg.dataset.wired) {
      dlg.dataset.wired = '1';
      const add = () => {
        const name = dlg.querySelector('#dd-name');
        if (name && addCustom(name.value, picked)) render(true);
      };
      dlg.addEventListener('change', (e) => {
        const t = e.target;
        if (t.name === 'dd-icon') return void (picked = t.value);
        if (t.type !== 'checkbox') return;
        const enabled = [...dlg.querySelectorAll('.dd-pick input:checked')].map((b) => b.value);
        if (!enabled.length) return void (t.checked = true); // keep at least one
        commit({ ...state, enabled });
      });
      dlg.addEventListener('input', (e) => {
        if (e.target.id === 'dd-name') dlg.querySelector('[data-add]').disabled = !cleanLabel(e.target.value);
      });
      dlg.addEventListener('keydown', (e) => {
        // Enter in the name field would otherwise submit the dialog form and close it.
        if (e.key === 'Enter' && e.target.id === 'dd-name') {
          e.preventDefault();
          add();
        }
      });
      dlg.addEventListener('click', (e) => {
        if (e.target.closest('[data-add]')) return add();
        const remove = e.target.closest('[data-remove]');
        if (remove) {
          removeCustom(remove.dataset.remove);
          return render(false);
        }
        if (e.target.closest('[data-reset]')) {
          commit({ ...state, enabled: DEFAULT_ENABLED.slice() });
          render(false);
        }
      });
    }
    render(false);
    dlg.showModal();
    dlg.focus(); // otherwise the browser focuses the scrollable list and rings it
  }

  const REMOVE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  const api = {
    get all() {
      return allDailies();
    },
    get list() {
      return allDailies().filter((d) => state.enabled.includes(d.id));
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
    esc,
    addCustom,
    removeCustom,
    openEditor,
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    date: (opts) => new Date().toLocaleDateString(undefined, opts),
  };

  window.Dailies = api;
})();

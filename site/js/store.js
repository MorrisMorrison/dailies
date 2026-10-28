// On-device state: which dailies are switched on, today's ticks, the dailies people added themselves,
// the dates of finished days, and the chosen quote collections. Everything lives in localStorage under
// one key and never leaves the device. Ticks reset at local midnight; everything else carries over.
import { BUILTIN, DEFAULT_ENABLED, MAX_CUSTOM, cleanLabel, cleanNote } from './dailies.js';
import { DEFAULT_ICON, isIcon } from './icons.js';
import { DEFAULT_COLLECTIONS, isCollection } from './quotes.js';

const KEY = 'dailies:v1';
const MAX_HISTORY = 3660; // ten years of finished days

const pad = (n) => String(n).padStart(2, '0');

/** Today's date as "YYYY-MM-DD" in local time. */
export const dayKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// ---- Persistence. Falls back to memory only when storage is blocked (some private modes).

let memory = null;

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return memory;
  }
}

function write(state) {
  memory = state;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // keep it in memory only
  }
}

// ---- Validation. Stored data is untrusted (it can be edited by hand), so it is cleaned on every load.

const isDay = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

// A note is optional: stored only when there is one.
const withNote = (value) => {
  const note = typeof value === 'string' ? cleanNote(value) : '';
  return note ? { note } : {};
};

function cleanCustom(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list
    .filter((c) => c && /^c-[a-z0-9]{4,24}$/.test(c.id) && !seen.has(c.id) && seen.add(c.id))
    .map((c) => ({ id: c.id, label: cleanLabel(c.label), icon: isIcon(c.icon) ? c.icon : DEFAULT_ICON, ...withNote(c.note) }))
    .filter((c) => c.label)
    .slice(0, MAX_CUSTOM);
}

/** Turns whatever was stored into a valid state for `today`. Ticks from another day are dropped. */
export function parse(saved, today = dayKey()) {
  const s = saved && typeof saved === 'object' ? saved : {};
  const custom = cleanCustom(s.custom);
  const known = new Set([...BUILTIN.map((d) => d.id), ...custom.map((c) => c.id)]);
  const onlyKnown = (ids) => (Array.isArray(ids) ? ids.filter((id) => known.has(id)) : []);
  const enabled = onlyKnown(s.enabled);
  const history = Array.isArray(s.history) ? [...new Set(s.history.filter(isDay))].sort() : [];
  const quotes = Array.isArray(s.quotes) ? [...new Set(s.quotes.filter(isCollection))] : [];
  return {
    day: today,
    enabled: enabled.length ? enabled : [...DEFAULT_ENABLED],
    done: s.day === today ? onlyKnown(s.done) : [],
    custom,
    history: history.slice(-MAX_HISTORY),
    quotes: quotes.length ? quotes : [...DEFAULT_COLLECTIONS],
    // The quote shown when today was finished; it belongs to today only.
    keptQuote: s.day === today && typeof s.keptQuote === 'string' ? s.keptQuote.slice(0, 500) : null,
  };
}

// Today counts as a finished day exactly while every switched-on daily is ticked,
// so unticking one (or switching on a new one) takes today's star back.
function withHistory(state) {
  const finished = state.enabled.length > 0 && state.enabled.every((id) => state.done.includes(id));
  const others = state.history.filter((day) => day !== state.day);
  return { ...state, history: finished ? [...others, state.day].slice(-MAX_HISTORY) : others };
}

// ---- State and change notifications.

let state = parse(read());
const listeners = new Set();

/** Calls `listener` after every change. Returns a function that stops listening. */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const notify = () => listeners.forEach((listener) => listener());

function commit(next) {
  state = withHistory(next);
  write(state);
  notify();
}

/** Re-reads storage, e.g. after another tab changed it. */
export function reload() {
  state = parse(read());
  notify();
}

/** Keeps state current while the page stays open: midnight rollover and changes made in other tabs. */
export function watch() {
  const rollover = () => {
    if (state.day !== dayKey()) commit(parse(read()));
  };
  setInterval(rollover, 30 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') rollover();
  });
  window.addEventListener('storage', (event) => {
    if (event.key === KEY) reload();
  });
}

// ---- Reading.

// A daily of one's own shows its note, if it has one, where built-in dailies show their description.
const asDaily = ({ note, ...custom }) => ({ ...custom, hint: note ?? '', custom: true });

/** Every daily, built-in first, in a stable order. */
export const allDailies = () => [...BUILTIN, ...state.custom.map(asDaily)];

/** The dailies that are switched on, in the same order. */
export const enabledDailies = () => allDailies().filter((d) => state.enabled.includes(d.id));

export const isEnabled = (id) => state.enabled.includes(id);
export const isDone = (id) => state.done.includes(id);
export const today = () => state.day;
export const customCount = () => state.custom.length;
/** The chosen quote collections (ids from quotes.js). */
export const quoteCollections = () => [...state.quotes];
/** Today's quote, if the day was finished and one was kept; otherwise null. */
export const keptQuote = () => state.keptQuote;

/** Days on which every daily got done, today included once it is. */
export const finishedDays = () => state.history.length;
/** Finished days before today: proof someone came back, not just tried it once. */
export const earlierFinishedDays = () => state.history.filter((day) => day !== state.day).length;
/** Whether every daily is done today. */
export const finishedToday = () => state.history.includes(state.day);

/** How far today is: done and total of the switched-on dailies, and the share done (0..1). */
export function progress() {
  const dailies = enabledDailies();
  const done = dailies.filter((d) => isDone(d.id)).length;
  return { done, total: dailies.length, ratio: dailies.length ? done / dailies.length : 0 };
}

// ---- Changing.

export function toggle(id) {
  const done = isDone(id) ? state.done.filter((x) => x !== id) : [...state.done, id];
  commit({ ...state, done });
}

/** Switches on exactly these dailies. At least one always stays on. */
export function setEnabled(ids) {
  if (ids.length) commit({ ...state, enabled: ids });
}

/** Remembers today's quote once the day is finished, so it stays until midnight. Saved quietly: it
 * changes nothing on screen, so listeners aren't called. */
export function keepQuote(text) {
  if (state.keptQuote === text) return;
  state = { ...state, keptQuote: text };
  write(state);
}

/** Chooses the quote collections. At least one always stays chosen. */
export function setQuoteCollections(ids) {
  const quotes = ids.filter(isCollection);
  if (quotes.length) commit({ ...state, quotes });
}

export function resetEnabled() {
  commit({ ...state, enabled: [...DEFAULT_ENABLED] });
}

/** Adds and switches on a daily of one's own. Returns its id, or null when the name is empty or the list is full. */
export function addCustom(label, iconName) {
  const name = cleanLabel(label);
  if (!name || state.custom.length >= MAX_CUSTOM) return null;
  const id = 'c-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const entry = { id, label: name, icon: isIcon(iconName) ? iconName : DEFAULT_ICON };
  commit({ ...state, custom: [...state.custom, entry], enabled: [...state.enabled, id] });
  return id;
}

/** Sets or changes the note of a daily of one's own; an empty note removes it. */
export function setNote(id, text) {
  const custom = state.custom.map(({ note, ...c }) => ({ ...c, ...withNote(c.id === id ? text : note) }));
  commit({ ...state, custom });
}

export function removeCustom(id) {
  const enabled = state.enabled.filter((x) => x !== id);
  commit({
    ...state,
    custom: state.custom.filter((c) => c.id !== id),
    enabled: enabled.length ? enabled : [...DEFAULT_ENABLED],
    done: state.done.filter((x) => x !== id),
  });
}

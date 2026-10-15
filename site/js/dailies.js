// The built-in dailies. The first six are on by default; the rest can be switched on under Edit.
// Each one draws the icon with the same name as its id.
export const BUILTIN = [
  { id: 'outside', label: 'Get outside', hint: 'Ten minutes under open sky.', core: true },
  { id: 'move', label: 'Move', hint: 'Walk, stretch, dance. It all counts.', core: true },
  { id: 'hydrate', label: 'Hydrate', hint: 'Keep a glass of water close.', core: true },
  { id: 'nourish', label: 'Eat well', hint: 'Something real, something green.', core: true },
  { id: 'rest', label: 'Rest', hint: 'Wind down. Protect your sleep.', core: true },
  { id: 'connect', label: 'Connect', hint: 'Reach out to someone you care about.', core: true },
  { id: 'breathe', label: 'Breathe', hint: 'Five slow minutes, nothing else.' },
  { id: 'unplug', label: 'Unplug', hint: 'An hour with the screens off.' },
  { id: 'create', label: 'Create', hint: 'Make something. Anything.' },
  { id: 'learn', label: 'Learn', hint: 'Read a few pages. Learn one thing.' },
  { id: 'tidy', label: 'Tidy', hint: 'Reset one small space.' },
  { id: 'gratitude', label: 'Be grateful', hint: 'Name one good thing about today.' },
  { id: 'play', label: 'Play', hint: 'Do something just for the fun of it.' },
  { id: 'give', label: 'Be kind', hint: 'One small kindness, no reason needed.' },
].map((daily) => ({ ...daily, icon: daily.id }));

export const DEFAULT_ENABLED = BUILTIN.filter((d) => d.core).map((d) => d.id);

/** How many dailies of their own someone can add, and how long a name may be. */
export const MAX_CUSTOM = 10;
export const MAX_LABEL = 32;

/** Collapses whitespace and trims a name to MAX_LABEL characters. */
export const cleanLabel = (value) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_LABEL);

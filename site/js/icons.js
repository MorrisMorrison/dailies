// Line icons on a 48×48 grid, stroked with currentColor (fill, stroke width and caps come from icon()).
// The order here is the order of the icon picker for custom dailies: generic shapes first, then the
// ones the built-in dailies use. `label` is what screen readers announce in the picker.
//
// Adding an icon: one entry with a short lowercase key, a label, and 1–3 paths kept inside about 6..42.
export const ICONS = {
  star: { label: 'Star', shape: '<path d="M24 7.5l4.9 10.4 11.4 1.4-8.4 7.8 2.2 11.3L24 32.8l-10.1 5.6 2.2-11.3-8.4-7.8 11.4-1.4z"/>' },
  leaf: { label: 'Leaf', shape: '<path d="M38 9C22 9 10 17.5 10 30.5c0 3.6 1.2 6.4 2.6 7.9C26 38.4 38 27 38 9z"/><path d="M13 38.5c5.5-8.5 11.5-14.5 19.5-21"/>' },
  music: { label: 'Music note', shape: '<path d="M19 34.5V12.5l18-4v22"/><circle cx="14.5" cy="34.5" r="4.5"/><circle cx="32.5" cy="30.5" r="4.5"/>' },
  dumbbell: { label: 'Dumbbell', shape: '<path d="M15 24h18M8.5 18.5v11M13.5 14v20M34.5 14v20M39.5 18.5v11"/>' },
  cup: { label: 'Cup', shape: '<path d="M11 19h22v7a11 11 0 0 1-22 0z"/><path d="M33 22h2.5a4.5 4.5 0 0 1 0 9H32M9 41h26M18 9c-1.6 1.6 1.6 3.4 0 5M24 9c-1.6 1.6 1.6 3.4 0 5"/>' },
  pill: { label: 'Pill', shape: '<g transform="rotate(-40 24 24)"><rect x="8.5" y="17.5" width="31" height="13" rx="6.5"/><path d="M24 17.5v13"/></g>' },
  donut: { label: 'Donut', shape: '<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="5.5"/><path d="M25.7 12.5l2.4 1.4M33.9 22.2l1.8-2.1M31.7 30.5l0.5 2.8M19.7 34.6l2.8 0.5M11.9 27.4l2.6-1M15.4 14.9l1.4 2.4"/>' },
  bed: { label: 'Bed', shape: '<path d="M8 12v26M40 24v14M8 24h32M8 32h32"/><path d="M15 17h4a3 3 0 0 1 3 3v4H12v-4a3 3 0 0 1 3-3z"/>' },
  church: { label: 'Church', shape: '<path d="M24 6v8M20.5 9.5h7M13 41V27l11-9 11 9v14M7 41h34"/><path d="M20 41v-6a4 4 0 0 1 8 0v6"/>' },

  outside: { label: 'Sun', shape: '<circle cx="24" cy="24" r="6.5"/><path d="M24 6.5v8M24.4 33.5v8M6.5 24h8M33.5 23.6h8M11.6 11.8l5.6 5.4M30.8 30.6l5.8 5.8M36.4 11.6l-5.6 5.6M17.2 30.8l-5.4 5.8"/>' },
  move: { label: 'Waves', shape: '<path d="M5 19c4.5-5 9-5 13.5 0s9 5 13.5 0 7-4.5 11-1.5"/><path d="M5 29c4.5-5 9-5 13.5 0s9 5 13.5 0 7-4.5 11-1.5"/>' },
  hydrate: { label: 'Drop', shape: '<path d="M24 7c-5 7.5-10.5 14-10.5 21a10.5 10.5 0 0 0 21 0C34.5 21 29 14.5 24 7z"/><path d="M19 29.5a5 5 0 0 0 4 5"/>' },
  nourish: { label: 'Apple', shape: '<path d="M24 17c-3-2.6-7.5-3.4-10.8-1.4C9.4 18 8.6 23.8 10.3 29.2 12.3 35.6 16.6 41 20.6 41c1.5 0 2.3-.8 3.4-.8s1.9.8 3.4.8c4 0 8.3-5.4 10.3-11.8 1.7-5.4.9-11.2-2.9-13.6C31.5 13.6 27 14.4 24 17z"/><path d="M24 17c0-4 .8-7 3-9.5"/><path d="M26.5 11.5c2.5-3.6 6.5-4.4 9.5-3.4-1.4 3.4-5.4 5-9.5 3.4z"/>' },
  rest: { label: 'Moon', shape: '<path d="M31 8.5A16 16 0 1 0 39.5 31 12.5 12.5 0 0 1 31 8.5z"/>' },
  connect: { label: 'Smile', shape: '<circle cx="24" cy="24" r="16"/><path d="M19 20.5v1.5M29 20.5v1.5"/><path d="M18.5 28.5c3 3.5 8 3.5 11 0"/>' },
  breathe: { label: 'Wind', shape: '<path d="M7 18h22c3.5 0 5-2.4 4.5-4.6-.6-2.6-4.4-3-5.6-.6"/><path d="M7 26h29c3 0 4.6 2.2 4 4.4-.6 2.4-4 2.8-5.2.8"/><path d="M7 34h15c2.6 0 4 1.8 3.4 3.6"/>' },
  unplug: { label: 'Plug', shape: '<path d="M17 20h14v6a7 7 0 0 1-14 0z"/><path d="M20.5 20v-7M27.5 20v-7M24 33v7"/><path d="M10 38 38 10"/>' },
  create: { label: 'Pencil', shape: '<path d="M11 37l2.5-8.5L31 11a3.5 3.5 0 0 1 5 0l1 1a3.5 3.5 0 0 1 0 5L19.5 34.5z"/><path d="M28 14l6 6M13.5 28.5l6 6"/>' },
  learn: { label: 'Book', shape: '<path d="M24 14c-4-3-10-3.6-16-2.6v25c6-1 12-.4 16 2.6 4-3 10-3.6 16-2.6v-25c-6-1-12-.4-16 2.6z"/><path d="M24 14v25"/>' },
  tidy: { label: 'Sparkle', shape: '<path d="M21 9c1 8 4.5 11.5 12.5 12.5C25.5 22.5 22 26 21 34c-1-8-4.5-11.5-12.5-12.5C16.5 20.5 20 17 21 9z"/><path d="M35 29c.5 3.5 2 5 5.5 5.5-3.5.5-5 2-5.5 5.5-.5-3.5-2-5-5.5-5.5 3.5-.5 5-2 5.5-5.5z"/>' },
  gratitude: { label: 'Heart', shape: '<path d="M24 39C14 32 8 26 8 18.5 8 13.5 11.5 10 16 10c3.6 0 6.4 2.2 8 5.4 1.6-3.2 4.4-5.4 8-5.4 4.5 0 8 3.5 8 8.5C40 26 34 32 24 39z"/>' },
  play: { label: 'Kite', shape: '<path d="M24 6l11 13-11 13-11-13z"/><path d="M13 19h22M24 6v26"/><path d="M24 32c-3 3 3 5 0 8s3 4 1 6"/>' },
  give: { label: 'Gift', shape: '<path d="M9 19h30v7H9z"/><path d="M11.5 26v14h25V26M24 19v21"/><path d="M24 19c-2.5-5-8-7-9.5-4.2-1.4 2.8 3.6 4.2 9.5 4.2zM24 19c2.5-5 8-7 9.5-4.2 1.4 2.8-3.6 4.2-9.5 4.2z"/>' },
};

export const DEFAULT_ICON = 'star';

export const isIcon = (name) => Object.hasOwn(ICONS, name);

/** Returns an inline <svg> for an icon; unknown names draw nothing. */
export function icon(name, className = 'icon') {
  const shape = isIcon(name) ? ICONS[name].shape : '';
  return `<svg class="${className}" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${shape}</g></svg>`;
}

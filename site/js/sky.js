// The sky's colours. Progress moves it from sunrise to sunset; the season gently changes its light
// (#15): paler and crisper in winter, richer in summer, no new colours. A contrast guard keeps the
// white greeting and count readable whatever the season does.
import { mix, adjust, toHsl, fromHsl, contrast } from './colour.js';

// Keyframes along the sun's path: top, middle, horizon, the sun's glow, and the ink on cards.
const SKY = [
  { at: 0.0, top: '#27306b', middle: '#7d6aa6', horizon: '#f39a68', glow: '#ffb36b', deep: '#3a3577' }, // sunrise
  { at: 0.25, top: '#2563c2', middle: '#6b9fdc', horizon: '#f6c79b', glow: '#ffe0a8', deep: '#1f4d94' }, // morning
  { at: 0.5, top: '#1d6ccd', middle: '#4f9ae6', horizon: '#cbe5f8', glow: '#fff6d6', deep: '#17488a' }, // noon
  { at: 0.75, top: '#2a5fb4', middle: '#7f93cf', horizon: '#f5b98a', glow: '#ffd39a', deep: '#2b4688' }, // afternoon
  { at: 1.0, top: '#2a2461', middle: '#9c4d7c', horizon: '#f0844f', glow: '#ff9a5c', deep: '#452a66' }, // sunset
];
export const COLOURS = ['top', 'middle', 'horizon', 'glow', 'deep'];

/** The sky at a point of the day, 0 (sunrise) to 1 (sunset), blended between the two nearest keyframes. */
export function skyAt(ratio) {
  const i = Math.min(SKY.length - 2, Math.floor(ratio * (SKY.length - 1)));
  const [a, b] = [SKY[i], SKY[i + 1]];
  const t = (ratio - a.at) / (b.at - a.at);
  return Object.fromEntries(COLOURS.map((key) => [key, mix(a[key], b[key], t)]));
}

// ---- Seasons. Only saturation and lightness change, plus a little warmth or coolness in the sun.
const SEASONS = {
  winter: { saturation: 0.72, lightness: 0.04, glow: '#f6f4ff', glowAmount: 0.35 },
  spring: { saturation: 0.98, lightness: 0.025, glow: '#fff1d6', glowAmount: 0.15 },
  summer: { saturation: 1.14, lightness: 0, glow: '#ffcf73', glowAmount: 0.3 },
  autumn: { saturation: 0.92, lightness: -0.01, glow: '#ff9a52', glowAmount: 0.25 },
};

function inSeason(sky, name) {
  const s = SEASONS[name];
  const out = {};
  for (const key of COLOURS) {
    if (key === 'deep') out.deep = adjust(sky.deep, { saturation: (1 + s.saturation) / 2 }); // ink follows halfway
    else out[key] = adjust(sky[key], { saturation: s.saturation, lightness: key === 'horizon' ? s.lightness * 1.5 : s.lightness });
  }
  out.glow = mix(out.glow, s.glow, s.glowAmount);
  return out;
}

// Each season is at full strength in its middle (mid-February, mid-May, mid-August, mid-November)
// and blends smoothly into the next around the solstices and equinoxes, so nothing jumps overnight.
const PEAKS = [{ name: 'winter', day: 35 }, { name: 'spring', day: 125 }, { name: 'summer', day: 218 }, { name: 'autumn', day: 311 }];

const dayOfYear = (date) => Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 1)) / 864e5);

/** How much of each season applies on a date, e.g. { winter: 0.7, spring: 0.3 }. Always sums to 1. */
export function seasonWeights(date, hemisphere = 'north') {
  const day = (dayOfYear(date) + (hemisphere === 'south' ? 182 : 0)) % 365;
  for (let i = 0; i < PEAKS.length; i++) {
    const a = PEAKS[i];
    const b = PEAKS[(i + 1) % PEAKS.length];
    const span = (b.day - a.day + 365) % 365;
    const into = (day - a.day + 365) % 365;
    if (into < span) {
      const t = into / span;
      const eased = t * t * (3 - 2 * t);
      return { [a.name]: 1 - eased, [b.name]: eased };
    }
  }
  return { winter: 1 };
}

// ---- Hemisphere. We don't ask for a location; the timezone is a good enough guess, and north is the default.
const SOUTHERN_ZONES = /^(Australia\/|Antarctica\/|Pacific\/(Auckland|Chatham|Fiji|Tongatapu|Apia|Noumea|Efate|Port_Moresby)|America\/(Argentina|Santiago|Punta_Arenas|Sao_Paulo|Montevideo|Asuncion|La_Paz|Lima)|Africa\/(Johannesburg|Maputo|Windhoek|Harare|Lusaka|Gaborone|Maseru|Mbabane|Blantyre|Lubumbashi)|Indian\/(Antananarivo|Mauritius|Reunion))/;

export const hemisphereOf = (timeZone = '') => (SOUTHERN_ZONES.test(timeZone) ? 'south' : 'north');

// ---- Contrast guard. The greeting sits on the top colour and the big count on the middle one, both
// white. If the sky gets too light there, darken just enough to keep a contrast of at least 3.1.
export const MIN_CONTRAST = 3.1;

function guard(sky) {
  const out = { ...sky };
  for (const key of ['top', 'middle']) {
    const [h, s] = toHsl(out[key]);
    let l = toHsl(out[key])[2];
    while (contrast('#ffffff', out[key]) < MIN_CONTRAST && l > 0.05) {
      l -= 0.005;
      out[key] = fromHsl([h, s, l]);
    }
  }
  return out;
}

/** The sky for today's progress (0..1) on a date, in a hemisphere. */
export function seasonalSky(ratio, date = new Date(), hemisphere = 'north') {
  const base = skyAt(ratio);
  // At most two seasons apply at once: the one fading out and the one fading in.
  const [[first], [second, weight] = [first, 0]] = Object.entries(seasonWeights(date, hemisphere));
  const a = inSeason(base, first);
  const b = inSeason(base, second);
  return guard(Object.fromEntries(COLOURS.map((key) => [key, mix(a[key], b[key], weight)])));
}

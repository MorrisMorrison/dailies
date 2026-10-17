// Small colour helpers for "#rrggbb" strings.

export const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export const toHex = (rgb) => '#' + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');

/** Blends from `a` (t = 0) to `b` (t = 1). */
export const mix = (a, b, t) => toHex(toRgb(a).map((v, i) => v + (toRgb(b)[i] - v) * t));

export function toHsl(hex) {
  const [r, g, b] = toRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

export function fromHsl([h, s, l]) {
  if (s === 0) return toHex([l * 255, l * 255, l * 255]);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const channel = (t) => {
    t = (t + 1) % 1;
    const v = t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
    return v * 255;
  };
  return toHex([channel(h + 1 / 3), channel(h), channel(h - 1 / 3)]);
}

/** Scales saturation and shifts lightness (both in HSL). */
export function adjust(hex, { saturation = 1, lightness = 0 }) {
  const [h, s, l] = toHsl(hex);
  return fromHsl([h, Math.min(1, s * saturation), Math.min(1, Math.max(0, l + lightness))]);
}

/** WCAG contrast ratio between two colours (1 to 21). */
export function contrast(a, b) {
  const luminance = (hex) => {
    const [r, g, b] = toRgb(hex).map((v) => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

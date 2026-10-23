/**
 * Small color helpers: parsing, WCAG 2.x contrast, and perceptual distance (OKLab).
 * No dependencies so they run anywhere, including inside an MCP tool call.
 */

export type RGB = readonly [number, number, number];

/** Parses #rgb, #rrggbb, rgb(r, g, b) and rgba(...). Returns 0–255 channels, or null. */
export function parseColor(input: string): RGB | null {
  const s = input.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(s);
  if (hex) {
    let h = hex[1]!;
    if (h.length === 3) h = [...h].map((c) => c + c).join('');
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as unknown as RGB;
  }
  const rgb = /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:[\s,/]+[\d.]+%?)?\s*\)$/.exec(s);
  if (rgb) {
    const channels = [rgb[1], rgb[2], rgb[3]].map(Number);
    if (channels.every((c) => c >= 0 && c <= 255)) return channels as unknown as RGB;
  }
  return null;
}

export const toHex = ([r, g, b]: RGB): string =>
  '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');

const linear = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

export function relativeLuminance(rgb: RGB): number {
  const [r, g, b] = rgb.map(linear) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1–21. */
export function contrastRatio(a: RGB, b: RGB): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export interface ContrastVerdict {
  ratio: number;
  /** 4.5:1 — normal text. */
  aaText: boolean;
  /** 3:1 — large text (≥24px, or ≥18.66px bold) and UI components / focus indicators. */
  aaLarge: boolean;
  /** 7:1 — enhanced. */
  aaaText: boolean;
}

export function judgeContrast(a: RGB, b: RGB): ContrastVerdict {
  const ratio = Math.round(contrastRatio(a, b) * 100) / 100;
  return { ratio, aaText: ratio >= 4.5, aaLarge: ratio >= 3, aaaText: ratio >= 7 };
}

function toOklab(rgb: RGB): [number, number, number] {
  const [r, g, b] = rgb.map(linear) as [number, number, number];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** OKLCH chroma: ~0 for grays, >0.05 for clearly colored values. */
export function chroma(rgb: RGB): number {
  const [, a, b] = toOklab(rgb);
  return Math.hypot(a, b);
}

/** Perceptual distance in OKLab. ~0.02 is barely noticeable; >0.1 is clearly a different color. */
export function colorDistance(a: RGB, b: RGB): number {
  const [l1, a1, b1] = toOklab(a);
  const [l2, a2, b2] = toOklab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

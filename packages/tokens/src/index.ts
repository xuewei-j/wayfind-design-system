import raw from './tokens.json';
import { resolveTokens, type ResolvedToken, type ResolvedValue } from './resolve';
import { parseColor, judgeContrast, type ContrastVerdict } from './color';
import { contrastPairs, type ContrastPair } from './contracts';

export * from './resolve';
export * from './color';
export * from './contracts';
export { toCss } from './css';

/** The raw DTCG document, for tools that want to round-trip it (e.g. Figma token plugins). */
export const source = raw;

/** Every Wayfind token, resolved. */
export const tokens: readonly ResolvedToken[] = resolveTokens(raw);

const byName = new Map(tokens.map((t) => [t.name, t]));

export const getToken = (name: string): ResolvedToken | undefined => byName.get(name);

/** `cssVar('color.text.default')` → `var(--wf-color-text-default)`. Throws on unknown names. */
export function cssVar(name: string): string {
  const token = byName.get(name);
  if (!token) throw new Error(`Unknown Wayfind token "${name}"`);
  return `var(${token.cssVar})`;
}

export type Mode = 'light' | 'dark';

export const valueIn = (token: ResolvedToken, mode: Mode): ResolvedValue =>
  mode === 'dark' && token.dark ? token.dark : token;

export interface PairResult extends ContrastPair, ContrastVerdict {
  mode: Mode;
  pass: boolean;
}

/** Evaluates the accessibility contract in both modes. */
export function checkContrastPairs(pairs: readonly ContrastPair[] = contrastPairs): PairResult[] {
  return (['light', 'dark'] as const).flatMap((mode) =>
    pairs.map((pair) => {
      const fg = getToken(pair.foreground);
      const bg = getToken(pair.background);
      if (!fg || !bg) throw new Error(`Contrast pair references unknown token: ${pair.foreground} / ${pair.background}`);
      const verdict = judgeContrast(parseColor(valueIn(fg, mode).value)!, parseColor(valueIn(bg, mode).value)!);
      return { ...pair, ...verdict, mode, pass: verdict.ratio >= pair.min };
    }),
  );
}

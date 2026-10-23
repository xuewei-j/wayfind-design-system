import { getToken, parseColor, judgeContrast, valueIn, tokens, type Mode, type ContrastVerdict } from '@wayfind/tokens';

export interface ContrastInput {
  /** Token name ("color.text.muted") or color ("#6b6b6b"). */
  foreground: string;
  background: string;
  mode?: Mode;
}

export interface ContrastResult extends ContrastVerdict {
  foreground: { input: string; value: string };
  background: { input: string; value: string };
  mode: Mode;
  /** When text fails AA, semantic text tokens that would pass on this background. */
  alternatives?: string[];
}

function resolve(input: string, mode: Mode): string {
  const token = getToken(input.trim());
  if (token) {
    if (token.type !== 'color') throw new Error(`${input} is a ${token.type} token, not a color.`);
    return valueIn(token, mode).value;
  }
  if (parseColor(input)) return input.trim();
  throw new Error(`"${input}" is neither a Wayfind color token nor a hex/rgb color.`);
}

export function checkContrast({ foreground, background, mode = 'light' }: ContrastInput): ContrastResult {
  const fg = resolve(foreground, mode);
  const bg = resolve(background, mode);
  const bgRgb = parseColor(bg)!;
  const verdict = judgeContrast(parseColor(fg)!, bgRgb);
  const result: ContrastResult = {
    ...verdict,
    foreground: { input: foreground, value: fg },
    background: { input: background, value: bg },
    mode,
  };
  if (!verdict.aaText) {
    result.alternatives = tokens
      .filter((t) => t.name.startsWith('color.text.') && t.name !== 'color.text.disabled')
      .filter((t) => judgeContrast(parseColor(valueIn(t, mode).value)!, bgRgb).aaText)
      .map((t) => t.name);
  }
  return result;
}

import { describe, expect, it } from 'vitest';
import {
  tokens,
  getToken,
  cssVar,
  resolveTokens,
  toCss,
  checkContrastPairs,
  parseColor,
  contrastRatio,
  colorDistance,
} from '../src/index';

describe('resolveTokens', () => {
  it('flattens groups, inherits $type and follows aliases', () => {
    const resolved = resolveTokens({
      palette: { $type: 'color', blue: { '500': { $value: '#0000ff' } } },
      color: { $type: 'color', link: { $value: '{palette.blue.500}' } },
    });
    expect(resolved).toEqual([
      expect.objectContaining({ name: 'palette.blue.500', value: '#0000ff', type: 'color', tier: 'primitive' }),
      expect.objectContaining({
        name: 'color.link',
        value: '#0000ff',
        aliasOf: 'palette.blue.500',
        cssVar: '--wf-color-link',
        tier: 'semantic',
      }),
    ]);
  });

  it('rejects unknown references and cycles', () => {
    expect(() => resolveTokens({ a: { $type: 'color', $value: '{nope}' } })).toThrow(/unknown token/);
    expect(() =>
      resolveTokens({ $type: 'color', a: { $value: '{b}' }, b: { $value: '{a}' } }),
    ).toThrow(/Circular alias/);
  });

  it('requires a $type somewhere up the tree', () => {
    expect(() => resolveTokens({ a: { $value: '1px' } })).toThrow(/no \$type/);
  });
});

describe('Wayfind tokens', () => {
  it('keeps the original brand teal as palette.teal.500', () => {
    expect(getToken('palette.teal.500')?.value).toBe('#31a3b4');
  });

  it('gives every semantic color a dark-mode value', () => {
    const missing = tokens.filter((t) => t.tier === 'semantic' && !t.dark).map((t) => t.name);
    expect(missing).toEqual([]);
  });

  it('only aliases semantic colors to the palette (no raw hex in the semantic layer)', () => {
    const raw = tokens.filter((t) => t.tier === 'semantic' && !t.aliasOf?.startsWith('palette.'));
    expect(raw.map((t) => t.name)).toEqual([]);
  });

  it('cssVar() returns a var() reference and throws on typos', () => {
    expect(cssVar('color.text.default')).toBe('var(--wf-color-text-default)');
    expect(() => cssVar('color.text.defualt')).toThrow(/Unknown Wayfind token/);
  });

  it('emits light values, a prefers-color-scheme block and an explicit dark theme', () => {
    const css = toCss(tokens);
    expect(css).toContain('--wf-color-text-default: var(--wf-palette-neutral-800);');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain(':root[data-theme="dark"]');
  });
});

describe('accessibility contract', () => {
  it('every documented pair meets WCAG AA in light and dark mode', () => {
    const failures = checkContrastPairs()
      .filter((r) => !r.pass)
      .map((r) => `${r.mode}: ${r.foreground} on ${r.background} = ${r.ratio}:1 (needs ${r.min})`);
    expect(failures).toEqual([]);
  });

  it('documents why the raw brand teal is not a text color', () => {
    const ratio = contrastRatio(parseColor('#31a3b4')!, parseColor('#ffffff')!);
    expect(ratio).toBeLessThan(3);
  });
});

describe('color helpers', () => {
  it('parses hex shorthand and rgb()', () => {
    expect(parseColor('#fff')).toEqual([255, 255, 255]);
    expect(parseColor('rgb(49, 163, 180)')).toEqual([49, 163, 180]);
    expect(parseColor('rgba(0,0,0,0.5)')).toEqual([0, 0, 0]);
    expect(parseColor('tomato')).toBeNull();
  });

  it('measures perceptual distance', () => {
    const teal = parseColor('#31a3b4')!;
    expect(colorDistance(teal, teal)).toBe(0);
    expect(colorDistance(teal, parseColor('#32a4b5')!)).toBeLessThan(0.01);
    expect(colorDistance(teal, parseColor('#c2362b')!)).toBeGreaterThan(0.2);
  });
});

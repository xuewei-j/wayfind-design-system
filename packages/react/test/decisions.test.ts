/**
 * Keeps the decision layer honest: patterns only point at things that exist,
 * and an exception that stops being true fails the build instead of going stale.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { contrastRatio, getToken, parseColor, valueIn, type Mode } from '@wayfind/tokens';
import { components, decisions, exceptions } from '../src/registry';

const src = join(dirname(fileURLToPath(import.meta.url)), '../src');
const componentNames = new Set(components.map((c) => c.name));
const decisionIds = new Set(decisions.map((d) => d.id));
const exceptionIds = new Set(exceptions.map((e) => e.id));

const cssFiles = [
  join(src, 'base.css'),
  ...readdirSync(join(src, 'components')).map((name) => join(src, 'components', name, `${name}.css`)),
];

describe('decision patterns', () => {
  it('have unique kebab-case ids', () => {
    expect(decisionIds.size).toBe(decisions.length);
    for (const d of decisions) expect(d.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it.each(decisions.map((d) => [d.id, d] as const))('%s is a real choice between real components', (_id, d) => {
    expect(d.options.length).toBeGreaterThanOrEqual(2);
    for (const option of d.options) {
      expect(option.components.length, option.choose).toBeGreaterThan(0);
      expect(option.components.filter((c) => !componentNames.has(c)), option.choose).toEqual([]);
    }
  });

  it.each(decisions.map((d) => [d.id, d] as const))('%s examples only use real components', (_id, d) => {
    for (const option of d.options) {
      for (const [, tag] of (option.example?.code ?? '').matchAll(/<([A-Z][A-Za-z]*)/g)) {
        expect(componentNames, `${option.choose} uses <${tag}>`).toContain(tag);
      }
    }
  });

  it.each(decisions.map((d) => [d.id, d] as const))('%s says what to avoid and where it ends', (_id, d) => {
    expect(d.question.endsWith('?')).toBe(true);
    expect(d.principle.length).toBeGreaterThan(0);
    expect(d.avoid.length).toBeGreaterThan(0);
    expect(d.boundary.length).toBeGreaterThan(0);
  });

  it('only links to patterns and exceptions that exist', () => {
    for (const d of decisions) {
      expect((d.related ?? []).filter((id) => !decisionIds.has(id)), d.id).toEqual([]);
      const cited = JSON.stringify(d).match(/EX-\d{3}/g) ?? [];
      expect(cited.filter((id) => !exceptionIds.has(id)), d.id).toEqual([]);
    }
  });
});

describe('exception log', () => {
  it('numbers entries in order, without gaps', () => {
    expect(exceptions.map((e) => e.id)).toEqual(
      exceptions.map((_, i) => `EX-${String(i + 1).padStart(3, '0')}`),
    );
  });

  it.each(exceptions.map((e) => [e.id, e] as const))('%s points at a real pattern, components and tokens', (_id, e) => {
    if (e.pattern) expect(decisionIds).toContain(e.pattern);
    expect(e.affects.length).toBeGreaterThan(0);
    expect(e.affects.filter((a) => !componentNames.has(a) && !getToken(a))).toEqual([]);
    expect(e.recorded).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const field of [e.rule, e.where, e.what, e.why, e.nextTime]) expect(field.length).toBeGreaterThan(0);
  });

  const measured = exceptions.filter((e) => e.evidence);
  it.each(measured.map((e) => [e.id, e] as const))('%s still rests on a true measurement, in light and dark', (_id, e) => {
    const { foreground, background, below } = e.evidence!;
    const color = (ref: string, mode: Mode) => {
      const token = getToken(ref);
      return parseColor(token ? valueIn(token, mode).value : ref);
    };
    for (const mode of ['light', 'dark'] as const) {
      const fg = color(foreground, mode);
      const bg = color(background, mode);
      expect(fg, foreground).not.toBeNull();
      expect(bg, background).not.toBeNull();
      // If this fails, the tokens changed and the exception is no longer needed: retire it.
      expect(contrastRatio(fg!, bg!), `${e.id} in ${mode} mode`).toBeLessThan(below);
    }
  });

  it('every wayfind-ignore in the library cites a recorded exception', () => {
    const ignores = cssFiles.flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .filter((line) => line.includes('wayfind-ignore')),
    );
    expect(ignores.length).toBeGreaterThan(0);
    for (const line of ignores) {
      const id = /EX-\d{3}/.exec(line)?.[0];
      expect(id, line.trim()).toBeDefined();
      expect(exceptionIds, line.trim()).toContain(id);
    }
  });
});

describe('theming stays in the token layer', () => {
  it('no component stylesheet mentions dark mode', () => {
    for (const file of cssFiles) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/prefers-color-scheme|data-theme/);
    }
  });
});

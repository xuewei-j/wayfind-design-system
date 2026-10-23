/**
 * Keeps the registry honest. The MCP server hands this metadata to AI agents,
 * so if it drifts from the real components, agents generate broken UI.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getToken, tokens } from '@wayfind/tokens';
import * as library from '../src';
import { components } from '../src/registry';

const componentsDir = join(dirname(fileURLToPath(import.meta.url)), '../src/components');
const readCss = (name: string) => readFileSync(join(componentsDir, name, `${name}.css`), 'utf8');
const cssVarToName = new Map(tokens.map((t) => [t.cssVar, t.name]));

const colorTokensIn = (css: string) =>
  [...new Set([...css.matchAll(/var\((--wf-color-[a-z0-9-]+)\)/g)].map((m) => m[1]!))]
    .map((v) => cssVarToName.get(v) ?? `UNKNOWN ${v}`)
    .sort();

describe('component registry', () => {
  it('has an entry for every component folder and every exported component', () => {
    const folders = readdirSync(componentsDir).sort();
    const exported = Object.keys(library)
      .filter((k) => /^[A-Z]/.test(k))
      .sort();
    const documented = components.map((c) => c.name).sort();
    expect(documented).toEqual(folders);
    expect(documented).toEqual(exported);
  });

  it.each(components.map((c) => [c.name, c] as const))('%s lists exactly the color tokens its CSS uses', (name, meta) => {
    expect([...meta.tokens].sort()).toEqual(colorTokensIn(readCss(name)));
  });

  it.each(components.map((c) => [c.name, c] as const))('%s only references tokens that exist', (_name, meta) => {
    expect(meta.tokens.filter((t) => !getToken(t))).toEqual([]);
  });

  it.each(components.map((c) => [c.name, c] as const))('%s examples only use real components and props', (_name, meta) => {
    const known = new Set(components.map((c) => c.name));
    for (const example of meta.examples) {
      for (const [, tag] of example.code.matchAll(/<([A-Z][A-Za-z]*)/g)) {
        expect(known, `${example.title} uses <${tag}>`).toContain(tag);
      }
    }
  });

  it('every component has usage guidance and accessibility notes', () => {
    for (const meta of components) {
      expect(meta.usage.do.length, meta.name).toBeGreaterThan(0);
      expect(meta.usage.dont.length, meta.name).toBeGreaterThan(0);
      expect(meta.accessibility.length, meta.name).toBeGreaterThan(0);
      expect(meta.examples.length, meta.name).toBeGreaterThan(0);
    }
  });
});

describe('component CSS follows the system', () => {
  const folders = readdirSync(componentsDir);

  it.each(folders)('%s uses no raw colors', (name) => {
    const css = readCss(name).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css.match(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/gi) ?? []).toEqual([]);
  });

  it.each(folders)('%s never reaches past semantic tokens into the palette', (name) => {
    expect(readCss(name)).not.toMatch(/--wf-palette-/);
  });

  it.each(folders)('%s only references tokens that exist', (name) => {
    const vars = [...readCss(name).matchAll(/var\((--wf-[a-z0-9-]+)/g)].map((m) => m[1]!);
    expect(vars.filter((v) => !cssVarToName.has(v))).toEqual([]);
  });
});

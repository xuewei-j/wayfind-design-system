import type { ResolvedToken } from './resolve';
import { toCssVar } from './resolve';

const ref = (t: { value: string; aliasOf?: string }) => (t.aliasOf ? `var(${toCssVar(t.aliasOf)})` : t.value);

/**
 * Emits tokens as CSS custom properties.
 * Semantic tokens point at palette variables (so aliasing stays visible in devtools),
 * and dark values apply both via prefers-color-scheme and an explicit data-theme switch.
 */
export function toCss(tokens: readonly ResolvedToken[]): string {
  const light = tokens.map((t) => `  ${t.cssVar}: ${ref(t)};`).join('\n');
  const darkTokens = tokens.filter((t) => t.dark);
  const dark = darkTokens.map((t) => `  ${t.cssVar}: ${ref(t.dark!)};`).join('\n');
  const indent = (s: string) => s.replace(/^/gm, '  ');

  return `/* Wayfind design tokens — generated from tokens.json. Do not edit by hand. */
:root {
  color-scheme: light;
${light}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
${indent(dark)}
  }
}

:root[data-theme="dark"] {
  color-scheme: dark;
${dark}
}
`;
}

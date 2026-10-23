/**
 * Writes the static artifacts next to the JS bundle:
 *   dist/tokens.css   — CSS custom properties (light + dark)
 *   dist/tokens.json  — flat resolved list, handy for other tools
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokens, toCss, checkContrastPairs } from '../src/index';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
mkdirSync(dist, { recursive: true });

const failures = checkContrastPairs().filter((r) => !r.pass);
if (failures.length) {
  for (const f of failures) {
    console.error(`✗ ${f.mode}: ${f.foreground} on ${f.background} = ${f.ratio}:1 (needs ${f.min}:1) — ${f.usedBy}`);
  }
  throw new Error(`${failures.length} contrast pair(s) fail WCAG AA. Fix tokens.json before building.`);
}

writeFileSync(resolve(dist, 'tokens.css'), toCss(tokens));
writeFileSync(resolve(dist, 'tokens.json'), JSON.stringify(tokens, null, 2) + '\n');
console.log(`✓ ${tokens.length} tokens → dist/tokens.css, dist/tokens.json (all contrast pairs pass)`);

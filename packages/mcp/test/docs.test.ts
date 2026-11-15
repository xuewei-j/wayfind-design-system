/**
 * The Markdown docs people read on GitHub are generated from the same data the
 * MCP server serves. These are file snapshots: if tokens, the registry or a
 * pattern changes and the doc was not regenerated, the test fails.
 *
 *   pnpm docs:generate
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { components, decisions, exceptions } from '@wayfind/react/registry';
import { architectureToMarkdown, decisionPatternsToMarkdown, tokenArchitecture } from '../src/core/index';

describe('generated docs are up to date', () => {
  it('docs/TOKENS.md', async () => {
    await expect(architectureToMarkdown()).toMatchFileSnapshot('../../../docs/TOKENS.md');
  });

  it('docs/DECISION-PATTERNS.md', async () => {
    await expect(decisionPatternsToMarkdown()).toMatchFileSnapshot('../../../docs/DECISION-PATTERNS.md');
  });
});

describe('README', () => {
  const readme = readFileSync(fileURLToPath(new URL('../../../README.md', import.meta.url)), 'utf8');
  const a = tokenArchitecture();
  const [primitive, semantic] = a.tiers;

  it.each([
    `${a.total} tokens`,
    `${primitive!.count} palette values`,
    `${semantic!.count} semantic colors`,
    `${components.length} React components`,
    `${decisions.length} questions`,
    `${exceptions.length} recorded exceptions`,
    `${a.contract.pairs} color pairings`,
  ])('says "%s", which matches the data', (claim) => {
    expect(readme).toContain(claim);
  });
});

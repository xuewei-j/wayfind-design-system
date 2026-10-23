import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkStyles, fixStyles, type Rule } from '../src/core/lint';

const rules = (code: string) => checkStyles(code).issues.map((i) => i.rule);
const only = (code: string, rule: Rule) => checkStyles(code).issues.filter((i) => i.rule === rule);

describe('check_styles', () => {
  it('passes clean, token-based CSS', () => {
    const report = checkStyles(`.card {
  padding: var(--wf-space-4);
  color: var(--wf-color-text-default);
  border-radius: var(--wf-radius-md);
  font-family: var(--wf-font-family-body);
}`);
    expect(report).toEqual({ passed: true, summary: { errors: 0, warnings: 0, infos: 0 }, issues: [] });
  });

  it('catches hallucinated tokens and maps names borrowed from other systems by intent', () => {
    const [issue] = only('.a { color: var(--wf-color-text-primary); }', 'unknown-token');
    expect(issue).toMatchObject({ severity: 'error', line: 1, found: '--wf-color-text-primary' });
    expect(issue!.suggestion).toBe('var(--wf-color-text-default)');

    const guess = (v: string) => only(`.a { x: var(${v}); }`, 'unknown-token')[0]?.fix?.text;
    expect(guess('--wf-color-text-secondary')).toBe('--wf-color-text-muted');
    expect(guess('--wf-color-background-card')).toBe('--wf-color-bg-surface');
    expect(guess('--wf-spacing-4')).toBe('--wf-space-4');
    expect(guess('--wf-radius-full')).toBe('--wf-radius-pill');
    expect(guess('--wf-colour-text-default')).toBe('--wf-color-text-default'); // typo → edit distance
  });

  it('catches unknown names passed to cssVar()', () => {
    expect(only("const c = cssVar('color.txt.default');", 'unknown-token')[0]?.suggestion).toBe("cssVar('color.text.default')");
  });

  it('steers palette usage to semantic tokens by property', () => {
    const [issue] = only('.a { background: var(--wf-palette-orange-600); }', 'palette-token');
    expect(issue).toMatchObject({ severity: 'warning', suggestion: 'var(--wf-color-bg-brand)' });
  });

  it('maps a hard-coded color that matches a token', () => {
    const [issue] = only('.a { color: #0d0d0d; }', 'raw-color');
    expect(issue).toMatchObject({ severity: 'warning', suggestion: 'var(--wf-color-text-default)' });
  });

  it('flags off-system colors as errors, with the nearest token for the property', () => {
    const [issue] = only("<div style={{ backgroundColor: '#3b82f6' }} />", 'raw-color');
    expect(issue?.severity).toBe('error');
    expect(issue?.suggestion).toMatch(/^var\(--wf-color-bg-/);
    // A saturated orange maps to a colored token (the brand), not the nearest gray.
    expect(only("<p style={{ color: '#c2410c' }} />", 'raw-color')[0]?.suggestion).toBe('var(--wf-color-text-brand)');
  });

  it('flags off-grid spacing and raw on-grid values differently', () => {
    const issues = checkStyles('.a { padding: 13px 16px; }').issues;
    expect(issues).toEqual([
      expect.objectContaining({ rule: 'off-scale', found: '13px', suggestion: 'var(--wf-space-3)', column: 15 }),
      expect.objectContaining({ rule: 'raw-scale-value', found: '16px', severity: 'info', suggestion: 'var(--wf-space-4)' }),
    ]);
  });

  it('understands React style objects (unitless px, camelCase)', () => {
    const issues = checkStyles('<div style={{ marginTop: 10, fontSize: 17, borderRadius: 7 }} />').issues;
    expect(issues.map((i) => [i.rule, i.found, i.suggestion])).toEqual([
      ['off-scale', '10', 'var(--wf-space-2)'],
      ['off-scale', '17', 'var(--wf-font-size-md)'],
      ['off-scale', '7', 'var(--wf-radius-md)'],
    ]);
  });

  it('handles negative margins and rem', () => {
    const [issue] = checkStyles('.a { margin-left: -1rem; }').issues;
    expect(issue).toMatchObject({ rule: 'raw-scale-value', suggestion: 'calc(-1 * var(--wf-space-4))' });
  });

  it('flags off-system fonts', () => {
    expect(rules('.a { font-family: Inter, sans-serif; }')).toEqual(['unknown-font']);
    expect(rules('.a { font-family: var(--wf-font-family-display); }')).toEqual([]);
  });

  it('catches invented variants and suggests the closest valid one', () => {
    const [issue] = only('<Button variant="primay">Go</Button>', 'invalid-prop');
    expect(issue).toMatchObject({ severity: 'error', suggestion: 'variant="primary"' });
    expect(rules('<Stack gap={7}>…</Stack>')).toEqual(['invalid-prop']);
    expect(rules('<Stack gap={6}>…</Stack>')).toEqual([]);
  });

  it('copes with arrow functions and nested braces inside a tag', () => {
    expect(rules('<Button onClick={() => { if (a > b) go(); }} size="xl">Go</Button>')).toEqual(['invalid-prop']);
  });

  it('requires labels on fields and levels on headings', () => {
    expect(rules('<TextField placeholder="Email" />')).toEqual(['missing-prop']);
    expect(rules('<Heading>Title</Heading>')).toEqual(['missing-prop']);
    expect(rules('<TextField {...field} />')).toEqual([]);
  });

  it('reports positions on the right line', () => {
    const issue = checkStyles('.a {\n  color: var(--wf-color-text-default);\n  gap: 5px;\n}').issues[0];
    expect(issue).toMatchObject({ line: 3, column: 8 });
  });

  it('ignores comments and lines marked wayfind-ignore', () => {
    expect(rules('/* color: #ff0000; */ .a { color: var(--wf-color-text-default); }')).toEqual([]);
    expect(rules('.a { margin-top: 2px; /* wayfind-ignore: optical alignment */ }')).toEqual([]);
    expect(rules('const url = "https://example.com"; // padding: 3px')).toEqual([]);
  });

  it('fixStyles applies safe fixes and leaves judgment calls', () => {
    const input = `<Card>
  <TextField placeholder="Email" />
  <Stack direction="row" gap={7}>
    <Button variant="tertiary">Cancel</Button>
    <Button style={{ background: '#e07b42', padding: 10, fontFamily: 'Inter' }}>Pay</Button>
  </Stack>
  <p style={{ color: 'var(--wf-color-text-primary)' }}>Non-refundable.</p>
</Card>`;
    const { code, applied, report } = fixStyles(input);
    expect(applied).toBe(6);
    expect(code).toContain('gap={6}');
    expect(code).toContain('variant="primary"');
    expect(code).toContain("background: 'var(--wf-color-bg-accent)'");
    expect(code).toContain("padding: 'var(--wf-space-2)'");
    expect(code).toContain("fontFamily: 'var(--wf-font-family-body)'");
    expect(code).toMatch(/var\(--wf-color-text-[a-z-]+\)/);
    expect(code).not.toContain('text-primary');
    // Only the missing label is left: a human or agent has to write it.
    expect(report.issues.map((i) => i.rule)).toEqual(['missing-prop']);
  });

  it('the component library passes its own linter (dogfooding)', () => {
    const dir = join(dirname(fileURLToPath(import.meta.url)), '../../react/src/components');
    const problems = readdirSync(dir).flatMap((name) =>
      checkStyles(readFileSync(join(dir, name, `${name}.css`), 'utf8')).issues.map((i) => `${name}.css:${i.line} ${i.message}`),
    );
    expect(problems).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { decisions, exceptions } from '@wayfind/react/registry';
import {
  checkStyles,
  decisionToMarkdown,
  exceptionsToMarkdown,
  getDecision,
  listDecisions,
  tokenArchitecture,
} from '../src/core/index';

describe('decision patterns', () => {
  it('lists every pattern with the components it chooses between', () => {
    const list = listDecisions();
    expect(list.map((d) => d.id)).toEqual(decisions.map((d) => d.id));
    expect(list.find((d) => d.id === 'form-errors')).toMatchObject({
      question: 'Does this error go on the field or in a banner?',
      components: ['TextField', 'Alert'],
    });
  });

  it('finds a pattern from a question in plain words, or from a component name', () => {
    expect(listDecisions('where should a form error go, field or banner?')[0]?.id).toBe('form-errors');
    expect(listDecisions('which button variant')[0]?.id).toBe('action-hierarchy');
    expect(listDecisions('empty screen')[0]?.id).toBe('empty-states');
    expect(listDecisions('Tag').map((d) => d.id)).toContain('feedback-loudness');
    expect(listDecisions('zzz')).toEqual([]);
  });

  it('get_decision returns the pattern with its recorded exceptions, and suggests on a miss', () => {
    const hit = getDecision('Contrast Floors');
    expect(hit.found && hit.exceptions.map((e) => e.id)).toEqual(['EX-001', 'EX-002']);

    const miss = getDecision('button variant');
    expect(miss).toEqual({ found: false, suggestions: expect.arrayContaining(['action-hierarchy']) });
  });

  it('renders options, examples, boundary and exceptions as Markdown', () => {
    const doc = decisionToMarkdown(decisions.find((d) => d.id === 'contrast-floors')!);
    expect(doc).toContain('# How much contrast does this pair need?');
    expect(doc).toContain('**When:**');
    expect(doc).toContain('## Boundary');
    expect(doc).toContain('### EX-001 · Outlines drawn with color.border.default');
    expect(exceptionsToMarkdown()).toContain(`### ${exceptions.at(-1)!.id}`);
  });

  const examples = decisions.flatMap((d) =>
    d.options.flatMap((o) => (o.example ? [[`${d.id} › ${o.choose}`, o.example.code] as const] : [])),
  );
  it.each(examples)('%s passes the linter', (_name, code) => {
    expect(checkStyles(code).issues).toEqual([]);
  });
});

describe('exceptions in check_styles', () => {
  it('skips an explained line and reports the exception', () => {
    const report = checkStyles('.a { margin-top: 2px; /* wayfind-ignore: optical alignment */ }');
    expect(report.passed).toBe(true);
    expect(report.exceptions).toEqual([{ line: 1, reason: 'optical alignment' }]);
  });

  it('resolves a recorded exception id to its reason', () => {
    const report = checkStyles('.icon { margin-top: 0.125rem; /* wayfind-ignore EX-004 */ }');
    expect(report.passed).toBe(true);
    expect(report.exceptions).toEqual([{ line: 1, id: 'EX-004', reason: exceptions.find((e) => e.id === 'EX-004')!.why }]);
  });

  it('flags an ignore that gives no reason', () => {
    const report = checkStyles('.a {\n  margin-top: 2px; /* wayfind-ignore */\n}');
    expect(report.passed).toBe(false);
    expect(report.issues).toEqual([expect.objectContaining({ rule: 'unexplained-ignore', severity: 'warning', line: 2 })]);
    expect(report.exceptions).toEqual([]);
  });

  it('rejects an exception id that is not in the log', () => {
    const report = checkStyles('<div style={{ margin: 3 }} /> // wayfind-ignore EX-999');
    expect(report.issues).toEqual([expect.objectContaining({ rule: 'unknown-exception', severity: 'error', found: 'EX-999' })]);
  });
});

describe('token architecture', () => {
  const a = tokenArchitecture();

  it('counts the tiers from tokens.json', () => {
    expect(a.tiers.map((t) => t.tier)).toEqual(['primitive', 'semantic', 'scale']);
    expect(a.tiers.reduce((sum, t) => sum + t.count, 0)).toBe(a.total);
    expect(a.tiers[1]!.example).toBe('color.bg.brand → palette.orange.600');
  });

  it('traces a semantic color to its palette steps, its readers and its contrast checks', () => {
    const brand = a.semantic.find((t) => t.name === 'color.bg.brand')!;
    expect(brand.light).toEqual({ value: '#ba4300', aliasOf: 'palette.orange.600' });
    expect(brand.dark.aliasOf).toBe('palette.orange.400');
    expect(brand.readBy).toEqual(['Button']);
    expect(brand.contractPairs).toBeGreaterThan(0);
  });

  it('every role has a purpose and an example', () => {
    for (const role of a.roles) {
      expect(role.purpose, role.role).not.toBe('');
      expect(role.example.startsWith(`color.${role.role}.`)).toBe(true);
    }
  });
});

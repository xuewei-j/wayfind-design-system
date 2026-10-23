/**
 * check_styles: a design-system linter for CSS and JSX snippets.
 *
 * Built for AI-generated UI, which tends to fail in predictable ways:
 * hallucinated token names, hard-coded hex colors, off-grid spacing,
 * made-up variants ("tertiary"), and fields without labels.
 *
 * It is deliberately regex-based (no parser dependency) so it runs in the
 * browser and inside an MCP call in a few milliseconds. Lines containing
 * `wayfind-ignore` are skipped, like an eslint-disable comment.
 *
 * Most issues carry a machine-applicable `fix`, so an agent can lint → fix →
 * re-lint in a loop and only has to think about what's left.
 */
import { tokens, parseColor, colorDistance, chroma, type ResolvedToken } from '@wayfind/tokens';
import { components, type ComponentMeta } from '@wayfind/react/registry';

export type Severity = 'error' | 'warning' | 'info';

export type Rule =
  | 'unknown-token'
  | 'palette-token'
  | 'raw-color'
  | 'off-scale'
  | 'raw-scale-value'
  | 'unknown-font'
  | 'invalid-prop'
  | 'missing-prop';

/** Replace code.slice(start, end) with text. Offsets refer to the original input. */
export interface Fix {
  start: number;
  end: number;
  text: string;
}

export interface StyleIssue {
  rule: Rule;
  severity: Severity;
  line: number;
  column: number;
  found: string;
  message: string;
  /** Human-readable replacement, when there is a clear one. */
  suggestion?: string;
  fix?: Fix;
}

export interface StyleReport {
  passed: boolean;
  summary: { errors: number; warnings: number; infos: number };
  issues: StyleIssue[];
}

const ROOT_PX = 16;
const byCssVar = new Map(tokens.map((t) => [t.cssVar, t]));
const byName = new Map(tokens.map((t) => [t.name, t]));
const semanticColors = tokens.filter((t) => t.tier === 'semantic' && t.type === 'color');
const usage = (t: ResolvedToken) => `var(${t.cssVar})`;

function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]!;
      prev[j] = Math.min(prev[j]! + 1, prev[j - 1]! + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length]!;
}

/**
 * Names agents tend to invent, borrowed from other systems (Tailwind, MUI, shadcn).
 * Tried before falling back to edit distance, so `text-primary` maps to the intent, not the spelling.
 */
const synonyms: Array<[RegExp, string]> = [
  [/-text-primary$/, '-text-default'],
  [/-text-(secondary|tertiary|subtle)$/, '-text-muted'],
  [/-(bg|background)-(primary|accent)$/, '-bg-brand'],
  [/-(bg|background)-(default|base|page)$/, '-bg-canvas'],
  [/-(bg|background)-(card|paper|elevated)$/, '-bg-surface'],
  [/-background-/, '-bg-'],
  [/-primary/, '-brand'],
  [/-spacing-/, '-space-'],
  [/-radius-(full|round)$/, '-radius-pill'],
  [/-font-(body|display|mono)$/, '-font-family-$1'],
];

function guessToken(cssVar: string): ResolvedToken | undefined {
  let candidate = cssVar;
  for (const [pattern, replacement] of synonyms) {
    candidate = candidate.replace(pattern, replacement);
    const hit = byCssVar.get(candidate);
    if (hit) return hit;
  }
  return closest(tokens, (t) => editDistance(t.cssVar, cssVar));
}

const closest = <T>(items: readonly T[], score: (item: T) => number): T | undefined =>
  items.reduce<{ item?: T; s: number }>((best, item) => {
    const s = score(item);
    return s < best.s ? { item, s } : best;
  }, { s: Infinity }).item;

/** Which semantic color group fits a CSS property. */
function colorGroupFor(property: string | undefined): string | undefined {
  if (!property) return undefined;
  if (/^(color|caret-color|text-decoration-color)$/.test(property)) return 'color.text.';
  if (/^(background|background-color|fill)$/.test(property)) return 'color.bg.';
  if (/^(border|outline|stroke|box-shadow)/.test(property)) return 'color.border.';
  return undefined;
}

const kebab = (prop: string) => prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const scales: Array<{ test: RegExp; prefix: string; label: string }> = [
  { test: /^(padding|margin|gap|row-gap|column-gap|inset)(-[a-z]+)*$/, prefix: 'space.', label: 'space' },
  { test: /^border(-[a-z]+)*-radius$/, prefix: 'radius.', label: 'radius' },
  { test: /^font-size$/, prefix: 'font.size.', label: 'font size' },
];

const toPx = (value: string): number | null => {
  const m = /^(-?\d*\.?\d+)(px|rem)?$/.exec(value);
  if (!m) return null;
  const n = Number(m[1]);
  return m[2] === 'rem' ? n * ROOT_PX : n;
};

const scaleSteps = new Map(
  scales.map((s) => [
    s.prefix,
    tokens
      .filter((t) => t.name.startsWith(s.prefix) && t.type === 'dimension')
      .map((t) => ({ token: t, px: toPx(t.value) }))
      .filter((step): step is { token: ResolvedToken; px: number } => step.px !== null && step.px < 9999),
  ]),
);

/** Replaces comments with spaces so positions are preserved but contents are ignored. */
function maskComments(code: string): string {
  const blank = (s: string) => s.replace(/[^\n]/g, ' ');
  return code
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(^|[^:\\])(\/\/[^\n]*)/gm, (_, pre: string, comment: string) => pre + blank(comment));
}

/** Finds the end of a JSX opening tag, skipping over {expressions} and "strings". */
function scanTag(code: string, start: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = start; i < code.length; i++) {
    const ch = code[i]!;
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if (ch === '{') depth++;
    else if (ch === '}') depth--;
    else if (ch === '>' && depth === 0) return i;
  }
  return code.length;
}

/** "'a' | 'b'" → ['a', 'b']; "0 | 1" → ['0', '1']; anything non-literal → null. */
function literalUnion(type: string): string[] | null {
  const parts = type.split('|').map((p) => p.trim());
  if (!parts.every((p) => /^'[^']*'$/.test(p) || /^-?\d+$/.test(p))) return null;
  return parts.map((p) => p.replace(/'/g, ''));
}

export function checkStyles(code: string): StyleReport {
  const issues: StyleIssue[] = [];
  const lineStarts = [0, ...[...code.matchAll(/\n/g)].map((m) => m.index! + 1)];
  const position = (index: number) => {
    let line = lineStarts.length - 1;
    while (lineStarts[line]! > index) line--;
    return { line: line + 1, column: index - lineStarts[line]! + 1 };
  };
  const ignored = new Set(code.split('\n').flatMap((text, i) => (text.includes('wayfind-ignore') ? [i + 1] : [])));
  const add = (index: number, issue: Omit<StyleIssue, 'line' | 'column'>) => {
    const pos = position(index);
    if (!ignored.has(pos.line)) issues.push({ ...pos, ...issue });
  };
  const src = maskComments(code);

  /** The CSS/JS property a value at `index` belongs to, e.g. "background-color". */
  const propertyAt = (index: number): string | undefined => {
    const lineStart = src.lastIndexOf('\n', index - 1) + 1;
    const matches = [...src.slice(lineStart, index).matchAll(/([a-zA-Z-]+)\s*:/g)];
    const last = matches[matches.length - 1];
    return last ? kebab(last[1]!) : undefined;
  };

  // 1. Token references that don't exist (the #1 agent hallucination) and palette shortcuts.
  for (const m of src.matchAll(/var\(\s*(--wf-[a-z0-9-]+)/g)) {
    const cssVar = m[1]!;
    const start = m.index! + m[0].indexOf(cssVar);
    const end = start + cssVar.length;
    const token = byCssVar.get(cssVar);
    if (!token) {
      const guess = guessToken(cssVar);
      add(start, {
        rule: 'unknown-token',
        severity: 'error',
        found: cssVar,
        message: `${cssVar} is not a Wayfind token.${guess ? ` Did you mean ${guess.cssVar} (${guess.name})?` : ''}`,
        ...(guess ? { suggestion: usage(guess), fix: { start, end, text: guess.cssVar } } : {}),
      });
    } else if (token.tier === 'primitive') {
      const group = colorGroupFor(propertyAt(start)) ?? '\0';
      const semantic = semanticColors
        .filter((t) => t.aliasOf === token.name)
        .sort((a, b) => Number(!a.name.startsWith(group)) - Number(!b.name.startsWith(group)));
      add(start, {
        rule: 'palette-token',
        severity: 'warning',
        found: cssVar,
        message: `${token.name} is a primitive. Use a semantic token so dark mode and theming work${
          semantic.length ? `: ${semantic.slice(0, 3).map((t) => t.name).join(', ')}` : ''
        }.`,
        ...(semantic[0] ? { suggestion: usage(semantic[0]), fix: { start, end, text: semantic[0].cssVar } } : {}),
      });
    }
  }

  for (const m of src.matchAll(/cssVar\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    if (byName.has(m[1]!)) continue;
    const guess = guessToken(`--wf-${m[1]!.split('.').join('-')}`);
    const text = guess ? `cssVar('${guess.name}')` : undefined;
    add(m.index!, {
      rule: 'unknown-token',
      severity: 'error',
      found: m[1]!,
      message: `cssVar('${m[1]}') will throw: no such token.${guess ? ` Did you mean '${guess.name}'?` : ''}`,
      ...(text ? { suggestion: text, fix: { start: m.index!, end: m.index! + m[0].length, text } } : {}),
    });
  }

  // 2. Hard-coded colors.
  for (const m of src.matchAll(/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b|rgba?\([^)]*\)/g)) {
    const rgb = parseColor(m[0].length === 9 ? m[0].slice(0, 7) : m[0]);
    if (!rgb) continue;
    const group = colorGroupFor(propertyAt(m.index!));
    let pool = group ? semanticColors.filter((t) => t.name.startsWith(group)) : semanticColors;
    // A clearly colored value (say, a random blue) was probably meant as an accent,
    // so suggest a colored token rather than the nearest gray.
    if (chroma(rgb) > 0.05) {
      const colored = pool.filter((t) => chroma(parseColor(t.value)!) > 0.05);
      if (colored.length) pool = colored;
    }
    const best = closest(pool.length ? pool : semanticColors, (t) => colorDistance(rgb, parseColor(t.value)!))!;
    const exact = colorDistance(rgb, parseColor(best.value)!) < 0.02;
    const fix = { start: m.index!, end: m.index! + m[0].length, text: usage(best) };
    add(m.index!, {
      rule: 'raw-color',
      severity: exact ? 'warning' : 'error',
      found: m[0],
      message: exact
        ? `Hard-coded ${m[0]} matches ${best.name}. Use the token so it adapts to dark mode.`
        : `${m[0]} is not a Wayfind color. Closest ${group ? `${group.slice(0, -1)} ` : ''}token is ${best.name} (${best.value}).`,
      suggestion: usage(best),
      fix,
    });
  }

  // 3. Declarations: spacing / radius / font-size scales and font families.
  // A value runs to ; { } or a newline — or, in JS objects, to a comma that starts the next key.
  for (const m of src.matchAll(/([a-zA-Z-]+)\s*:\s*((?:[^;{}\n,]|,(?!\s*[a-zA-Z-]+\s*:))+)/g)) {
    const property = kebab(m[1]!);
    const rawValue = m[2]!;
    const valueStart = m.index! + m[0].length - rawValue.length;

    if (property === 'font-family') {
      if (/var\(--wf-font-family|sf pro|-apple-system|system-ui|monospace|inherit/i.test(rawValue)) continue;
      const trimmed = rawValue.replace(/[\s,]+$/, '');
      const quote = /^['"`]/.test(trimmed) ? trimmed[0]! : '';
      add(valueStart, {
        rule: 'unknown-font',
        severity: 'warning',
        found: trimmed,
        message: 'Font is outside the system. Use the body or display family.',
        suggestion: 'var(--wf-font-family-body)',
        fix: { start: valueStart, end: valueStart + trimmed.length, text: `${quote}var(--wf-font-family-body)${quote}` },
      });
      continue;
    }

    const scale = scales.find((s) => s.test.test(property));
    if (!scale) continue;
    const steps = scaleSteps.get(scale.prefix)!;

    for (const part of rawValue.matchAll(/[^\s'"`,]+/g)) {
      // Unitless numbers are treated as px, which is what React does for style={{ padding: 12 }}.
      const value = part[0].replace(/!important$/, '');
      const px = toPx(value);
      if (px === null || px === 0) continue;
      const start = valueStart + part.index!;
      const nearest = closest(steps, (s) => Math.abs(s.px - Math.abs(px)))!;
      const replacement = px < 0 ? `calc(-1 * ${usage(nearest.token)})` : usage(nearest.token);
      // A bare number only appears in JS objects, where the replacement must become a string.
      const fix = { start, end: start + value.length, text: /^-?[\d.]+$/.test(value) ? `'${replacement}'` : replacement };
      const onScale = Math.abs(nearest.px - Math.abs(px)) < 0.01;
      add(start, {
        rule: onScale ? 'raw-scale-value' : 'off-scale',
        severity: onScale ? 'info' : 'warning',
        found: value,
        message: onScale
          ? `${value} is ${nearest.token.name}; reference the token instead of the raw value.`
          : `${value} is off the ${scale.label} scale. Nearest step is ${nearest.token.name} (${nearest.token.value}).`,
        suggestion: replacement,
        fix,
      });
    }
  }

  // 4. JSX: invalid variants and missing required props on Wayfind components.
  const metas = new Map<string, ComponentMeta>(components.map((c) => [c.name, c]));
  for (const m of src.matchAll(/<([A-Z][A-Za-z]*)\b/g)) {
    const meta = metas.get(m[1]!);
    if (!meta) continue;
    const tag = src.slice(m.index!, scanTag(src, m.index! + m[0].length));
    const hasSpread = /\{\s*\.\.\./.test(tag);
    const attrs = new Map<string, { value?: string; braced: boolean; start: number; end: number }>();
    for (const a of tag.matchAll(
      /\s([a-zA-Z][\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*(?:(-?\d+(?:\.\d+)?)|"([^"]*)"|'([^']*)'|[^}]*)\s*\}))?/g,
    )) {
      const value = a[2] ?? a[3] ?? a[4] ?? a[5] ?? a[6];
      const start = m.index! + a.index! + 1;
      attrs.set(a[1]!, {
        ...(value !== undefined ? { value } : {}),
        braced: a[4] !== undefined,
        start,
        end: start + a[0].length - 1,
      });
    }

    for (const [prop, doc] of Object.entries(meta.props)) {
      const attr = attrs.get(prop);
      if (!attr) {
        if (doc.required && prop !== 'children' && !hasSpread) {
          add(m.index!, {
            rule: 'missing-prop',
            severity: 'error',
            found: `<${meta.name}>`,
            message: `<${meta.name}> requires \`${prop}\`: ${doc.description}`,
          });
        }
        continue;
      }
      const allowed = literalUnion(doc.type);
      if (!allowed || attr.value === undefined || allowed.includes(attr.value)) continue;
      const numeric = allowed.every((v) => /^-?\d+$/.test(v)) && /^-?\d+(\.\d+)?$/.test(attr.value);
      const guess = numeric
        ? closest(allowed, (v) => Math.abs(Number(v) - Number(attr.value)))
        : closest(allowed, (v) => editDistance(v, attr.value!));
      const text = guess === undefined ? undefined : attr.braced || numeric ? `${prop}={${guess}}` : `${prop}="${guess}"`;
      add(attr.start, {
        rule: 'invalid-prop',
        severity: 'error',
        found: src.slice(attr.start, attr.end),
        message: `<${meta.name}> has no ${prop} ${attr.value}. Use one of: ${allowed.join(', ')}.`,
        ...(text ? { suggestion: text, fix: { start: attr.start, end: attr.end, text } } : {}),
      });
    }
  }

  issues.sort((a, b) => a.line - b.line || a.column - b.column);
  const count = (s: Severity) => issues.filter((i) => i.severity === s).length;
  const summary = { errors: count('error'), warnings: count('warning'), infos: count('info') };
  return { passed: summary.errors === 0 && summary.warnings === 0, summary, issues };
}

export interface FixResult {
  code: string;
  applied: number;
  /** What's left after fixing: usually issues that need judgment, like a missing label. */
  report: StyleReport;
}

/** Applies every non-overlapping machine fix, then re-lints the result. */
export function fixStyles(code: string): FixResult {
  const fixes = checkStyles(code)
    .issues.flatMap((i) => (i.fix ? [i.fix] : []))
    .sort((a, b) => b.start - a.start);
  let out = code;
  let applied = 0;
  let floor = Infinity;
  for (const fix of fixes) {
    if (fix.end > floor) continue; // overlaps a fix we already applied
    out = out.slice(0, fix.start) + fix.text + out.slice(fix.end);
    floor = fix.start;
    applied++;
  }
  return { code: out, applied, report: checkStyles(out) };
}

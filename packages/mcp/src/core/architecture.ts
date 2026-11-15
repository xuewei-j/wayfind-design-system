/**
 * The token architecture, described from the data itself: tiers, naming, and for
 * every semantic color where it points in each mode, which components read it and
 * how many contrast checks it is part of.
 *
 * `docs/TOKENS.md`, the Storybook "Token architecture" page and the
 * `wayfind://tokens/architecture` resource are all rendered from this, so the
 * numbers in the docs can't drift from tokens.json.
 */
import { tokens, contrastPairs, type ResolvedToken, type ResolvedValue, type TokenTier } from '@wayfind/tokens';
import { components, exceptions } from '@wayfind/react/registry';

export interface TierInfo {
  tier: TokenTier;
  label: string;
  /** Where the tier lives in tokens.json. */
  path: string;
  count: number;
  namedBy: string;
  example: string;
  rule: string;
  groups: Array<{ name: string; count: number }>;
}

export interface SemanticTrace {
  name: string;
  role: string;
  description?: string;
  light: ResolvedValue;
  dark: ResolvedValue;
  /** Components whose stylesheet reads this token. */
  readBy: string[];
  /** Pairings in the contrast contract that include this token. */
  contractPairs: number;
  /** The recorded exception that explains why this token sits below a contrast floor, if there is one. */
  exception?: string;
}

export interface TokenArchitecture {
  total: number;
  tiers: TierInfo[];
  roles: Array<{ role: string; count: number; purpose: string; example: string }>;
  semantic: SemanticTrace[];
  palette: Array<{ family: string; steps: string[] }>;
  contract: { pairs: number; checks: number };
  components: number;
}

const rolePurpose: Record<string, string> = {
  bg: 'Fills behind content',
  text: 'Text and icons',
  border: 'Lines and outlines',
  focus: 'The keyboard focus ring',
};

const countBy = (list: readonly ResolvedToken[], key: (t: ResolvedToken) => string) => {
  const counts = new Map<string, number>();
  for (const t of list) counts.set(key(t), (counts.get(key(t)) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count }));
};

const show = (v: ResolvedValue) => (v.aliasOf ? `\`${v.aliasOf}\` ${v.value}` : v.value);

const optional = <K extends string, V>(key: K, value: V | undefined): { [P in K]?: V } =>
  value === undefined ? {} : ({ [key]: value } as { [P in K]?: V });

/** Prefers an example that shows the naming grammar at work: a state suffix or an on-<x> pair. */
const exampleFor = (list: readonly ResolvedToken[], role: string) => {
  const inRole = list.filter((t) => t.name.startsWith(`color.${role}.`));
  return (inRole.find((t) => /\.on-|-hover$/.test(t.name)) ?? inRole[0]!).name;
};

export function tokenArchitecture(): TokenArchitecture {
  const tier = (name: TokenTier) => tokens.filter((t) => t.tier === name);
  const primitive = tier('primitive');
  const semantic = tier('semantic');
  const scale = tier('scale');
  const brand = tokens.find((t) => t.name === 'color.bg.brand')!;
  const space = tokens.find((t) => t.name === 'space.4')!;

  const tiers: TierInfo[] = [
    {
      tier: 'primitive',
      label: 'Primitive',
      path: 'palette.*',
      count: primitive.length,
      namedBy: 'What it is: a hue and a step',
      example: `${brand.aliasOf} = ${brand.value}`,
      rule: 'Only semantic tokens may point at it.',
      groups: countBy(primitive, (t) => t.name.split('.')[1]!),
    },
    {
      tier: 'semantic',
      label: 'Semantic',
      path: 'color.*',
      count: semantic.length,
      namedBy: 'Where it goes and what it means',
      example: `${brand.name} → ${brand.aliasOf}`,
      rule: 'Components and product code use this tier, and only this tier, for color.',
      groups: countBy(semantic, (t) => t.name.split('.')[1]!),
    },
    {
      tier: 'scale',
      label: 'Scale',
      path: [...new Set(scale.map((t) => `${t.name.split('.')[0]}.*`))].join(', '),
      count: scale.length,
      namedBy: 'Its step on a scale',
      example: `${space.name} = ${space.value}`,
      rule: 'One tier. A step has no light or dark version, so there is nothing to alias.',
      groups: countBy(scale, (t) => t.name.split('.')[0]!),
    },
  ];

  const traces: SemanticTrace[] = semantic.map((t) => ({
    name: t.name,
    role: t.name.split('.')[1]!,
    ...(t.description ? { description: t.description } : {}),
    light: { value: t.value, ...(t.aliasOf ? { aliasOf: t.aliasOf } : {}) },
    dark: t.dark ?? { value: t.value, ...(t.aliasOf ? { aliasOf: t.aliasOf } : {}) },
    readBy: components.filter((c) => c.tokens.includes(t.name)).map((c) => c.name),
    contractPairs: contrastPairs.filter((p) => p.foreground === t.name || p.background === t.name).length,
    ...optional('exception', exceptions.find((e) => e.evidence?.foreground === t.name)?.id),
  }));

  return {
    total: tokens.length,
    tiers,
    roles: tiers[1]!.groups.map(({ name, count }) => ({
      role: name,
      count,
      purpose: rolePurpose[name] ?? '',
      example: exampleFor(semantic, name),
    })),
    semantic: traces,
    palette: tiers[0]!.groups.map(({ name }) => ({
      family: name,
      steps: primitive.filter((t) => t.name.startsWith(`palette.${name}.`)).map((t) => t.name.split('.')[2]!),
    })),
    contract: { pairs: contrastPairs.length, checks: contrastPairs.length * 2 },
    components: components.length,
  };
}

/** The architecture as a Markdown document: `docs/TOKENS.md` and the `wayfind://tokens/architecture` resource. */
export function architectureToMarkdown(a: TokenArchitecture = tokenArchitecture()): string {
  const [primitive, semantic, scale] = a.tiers as [TierInfo, TierInfo, TierInfo];
  const withDark = a.semantic.filter((t) => t.dark.aliasOf !== t.light.aliasOf || t.dark.value !== t.light.value).length;
  const unread = a.semantic.filter((t) => t.readBy.length === 0).map((t) => `\`${t.name}\``);

  return `# Token architecture

<!-- Generated from tokens.json, the component registry and the contrast contract.
     Regenerate with \`pnpm docs:generate\`. A test fails if this file is out of date. -->

Wayfind has **${a.total} tokens**. Color has two public tiers. Everything else is a single scale.

| Tier | Path | Tokens | Named by | Example | Rule |
| --- | --- | ---: | --- | --- | --- |
${a.tiers.map((t) => `| ${t.label} | \`${t.path.split(', ').join('`, `')}\` | ${t.count} | ${t.namedBy} | \`${t.example}\` | ${t.rule} |`).join('\n')}

\`\`\`
${primitive.path.padEnd(15)} ${`${primitive.count} values`.padEnd(12)} what a color is
    ▲
${semantic.path.padEnd(15)} ${`${semantic.count} intents`.padEnd(12)} where it goes and what it means, in light and dark
    ▲
${'component CSS'.padEnd(15)} ${'private'.padEnd(12)} --_bg, --_fg: set per variant, never exported
\`\`\`

## Why two tiers

A palette value says what a color is. A semantic token says where it goes and what it means. Components read only
semantic tokens, so changing a mode or a brand means changing values in one place, and no component is touched.

That is how dark mode works here: ${withDark === semantic.count ? `all ${withDark}` : `${withDark} of the ${semantic.count}`} semantic colors point at a different palette step
in dark mode, and none of the ${a.components} component stylesheets mentions dark mode.

## When a third tier would be worth it

Component values, such as a button's background on hover, are private custom properties inside each component's
stylesheet (\`--_bg\`, \`--_fg\`). They are not public tokens. With ${a.components} web components, a public component
tier would be names with nothing to do.

A public component tier earns its place when:

- more than one platform (web, iOS, Android) has to agree on the same component value, such as a control height, or
- a brand or theme has to change one component without changing what a semantic token means everywhere else.

## Naming

\`color.<role>.<intent>[-<state>]\`

| Role | Tokens | For | Example |
| --- | ---: | --- | --- |
${a.roles.map((r) => `| \`${r.role}\` | ${r.count} | ${r.purpose} | \`${r.example}\` |`).join('\n')}

- **Intent** says what the color means, never what it looks like: \`brand\`, \`danger\`, \`muted\`, not \`orange\`, \`red\`, \`gray\`.
- **\`text.on-<x>\`** is the text that sits on \`bg.<x>\`: \`color.text.on-brand\` on \`color.bg.brand\`. Each such pair is in the contrast contract.
- **State** is a suffix: \`-hover\`, \`-subtle\`.

## What enforces it

| Rule | Enforced by |
| --- | --- |
| A semantic color only points at the palette. No raw hex in the semantic tier. | \`@wayfind/tokens\` tests |
| Every semantic color has a dark value. | \`@wayfind/tokens\` tests |
| Component CSS never uses \`--wf-palette-*\` or a raw color. | \`@wayfind/react\` registry tests |
| Each component lists exactly the color tokens its CSS reads. | \`@wayfind/react\` registry tests |
| Every pairing in the contrast contract passes WCAG AA: ${a.contract.pairs} pairs × 2 modes = ${a.contract.checks} checks. | The contract, at build time |
| A color that sits below a floor on purpose has a recorded exception, and a test re-measures it. | The exception log |
| In product and agent code, palette tokens and raw colors are flagged with the semantic replacement. | \`check_styles\` |

## Every semantic color

| Token | Light | Dark | Read by | Contract pairs |
| --- | --- | --- | --- | ---: |
${a.semantic.map((t) => `| \`${t.name}\` | ${show(t.light)} | ${show(t.dark)} | ${t.readBy.join(', ') || '—'} | ${t.contractPairs || (t.exception ? `${t.exception}` : '—')} |`).join('\n')}
${unread.length ? `\nNo component stylesheet reads ${unread.join(', ')}. ${unread.length === 1 ? 'It is' : 'They are'} for pages and layouts.\n` : ''}
A token with an \`EX-\` id in the last column sits below a contrast floor on purpose. The reason is in the
[exception log](DECISION-PATTERNS.md#exception-log).
## The palette

| Family | Steps |
| --- | --- |
${a.palette.map((p) => `| \`palette.${p.family}\` | ${p.steps.join(' · ')} |`).join('\n')}

## The scales

| Scale | Tokens |
| --- | ---: |
${scale.groups.map((g) => `| \`${g.name}.*\` | ${g.count} |`).join('\n')}
`;
}

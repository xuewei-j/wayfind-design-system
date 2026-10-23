import { components, type ComponentMeta } from '@wayfind/react/registry';

export interface ComponentSummary {
  name: string;
  status: ComponentMeta['status'];
  summary: string;
  whenToUse: string;
}

export const listComponents = (): ComponentSummary[] =>
  components.map(({ name, status, summary, whenToUse }) => ({ name, status, summary, whenToUse }));

/** Levenshtein distance, for "did you mean" suggestions. */
function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0]![j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length]![b.length]!;
}

export type ComponentLookup =
  | { found: true; component: ComponentMeta }
  | { found: false; suggestions: string[] };

export function getComponent(name: string): ComponentLookup {
  const wanted = name.trim().toLowerCase();
  const component = components.find((c) => c.name.toLowerCase() === wanted);
  if (component) return { found: true, component };
  const suggestions = components
    .map((c) => ({ name: c.name, d: distance(c.name.toLowerCase(), wanted) }))
    .filter(({ name: n, d }) => d <= 3 || n.toLowerCase().includes(wanted) || wanted.includes(n.toLowerCase()))
    .sort((a, b) => a.d - b.d)
    .map((c) => c.name);
  return { found: false, suggestions };
}

/** Markdown rendering of a component's docs, tuned for an agent's context window. */
export function componentToMarkdown(c: ComponentMeta): string {
  const props = Object.entries(c.props)
    .map(([name, p]) => {
      const flags = [p.required ? 'required' : null, p.default ? `default ${p.default}` : null].filter(Boolean).join(', ');
      return `| \`${name}\` | \`${p.type.replace(/\|/g, '\\|')}\` | ${flags || '—'} | ${p.description} |`;
    })
    .join('\n');
  const list = (items: string[]) => items.map((i) => `- ${i}`).join('\n');

  return `# ${c.name} (${c.status})

${c.summary}

**When to use:** ${c.whenToUse}

\`\`\`tsx
${c.import}
\`\`\`
${c.extends ? `\nAlso accepts all native \`<${c.extends}>\` attributes.\n` : ''}
## Props

| Prop | Type | | Description |
| --- | --- | --- | --- |
${props}

## Do
${list(c.usage.do)}

## Don't
${list(c.usage.dont)}

## Accessibility
${list(c.accessibility)}
${c.tokens.length ? `\n## Color tokens used\n${c.tokens.map((t) => `\`${t}\``).join(', ')}\n` : ''}
## Examples
${c.examples.map((e) => `### ${e.title}\n\`\`\`tsx\n${e.code}\n\`\`\``).join('\n\n')}
${c.related?.length ? `\n**Related:** ${c.related.join(', ')}\n` : ''}`;
}

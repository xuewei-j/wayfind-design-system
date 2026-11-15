import {
  decisions,
  exceptions,
  type DecisionPattern,
  type DecisionException,
} from '@wayfind/react/registry';

export interface DecisionSummary {
  id: string;
  question: string;
  principle: string;
  components: string[];
}

const componentsOf = (d: DecisionPattern) => [...new Set(d.options.flatMap((o) => o.components))];

const summarizeDecision = (d: DecisionPattern): DecisionSummary => ({
  id: d.id,
  question: d.question,
  principle: d.principle,
  components: componentsOf(d),
});

/** Words that carry no intent in a question like "where should this error go". */
const STOP = new Set(
  'a an and are can do does for how i in is it my of on or put should that the this to use what when where which with'.split(' '),
);

const searchable = (d: DecisionPattern) =>
  [d.id, d.question, d.principle, ...d.options.flatMap((o) => [o.choose, o.when, ...o.components]), ...d.avoid]
    .join(' ')
    .toLowerCase();

/** All patterns, or the ones that match a question or a component name, best match first. */
export function listDecisions(query?: string): DecisionSummary[] {
  const words = (query ?? '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
  if (!words.length) return decisions.map(summarizeDecision);
  return decisions
    .map((d) => ({ d, score: words.filter((w) => searchable(d).includes(w)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ d }) => summarizeDecision(d));
}

export const exceptionsFor = (patternId: string): DecisionException[] =>
  exceptions.filter((e) => e.pattern === patternId);

export const listExceptions = (): readonly DecisionException[] => exceptions;

export type DecisionLookup =
  | { found: true; decision: DecisionPattern; exceptions: DecisionException[] }
  | { found: false; suggestions: string[] };

export function getDecision(id: string): DecisionLookup {
  const wanted = id.trim().toLowerCase().replace(/[\s_]+/g, '-');
  const decision = decisions.find((d) => d.id === wanted);
  if (decision) return { found: true, decision, exceptions: exceptionsFor(decision.id) };
  return { found: false, suggestions: listDecisions(id).slice(0, 3).map((d) => d.id) };
}

export function exceptionToMarkdown(e: DecisionException): string {
  return `### ${e.id} · ${e.where}

- **Rule:** ${e.rule}
- **What:** ${e.what}
- **Why:** ${e.why}
- **Scope:** ${e.scope} · **Outcome:** ${e.outcome}${e.changed ? `\n- **What changed:** ${e.changed}` : ''}
- **Next time:** ${e.nextTime}
- **Touches:** ${e.affects.map((a) => `\`${a}\``).join(', ')}`;
}

export function exceptionsToMarkdown(list: readonly DecisionException[] = exceptions): string {
  return `# Exception log

Every place Wayfind breaks one of its own rules, and why. Cite an entry where the rule is broken:
\`wayfind-ignore ${list[0]?.id ?? 'EX-001'}\`. Read the "next time" line before adding a similar exception.

${list.map(exceptionToMarkdown).join('\n\n')}
`;
}

/** Markdown rendering of a decision pattern, tuned for an agent's context window. */
export function decisionToMarkdown(d: DecisionPattern, related: readonly DecisionException[] = exceptionsFor(d.id)): string {
  const options = d.options
    .map(
      (o) => `### ${o.choose}

**When:** ${o.when}

**Components:** ${o.components.join(', ')}${o.example ? `\n\n\`\`\`tsx\n${o.example.code}\n\`\`\`` : ''}`,
    )
    .join('\n\n');

  return `# ${d.question}

\`${d.id}\` · ${d.status}

**Principle:** ${d.principle}

## Choose

${options}

## Avoid
${d.avoid.map((a) => `- ${a}`).join('\n')}

## Boundary
${d.boundary}
${related.length ? `\n## Recorded exceptions\n\n${related.map(exceptionToMarkdown).join('\n\n')}\n` : ''}${
    d.related?.length ? `\n**Related:** ${d.related.join(', ')}\n` : ''
  }`;
}

/**
 * The whole decision layer as one Markdown document: `docs/DECISION-PATTERNS.md`.
 * Generated, so the page people read on GitHub is the same data agents get from `get_decision`.
 */
export function decisionPatternsToMarkdown(): string {
  const anchor = (d: DecisionPattern) => d.id;
  const section = (d: DecisionPattern) =>
    decisionToMarkdown(d, [])
      .replace(/^# (.*)$/m, `## $1\n\n<a id="${anchor(d)}"></a>`)
      .replace(/^## (Choose|Avoid|Boundary)$/gm, '### $1')
      .replace(/^### (?!Choose|Avoid|Boundary)(.*)$/gm, '#### $1')
      .trim();

  return `# Decision patterns

<!-- Generated from packages/react/src/decisions and packages/react/src/exceptions.ts.
     Regenerate with \`pnpm docs:generate\`. A test fails if this file is out of date. -->

A component library answers "how do I build this?". Tokens answer "what does it look like?".
Neither answers "which one do I use here, and when is it fine not to?". That judgment usually lives in
people's heads and gets argued again in every review.

Wayfind writes it down as data. Each pattern below is a question with its options, the condition that selects
each option, and what to avoid. Storybook renders them for people, and the MCP server hands the same entries to
AI agents through \`list_decisions\` and \`get_decision\`.

| Question | Pattern | Components |
| --- | --- | --- |
${decisions.map((d) => `| [${d.question}](#${anchor(d)}) | \`${d.id}\` | ${componentsOf(d).join(', ')} |`).join('\n')}

${decisions.map(section).join('\n\n---\n\n')}

---

${exceptionsToMarkdown()
  .replace(/^# Exception log$/m, '## Exception log\n\n<a id="exception-log"></a>')
  .trim()}

### What an exception has to answer

1. Why doesn't the rule fit here?
2. Is this a one-off, or a sign the system should change?
3. What should the next person do when a similar case shows up?

An exception that rests on a contrast measurement carries that measurement as \`evidence\`, and a test re-measures
it. If the tokens change and the exception is no longer true, the build fails and the entry is retired.
`;
}

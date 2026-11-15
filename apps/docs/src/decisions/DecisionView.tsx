import type { ReactNode } from 'react';
import { contrastRatio, getToken, parseColor, valueIn, type Mode } from '@wayfind/tokens';
import { decisions, exceptions, type DecisionException } from '@wayfind/react/registry';
import { Card, Heading, Stack, Tag, Text } from '@wayfind/react';

export const mono = { fontFamily: 'var(--wf-font-family-mono)', fontSize: 'var(--wf-font-size-xs)' };

const code = {
  margin: 0,
  padding: 'var(--wf-space-3)',
  background: 'var(--wf-color-bg-subtle)',
  border: 'var(--wf-border-width-thin) solid var(--wf-color-border-default)',
  borderRadius: 'var(--wf-radius-md)',
  fontFamily: 'var(--wf-font-family-mono)',
  fontSize: 'var(--wf-font-size-sm)',
  lineHeight: 'var(--wf-font-line-height-sm)',
  whiteSpace: 'pre-wrap' as const,
  overflowWrap: 'anywhere' as const,
};

const plainList = { listStyle: 'none', padding: 0, margin: 0 };

/** Re-measures the claim an exception rests on, with today's tokens, in both modes. */
function measure(exception: DecisionException): string | undefined {
  if (!exception.evidence) return undefined;
  const { foreground, background, below } = exception.evidence;
  const color = (ref: string, mode: Mode) => {
    const token = getToken(ref);
    return parseColor(token ? valueIn(token, mode).value : ref)!;
  };
  const ratio = (mode: Mode) => contrastRatio(color(foreground, mode), color(background, mode)).toFixed(2);
  const themed = Boolean(getToken(foreground) || getToken(background));
  const measured = themed ? `${ratio('light')}:1 in light mode and ${ratio('dark')}:1 in dark` : `${ratio('light')}:1`;
  return `${foreground} on ${background} measures ${measured}, below the ${below}:1 floor.`;
}

const outcomeTone = { kept: 'neutral', declined: 'warning', promoted: 'success' } as const;

export function ExceptionCard({ exception, headingLevel = 3 }: { exception: DecisionException; headingLevel?: 2 | 3 }) {
  const measured = measure(exception);
  const rows: Array<[string, string | undefined]> = [
    ['Rule', exception.rule],
    ['What', exception.what],
    ['Why', exception.why],
    ['What changed', exception.changed],
    ['Next time', exception.nextTime],
    ['Measured', measured],
  ];
  return (
    <Card as="li">
      <Stack gap={3}>
        <Stack direction="row" gap={2} wrap>
          <Tag tone="brand">{exception.id}</Tag>
          <Tag>{exception.scope}</Tag>
          <Tag tone={outcomeTone[exception.outcome]}>{exception.outcome}</Tag>
        </Stack>
        <Heading level={headingLevel} size="md">
          {exception.where}
        </Heading>
        <dl style={{ margin: 0, display: 'grid', gap: 'var(--wf-space-2)' }}>
          {rows
            .filter((row): row is [string, string] => row[1] !== undefined)
            .map(([term, detail]) => (
              <div key={term}>
                <dt>
                  <Text as="span" size="sm" weight="semibold">
                    {term}
                  </Text>
                </dt>
                <dd style={{ margin: 0 }}>
                  <Text as="span" size="sm">
                    {detail}
                  </Text>
                </dd>
              </div>
            ))}
        </dl>
        <Stack direction="row" gap={2} wrap>
          {exception.affects.map((name) => (
            <code key={name} style={mono}>
              {name}
            </code>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}

/** One decision pattern, rendered from the same registry entry an agent gets from `get_decision`. */
export function DecisionView({ id, children }: { id: string; children?: ReactNode }) {
  const decision = decisions.find((d) => d.id === id)!;
  const recorded = exceptions.filter((e) => e.pattern === id);
  return (
    <Stack gap={8} style={{ maxWidth: '52rem' }}>
      <Stack gap={2} align="start">
        <code style={mono}>{decision.id}</code>
        <Heading level={1} size="xl">
          {decision.question}
        </Heading>
        <Text size="lg">{decision.principle}</Text>
      </Stack>

      {children && (
        <Card variant="filled" padding="lg">
          <Stack gap={4}>
            <Heading level={2} size="md">
              Try it
            </Heading>
            {children}
          </Stack>
        </Card>
      )}

      <Stack gap={4}>
        <Heading level={2} size="lg">
          Choose
        </Heading>
        <Stack as="ul" gap={4} style={plainList}>
          {decision.options.map((option) => (
            <Card as="li" key={option.choose}>
              <Stack gap={3}>
                <Heading level={3} size="md">
                  {option.choose}
                </Heading>
                <Text>
                  <strong>When.</strong> {option.when}
                </Text>
                <Stack direction="row" gap={2} wrap>
                  {option.components.map((name) => (
                    <Tag key={name} size="sm">
                      {name}
                    </Tag>
                  ))}
                </Stack>
                {option.example && <pre style={code}>{option.example.code}</pre>}
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>

      <Stack gap={3}>
        <Heading level={2} size="lg">
          Avoid
        </Heading>
        {/* A plain list: a flex container would drop the bullets. */}
        <ul style={{ margin: 0, paddingInlineStart: 'var(--wf-space-5)' }}>
          {decision.avoid.map((item) => (
            <li key={item} style={{ marginBlockEnd: 'var(--wf-space-2)' }}>
              <Text as="span">{item}</Text>
            </li>
          ))}
        </ul>
      </Stack>

      <Stack gap={3}>
        <Heading level={2} size="lg">
          Where it ends
        </Heading>
        <Text>{decision.boundary}</Text>
      </Stack>

      {recorded.length > 0 && (
        <Stack gap={4}>
          <Heading level={2} size="lg">
            Recorded exceptions
          </Heading>
          <Stack as="ul" gap={4} style={plainList}>
            {recorded.map((exception) => (
              <ExceptionCard key={exception.id} exception={exception} />
            ))}
          </Stack>
        </Stack>
      )}

      <Text size="sm" tone="muted">
        An agent gets this same entry from <code style={mono}>get_decision("{decision.id}")</code>.
      </Text>
    </Stack>
  );
}

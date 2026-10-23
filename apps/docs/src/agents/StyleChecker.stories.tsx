import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { checkStyles, fixStyles, type StyleIssue } from '@wayfind/mcp/core';
import { Alert, Button, Card, Heading, Stack, Tag, Text } from '@wayfind/react';

const SAMPLE = `// A typical first draft from an AI agent. Edit it, or paste your own.
export function TicketForm() {
  return (
    <Card padding="md">
      <Heading>Book tickets</Heading>
      <TextField placeholder="Email" />
      <Stack direction="row" gap={7}>
        <Button variant="tertiary">Cancel</Button>
        <Button style={{ background: '#e07b42', padding: 10 }}>Pay now</Button>
      </Stack>
      <p style={{ color: 'var(--wf-color-text-primary)', fontFamily: 'Inter' }}>
        Tickets are non-refundable.
      </p>
    </Card>
  );
}`;

const tone = { error: 'danger', warning: 'warning', info: 'neutral' } as const;

function IssueRow({ issue }: { issue: StyleIssue }) {
  return (
    <Card as="li" padding="sm" variant="filled">
      <Stack direction="row" gap={2} wrap>
        <Tag size="sm" tone={tone[issue.severity]}>
          {issue.severity}
        </Tag>
        <Text as="span" size="sm" tone="muted" style={{ fontFamily: 'var(--wf-font-family-mono)' }}>
          {issue.line}:{issue.column} · {issue.rule}
        </Text>
      </Stack>
      <Text size="sm">
        {/* Messages use `backticks` for code, written for agents; render them as <code> here. */}
        {issue.message.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}
      </Text>
      {issue.suggestion && (
        <Text size="sm" tone="brand" style={{ fontFamily: 'var(--wf-font-family-mono)' }}>
          → {issue.suggestion}
        </Text>
      )}
    </Card>
  );
}

function StyleChecker() {
  const [code, setCode] = useState(SAMPLE);
  const [lastFix, setLastFix] = useState<number>();
  const report = useMemo(() => checkStyles(code), [code]);
  const fixable = report.issues.filter((i) => i.fix).length;

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Heading level={1} size="xl">
          check_styles playground
        </Heading>
        <Text tone="muted">
          This is the exact function the MCP server runs when an agent calls <code>check_styles</code>. It catches hallucinated
          tokens, hard-coded colors, off-grid spacing, invented variants and missing labels — and fixes what it safely can.
        </Text>
      </Stack>

      <div style={{ display: 'grid', gap: 'var(--wf-space-6)', gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))' }}>
        <Stack gap={3}>
          <label htmlFor="code" style={{ fontWeight: 600 }}>
            Code
          </label>
          <textarea
            id="code"
            value={code}
            spellCheck={false}
            onChange={(e) => {
              setCode(e.target.value);
              setLastFix(undefined);
            }}
            style={{
              minHeight: '26rem',
              padding: 'var(--wf-space-3)',
              border: 'var(--wf-border-width-thin) solid var(--wf-color-border-strong)',
              borderRadius: 'var(--wf-radius-sm)',
              background: 'var(--wf-color-bg-surface)',
              color: 'var(--wf-color-text-default)',
              fontFamily: 'var(--wf-font-family-mono)',
              fontSize: 'var(--wf-font-size-sm)',
              lineHeight: 'var(--wf-font-line-height-md)',
              resize: 'vertical',
            }}
          />
          <Stack direction="row" gap={3} wrap>
            <Button
              disabled={fixable === 0}
              onClick={() => {
                const result = fixStyles(code);
                setCode(result.code);
                setLastFix(result.applied);
              }}
            >
              Apply {fixable} fix{fixable === 1 ? '' : 'es'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setCode(SAMPLE);
                setLastFix(undefined);
              }}
            >
              Reset sample
            </Button>
          </Stack>
        </Stack>

        <Stack gap={3} aria-live="polite">
          <Stack direction="row" gap={2} wrap>
            <Tag tone={report.summary.errors ? 'danger' : 'success'}>{report.summary.errors} errors</Tag>
            <Tag tone={report.summary.warnings ? 'warning' : 'success'}>{report.summary.warnings} warnings</Tag>
            <Tag>{report.summary.infos} info</Tag>
          </Stack>
          {lastFix !== undefined && (
            <Alert tone={report.passed ? 'success' : 'info'} title={`Applied ${lastFix} fixes`}>
              {report.passed
                ? 'Everything passes.'
                : 'What’s left needs judgment — like writing a real label. That’s the part an agent (or a person) has to think about.'}
            </Alert>
          )}
          {report.issues.length === 0 ? (
            <Text tone="success" weight="semibold">
              No issues. This code follows the system.
            </Text>
          ) : (
            <Stack as="ul" gap={2}>
              {report.issues.map((issue, i) => (
                <IssueRow key={`${issue.line}-${issue.column}-${i}`} issue={issue} />
              ))}
            </Stack>
          )}
        </Stack>
      </div>
    </Stack>
  );
}

const meta = {
  title: 'Agents/Style checker',
  component: StyleChecker,
  parameters: { layout: 'padded', docs: { description: { component: 'Live demo of the MCP `check_styles` tool.' } } },
  tags: ['!autodocs'],
} satisfies Meta<typeof StyleChecker>;

export default meta;

export const Playground: StoryObj<typeof meta> = {};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { checkContrast } from '@wayfind/mcp/core';
import { Alert, Button, Card, Heading, Stack, Tag, Text, TextField } from '@wayfind/react';
import { DecisionView, mono } from './DecisionView';

const meta = {
  title: 'Decision patterns/Patterns',
  parameters: { layout: 'padded' },
  tags: ['!autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A row of toggle buttons for switching between the situations a pattern distinguishes. */
function Situations<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (next: T) => void }) {
  return (
    <Stack direction="row" gap={2} wrap role="group" aria-label={label}>
      {options.map((option) => (
        <Button key={option} size="sm" variant={option === value ? 'primary' : 'secondary'} aria-pressed={option === value} onClick={() => onChange(option)}>
          {option}
        </Button>
      ))}
    </Stack>
  );
}

const Labelled = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack gap={2} align="start">
    <Text as="span" size="sm" tone="muted" style={mono}>
      {label}
    </Text>
    {children}
  </Stack>
);

function FormErrorsDemo() {
  const situations = ['One field is wrong', 'The payment failed', 'Two fields are wrong'] as const;
  const [situation, setSituation] = useState<(typeof situations)[number]>(situations[0]);
  const emailError = situation !== 'The payment failed' ? 'Enter an email like name@example.com' : undefined;
  const phoneError = situation === 'Two fields are wrong' ? 'Enter a 10-digit phone number' : undefined;
  return (
    <Stack gap={5}>
      <Situations label="Situation" options={situations} value={situation} onChange={setSituation} />
      {/* noValidate: the pattern shows our own messages instead of the browser's tooltip. */}
      <form style={{ maxWidth: '24rem' }} onSubmit={(event) => event.preventDefault()} noValidate>
        <Stack gap={5}>
          {situation === 'The payment failed' && (
            <Alert tone="danger" title="Payment failed">
              Your card was declined. Try another card or contact your bank.
            </Alert>
          )}
          {situation === 'Two fields are wrong' && (
            <Alert tone="danger" title="Fix 2 fields to continue">
              Check your email address and phone number.
            </Alert>
          )}
          <TextField label="Email address" type="email" defaultValue="name@" error={emailError} />
          <TextField label="Phone number" type="tel" defaultValue="617 555" error={phoneError} />
          <Button type="submit">Book tickets</Button>
        </Stack>
      </form>
    </Stack>
  );
}

export const FormErrors: Story = {
  name: 'Form errors',
  render: () => (
    <DecisionView id="form-errors">
      <FormErrorsDemo />
    </DecisionView>
  ),
};

export const FeedbackLoudness: Story = {
  name: 'Feedback loudness',
  render: () => (
    <DecisionView id="feedback-loudness">
      <Stack gap={5}>
        <Labelled label='role="alert" · announced at once'>
          <Alert tone="danger" title="Payment failed">
            Your card was declined. Try another card or contact your bank.
          </Alert>
        </Labelled>
        <Labelled label='role="status" · announced when the screen reader is idle'>
          <Alert tone="warning" title="Only 4 tickets left">
            Saturday 2pm is almost full.
          </Alert>
        </Labelled>
        <Labelled label="no live region · it is a property of the item">
          <Tag tone="success">On view</Tag>
        </Labelled>
      </Stack>
    </DecisionView>
  ),
};

export const ActionHierarchy: Story = {
  name: 'Action hierarchy',
  render: () => (
    <DecisionView id="action-hierarchy">
      <Stack gap={5}>
        <Labelled label="one primary, one alternative">
          <Stack direction="row" gap={3}>
            <Button variant="secondary">Cancel</Button>
            <Button>Save changes</Button>
          </Stack>
        </Labelled>
        <Labelled label="repeated, low emphasis">
          <Button variant="ghost" size="sm">
            View details
          </Button>
        </Labelled>
        <Labelled label="destructive">
          <Button variant="danger">Delete booking</Button>
        </Labelled>
      </Stack>
    </DecisionView>
  ),
};

function AsyncActionsDemo() {
  const [saving, setSaving] = useState(false);
  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };
  return (
    <Stack gap={5}>
      <Labelled label="in progress · press it, then press Tab: focus is still on the button">
        <Button loading={saving} onClick={save}>
          Save changes
        </Button>
      </Labelled>
      <Labelled label="can’t happen right now · the reason sits next to it">
        <Stack gap={2} align="start">
          <Button disabled>Book tickets</Button>
          <Text size="sm" tone="muted">
            Saturday 2pm is sold out.
          </Text>
        </Stack>
      </Labelled>
    </Stack>
  );
}

export const AsyncActions: Story = {
  name: 'Async actions',
  render: () => (
    <DecisionView id="async-actions">
      <AsyncActionsDemo />
    </DecisionView>
  ),
};

export const EmptyStates: Story = {
  name: 'Empty states',
  render: () => (
    <DecisionView id="empty-states">
      <Stack direction="row" gap={4} wrap align="stretch">
        <Card style={{ flex: '1 1 16rem' }}>
          <Stack gap={3} align="start">
            <Heading level={3} size="lg">
              No bookings yet
            </Heading>
            <Text tone="muted">Tickets you book will show up here.</Text>
            <Button>Browse exhibitions</Button>
          </Stack>
        </Card>
        <Card style={{ flex: '1 1 16rem' }}>
          <Stack gap={3} align="start">
            <Heading level={3} size="lg">
              No exhibitions match
            </Heading>
            <Text tone="muted">Nothing is open on Mondays. Try another day.</Text>
            <Button variant="secondary">Clear filters</Button>
          </Stack>
        </Card>
      </Stack>
    </DecisionView>
  ),
};

export const EmphasisColor: Story = {
  name: 'Emphasis color',
  render: () => (
    <DecisionView id="emphasis-color">
      <Stack gap={5}>
        <Labelled label="color.bg.brand · the main action">
          <Button>Book tickets</Button>
        </Labelled>
        <Labelled label="color.bg.accent + color.text.on-accent · a highlight">
          <Tag tone="accent">Members first</Tag>
        </Labelled>
        <Labelled label="color.text.brand · quiet emphasis in text">
          <Text tone="brand" weight="semibold">
            Opening week
          </Text>
        </Labelled>
      </Stack>
    </DecisionView>
  ),
};

const floors = [
  { floor: 4.5, label: 'Text people read', foreground: 'color.text.muted', background: 'color.bg.surface' },
  { floor: 4.5, label: 'A button label', foreground: 'color.text.on-brand', background: 'color.bg.brand' },
  { floor: 3, label: 'The only edge of a control', foreground: 'color.border.strong', background: 'color.bg.surface' },
  { floor: 3, label: 'The focus ring', foreground: 'color.focus.ring', background: 'color.bg.surface' },
  { floor: 0, label: 'A decorative outline (EX-001)', foreground: 'color.border.default', background: 'color.bg.surface' },
  { floor: 0, label: 'Disabled text (EX-002)', foreground: 'color.text.disabled', background: 'color.bg.surface' },
] as const;

function ContrastFloorsDemo({ mode }: { mode: 'light' | 'dark' }) {
  return (
    <Stack as="ul" gap={2} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {floors.map((pair) => {
        const { ratio } = checkContrast({ foreground: pair.foreground, background: pair.background, mode });
        const tone = pair.floor === 0 ? 'neutral' : ratio >= pair.floor ? 'success' : 'danger';
        return (
          <li key={pair.label}>
            <Stack direction="row" gap={3} wrap>
              <Tag tone={tone}>{ratio}:1</Tag>
              <Text as="span" weight="semibold">
                {pair.label}
              </Text>
              <Text as="span" size="sm" tone="muted" style={mono}>
                {pair.foreground.replace('color.', '')} on {pair.background.replace('color.', '')} ·{' '}
                {pair.floor ? `needs ${pair.floor}:1` : 'no floor'}
              </Text>
            </Stack>
          </li>
        );
      })}
    </Stack>
  );
}

export const ContrastFloors: Story = {
  name: 'Contrast floors',
  render: (_args, { globals }) => (
    <DecisionView id="contrast-floors">
      <Text size="sm" tone="muted">
        Measured from the tokens in the current mode. Switch the theme in the toolbar to re-measure.
      </Text>
      <ContrastFloorsDemo mode={globals.theme === 'dark' ? 'dark' : 'light'} />
    </DecisionView>
  ),
};

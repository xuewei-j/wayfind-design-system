import type { Meta, StoryObj } from '@storybook/react-vite';
import { tokens } from '@wayfind/tokens';
import { Heading, Stack, Text } from '@wayfind/react';

const meta = {
  title: 'Foundations/Spacing & shape',
  parameters: {
    docs: {
      description: {
        component:
          'A 4px grid in rem. Corners stay nearly square, like gallery wall labels — rounding is reserved for pills. `Stack` turns the space scale into a prop, so off-grid gaps are a type error.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const mono = { fontFamily: 'var(--wf-font-family-mono)', fontSize: 'var(--wf-font-size-xs)' };
const group = (prefix: string) => tokens.filter((t) => t.name.startsWith(prefix));

export const Space: Story = {
  render: () => (
    <Stack gap={2}>
      {group('space.').map((t) => (
        <Stack key={t.name} direction="row" gap={4}>
          <Text as="span" size="sm" tone="muted" style={{ ...mono, width: '8rem' }}>
            {t.name} · {t.value}
          </Text>
          <span style={{ width: `var(${t.cssVar})`, height: 'var(--wf-space-4)', background: 'var(--wf-color-bg-accent)' }} />
        </Stack>
      ))}
    </Stack>
  ),
};

export const RadiusAndShadow: Story = {
  name: 'Radius & shadow',
  render: () => (
    <Stack gap={8}>
      <Stack gap={3}>
        <Heading level={2} size="md">
          Radius
        </Heading>
        <Stack direction="row" gap={5} wrap>
          {group('radius.').map((t) => (
            <Stack key={t.name} gap={2} align="center">
              <span
                style={{
                  width: '4rem',
                  height: '4rem',
                  borderRadius: `var(${t.cssVar})`,
                  border: 'var(--wf-border-width-thick) solid var(--wf-color-border-brand)',
                  background: 'var(--wf-color-bg-brand-subtle)',
                }}
              />
              <Text size="sm" tone="muted" style={mono}>
                {t.name.replace('radius.', '')}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Stack gap={3}>
        <Heading level={2} size="md">
          Shadow
        </Heading>
        <Stack direction="row" gap={6} wrap>
          {group('shadow.').map((t) => (
            <Stack key={t.name} gap={2} align="center">
              <span style={{ width: '6rem', height: '4rem', background: 'var(--wf-color-bg-surface)', boxShadow: `var(${t.cssVar})` }} />
              <Text size="sm" tone="muted" style={mono}>
                {t.name.replace('shadow.', '')}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  ),
};

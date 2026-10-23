import type { Meta, StoryObj } from '@storybook/react-vite';
import { getToken } from '@wayfind/tokens';
import { Heading, Stack, Text } from '@wayfind/react';

const meta = {
  title: 'Foundations/Typography',
  parameters: {
    docs: {
      description: {
        component:
          '**SF Pro** at two weights, 400 and 600, from the product design system. SF Pro can’t be self-hosted, so the stack uses the system font: SF Pro on Apple platforms, Segoe UI or Roboto elsewhere. Each size step comes with its own line height and letter spacing — use the three tokens together. Sizes are in rem so text follows the reader’s browser settings.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const mono = { fontFamily: 'var(--wf-font-family-mono)', fontSize: 'var(--wf-font-size-xs)' };

export const Families: Story = {
  render: () => (
    <Stack gap={8}>
      <Stack gap={1}>
        <Text size="sm" tone="muted" style={mono}>
          font.family.display · SF Pro Display · 600
        </Text>
        <Heading level={2} size="display">
          Hi, this is Xuewei
        </Heading>
      </Stack>
      <Stack gap={1}>
        <Text size="sm" tone="muted" style={mono}>
          font.family.body · SF Pro Text · 400
        </Text>
        <Text size="lg">
          I’m a product designer focused on complex, system-heavy products. I specialize in clarifying workflows and building
          0→1 experiences.
        </Text>
      </Stack>
    </Stack>
  ),
};

const ramp = [
  { step: '2xl', name: 'heading1', weight: 'semibold' },
  { step: 'xl', name: 'heading2', weight: 'semibold' },
  { step: 'lg', name: 'heading3', weight: 'semibold' },
  { step: 'md', name: 'body', weight: 'regular / semibold' },
  { step: 'sm', name: 'body-small', weight: 'regular / semibold' },
  { step: 'xs', name: 'caption', weight: 'regular / semibold' },
];

const px = (rem: string) => `${parseFloat(rem) * 16}px`;

export const Scale: Story = {
  render: () => (
    <Stack gap={4}>
      {ramp.map(({ step, name, weight }) => (
        <Stack key={step} direction="row" gap={6} align="baseline" wrap>
          <span
            style={{
              flex: '1 1 16rem',
              fontSize: `var(--wf-font-size-${step})`,
              lineHeight: `var(--wf-font-line-height-${step})`,
              letterSpacing: `var(--wf-font-letter-spacing-${step})`,
              fontWeight: weight === 'semibold' ? 'var(--wf-font-weight-semibold)' : undefined,
            }}
          >
            {name}
          </span>
          <Text as="span" size="sm" tone="muted" style={{ ...mono, flex: 'none' }}>
            {step} · {px(getToken(`font.size.${step}`)!.value)} / {px(getToken(`font.line-height.${step}`)!.value)} ·{' '}
            {getToken(`font.letter-spacing.${step}`)!.value} · {weight}
          </Text>
        </Stack>
      ))}
    </Stack>
  ),
};

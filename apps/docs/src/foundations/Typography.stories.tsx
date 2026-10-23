import type { Meta, StoryObj } from '@storybook/react-vite';
import { tokens } from '@wayfind/tokens';
import { Heading, Stack, Text } from '@wayfind/react';

const meta = {
  title: 'Foundations/Typography',
  parameters: {
    docs: {
      description: {
        component:
          '**Chivo Black** with wide tracking for display type, as on xueweijiang.com. **Overpass** for UI and body copy — an open-source stand-in for Interstate, the site’s licensed font; both descend from US highway signage, which suits a system called Wayfind. Sizes are in rem so text follows the reader’s browser settings.',
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
          font.family.display · Chivo 900 · tracking 0.07em
        </Text>
        <Heading level={2} size="display">
          Hi, this is Xuewei
        </Heading>
      </Stack>
      <Stack gap={1}>
        <Text size="sm" tone="muted" style={mono}>
          font.family.body · Overpass
        </Text>
        <Text size="lg">
          I’m a product designer focused on complex, system-heavy products. I specialize in clarifying workflows and building
          0→1 experiences.
        </Text>
      </Stack>
    </Stack>
  ),
};

export const Scale: Story = {
  render: () => (
    <Stack gap={4}>
      {tokens
        .filter((t) => t.name.startsWith('font.size.'))
        .slice()
        .reverse()
        .map((t) => (
          <Stack key={t.name} direction="row" gap={6} align="baseline">
            <Text as="span" size="sm" tone="muted" style={{ ...mono, width: '9rem', flex: 'none' }}>
              {t.name.replace('font.size.', '')} · {t.value}
            </Text>
            <span style={{ fontSize: `var(${t.cssVar})`, lineHeight: 'var(--wf-font-line-height-tight)' }}>
              Exhibitions, tickets &amp; tours
            </span>
          </Stack>
        ))}
    </Stack>
  ),
};

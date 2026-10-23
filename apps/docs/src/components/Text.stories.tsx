import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack, Text } from '@wayfind/react';
import { textMeta } from '@wayfind/react/registry';
import { docsParameters } from '../docs-helpers';

const meta = {
  title: 'Components/Text',
  component: Text,
  parameters: docsParameters(textMeta),
  args: {
    children: 'I design complex, system-heavy products and build 0→1 experiences.',
    size: 'md',
    tone: 'default',
    weight: 'regular',
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <Stack gap={2}>
      {(['default', 'muted', 'brand', 'success', 'warning', 'danger'] as const).map((tone) => (
        <Text key={tone} tone={tone}>
          {tone} — the quick brown fox
        </Text>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap={3}>
      <Text size="lg">Large lead paragraph for the top of a page.</Text>
      <Text>Medium body copy for everything else.</Text>
      <Text size="sm" tone="muted">
        Small metadata · Gallery 4 · Until March 30
      </Text>
    </Stack>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from '@wayfind/react';
import { stackMeta } from '@wayfind/react/registry';
import { docsParameters } from '../docs-helpers';

const Box = ({ label }: { label: string }) => (
  <div
    style={{
      padding: 'var(--wf-space-3) var(--wf-space-4)',
      background: 'var(--wf-color-bg-brand-subtle)',
      border: 'var(--wf-border-width-thin) solid var(--wf-color-border-brand)',
      color: 'var(--wf-color-text-brand)',
      fontWeight: 600,
    }}
  >
    {label}
  </div>
);

const meta = {
  title: 'Components/Stack',
  component: Stack,
  parameters: docsParameters(stackMeta),
  args: {
    direction: 'row',
    gap: 4,
    wrap: false,
    children: (
      <>
        <Box label="One" />
        <Box label="Two" />
        <Box label="Three" />
      </>
    ),
  },
  argTypes: {
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16] },
    children: { control: false },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Column: Story = { args: { direction: 'column', gap: 2 } };

export const SpaceBetween: Story = { args: { justify: 'between' } };

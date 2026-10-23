import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack, Tag } from '@wayfind/react';
import { tagMeta } from '@wayfind/react/registry';
import { docsParameters } from '../docs-helpers';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  parameters: docsParameters(tagMeta),
  args: { children: 'On view', tone: 'success', size: 'md' },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: (args) => (
    <Stack direction="row" gap={2} wrap>
      <Tag {...args} tone="neutral">
        Sculpture
      </Tag>
      <Tag {...args} tone="brand">
        New
      </Tag>
      <Tag {...args} tone="accent">
        Members first
      </Tag>
      <Tag {...args} tone="success">
        On view
      </Tag>
      <Tag {...args} tone="warning">
        Few left
      </Tag>
      <Tag {...args} tone="danger">
        Sold out
      </Tag>
    </Stack>
  ),
};

export const Small: Story = { args: { size: 'sm', tone: 'neutral', children: 'Gallery 4' } };

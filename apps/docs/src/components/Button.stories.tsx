import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Stack } from '@wayfind/react';
import { buttonMeta } from '@wayfind/react/registry';
import { docsParameters } from '../docs-helpers';

const Arrow = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: docsParameters(buttonMeta),
  args: { children: 'Book tickets', variant: 'primary', size: 'md', loading: false, fullWidth: false },
  argTypes: {
    iconStart: { control: false },
    iconEnd: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <Stack direction="row" gap={3} wrap>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="danger">
        Delete booking
      </Button>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" gap={3} align="center">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </Stack>
  ),
};

export const WithIcon: Story = {
  args: { children: 'Continue', iconEnd: <Arrow /> },
};

export const Loading: Story = {
  args: { loading: true, children: 'Save changes' },
  parameters: {
    docs: {
      description: {
        story: 'Stays focusable and keeps its width; clicks are ignored and `aria-busy` is set while the request runs.',
      },
    },
  },
};

export const ActionPair: Story = {
  name: 'Primary + secondary',
  render: () => (
    <Stack direction="row" gap={3}>
      <Button variant="secondary">Cancel</Button>
      <Button>Save changes</Button>
    </Stack>
  ),
};

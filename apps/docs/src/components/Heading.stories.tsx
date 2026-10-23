import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading, Stack } from '@wayfind/react';
import { headingMeta } from '@wayfind/react/registry';
import { docsParameters } from '../docs-helpers';

const meta = {
  title: 'Components/Heading',
  component: Heading,
  parameters: docsParameters(headingMeta),
  args: { level: 1, children: 'Hi, this is Xuewei', tone: 'default' },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Scale: Story = {
  render: () => (
    <Stack gap={5}>
      <Heading level={1}>Display · level 1</Heading>
      <Heading level={2}>Extra large · level 2</Heading>
      <Heading level={3}>Large · level 3</Heading>
      <Heading level={4}>Medium · level 4</Heading>
    </Stack>
  ),
};

export const BrandEyebrow: Story = {
  name: 'Size ≠ level',
  render: () => (
    <Stack gap={2}>
      <Heading level={2} size="md" tone="brand">
        Now showing
      </Heading>
      <Heading level={3} size="display">
        Light &amp; Shadow
      </Heading>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'The outline stays h2 → h3 while the visuals flip: a small eyebrow above a display-size title.',
      },
    },
  },
};

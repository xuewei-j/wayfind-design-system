import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Card, Heading, Stack, Tag, Text } from '@wayfind/react';
import { cardMeta } from '@wayfind/react/registry';
import { docsParameters } from '../docs-helpers';

const Body = () => (
  <>
    <Stack gap={2}>
      <Tag tone="success">On view</Tag>
      <Heading level={3}>Light &amp; Shadow</Heading>
      <Text size="sm" tone="muted">
        Gallery 4 · Until March 30
      </Text>
    </Stack>
    <Text>Forty years of photographs about how cities look after dark.</Text>
    <div>
      <Button variant="secondary">Get tickets</Button>
    </div>
  </>
);

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: docsParameters(cardMeta),
  args: { variant: 'outlined', padding: 'md', as: 'article', children: <Body /> },
  argTypes: { children: { control: false } },
  decorators: [(Story) => <div style={{ maxWidth: '22rem' }}>{Story()}</div>],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 'none' }}>{Story()}</div>],
  render: (args) => (
    <Stack direction="row" gap={5} align="stretch" wrap>
      {(['outlined', 'elevated', 'filled'] as const).map((variant) => (
        <div key={variant} style={{ width: '18rem' }}>
          <Card {...args} variant={variant}>
            <Heading level={3}>{variant}</Heading>
            <Text tone="muted">
              {variant === 'outlined' && 'Default for lists of items.'}
              {variant === 'elevated' && 'Lifts one featured item.'}
              {variant === 'filled' && 'Quiet grouping inside a page.'}
            </Text>
          </Card>
        </div>
      ))}
    </Stack>
  ),
};

export const Collection: Story = {
  name: 'Collection (ul + li)',
  decorators: [(Story) => <div style={{ maxWidth: 'none' }}>{Story()}</div>],
  render: () => (
    <Stack as="ul" direction="row" gap={5} align="stretch" wrap>
      {['Light & Shadow', 'Soft Machines', 'The Long Table'].map((title) => (
        <Card as="li" key={title} style={{ width: '16rem' }}>
          <Heading level={3}>{title}</Heading>
          <Text size="sm" tone="muted">
            Gallery 4
          </Text>
        </Card>
      ))}
    </Stack>
  ),
};

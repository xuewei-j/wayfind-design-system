import type { Meta, StoryObj } from '@storybook/react-vite';
import { exceptions } from '@wayfind/react/registry';
import { Heading, Stack, Text } from '@wayfind/react';
import { ExceptionCard, mono } from './DecisionView';

const meta = {
  title: 'Decision patterns/Exception log',
  parameters: { layout: 'padded' },
  tags: ['!autodocs'],
} satisfies Meta;

export default meta;

export const Log: StoryObj<typeof meta> = {
  name: 'Exception log',
  render: () => (
    <Stack gap={6} style={{ maxWidth: '52rem' }}>
      <Stack gap={2}>
        <Heading level={1} size="xl">
          Exception log
        </Heading>
        <Text size="lg">Every place Wayfind breaks one of its own rules, and why.</Text>
        <Text tone="muted">
          An exception is cited where the rule is broken, as <code style={mono}>wayfind-ignore EX-004</code>, and{' '}
          <code style={mono}>check_styles</code> reports every one it skips. The ones that rest on a contrast measurement
          are re-measured in tests, so an exception that stops being true fails the build.
        </Text>
      </Stack>
      <Stack as="ul" gap={4} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {exceptions.map((exception) => (
          <ExceptionCard key={exception.id} exception={exception} headingLevel={2} />
        ))}
      </Stack>
    </Stack>
  ),
};

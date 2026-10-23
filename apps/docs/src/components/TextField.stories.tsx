import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button, Stack, TextField } from '@wayfind/react';
import { textFieldMeta } from '@wayfind/react/registry';
import { docsParameters } from '../docs-helpers';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  parameters: docsParameters(textFieldMeta),
  args: { label: 'Email address', hint: 'We’ll send your tickets here.', type: 'email', size: 'md' },
  decorators: [(Story) => <div style={{ maxWidth: '24rem' }}>{Story()}</div>],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithError: Story = {
  args: { error: 'Enter an email like name@example.com', defaultValue: 'xuewei@' },
};

export const Required: Story = {
  args: { label: 'Full name', required: true, hint: undefined, type: 'text', autoComplete: 'name' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'xuewei@example.com' },
};

export const HiddenLabel: Story = {
  name: 'Hidden label (search)',
  args: { label: 'Search exhibitions', hideLabel: true, type: 'search', placeholder: 'Search…', hint: undefined },
};

export const ValidateOnSubmit: Story = {
  name: 'Validate on submit',
  render: () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string>();
    return (
      <Stack
        as="form"
        gap={4}
        onSubmit={(e) => {
          e.preventDefault();
          setError(/^\S+@\S+\.\S+$/.test(email) ? undefined : 'Enter an email like name@example.com');
        }}
      >
        <TextField
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          hint="We’ll send your tickets here."
        />
        <div>
          <Button type="submit">Continue</Button>
        </div>
      </Stack>
    );
  },
};

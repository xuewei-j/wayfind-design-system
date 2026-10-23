import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Stack } from '@wayfind/react';
import { alertMeta } from '@wayfind/react/registry';
import { docsParameters } from '../docs-helpers';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: docsParameters(alertMeta),
  args: {
    tone: 'info',
    title: 'Members preview this Friday',
    children: 'Doors open at 6pm for members. Bring your card or the app.',
  },
  argTypes: { action: { control: false } },
  decorators: [(Story) => <div style={{ maxWidth: '40rem' }}>{Story()}</div>],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <Stack gap={4}>
      <Alert tone="info" title="Members preview this Friday">
        Doors open at 6pm for members.
      </Alert>
      <Alert tone="success" title="Booking confirmed">
        Your tickets are on their way to xuewei@example.com.
      </Alert>
      <Alert tone="warning" title="Only 4 tickets left" action={<Button size="sm" variant="secondary">Book now</Button>}>
        Saturday 2pm is almost full.
      </Alert>
      <Alert tone="danger" title="Payment failed">
        Your card was declined. Try another card or contact your bank.
      </Alert>
    </Stack>
  ),
};

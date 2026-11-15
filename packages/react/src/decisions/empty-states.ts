import { defineDecision } from '../decision';

export const emptyStates = defineDecision({
  id: 'empty-states',
  status: 'stable',
  question: 'Explain why it is empty, or offer the next step?',
  principle: 'An empty screen should still move the task forward.',
  options: [
    {
      choose: 'Lead with the action',
      when: 'The person can fill it in one step: nothing booked yet, nothing saved yet.',
      components: ['Card', 'Heading', 'Text', 'Button'],
      example: {
        title: 'Nothing here yet',
        code: '<Card variant="filled" padding="lg">\n  <Stack gap={3} align="start">\n    <Heading level={2} size="lg">No bookings yet</Heading>\n    <Text tone="muted">Tickets you book will show up here.</Text>\n    <Button>Browse exhibitions</Button>\n  </Stack>\n</Card>',
      },
    },
    {
      choose: 'Explain, then offer a way out',
      when: 'It is empty for a reason they can’t fix from here: no results, nothing open that day.',
      components: ['Card', 'Heading', 'Text', 'Button'],
      example: {
        title: 'No results',
        code: '<Card variant="filled" padding="lg">\n  <Stack gap={3} align="start">\n    <Heading level={2} size="lg">No exhibitions match</Heading>\n    <Text tone="muted">Nothing is open on Mondays. Try another day.</Text>\n    <Button variant="secondary">Clear filters</Button>\n  </Stack>\n</Card>',
      },
    },
  ],
  avoid: [
    'Don’t leave a blank container. People can’t tell empty from broken.',
    'Don’t use an Alert. Nothing went wrong.',
    'Don’t explain the feature at length. One line, then the action.',
  ],
  boundary:
    'When the next step is the primary action of the whole page, the empty state uses a primary button. Otherwise it is secondary, so it doesn’t compete.',
  related: ['action-hierarchy'],
});

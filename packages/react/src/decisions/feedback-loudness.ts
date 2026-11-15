import { defineDecision } from '../decision';

export const feedbackLoudness = defineDecision({
  id: 'feedback-loudness',
  status: 'stable',
  question: 'Should this message interrupt?',
  principle: 'Interrupt only for what blocks the task.',
  options: [
    {
      choose: 'Interrupt: a danger Alert',
      when: 'Something failed or the person cannot continue. It renders role="alert", so a screen reader announces it at once.',
      components: ['Alert'],
      example: {
        title: 'Blocking failure',
        code: '<Alert tone="danger" title="Payment failed">\n  Your card was declined. Try another card or contact your bank.\n</Alert>',
      },
    },
    {
      choose: 'Inform: an info, success or warning Alert',
      when: 'They should know, but they can keep going: a saved change, low availability. It renders role="status" and waits its turn.',
      components: ['Alert'],
      example: {
        title: 'Worth knowing',
        code: '<Alert tone="warning" title="Only 4 tickets left">\n  Saturday 2pm is almost full.\n</Alert>',
      },
    },
    {
      choose: 'No message: a Tag',
      when: 'The state belongs to an item, not to something that just happened: on view, coming soon, members first.',
      components: ['Tag'],
      example: { title: 'Status of an item', code: '<Tag tone="success">On view</Tag>' },
    },
  ],
  avoid: [
    'Don’t use danger for emphasis. It interrupts screen-reader users for something that is not a failure.',
    'Don’t stack alerts. Combine them into one message.',
    'Don’t give an alert more than one action.',
  ],
  boundary:
    'A warning that must be heard immediately can override the default with the role prop. Record where and why in the exception log.',
  related: ['form-errors'],
});

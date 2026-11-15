import { defineDecision } from '../decision';

export const formErrors = defineDecision({
  id: 'form-errors',
  status: 'stable',
  question: 'Does this error go on the field or in a banner?',
  principle: 'Put the message where the fix is.',
  options: [
    {
      choose: 'On the field',
      when: 'One field is wrong and the person can fix it right there.',
      components: ['TextField'],
      example: {
        title: 'Field error',
        code: '<TextField label="Email address" type="email" error="Enter an email like name@example.com" />',
      },
    },
    {
      choose: 'In an Alert above the form',
      when: 'The failure is not tied to one field: a declined payment, a lost connection, a slot that just sold out.',
      components: ['Alert'],
      example: {
        title: 'Form-level error',
        code: '<Alert tone="danger" title="Payment failed">\n  Your card was declined. Try another card or contact your bank.\n</Alert>',
      },
    },
    {
      choose: 'Both',
      when: 'A submit fails on two or more fields. One Alert counts them, and each field still carries its own message.',
      components: ['Alert', 'TextField'],
      example: {
        title: 'Summary plus field errors',
        code: '<Stack as="form" gap={5}>\n  <Alert tone="danger" title="Fix 2 fields to continue">\n    Check your email address and phone number.\n  </Alert>\n  <TextField label="Email address" type="email" error="Enter an email like name@example.com" />\n  <TextField label="Phone number" type="tel" error="Enter a 10-digit phone number" />\n</Stack>',
      },
    },
  ],
  avoid: [
    'Don’t validate while someone is still typing. Check on blur or on submit.',
    'Don’t show an error as a red border alone. The message says how to fix it, and color is never the only signal.',
    'Don’t put errors in a toast. A message that disappears can’t be read twice, which is why Wayfind has no toast.',
  ],
  boundary:
    'If the field with the problem is not on screen (an earlier step), the error moves into the Alert and names the field.',
  related: ['feedback-loudness', 'async-actions'],
});

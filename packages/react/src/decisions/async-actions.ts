import { defineDecision } from '../decision';

export const asyncActions = defineDecision({
  id: 'async-actions',
  status: 'stable',
  question: 'What does a button do while its action runs, or when it can’t run?',
  principle: 'Never take focus away from someone in the middle of a task.',
  options: [
    {
      choose: 'loading',
      when: 'The action was triggered and is in progress. The button stays focusable, ignores clicks and keeps its width.',
      components: ['Button'],
      example: { title: 'Saving', code: '<Button type="submit" loading={isSaving}>Save changes</Button>' },
    },
    {
      choose: 'Leave it enabled and validate on submit',
      when: 'The form is not complete yet. Let people press the button, then tell them what is missing.',
      components: ['Button', 'TextField'],
      example: {
        title: 'Incomplete form',
        code: '<Stack as="form" gap={5}>\n  <TextField label="Email address" type="email" required />\n  <Button type="submit">Book tickets</Button>\n</Stack>',
      },
    },
    {
      choose: 'disabled, with the reason next to it',
      when: 'The action cannot happen at all right now and nothing on this screen changes that.',
      components: ['Button', 'Text'],
      example: {
        title: 'Unavailable',
        code: '<Stack gap={2} align="start">\n  <Button disabled>Book tickets</Button>\n  <Text size="sm" tone="muted">Saturday 2pm is sold out.</Text>\n</Stack>',
      },
    },
  ],
  avoid: [
    'Don’t disable a button to show that it is working. A disabled button drops keyboard focus mid-submit.',
    'Don’t disable submit until the form is valid. People can’t tell what is missing.',
    'Don’t hide the label while loading in a way that removes the button’s name for screen readers.',
  ],
  boundary: 'A disabled control is the one place text may sit below 4.5:1 (see EX-002). The reason beside it may not.',
  related: ['form-errors', 'contrast-floors'],
});

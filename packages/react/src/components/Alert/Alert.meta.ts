import { defineMeta } from '../../meta';
import type { AlertOwnProps } from './Alert';

export const alertMeta = defineMeta<AlertOwnProps>()({
  name: 'Alert',
  status: 'stable',
  summary: 'Inline message about the state of a page or task, with an optional action.',
  whenToUse:
    'Use for feedback that relates to the content around it: a form that failed to submit, a saved change, a limited-availability notice. Not for transient toasts.',
  import: "import { Alert } from '@wayfind/react';",
  extends: 'div',
  props: {
    tone: {
      type: "'info' | 'success' | 'warning' | 'danger'",
      default: "'info'",
      description: 'info = neutral notice, success = completed, warning = needs attention soon, danger = something failed or is blocked.',
    },
    title: { type: 'ReactNode', description: 'Short headline, e.g. "Payment failed".' },
    action: { type: 'ReactNode', description: 'One follow-up action, usually <Button size="sm" variant="secondary">.' },
    children: { type: 'ReactNode', description: 'What happened and what to do next.' },
  },
  usage: {
    do: [
      'Say what happened and what to do next ("Your card was declined. Try another card or contact your bank.").',
      'Place the alert next to the thing it is about, e.g. at the top of the form.',
      'Use danger only for failures, not for general emphasis.',
    ],
    dont: [
      "Don't stack several alerts; combine them into one message.",
      "Don't use an Alert for marketing banners.",
      "Don't put more than one action in an alert.",
    ],
  },
  accessibility: [
    'tone="danger" renders role="alert" (assertive); other tones render role="status" (polite). Override with the role prop if needed.',
    'Insert alerts into a container that is already in the DOM so screen readers announce them.',
    'The icon is decorative (aria-hidden); the title/body carry the meaning.',
    'Title and body text pass 4.5:1 against every tone background in both modes.',
  ],
  tokens: [
    'color.bg.brand-subtle',
    'color.text.brand',
    'color.border.brand',
    'color.text.default',
    'color.bg.success-subtle',
    'color.text.success',
    'color.border.success',
    'color.bg.warning-subtle',
    'color.text.warning',
    'color.border.warning',
    'color.bg.danger-subtle',
    'color.text.danger',
    'color.border.danger',
  ],
  examples: [
    {
      title: 'Form error',
      code: '<Alert tone="danger" title="Payment failed">\n  Your card was declined. Try another card or contact your bank.\n</Alert>',
    },
    {
      title: 'With action',
      code: '<Alert\n  tone="warning"\n  title="Only 4 tickets left"\n  action={<Button size="sm" variant="secondary">Book now</Button>}\n>\n  Saturday 2pm is almost full.\n</Alert>',
    },
  ],
  related: ['Tag', 'TextField'],
});

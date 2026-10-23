import { defineMeta } from '../../meta';
import type { TextFieldOwnProps } from './TextField';

export const textFieldMeta = defineMeta<TextFieldOwnProps>()({
  name: 'TextField',
  status: 'stable',
  summary: 'Labelled single-line text input with hint and error messaging wired up for screen readers.',
  whenToUse: 'Use for short free-text input: names, emails, search, quantities. Always with a visible label.',
  import: "import { TextField } from '@wayfind/react';",
  extends: 'input',
  props: {
    label: { type: 'ReactNode', required: true, description: 'Visible label. Required — a placeholder is not a label.' },
    hideLabel: {
      type: 'boolean',
      default: 'false',
      description: 'Visually hides the label but keeps it for assistive tech. Only for self-explanatory fields like a lone search box.',
    },
    hint: { type: 'ReactNode', description: 'Helper text under the field, linked via aria-describedby.' },
    error: {
      type: 'ReactNode',
      description: 'Error message. Sets aria-invalid, turns the border red and is announced via role="alert".',
    },
    size: { type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Control height: 32 / 40 / 48px.' },
  },
  usage: {
    do: [
      'Keep labels short and specific ("Email address", not "Enter your email address here").',
      'Use hint for format guidance ("We’ll send your tickets here").',
      'Write errors that say how to fix the problem ("Enter an email like name@example.com").',
      'Set type, inputMode and autoComplete so mobile keyboards and autofill work.',
    ],
    dont: [
      "Don't use placeholder text as the only label.",
      "Don't show an error before the user has finished typing; validate on blur or submit.",
      "Don't hide the label just to save space.",
    ],
  },
  accessibility: [
    'Label is a real <label for>, generated with useId() when no id is passed.',
    'hint and error are linked via aria-describedby (error first, so it is read first).',
    'Errors set aria-invalid="true" and render with role="alert".',
    'Required fields show a visual asterisk (aria-hidden) and use the native required attribute for assistive tech.',
    'Border uses color.border.strong, which meets the 3:1 non-text contrast requirement.',
  ],
  tokens: [
    'color.text.default',
    'color.text.danger',
    'color.border.strong',
    'color.bg.surface',
    'color.text.muted',
    'color.border.brand',
    'color.focus.ring',
    'color.bg.subtle',
    'color.text.disabled',
    'color.border.default',
    'color.border.danger',
  ],
  examples: [
    {
      title: 'Email with hint',
      code: '<TextField\n  label="Email address"\n  type="email"\n  autoComplete="email"\n  hint="We’ll send your tickets here."\n/>',
    },
    { title: 'With error', code: '<TextField label="Email address" error="Enter an email like name@example.com" />' },
    { title: 'Search', code: '<TextField label="Search exhibitions" hideLabel type="search" placeholder="Search…" />' },
  ],
  related: ['Button', 'Stack'],
});

import { defineMeta } from '../../meta';
import type { ButtonOwnProps } from './Button';

export const buttonMeta = defineMeta<ButtonOwnProps>()({
  name: 'Button',
  status: 'stable',
  summary: 'Triggers an action. Four variants, three sizes, built-in loading state.',
  whenToUse:
    'Use for actions (submit, save, book, delete). For navigation to another page, render a link instead so it gets link semantics.',
  import: "import { Button } from '@wayfind/react';",
  extends: 'button',
  props: {
    variant: {
      type: "'primary' | 'secondary' | 'ghost' | 'danger'",
      default: "'primary'",
      description: 'Visual emphasis. primary = the main action, secondary = alternatives, ghost = low emphasis, danger = destructive.',
    },
    size: { type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Control height: 32 / 40 / 48px.' },
    loading: {
      type: 'boolean',
      default: 'false',
      description: 'Shows a spinner, sets aria-busy and ignores clicks, while staying focusable and keeping its width.',
    },
    fullWidth: { type: 'boolean', default: 'false', description: 'Stretch to the width of the container.' },
    iconStart: { type: 'ReactNode', description: 'Decorative icon before the label. Hidden from assistive tech.' },
    iconEnd: { type: 'ReactNode', description: 'Decorative icon after the label. Hidden from assistive tech.' },
    children: { type: 'ReactNode', required: true, description: 'The label. Start with a verb: "Book tickets", not "OK".' },
  },
  usage: {
    do: [
      'Use one primary button per view or section — it marks the main way forward.',
      'Write labels as verb + noun ("Save draft", "Book tickets").',
      'Use loading for async actions instead of disabling the button.',
      'Pair a danger button with a confirmation step for irreversible actions.',
    ],
    dont: [
      "Don't put two primary buttons side by side; make one secondary.",
      "Don't use a Button for navigation — use a link.",
      "Don't override colors with inline styles; pick a variant.",
      "Don't use an icon-only button without an aria-label.",
    ],
  },
  accessibility: [
    'Renders a native <button type="button"> so it works with keyboard and screen readers by default; pass type="submit" inside forms.',
    'While loading it uses aria-disabled + aria-busy instead of disabled, so keyboard focus is not lost.',
    'All variant text/background pairs meet WCAG AA 4.5:1 in light and dark mode (enforced by the token contract tests).',
    'Visible 2px focus ring using color.focus.ring (≥3:1 against surfaces).',
    'md and lg sizes meet the 40px+ touch target guideline; use sm only in dense desktop UI.',
  ],
  tokens: [
    'color.bg.brand',
    'color.bg.brand-hover',
    'color.text.on-brand',
    'color.focus.ring',
    'color.bg.surface',
    'color.bg.subtle',
    'color.text.default',
    'color.border.strong',
    'color.bg.brand-subtle',
    'color.text.brand',
    'color.bg.danger',
    'color.bg.danger-hover',
    'color.text.on-danger',
    'color.text.disabled',
    'color.border.default',
  ],
  examples: [
    { title: 'Primary action', code: '<Button onClick={book}>Book tickets</Button>' },
    {
      title: 'Primary + secondary pair',
      code: '<Stack direction="row" gap="3">\n  <Button variant="secondary">Cancel</Button>\n  <Button type="submit">Save changes</Button>\n</Stack>',
    },
    { title: 'Async submit', code: '<Button type="submit" loading={isSaving}>Save changes</Button>' },
    { title: 'Destructive', code: '<Button variant="danger" onClick={confirmDelete}>Delete booking</Button>' },
  ],
  related: ['Stack', 'Alert'],
});

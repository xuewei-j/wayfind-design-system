import { defineMeta } from '../../meta';
import type { TagOwnProps } from './Tag';

export const tagMeta = defineMeta<TagOwnProps>()({
  name: 'Tag',
  status: 'stable',
  summary: 'Short, non-interactive status or category label.',
  whenToUse:
    'Use to label status ("Sold out", "New") or category ("Sculpture"). Not clickable — for filters, use buttons.',
  import: "import { Tag } from '@wayfind/react';",
  extends: 'span',
  props: {
    tone: {
      type: "'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger'",
      default: "'neutral'",
      description: 'Carries meaning. accent uses the original brand teal with dark text — use it sparingly for highlights.',
    },
    size: { type: "'sm' | 'md'", default: "'md'", description: 'sm fits inside dense rows and table cells.' },
    children: { type: 'ReactNode', required: true, description: 'One to three words.' },
  },
  usage: {
    do: [
      'Keep labels to one to three words.',
      'Use tone consistently across a product (e.g. danger always means unavailable).',
      'Put the most important tag first when showing several.',
    ],
    dont: [
      "Don't rely on color alone — the text must carry the meaning (\"Sold out\", not a red dot).",
      "Don't make Tags clickable; use a Button or link for actions and filters.",
      "Don't use more than one accent tag per card.",
    ],
  },
  accessibility: [
    'Renders a plain <span>; the text is the accessible name, so color is never the only signal.',
    'Every tone passes 4.5:1 for its text in light and dark mode.',
    'Uppercase is applied with CSS text-transform, so screen readers read the original casing.',
  ],
  tokens: [
    'color.bg.subtle',
    'color.text.default',
    'color.border.default',
    'color.bg.brand-subtle',
    'color.text.brand',
    'color.border.brand',
    'color.bg.accent',
    'color.text.on-accent',
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
    { title: 'Status', code: '<Tag tone="success">On view</Tag>' },
    { title: 'Highlight', code: '<Tag tone="accent">Members first</Tag>' },
    {
      title: 'Several tags',
      code: '<Stack direction="row" gap="2" wrap>\n  <Tag tone="danger">Sold out</Tag>\n  <Tag>Sculpture</Tag>\n</Stack>',
    },
  ],
  related: ['Alert', 'Card'],
});

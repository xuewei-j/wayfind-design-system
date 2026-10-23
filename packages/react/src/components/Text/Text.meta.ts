import { defineMeta } from '../../meta';
import type { TextOwnProps } from './Text';

export const textMeta = defineMeta<TextOwnProps>()({
  name: 'Text',
  status: 'stable',
  summary: 'Body copy with size, tone and weight from the type scale.',
  whenToUse: 'Use for all running text and inline emphasis instead of styling raw <p> or <span> elements.',
  import: "import { Text } from '@wayfind/react';",
  extends: 'p | span | div | strong | em | small',
  props: {
    size: { type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'sm = 14px metadata, md = 16px body, lg = 20px lead paragraph.' },
    tone: {
      type: "'default' | 'muted' | 'brand' | 'success' | 'warning' | 'danger'",
      default: "'default'",
      description: 'Text color. Every tone passes 4.5:1 on canvas, surface and subtle backgrounds.',
    },
    weight: { type: "'regular' | 'medium' | 'semibold' | 'bold'", default: "'regular'", description: 'Font weight.' },
    as: {
      type: "'p' | 'span' | 'div' | 'strong' | 'em' | 'small'",
      default: "'p'",
      description: 'Rendered element. Use strong/em when the emphasis is semantic, not just visual.',
    },
    children: { type: 'ReactNode', required: true, description: 'Text content.' },
  },
  usage: {
    do: [
      'Use tone="muted" for metadata (dates, locations), not for important content.',
      'Use size="lg" for a single lead paragraph under a page title.',
      'Use as="span" inside other text to avoid nested paragraphs.',
    ],
    dont: [
      "Don't use colored tones for long paragraphs.",
      "Don't use weight to fake a heading — use Heading so it appears in the outline.",
    ],
  },
  accessibility: [
    'Sizes are in rem, so text scales with the user’s browser font setting.',
    'Muted text still meets 4.5:1 (the site’s original #aaaaaa gray did not, so it was darkened).',
  ],
  tokens: [
    'color.text.default',
    'color.text.muted',
    'color.text.brand',
    'color.text.success',
    'color.text.warning',
    'color.text.danger',
  ],
  examples: [
    { title: 'Lead paragraph', code: '<Text size="lg">I design complex, system-heavy products.</Text>' },
    { title: 'Metadata', code: '<Text size="sm" tone="muted">Gallery 4 · Until March 30</Text>' },
  ],
  related: ['Heading'],
});

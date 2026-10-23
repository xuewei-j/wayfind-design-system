import { defineMeta } from '../../meta';
import type { HeadingOwnProps } from './Heading';

export const headingMeta = defineMeta<HeadingOwnProps>()({
  name: 'Heading',
  status: 'stable',
  summary: 'Section titles h1–h4, with visual size decoupled from document level.',
  whenToUse: 'Use for every page, section and card title so the document outline stays navigable.',
  import: "import { Heading } from '@wayfind/react';",
  extends: 'h1 | h2 | h3 | h4',
  props: {
    level: { type: '1 | 2 | 3 | 4', required: true, description: 'Outline level. Pick by structure: one h1 per page, no skipped levels.' },
    size: {
      type: "'display' | 'xl' | 'lg' | 'md'",
      description: 'Visual size. Defaults by level (1 → display, 2 → xl, 3 → lg, 4 → md). display is heading1 (36px), xl heading2 (24px), lg heading3 (18px), md body emphasized (16px).',
    },
    tone: { type: "'default' | 'brand'", default: "'default'", description: 'brand renders in color.text.brand.' },
    children: { type: 'ReactNode', required: true, description: 'Title text.' },
  },
  usage: {
    do: [
      'Use exactly one level={1} per page.',
      'Change size, not level, when a heading needs to look bigger or smaller.',
      'Keep headings short; let body text do the explaining.',
    ],
    dont: [
      "Don't skip levels (h2 → h4) for visual reasons — use the size prop.",
      "Don't use Heading for non-heading emphasis; use Text with weight.",
    ],
  },
  accessibility: [
    'Renders real h1–h4 elements, which screen reader users navigate by.',
    'Visual size is independent from level, so design never forces a broken outline.',
    'text-wrap: balance keeps multi-line titles readable.',
  ],
  tokens: ['color.text.default', 'color.text.brand'],
  examples: [
    { title: 'Page title', code: '<Heading level={1}>Hi, this is Xuewei</Heading>' },
    { title: 'Card title', code: '<Heading level={3}>Light & Shadow</Heading>' },
    { title: 'Small, brand-colored label', code: '<Heading level={2} size="md" tone="brand">Now showing</Heading>' },
  ],
  related: ['Text'],
});

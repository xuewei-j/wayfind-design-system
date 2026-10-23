import { defineMeta } from '../../meta';
import type { CardOwnProps } from './Card';

export const cardMeta = defineMeta<CardOwnProps>()({
  name: 'Card',
  status: 'stable',
  summary: 'A container that groups related content and actions about one subject.',
  whenToUse:
    'Use to present one item in a collection (an exhibition, a ticket, a plan) or to group a section of a form. Not for page layout — use Stack.',
  import: "import { Card } from '@wayfind/react';",
  extends: 'div | article | section | li',
  props: {
    variant: {
      type: "'outlined' | 'elevated' | 'filled'",
      default: "'outlined'",
      description: 'outlined for lists, elevated to lift one featured item, filled for quiet grouping inside a page.',
    },
    padding: { type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Inner spacing: 0 / 12 / 20 / 32px. Use none for edge-to-edge media.' },
    as: {
      type: "'div' | 'article' | 'section' | 'li'",
      default: "'div'",
      description: 'Rendered element. article for self-contained items, li when cards sit in a <ul>.',
    },
    children: { type: 'ReactNode', required: true, description: 'Card content, typically Heading + text + actions in a Stack.' },
  },
  usage: {
    do: [
      'Lead with a Heading so the card has a clear title.',
      'Keep actions at the bottom, with at most one primary Button.',
      'Render a list of cards as <ul> + <Card as="li"> so screen readers announce the count.',
    ],
    dont: [
      "Don't nest cards inside cards.",
      "Don't make the whole card a link and also put buttons inside it.",
      "Don't mix outlined and elevated cards in the same list.",
    ],
  },
  accessibility: [
    'Pick a semantic element with the `as` prop; the default div adds no semantics.',
    'Card borders are decorative; meaning never depends on them.',
    'When using as="li", wrap the cards in a <ul> or <ol>.',
  ],
  tokens: ['color.border.default', 'color.bg.surface', 'color.text.default', 'color.bg.subtle'],
  examples: [
    {
      title: 'Exhibition card',
      code: '<Card as="article">\n  <Stack gap="2">\n    <Tag tone="success">On view</Tag>\n    <Heading level={3}>Light & Shadow</Heading>\n    <Text tone="muted">Gallery 4 · Until March 30</Text>\n  </Stack>\n  <Button variant="secondary">Get tickets</Button>\n</Card>',
    },
    { title: 'Featured', code: '<Card variant="elevated" padding="lg">…</Card>' },
  ],
  related: ['Stack', 'Heading', 'Tag'],
});

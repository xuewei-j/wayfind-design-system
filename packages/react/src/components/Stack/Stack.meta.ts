import { defineMeta } from '../../meta';
import type { StackOwnProps } from './Stack';

export const stackMeta = defineMeta<StackOwnProps>()({
  name: 'Stack',
  status: 'stable',
  summary: 'Layout primitive: lays children out in a row or column with a gap from the space scale.',
  whenToUse:
    'Use for nearly all spacing between elements. It replaces ad-hoc margins, so spacing always lands on the 4px grid.',
  import: "import { Stack } from '@wayfind/react';",
  extends: 'div | section | ul | ol | nav | header | footer | form | fieldset',
  props: {
    direction: { type: "'column' | 'row'", default: "'column'", description: 'Main axis. Rows center items vertically by default.' },
    gap: {
      type: '0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16',
      default: '4',
      description: 'Step on the space scale (× 4px): 2 = 8px, 4 = 16px, 8 = 32px. Off-scale values are a type error.',
    },
    align: { type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'", description: 'Cross-axis alignment (align-items).' },
    justify: { type: "'start' | 'center' | 'end' | 'between'", description: 'Main-axis distribution (justify-content).' },
    wrap: { type: 'boolean', default: 'false', description: 'Allow row items to wrap.' },
    as: {
      type: "'div' | 'section' | 'ul' | 'ol' | 'nav' | 'header' | 'footer' | 'form' | 'fieldset'",
      default: "'div'",
      description: 'Rendered element. Use ul/ol for lists of cards so the list semantics stay intact.',
    },
    children: { type: 'ReactNode', description: 'Items to lay out.' },
  },
  usage: {
    do: [
      'Use gap 2–3 inside components, 4–6 between groups, 8+ between page sections.',
      'Nest Stacks: a column Stack of sections, each with a row Stack of actions.',
      'Use as="ul" with Card as="li" for collections.',
    ],
    dont: [
      "Don't add margins to children to fix spacing — change the gap.",
      "Don't use Stack for two-dimensional grids; use CSS grid.",
    ],
  },
  accessibility: [
    'Purely presentational; semantics come from the `as` element you choose.',
    'Visual order follows DOM order, so reading and tab order stay consistent.',
  ],
  tokens: [],
  examples: [
    {
      title: 'Form layout',
      code: '<Stack as="form" gap={5} onSubmit={submit}>\n  <TextField label="Name" />\n  <TextField label="Email address" type="email" />\n  <Button type="submit">Continue</Button>\n</Stack>',
    },
    {
      title: 'Toolbar',
      code: '<Stack direction="row" justify="between">\n  <Heading level={2}>Exhibitions</Heading>\n  <Button variant="ghost">View all</Button>\n</Stack>',
    },
  ],
  related: ['Card'],
});

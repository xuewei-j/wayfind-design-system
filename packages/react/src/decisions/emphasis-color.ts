import { defineDecision } from '../decision';

export const emphasisColor = defineDecision({
  id: 'emphasis-color',
  status: 'stable',
  question: 'Can I use the brand orange here?',
  principle: 'The strongest color belongs to the main action, and color is never the only signal.',
  options: [
    {
      choose: 'Brand fill (color.bg.brand)',
      when: 'It is the primary action. This is the only orange that carries white text.',
      components: ['Button'],
      example: { title: 'Primary action', code: '<Button>Book tickets</Button>' },
    },
    {
      choose: 'Accent pair (color.bg.accent with color.text.on-accent)',
      when: 'It is a highlight, not an action: a perk, a label that should catch the eye.',
      components: ['Tag'],
      example: { title: 'Highlight', code: '<Tag tone="accent">Members first</Tag>' },
    },
    {
      choose: 'Brand text (color.text.brand)',
      when: 'It is quiet emphasis inside text: a link, a category label.',
      components: ['Text', 'Heading'],
      example: { title: 'Quiet emphasis', code: '<Text tone="brand" weight="semibold">Opening week</Text>' },
    },
  ],
  avoid: [
    'Never put white text on the lighter oranges. They measure 3.74:1 and 2.97:1, below AA.',
    'Don’t use orange to mean “important” on several things at once. It stops meaning the main action.',
    'Don’t let color carry meaning alone. Tags and Alerts always have text.',
  ],
  boundary:
    'A request for a brand color that fails contrast is not approved as an exception. Look for a role where it passes first (see EX-006).',
  related: ['action-hierarchy', 'contrast-floors'],
});

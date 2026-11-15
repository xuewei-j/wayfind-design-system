import { defineDecision } from '../decision';

export const actionHierarchy = defineDecision({
  id: 'action-hierarchy',
  status: 'stable',
  question: 'Which button variant is this?',
  principle: 'One clear way forward in each view.',
  options: [
    {
      choose: 'primary',
      when: 'It is the one action that moves the task forward. One per view or section.',
      components: ['Button'],
      example: { title: 'Main action', code: '<Button type="submit">Book tickets</Button>' },
    },
    {
      choose: 'secondary',
      when: 'It is an alternative that sits next to the primary: cancel, back, pick another time.',
      components: ['Button', 'Stack'],
      example: {
        title: 'Primary with an alternative',
        code: '<Stack direction="row" gap={3}>\n  <Button variant="secondary">Cancel</Button>\n  <Button type="submit">Save changes</Button>\n</Stack>',
      },
    },
    {
      choose: 'ghost',
      when: 'It is a low-emphasis action that repeats in a list or sits beside content.',
      components: ['Button'],
      example: { title: 'Quiet action', code: '<Button variant="ghost" size="sm">View details</Button>' },
    },
    {
      choose: 'danger',
      when: 'It destroys something and is hard to undo. Pair it with a confirmation step.',
      components: ['Button'],
      example: { title: 'Destructive action', code: '<Button variant="danger">Delete booking</Button>' },
    },
  ],
  avoid: [
    'Don’t put two primary buttons side by side. Make one secondary.',
    'Don’t use a Button to go to another page. Render a link so it gets link semantics.',
    'Don’t restyle a button into a fifth variant. The linter rejects variants that don’t exist.',
  ],
  boundary:
    'Two sections can each have a primary button. Two primaries in one section is a design problem to solve, not an exception to file.',
  related: ['async-actions', 'emphasis-color'],
});

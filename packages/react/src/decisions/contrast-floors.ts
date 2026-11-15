import { defineDecision } from '../decision';

export const contrastFloors = defineDecision({
  id: 'contrast-floors',
  status: 'stable',
  question: 'How much contrast does this pair need?',
  principle: 'Anything a person has to read or find meets a floor, and the build checks it.',
  options: [
    {
      choose: '4.5:1',
      when: 'It is text people read: body, labels, hints, errors, links, button labels.',
      components: ['Text', 'Button', 'TextField', 'Alert', 'Tag'],
    },
    {
      choose: '3:1',
      when: 'It is the only thing that marks a control or its state: a text field’s border, a focus ring.',
      components: ['TextField', 'Button'],
    },
    {
      choose: 'No floor, and a recorded exception',
      when: 'It is decoration that something else already identifies, or a control that can’t be used.',
      components: ['Button', 'Card', 'Tag'],
    },
  ],
  avoid: [
    'Don’t add a color pair without adding it to the contrast contract. A pair outside the contract is not checked.',
    'Don’t pass a pair in light mode only. The contract runs in light and dark.',
    'Don’t judge contrast by eye. Use check_contrast or the contract.',
  ],
  boundary:
    'The third option is never a silent choice. Each use is in the exception log with the measurement that justifies it (EX-001, EX-002).',
  related: ['emphasis-color', 'async-actions'],
});

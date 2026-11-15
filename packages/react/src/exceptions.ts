/**
 * The exception log: every place Wayfind breaks one of its own rules, and why.
 *
 * Exceptions are part of the system, not a way around it. Each one is cited
 * where the rule is broken (`wayfind-ignore EX-004`), and the ones that rest on
 * a contrast measurement are re-measured in tests, so a stale exception fails.
 */
import type { DecisionException } from './decision';

export const exceptions: readonly DecisionException[] = [
  {
    id: 'EX-001',
    rule: 'The line that marks the edge of a control meets 3:1 against its background.',
    pattern: 'contrast-floors',
    where: 'Outlines drawn with color.border.default',
    what: 'The secondary Button, the outlined Card, the neutral Tag and disabled controls use a line far below 3:1.',
    why: 'None of these lines is the only thing that identifies a control. A button has its label, a card and a tag are not controls, and a disabled control is exempt.',
    scope: 'standing',
    outcome: 'kept',
    nextTime:
      'A border may skip 3:1 only when something else identifies the control. A text field has nothing else, so its border uses color.border.strong.',
    affects: ['Button', 'Card', 'Tag', 'TextField', 'color.border.default'],
    evidence: { foreground: 'color.border.default', background: 'color.bg.surface', below: 3 },
    recorded: '2026-10-23',
  },
  {
    id: 'EX-002',
    rule: 'Text meets 4.5:1 on the surface it sits on.',
    pattern: 'contrast-floors',
    where: 'Disabled controls',
    what: 'color.text.disabled sits below 4.5:1 on a surface.',
    why: 'WCAG exempts inactive controls, and a disabled control should read as unavailable.',
    scope: 'standing',
    outcome: 'kept',
    nextTime:
      'Use color.text.disabled only on a control that can’t be used. Hints, placeholders and metadata are read, so they use color.text.muted.',
    affects: ['color.text.disabled', 'Button', 'TextField'],
    evidence: { foreground: 'color.text.disabled', background: 'color.bg.surface', below: 4.5 },
    recorded: '2026-10-23',
  },
  {
    id: 'EX-003',
    rule: 'Every input has a visible label.',
    where: 'TextField, hideLabel',
    what: 'The label is hidden visually and kept for assistive technology.',
    why: 'A search box that stands alone is self-explanatory, and the label is still read by screen readers.',
    scope: 'standing',
    outcome: 'kept',
    nextTime:
      'Hide a label only when the field stands alone and its purpose is obvious from what surrounds it. Never to save space in a form.',
    affects: ['TextField'],
    recorded: '2026-10-23',
  },
  {
    id: 'EX-004',
    rule: 'Spacing comes from the 4px scale.',
    where: 'Alert icon',
    what: 'The icon has a 2px top margin, which is off the scale.',
    why: 'Optical alignment: the icon has to sit on the first line of text, and no step on the scale puts it there.',
    scope: 'one-off',
    outcome: 'kept',
    nextTime:
      'A 1–2px optical nudge inside one component is fine when the line says why. If a second component needs the same nudge, add a token instead.',
    affects: ['Alert'],
    recorded: '2026-10-23',
  },
  {
    id: 'EX-005',
    rule: 'Spacing comes from the 4px scale.',
    where: 'Visually hidden utility',
    what: 'The utility sets margin: -1px.',
    why: 'It is the standard visually-hidden recipe, copied as it is.',
    scope: 'one-off',
    outcome: 'kept',
    nextTime: 'A copied platform recipe keeps its literal values. Name the recipe in the ignore comment.',
    affects: ['TextField'],
    recorded: '2026-10-23',
  },
  {
    id: 'EX-006',
    rule: 'Only color.bg.brand carries white text.',
    pattern: 'emphasis-color',
    where: 'Primary buttons in the first mock-ups',
    what: 'The mock-ups filled calls to action with #D95F27 and used #E07B42 on hover, both under white labels.',
    why: 'They were drawn with the brighter orange. With white text it measures 3.74:1, and the hover 2.97:1.',
    scope: 'one-off',
    outcome: 'declined',
    changed:
      'The orange scale was rebuilt around #BA4300 for actions, and the lighter oranges got a role where they pass: the accent pair, with dark text.',
    nextTime:
      'When a brand color fails contrast in the role it was drawn for, look for a role where it passes before saying no.',
    affects: ['Button', 'Tag', 'color.bg.brand', 'color.bg.accent', 'color.text.on-accent'],
    evidence: { foreground: '#ffffff', background: '#d95f27', below: 4.5 },
    recorded: '2026-10-23',
  },
];

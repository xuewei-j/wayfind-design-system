/**
 * The accessibility contract: every foreground/background pairing the components
 * actually use, with the WCAG minimum it must meet in BOTH light and dark mode.
 *
 * Tests fail if a token change breaks any pair, so a palette tweak in Figma
 * can't silently ship an inaccessible button.
 */

export interface ContrastPair {
  foreground: string;
  background: string;
  /** 4.5 for text, 3 for large text, borders, and focus rings. */
  min: 4.5 | 3;
  usedBy: string;
}

const surfaces = ['color.bg.canvas', 'color.bg.surface', 'color.bg.subtle'];

export const contrastPairs: ContrastPair[] = [
  ...surfaces.flatMap((bg): ContrastPair[] => [
    { foreground: 'color.text.default', background: bg, min: 4.5, usedBy: 'Body text' },
    { foreground: 'color.text.muted', background: bg, min: 4.5, usedBy: 'Hints, metadata' },
    { foreground: 'color.text.brand', background: bg, min: 4.5, usedBy: 'Links, ghost buttons' },
    { foreground: 'color.text.danger', background: bg, min: 4.5, usedBy: 'Field errors, Text tone' },
    { foreground: 'color.text.success', background: bg, min: 4.5, usedBy: 'Text tone' },
    { foreground: 'color.text.warning', background: bg, min: 4.5, usedBy: 'Text tone' },
    { foreground: 'color.focus.ring', background: bg, min: 3, usedBy: 'Focus outline' },
  ]),
  { foreground: 'color.border.strong', background: 'color.bg.surface', min: 3, usedBy: 'TextField border' },
  { foreground: 'color.border.strong', background: 'color.bg.canvas', min: 3, usedBy: 'TextField border' },
  { foreground: 'color.text.on-brand', background: 'color.bg.brand', min: 4.5, usedBy: 'Primary button' },
  { foreground: 'color.text.on-brand', background: 'color.bg.brand-hover', min: 4.5, usedBy: 'Primary button (hover)' },
  { foreground: 'color.text.on-accent', background: 'color.bg.accent', min: 4.5, usedBy: 'Accent surfaces, accent tag' },
  { foreground: 'color.text.on-danger', background: 'color.bg.danger', min: 4.5, usedBy: 'Danger button' },
  { foreground: 'color.text.on-danger', background: 'color.bg.danger-hover', min: 4.5, usedBy: 'Danger button (hover)' },
  { foreground: 'color.text.inverse', background: 'color.bg.inverse', min: 4.5, usedBy: 'Inverse band' },
  { foreground: 'color.text.brand', background: 'color.bg.brand-subtle', min: 4.5, usedBy: 'Brand tag, info alert' },
  { foreground: 'color.text.default', background: 'color.bg.brand-subtle', min: 4.5, usedBy: 'Info alert body' },
  { foreground: 'color.text.success', background: 'color.bg.success-subtle', min: 4.5, usedBy: 'Success tag, alert' },
  { foreground: 'color.text.default', background: 'color.bg.success-subtle', min: 4.5, usedBy: 'Success alert body' },
  { foreground: 'color.text.warning', background: 'color.bg.warning-subtle', min: 4.5, usedBy: 'Warning tag, alert' },
  { foreground: 'color.text.default', background: 'color.bg.warning-subtle', min: 4.5, usedBy: 'Warning alert body' },
  { foreground: 'color.text.danger', background: 'color.bg.danger-subtle', min: 4.5, usedBy: 'Danger tag, alert' },
  { foreground: 'color.text.default', background: 'color.bg.danger-subtle', min: 4.5, usedBy: 'Danger alert body' },
  { foreground: 'color.border.brand', background: 'color.bg.surface', min: 3, usedBy: 'Selected / brand outline' },
];

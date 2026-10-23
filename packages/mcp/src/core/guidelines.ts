/** House rules an agent should follow when building with Wayfind. Served as the `wayfind://guidelines` resource. */
export const guidelines = `# Building with Wayfind

Wayfind is a small design system for clear, calm, exhibition-like product UI:
square corners, generous spacing, a teal brand voice, Chivo for display and Overpass for everything else.

## Setup
\`\`\`tsx
import '@wayfind/tokens/tokens.css';   // CSS custom properties (light + dark)
import '@wayfind/react/styles.css';    // component styles
import { Button, Stack, TextField } from '@wayfind/react';
\`\`\`
Load the fonts once: Chivo (400, 900) and Overpass (400, 500, 600, 700) from Google Fonts.

## Rules
1. **Reach for a component first.** Call \`list_components\`, then \`get_component\` for each one you use. Don't restyle raw HTML when a component exists.
2. **Only semantic color tokens in product code.** \`var(--wf-color-text-default)\`, \`var(--wf-color-bg-brand)\`… Never \`--wf-palette-*\` and never hex values: semantic tokens carry dark mode and accessibility guarantees.
3. **Spacing is on a 4px grid.** Use \`Stack gap={n}\` for layout and \`var(--wf-space-n)\` in CSS. Typical rhythm: 2–3 inside components, 4–6 between groups, 8+ between sections.
4. **One primary action per view.** Everything else is secondary or ghost.
5. **Every input has a visible label.** Placeholders are not labels.
6. **Headings follow the document outline.** One \`level={1}\` per page; change \`size\`, not \`level\`, for looks.
7. **Color is never the only signal.** Tags and Alerts always carry text.
8. **The raw brand teal (#31a3b4) is not a text color.** It is 2.99:1 on white. Use \`color.text.brand\` for text and \`color.bg.accent\` + \`color.text.on-accent\` for decorative highlights.

## Voice
Short, concrete, verb-first. "Book tickets", not "Submit". Errors say how to fix the problem.

## Before you finish
Run \`check_styles\` on the code you wrote and fix every error and warning.
Use \`check_contrast\` if you introduce any new color pairing.
`;

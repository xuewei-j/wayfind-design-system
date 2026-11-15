/** House rules an agent should follow when building with Wayfind. Served as the `wayfind://guidelines` resource. */
export const guidelines = `# Building with Wayfind

Wayfind is a small design system for clear, calm, exhibition-like product UI:
rounded corners (pill-shaped controls, 16px cards), generous spacing, an orange brand voice (#BA4300) and SF Pro at 400 and 600.

## Setup
\`\`\`tsx
import '@wayfind/tokens/tokens.css';   // CSS custom properties (light + dark)
import '@wayfind/react/styles.css';    // component styles
import { Button, Stack, TextField } from '@wayfind/react';
\`\`\`
No web fonts to load: the font tokens use the system stack, which is SF Pro on Apple platforms.

## Decide before you build
Components tell you how to build something. Decision patterns tell you which thing to build.
When you are choosing — where an error goes, which button variant, whether a message should interrupt, what an
empty screen shows, how much contrast a pair needs — call \`list_decisions\`, then \`get_decision\`, and follow the
option whose "when" matches your case.

## Rules
1. **Reach for a component first.** Call \`list_components\`, then \`get_component\` for each one you use. Don't restyle raw HTML when a component exists.
2. **Only semantic color tokens in product code.** \`var(--wf-color-text-default)\`, \`var(--wf-color-bg-brand)\`… Never \`--wf-palette-*\` and never hex values: semantic tokens carry dark mode and accessibility guarantees.
3. **Spacing is on a 4px grid.** Use \`Stack gap={n}\` for layout and \`var(--wf-space-n)\` in CSS. Typical rhythm: 2–3 inside components, 4–6 between groups, 8+ between sections.
4. **One primary action per view.** Everything else is secondary or ghost.
5. **Every input has a visible label.** Placeholders are not labels.
6. **Headings follow the document outline.** One \`level={1}\` per page; change \`size\`, not \`level\`, for looks.
7. **Color is never the only signal.** Tags and Alerts always carry text.
8. **Only #BA4300 carries white text.** The lighter oranges #D95F27 (3.74:1) and #E07B42 (2.97:1) fail AA with white. Use \`color.bg.brand\` for CTAs and \`color.bg.accent\` + \`color.text.on-accent\` for decorative highlights.
9. **Set type with matching tokens.** Pair \`font.size.<step>\` with \`font.line-height.<step>\` and \`font.letter-spacing.<step>\`; weights are 400 and 600.

## Exceptions
If a rule really does not fit, break it in the open.
- Put \`wayfind-ignore: <why>\` on the line, or cite a recorded exception: \`wayfind-ignore EX-004\`.
- \`check_styles\` lists every exception it skipped and flags an ignore that gives no reason.
- The recorded ones are at \`wayfind://exceptions\`. Read the "next time" line before adding a similar one.

## Voice
Short, concrete, verb-first. "Book tickets", not "Submit". Errors say how to fix the problem.

## Before you finish
Run \`check_styles\` on the code you wrote and fix every error and warning.
Use \`check_contrast\` if you introduce any new color pairing.
`;

# Token architecture

<!-- Generated from tokens.json, the component registry and the contrast contract.
     Regenerate with `pnpm docs:generate`. A test fails if this file is out of date. -->

Wayfind has **125 tokens**. Color has two public tiers. Everything else is a single scale.

| Tier | Path | Tokens | Named by | Example | Rule |
| --- | --- | ---: | --- | --- | --- |
| Primitive | `palette.*` | 40 | What it is: a hue and a step | `palette.orange.600 = #ba4300` | Only semantic tokens may point at it. |
| Semantic | `color.*` | 31 | Where it goes and what it means | `color.bg.brand → palette.orange.600` | Components and product code use this tier, and only this tier, for color. |
| Scale | `font.*`, `space.*`, `size.*`, `radius.*`, `border-width.*`, `shadow.*`, `motion.*` | 54 | Its step on a scale | `space.4 = 1rem` | One tier. A step has no light or dark version, so there is nothing to alias. |

```
palette.*       40 values    what a color is
    ▲
color.*         31 intents   where it goes and what it means, in light and dark
    ▲
component CSS   private      --_bg, --_fg: set per variant, never exported
```

## Why two tiers

A palette value says what a color is. A semantic token says where it goes and what it means. Components read only
semantic tokens, so changing a mode or a brand means changing values in one place, and no component is touched.

That is how dark mode works here: all 31 semantic colors point at a different palette step
in dark mode, and none of the 8 component stylesheets mentions dark mode.

## When a third tier would be worth it

Component values, such as a button's background on hover, are private custom properties inside each component's
stylesheet (`--_bg`, `--_fg`). They are not public tokens. With 8 web components, a public component
tier would be names with nothing to do.

A public component tier earns its place when:

- more than one platform (web, iOS, Android) has to agree on the same component value, such as a control height, or
- a brand or theme has to change one component without changing what a semantic token means everywhere else.

## Naming

`color.<role>.<intent>[-<state>]`

| Role | Tokens | For | Example |
| --- | ---: | --- | --- |
| `bg` | 13 | Fills behind content | `color.bg.brand-hover` |
| `text` | 11 | Text and icons | `color.text.on-brand` |
| `border` | 6 | Lines and outlines | `color.border.default` |
| `focus` | 1 | The keyboard focus ring | `color.focus.ring` |

- **Intent** says what the color means, never what it looks like: `brand`, `danger`, `muted`, not `orange`, `red`, `gray`.
- **`text.on-<x>`** is the text that sits on `bg.<x>`: `color.text.on-brand` on `color.bg.brand`. Each such pair is in the contrast contract.
- **State** is a suffix: `-hover`, `-subtle`.

## What enforces it

| Rule | Enforced by |
| --- | --- |
| A semantic color only points at the palette. No raw hex in the semantic tier. | `@wayfind/tokens` tests |
| Every semantic color has a dark value. | `@wayfind/tokens` tests |
| Component CSS never uses `--wf-palette-*` or a raw color. | `@wayfind/react` registry tests |
| Each component lists exactly the color tokens its CSS reads. | `@wayfind/react` registry tests |
| Every pairing in the contrast contract passes WCAG AA: 38 pairs × 2 modes = 76 checks. | The contract, at build time |
| A color that sits below a floor on purpose has a recorded exception, and a test re-measures it. | The exception log |
| In product and agent code, palette tokens and raw colors are flagged with the semantic replacement. | `check_styles` |

## Every semantic color

| Token | Light | Dark | Read by | Contract pairs |
| --- | --- | --- | --- | ---: |
| `color.bg.canvas` | `palette.neutral.0` #ffffff | `palette.neutral.950` #0d0d0d | — | 8 |
| `color.bg.surface` | `palette.neutral.0` #ffffff | `palette.neutral.900` #171717 | Button, TextField, Card | 9 |
| `color.bg.subtle` | `palette.neutral.50` #f3f3f3 | `palette.neutral.850` #212121 | Button, TextField, Tag, Card | 7 |
| `color.bg.inverse` | `palette.neutral.950` #0d0d0d | `palette.neutral.50` #f3f3f3 | — | 1 |
| `color.bg.brand` | `palette.orange.600` #ba4300 | `palette.orange.400` #e07b42 | Button | 1 |
| `color.bg.brand-hover` | `palette.orange.700` #9a3700 | `palette.orange.300` #eda172 | Button | 1 |
| `color.bg.brand-subtle` | `palette.orange.50` #fff8f3 | `palette.orange.950` #2e1100 | Button, Tag, Alert | 2 |
| `color.bg.accent` | `palette.orange.100` #fae0cf | `palette.orange.400` #e07b42 | Tag | 1 |
| `color.bg.danger` | `palette.red.600` #c2362b | `palette.red.300` #f08a80 | Button | 1 |
| `color.bg.danger-hover` | `palette.red.700` #a82e24 | `palette.red.200` #f6b1a9 | Button | 1 |
| `color.bg.success-subtle` | `palette.green.50` #f3faf5 | `palette.green.900` #0f2a1b | Tag, Alert | 2 |
| `color.bg.warning-subtle` | `palette.amber.50` #fffaeb | `palette.amber.900` #2e1d00 | Tag, Alert | 2 |
| `color.bg.danger-subtle` | `palette.red.50` #fef5f4 | `palette.red.900` #3a110d | Tag, Alert | 2 |
| `color.text.default` | `palette.neutral.950` #0d0d0d | `palette.neutral.50` #f3f3f3 | Button, TextField, Tag, Card, Alert, Heading, Text | 7 |
| `color.text.muted` | `palette.neutral.600` #5d5d5d | `palette.neutral.400` #8f8f8f | TextField, Text | 3 |
| `color.text.disabled` | `palette.neutral.400` #8f8f8f | `palette.neutral.600` #5d5d5d | Button, TextField | EX-002 |
| `color.text.inverse` | `palette.neutral.0` #ffffff | `palette.neutral.950` #0d0d0d | — | 1 |
| `color.text.brand` | `palette.orange.600` #ba4300 | `palette.orange.300` #eda172 | Button, Tag, Alert, Heading, Text | 4 |
| `color.text.on-brand` | `palette.neutral.0` #ffffff | `palette.neutral.950` #0d0d0d | Button | 2 |
| `color.text.on-accent` | `palette.orange.800` #7a2c00 | `palette.neutral.950` #0d0d0d | Tag | 1 |
| `color.text.on-danger` | `palette.neutral.0` #ffffff | `palette.neutral.950` #0d0d0d | Button | 2 |
| `color.text.success` | `palette.green.700` #1f6b3f | `palette.green.300` #7cc79a | Tag, Alert, Text | 4 |
| `color.text.warning` | `palette.amber.700` #8a4e00 | `palette.amber.300` #f2b75b | Tag, Alert, Text | 4 |
| `color.text.danger` | `palette.red.700` #a82e24 | `palette.red.300` #f08a80 | TextField, Tag, Alert, Text | 4 |
| `color.border.default` | `palette.neutral.100` #e8e8e8 | `palette.neutral.800` #2f2f2f | Button, TextField, Tag, Card | EX-001 |
| `color.border.strong` | `palette.neutral.400` #8f8f8f | `palette.neutral.500` #767676 | TextField | 2 |
| `color.border.brand` | `palette.orange.600` #ba4300 | `palette.orange.400` #e07b42 | TextField, Tag, Alert | 1 |
| `color.border.success` | `palette.green.600` #2e7d4f | `palette.green.300` #7cc79a | Tag, Alert | — |
| `color.border.warning` | `palette.amber.600` #a15c00 | `palette.amber.300` #f2b75b | Tag, Alert | — |
| `color.border.danger` | `palette.red.600` #c2362b | `palette.red.300` #f08a80 | TextField, Tag, Alert | — |
| `color.focus.ring` | `palette.orange.600` #ba4300 | `palette.orange.300` #eda172 | Button, TextField | 3 |

No component stylesheet reads `color.bg.canvas`, `color.bg.inverse`, `color.text.inverse`. They are for pages and layouts.

A token with an `EX-` id in the last column sits below a contrast floor on purpose. The reason is in the
[exception log](DECISION-PATTERNS.md#exception-log).
## The palette

| Family | Steps |
| --- | --- |
| `palette.orange` | 50 · 100 · 200 · 300 · 400 · 500 · 600 · 700 · 800 · 900 · 950 |
| `palette.neutral` | 0 · 50 · 100 · 200 · 300 · 400 · 500 · 600 · 700 · 800 · 850 · 900 · 950 |
| `palette.green` | 50 · 300 · 600 · 700 · 900 |
| `palette.amber` | 50 · 300 · 600 · 700 · 900 |
| `palette.red` | 50 · 200 · 300 · 600 · 700 · 900 |

## The scales

| Scale | Tokens |
| --- | ---: |
| `font.*` | 25 |
| `space.*` | 11 |
| `size.*` | 3 |
| `radius.*` | 5 |
| `border-width.*` | 2 |
| `shadow.*` | 3 |
| `motion.*` | 5 |

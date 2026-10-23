# Design decisions

Short records of the choices that shaped Wayfind: what the problem was, what we picked, and what it costs.

---

## 1. One registry, two audiences

**Context.** Design-system docs usually live in Storybook or Zeroheight, written for people. Agents writing UI never see
them, so they guess — and guess wrong in consistent ways (invented variants, hard-coded colors, missing labels).

**Decision.** Each component has a `*.meta.ts` registry entry: summary, when to use, props, do/don't, accessibility notes,
examples. Storybook renders it as the docs page; the MCP server renders it as Markdown for `get_component`. Neither has its
own copy.

**Trade-off.** Hand-written metadata can still go stale, so tests guard it: `defineMeta<Props>()` requires an entry for
every declared prop, the token list must match the CSS, and examples may only use real components.

## 2. Tokens: DTCG JSON and a small custom resolver

**Context.** Tokens need to feed CSS, TypeScript, Storybook, and the MCP server — and ideally round-trip with Figma.

**Decision.** `tokens.json` uses the W3C Design Tokens Community Group format (`$value`, `$type`, `{alias}` references),
which Figma plugins such as Tokens Studio can read. A ~100-line resolver flattens it, follows aliases, and catches
unknown references and cycles. Dark-mode values live under `$extensions`.

**Trade-off.** Style Dictionary is the industry tool and would handle more platforms (iOS, Android). For a web-only system
a resolver that runs unchanged in Node, the browser and an MCP call was simpler to explain and test. Swapping it in later
only touches the build script.

## 3. Primitive and semantic layers, enforced

**Context.** If components use `orange-600` directly, dark mode and re-theming mean editing every component.

**Decision.** `palette.*` holds raw values; `color.*` names intent (`color.text.muted`, `color.bg.brand`) and points at the
palette per mode. Component CSS may only use semantic tokens — a test fails on any `--wf-palette-*` or raw color in a
component stylesheet, and `check_styles` gives agents the same rule.

**Trade-off.** More tokens to name up front. Worth it: dark mode required zero component changes.

## 4. CTAs use Brand / Primary `#BA4300`, not the brighter oranges

**Context.** CTA mock-ups used `#D95F27` with a `#E07B42` hover. With white labels those measure **3.74:1** and **2.97:1**:
both fail AA for button text (4.5:1). The product design system's Brand / Primary `#BA4300` measures **5.40:1**.

**Decision.** Build the orange scale around `#BA4300` (`palette.orange.600`) and make it `color.bg.brand`; hover goes
darker (`orange-700`, 7.19:1), never lighter. `#E07B42` stays as `color.bg.accent` with near-black text (6.55:1). Text
colors are the design system's grays: `#0D0D0D` primary, `#5D5D5D` secondary (5.93:1 even on the `#F3F3F3` fill), and
`#8F8F8F` (3.23:1) for disabled text only. Every pairing the components use is listed in a contract and checked in both
modes at build time.

**Trade-off.** The CTA is deeper than the mock-up's orange. The brighter oranges remain available for accents.

*Earlier version:* the system was built around the portfolio teal `#31A3B4` with Chivo and Overpass; it moved to the
product design system's color and type.

## 5. SF Pro through the system font stack

**Context.** The product design system specifies SF Pro at 400 and 600. Apple's license doesn't allow serving SF Pro as
a web font.

**Decision.** `-apple-system, BlinkMacSystemFont, "SF Pro Text"…` for body and the `SF Pro Display` equivalent for
headings: real SF Pro on Apple platforms, the platform UI font elsewhere, and no font download. The type ramp copies the
spec — 36/40, 24/28, 18/26, 16/26, 14/18, 12/16 — with each size's own letter spacing as `font.letter-spacing.<step>`.

## 6. Rounded corners, a 4px grid, and typed spacing

**Decision.** Everything is rounded, following the product design system's pill CTAs. Controls — buttons, text fields
and tags — are pills; containers — cards and alerts — use `radius.lg` (16px). The secondary button uses the light
`#E8E8E8` outline: its label identifies it, so the outline is decorative and not held to the 3:1 non-text contrast rule.
Text fields have no label inside the box, so their border must reach 3:1; it uses the palette gray `#8F8F8F` (3.23:1)
rather than near-black. Spacing in rem on a 4px grid. `Stack`'s `gap` prop only accepts steps on the scale
(`0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16`), so off-grid spacing is a compile error rather than a review comment.

## 7. Plain CSS with data attributes, not CSS-in-JS

**Decision.** Components render `class="wf-button" data-variant="primary" data-size="md"`; styles are plain CSS reading
CSS variables, bundled into one `styles.css`.

**Why.** No runtime cost, no framework lock-in, works with server rendering out of the box, and the markup is readable
by people in devtools and by agents in generated code. Variant-specific values are set as local custom properties
(`--_bg`, `--_fg`), so each variant is a few lines.

**Trade-off.** No scoped class names; the `wf-` prefix does that job.

## 8. Accessibility choices inside components

- **Loading buttons use `aria-disabled` + `aria-busy`, not `disabled`.** A disabled button drops keyboard focus, so a
  keyboard user who just pressed Enter loses their place. Clicks (and form submission) are blocked in JS instead.
- **`TextField` requires `label`.** Placeholders disappear on input and are often low contrast; `hideLabel` exists for
  the rare self-explanatory field and keeps the label for screen readers.
- **Errors come first in `aria-describedby`**, so the problem is read before the hint.
- **`Alert` picks its live-region role from its tone.** Danger interrupts (`role="alert"`); everything else is polite
  (`role="status"`).
- **`Heading` separates `level` from `size`,** so a design that wants a small h2 doesn't break the document outline.
- Contrast can't be tested in jsdom, so axe-core runs with `color-contrast` off in unit tests and contrast is enforced at
  the token level instead.
- **Unit tests aren't enough; a real browser audit runs too.** The first version hid the loading button's label with
  `visibility: hidden`, which also removes it from the accessibility tree — the button lost its name while busy. Every
  jsdom test passed, because jsdom doesn't apply CSS. Running axe on each built story in Chromium caught it, so
  `pnpm audit:a11y` (every story, light and dark) is now part of CI, and the label uses `opacity: 0` instead.

## 9. A regex linter, on purpose

**Context.** `check_styles` has to run inside an MCP call and in the browser (the Storybook playground), on snippets that
are often incomplete code.

**Decision.** Pattern-based checks with careful position tracking, comment masking, and a small JSX tag scanner that
skips over `{expressions}`. Lines containing `wayfind-ignore` are skipped, like `eslint-disable`.

**Trade-off.** It can be fooled: a spread of props hides missing ones (so missing-prop checks are skipped when `{...props}`
is present), and computed values aren't evaluated. An AST-based version (e.g. an ESLint plugin and a Stylelint plugin
sharing the same registry) is the right next step once the rules settle — this version was for finding out which rules
matter.

## 10. Fixes as data

**Decision.** Most issues carry a machine-applicable fix (`{ start, end, text }`). `check_styles` with `fix: true` applies
the non-overlapping ones and re-lints.

**Why.** Agents work in loops. Mechanical problems (a raw hex that matches a token, `padding: 10` → `var(--wf-space-2)`)
shouldn't cost the agent reasoning. What's left after fixing is deliberately the stuff that needs judgment: a label only
the author can write, or a heading level that depends on the page.

## 11. Stateless MCP over stdio and HTTP

**Decision.** `createServer()` is transport-agnostic. `bin.ts` connects it to stdio (Claude Code, Claude Desktop,
Cursor) or, with `--http`, to a stateless Streamable HTTP endpoint that builds a fresh server per request.

**Why.** All tools are pure and read-only, so there's no session state to keep. Stateless HTTP is the easiest shape to
deploy behind a serverless function for remote clients such as ChatGPT apps or custom connectors.

---

## What I'd do next

- Sync tokens with Figma variables, so `tokens.json` is generated from the design file rather than edited by hand.
- Move the linter rules into ESLint and Stylelint plugins that read the same registry.
- Visual regression tests for every story (Chromatic or Playwright screenshots).
- More components where agents struggle most: Select, Dialog, Tabs.
- Measure it: run the same UI prompts through an agent with and without the MCP server and count `check_styles` issues.

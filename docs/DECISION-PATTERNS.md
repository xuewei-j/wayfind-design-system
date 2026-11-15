# Decision patterns

<!-- Generated from packages/react/src/decisions and packages/react/src/exceptions.ts.
     Regenerate with `pnpm docs:generate`. A test fails if this file is out of date. -->

A component library answers "how do I build this?". Tokens answer "what does it look like?".
Neither answers "which one do I use here, and when is it fine not to?". That judgment usually lives in
people's heads and gets argued again in every review.

Wayfind writes it down as data. Each pattern below is a question with its options, the condition that selects
each option, and what to avoid. Storybook renders them for people, and the MCP server hands the same entries to
AI agents through `list_decisions` and `get_decision`.

| Question | Pattern | Components |
| --- | --- | --- |
| [Does this error go on the field or in a banner?](#form-errors) | `form-errors` | TextField, Alert |
| [Should this message interrupt?](#feedback-loudness) | `feedback-loudness` | Alert, Tag |
| [Which button variant is this?](#action-hierarchy) | `action-hierarchy` | Button, Stack |
| [What does a button do while its action runs, or when it can’t run?](#async-actions) | `async-actions` | Button, TextField, Text |
| [Explain why it is empty, or offer the next step?](#empty-states) | `empty-states` | Card, Heading, Text, Button |
| [Can I use the brand orange here?](#emphasis-color) | `emphasis-color` | Button, Tag, Text, Heading |
| [How much contrast does this pair need?](#contrast-floors) | `contrast-floors` | Text, Button, TextField, Alert, Tag, Card |

## Does this error go on the field or in a banner?

<a id="form-errors"></a>

`form-errors` · stable

**Principle:** Put the message where the fix is.

### Choose

#### On the field

**When:** One field is wrong and the person can fix it right there.

**Components:** TextField

```tsx
<TextField label="Email address" type="email" error="Enter an email like name@example.com" />
```

#### In an Alert above the form

**When:** The failure is not tied to one field: a declined payment, a lost connection, a slot that just sold out.

**Components:** Alert

```tsx
<Alert tone="danger" title="Payment failed">
  Your card was declined. Try another card or contact your bank.
</Alert>
```

#### Both

**When:** A submit fails on two or more fields. One Alert counts them, and each field still carries its own message.

**Components:** Alert, TextField

```tsx
<Stack as="form" gap={5}>
  <Alert tone="danger" title="Fix 2 fields to continue">
    Check your email address and phone number.
  </Alert>
  <TextField label="Email address" type="email" error="Enter an email like name@example.com" />
  <TextField label="Phone number" type="tel" error="Enter a 10-digit phone number" />
</Stack>
```

### Avoid
- Don’t validate while someone is still typing. Check on blur or on submit.
- Don’t show an error as a red border alone. The message says how to fix it, and color is never the only signal.
- Don’t put errors in a toast. A message that disappears can’t be read twice, which is why Wayfind has no toast.

### Boundary
If the field with the problem is not on screen (an earlier step), the error moves into the Alert and names the field.

**Related:** feedback-loudness, async-actions

---

## Should this message interrupt?

<a id="feedback-loudness"></a>

`feedback-loudness` · stable

**Principle:** Interrupt only for what blocks the task.

### Choose

#### Interrupt: a danger Alert

**When:** Something failed or the person cannot continue. It renders role="alert", so a screen reader announces it at once.

**Components:** Alert

```tsx
<Alert tone="danger" title="Payment failed">
  Your card was declined. Try another card or contact your bank.
</Alert>
```

#### Inform: an info, success or warning Alert

**When:** They should know, but they can keep going: a saved change, low availability. It renders role="status" and waits its turn.

**Components:** Alert

```tsx
<Alert tone="warning" title="Only 4 tickets left">
  Saturday 2pm is almost full.
</Alert>
```

#### No message: a Tag

**When:** The state belongs to an item, not to something that just happened: on view, coming soon, members first.

**Components:** Tag

```tsx
<Tag tone="success">On view</Tag>
```

### Avoid
- Don’t use danger for emphasis. It interrupts screen-reader users for something that is not a failure.
- Don’t stack alerts. Combine them into one message.
- Don’t give an alert more than one action.

### Boundary
A warning that must be heard immediately can override the default with the role prop. Record where and why in the exception log.

**Related:** form-errors

---

## Which button variant is this?

<a id="action-hierarchy"></a>

`action-hierarchy` · stable

**Principle:** One clear way forward in each view.

### Choose

#### primary

**When:** It is the one action that moves the task forward. One per view or section.

**Components:** Button

```tsx
<Button type="submit">Book tickets</Button>
```

#### secondary

**When:** It is an alternative that sits next to the primary: cancel, back, pick another time.

**Components:** Button, Stack

```tsx
<Stack direction="row" gap={3}>
  <Button variant="secondary">Cancel</Button>
  <Button type="submit">Save changes</Button>
</Stack>
```

#### ghost

**When:** It is a low-emphasis action that repeats in a list or sits beside content.

**Components:** Button

```tsx
<Button variant="ghost" size="sm">View details</Button>
```

#### danger

**When:** It destroys something and is hard to undo. Pair it with a confirmation step.

**Components:** Button

```tsx
<Button variant="danger">Delete booking</Button>
```

### Avoid
- Don’t put two primary buttons side by side. Make one secondary.
- Don’t use a Button to go to another page. Render a link so it gets link semantics.
- Don’t restyle a button into a fifth variant. The linter rejects variants that don’t exist.

### Boundary
Two sections can each have a primary button. Two primaries in one section is a design problem to solve, not an exception to file.

**Related:** async-actions, emphasis-color

---

## What does a button do while its action runs, or when it can’t run?

<a id="async-actions"></a>

`async-actions` · stable

**Principle:** Never take focus away from someone in the middle of a task.

### Choose

#### loading

**When:** The action was triggered and is in progress. The button stays focusable, ignores clicks and keeps its width.

**Components:** Button

```tsx
<Button type="submit" loading={isSaving}>Save changes</Button>
```

#### Leave it enabled and validate on submit

**When:** The form is not complete yet. Let people press the button, then tell them what is missing.

**Components:** Button, TextField

```tsx
<Stack as="form" gap={5}>
  <TextField label="Email address" type="email" required />
  <Button type="submit">Book tickets</Button>
</Stack>
```

#### disabled, with the reason next to it

**When:** The action cannot happen at all right now and nothing on this screen changes that.

**Components:** Button, Text

```tsx
<Stack gap={2} align="start">
  <Button disabled>Book tickets</Button>
  <Text size="sm" tone="muted">Saturday 2pm is sold out.</Text>
</Stack>
```

### Avoid
- Don’t disable a button to show that it is working. A disabled button drops keyboard focus mid-submit.
- Don’t disable submit until the form is valid. People can’t tell what is missing.
- Don’t hide the label while loading in a way that removes the button’s name for screen readers.

### Boundary
A disabled control is the one place text may sit below 4.5:1 (see EX-002). The reason beside it may not.

**Related:** form-errors, contrast-floors

---

## Explain why it is empty, or offer the next step?

<a id="empty-states"></a>

`empty-states` · stable

**Principle:** An empty screen should still move the task forward.

### Choose

#### Lead with the action

**When:** The person can fill it in one step: nothing booked yet, nothing saved yet.

**Components:** Card, Heading, Text, Button

```tsx
<Card variant="filled" padding="lg">
  <Stack gap={3} align="start">
    <Heading level={2} size="lg">No bookings yet</Heading>
    <Text tone="muted">Tickets you book will show up here.</Text>
    <Button>Browse exhibitions</Button>
  </Stack>
</Card>
```

#### Explain, then offer a way out

**When:** It is empty for a reason they can’t fix from here: no results, nothing open that day.

**Components:** Card, Heading, Text, Button

```tsx
<Card variant="filled" padding="lg">
  <Stack gap={3} align="start">
    <Heading level={2} size="lg">No exhibitions match</Heading>
    <Text tone="muted">Nothing is open on Mondays. Try another day.</Text>
    <Button variant="secondary">Clear filters</Button>
  </Stack>
</Card>
```

### Avoid
- Don’t leave a blank container. People can’t tell empty from broken.
- Don’t use an Alert. Nothing went wrong.
- Don’t explain the feature at length. One line, then the action.

### Boundary
When the next step is the primary action of the whole page, the empty state uses a primary button. Otherwise it is secondary, so it doesn’t compete.

**Related:** action-hierarchy

---

## Can I use the brand orange here?

<a id="emphasis-color"></a>

`emphasis-color` · stable

**Principle:** The strongest color belongs to the main action, and color is never the only signal.

### Choose

#### Brand fill (color.bg.brand)

**When:** It is the primary action. This is the only orange that carries white text.

**Components:** Button

```tsx
<Button>Book tickets</Button>
```

#### Accent pair (color.bg.accent with color.text.on-accent)

**When:** It is a highlight, not an action: a perk, a label that should catch the eye.

**Components:** Tag

```tsx
<Tag tone="accent">Members first</Tag>
```

#### Brand text (color.text.brand)

**When:** It is quiet emphasis inside text: a link, a category label.

**Components:** Text, Heading

```tsx
<Text tone="brand" weight="semibold">Opening week</Text>
```

### Avoid
- Never put white text on the lighter oranges. They measure 3.74:1 and 2.97:1, below AA.
- Don’t use orange to mean “important” on several things at once. It stops meaning the main action.
- Don’t let color carry meaning alone. Tags and Alerts always have text.

### Boundary
A request for a brand color that fails contrast is not approved as an exception. Look for a role where it passes first (see EX-006).

**Related:** action-hierarchy, contrast-floors

---

## How much contrast does this pair need?

<a id="contrast-floors"></a>

`contrast-floors` · stable

**Principle:** Anything a person has to read or find meets a floor, and the build checks it.

### Choose

#### 4.5:1

**When:** It is text people read: body, labels, hints, errors, links, button labels.

**Components:** Text, Button, TextField, Alert, Tag

#### 3:1

**When:** It is the only thing that marks a control or its state: a text field’s border, a focus ring.

**Components:** TextField, Button

#### No floor, and a recorded exception

**When:** It is decoration that something else already identifies, or a control that can’t be used.

**Components:** Button, Card, Tag

### Avoid
- Don’t add a color pair without adding it to the contrast contract. A pair outside the contract is not checked.
- Don’t pass a pair in light mode only. The contract runs in light and dark.
- Don’t judge contrast by eye. Use check_contrast or the contract.

### Boundary
The third option is never a silent choice. Each use is in the exception log with the measurement that justifies it (EX-001, EX-002).

**Related:** emphasis-color, async-actions

---

## Exception log

<a id="exception-log"></a>

Every place Wayfind breaks one of its own rules, and why. Cite an entry where the rule is broken:
`wayfind-ignore EX-001`. Read the "next time" line before adding a similar exception.

### EX-001 · Outlines drawn with color.border.default

- **Rule:** The line that marks the edge of a control meets 3:1 against its background.
- **What:** The secondary Button, the outlined Card, the neutral Tag and disabled controls use a line far below 3:1.
- **Why:** None of these lines is the only thing that identifies a control. A button has its label, a card and a tag are not controls, and a disabled control is exempt.
- **Scope:** standing · **Outcome:** kept
- **Next time:** A border may skip 3:1 only when something else identifies the control. A text field has nothing else, so its border uses color.border.strong.
- **Touches:** `Button`, `Card`, `Tag`, `TextField`, `color.border.default`

### EX-002 · Disabled controls

- **Rule:** Text meets 4.5:1 on the surface it sits on.
- **What:** color.text.disabled sits below 4.5:1 on a surface.
- **Why:** WCAG exempts inactive controls, and a disabled control should read as unavailable.
- **Scope:** standing · **Outcome:** kept
- **Next time:** Use color.text.disabled only on a control that can’t be used. Hints, placeholders and metadata are read, so they use color.text.muted.
- **Touches:** `color.text.disabled`, `Button`, `TextField`

### EX-003 · TextField, hideLabel

- **Rule:** Every input has a visible label.
- **What:** The label is hidden visually and kept for assistive technology.
- **Why:** A search box that stands alone is self-explanatory, and the label is still read by screen readers.
- **Scope:** standing · **Outcome:** kept
- **Next time:** Hide a label only when the field stands alone and its purpose is obvious from what surrounds it. Never to save space in a form.
- **Touches:** `TextField`

### EX-004 · Alert icon

- **Rule:** Spacing comes from the 4px scale.
- **What:** The icon has a 2px top margin, which is off the scale.
- **Why:** Optical alignment: the icon has to sit on the first line of text, and no step on the scale puts it there.
- **Scope:** one-off · **Outcome:** kept
- **Next time:** A 1–2px optical nudge inside one component is fine when the line says why. If a second component needs the same nudge, add a token instead.
- **Touches:** `Alert`

### EX-005 · Visually hidden utility

- **Rule:** Spacing comes from the 4px scale.
- **What:** The utility sets margin: -1px.
- **Why:** It is the standard visually-hidden recipe, copied as it is.
- **Scope:** one-off · **Outcome:** kept
- **Next time:** A copied platform recipe keeps its literal values. Name the recipe in the ignore comment.
- **Touches:** `TextField`

### EX-006 · Primary buttons in the first mock-ups

- **Rule:** Only color.bg.brand carries white text.
- **What:** The mock-ups filled calls to action with #D95F27 and used #E07B42 on hover, both under white labels.
- **Why:** They were drawn with the brighter orange. With white text it measures 3.74:1, and the hover 2.97:1.
- **Scope:** one-off · **Outcome:** declined
- **What changed:** The orange scale was rebuilt around #BA4300 for actions, and the lighter oranges got a role where they pass: the accent pair, with dark text.
- **Next time:** When a brand color fails contrast in the role it was drawn for, look for a role where it passes before saying no.
- **Touches:** `Button`, `Tag`, `color.bg.brand`, `color.bg.accent`, `color.text.on-accent`

### What an exception has to answer

1. Why doesn't the rule fit here?
2. Is this a one-off, or a sign the system should change?
3. What should the next person do when a similar case shows up?

An exception that rests on a contrast measurement carries that measurement as `evidence`, and a test re-measures
it. If the tokens change and the exception is no longer true, the build fails and the entry is retired.

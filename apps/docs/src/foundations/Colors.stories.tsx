import type { Meta, StoryObj } from '@storybook/react-vite';
import { tokens, checkContrastPairs, getToken, valueIn, type Mode } from '@wayfind/tokens';
import { Heading, Stack, Tag, Text } from '@wayfind/react';

const meta = {
  title: 'Foundations/Colors',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Two layers. **Palette** primitives are raw values built around the portfolio teal #31A3B4. **Semantic** tokens name an intent (text, background, border) and switch values in dark mode. Components only use the semantic layer — a unit test enforces it.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const mono = { fontFamily: 'var(--wf-font-family-mono)', fontSize: 'var(--wf-font-size-xs)' };
const colorIn = (name: string, mode: Mode) => valueIn(getToken(name)!, mode).value;

const Swatch = ({ value, name, note }: { value: string; name: string; note?: string }) => (
  <div style={{ width: '7.5rem' }}>
    <div
      style={{
        height: '3.5rem',
        background: value,
        border: 'var(--wf-border-width-thin) solid var(--wf-color-border-default)',
      }}
    />
    <Text size="sm" weight="semibold">
      {name}
    </Text>
    <Text as="div" size="sm" tone="muted" style={mono}>
      {value}
    </Text>
    {note && (
      <Text as="div" size="sm" tone="brand">
        {note}
      </Text>
    )}
  </div>
);

export const Palette: Story = {
  render: () => {
    const families = [...new Set(tokens.filter((t) => t.tier === 'primitive').map((t) => t.name.split('.')[1]!))];
    return (
      <Stack gap={8}>
        {families.map((family) => (
          <Stack key={family} gap={3}>
            <Heading level={2} size="md">
              {family}
            </Heading>
            <Stack direction="row" gap={3} wrap align="start">
              {tokens
                .filter((t) => t.name.startsWith(`palette.${family}.`))
                .map((t) => (
                  <Swatch
                    key={t.name}
                    name={t.name.split('.').pop()!}
                    value={t.value}
                    note={t.name === 'palette.teal.500' ? 'brand' : undefined}
                  />
                ))}
            </Stack>
          </Stack>
        ))}
      </Stack>
    );
  },
};

export const Semantic: Story = {
  render: () => (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          {['Token', 'Light', 'Dark', 'Use'].map((h) => (
            <th key={h} style={{ textAlign: 'left', padding: 'var(--wf-space-2)', borderBottom: 'var(--wf-border-width-thick) solid var(--wf-color-border-strong)' }}>
              <Text as="span" size="sm" weight="bold">
                {h}
              </Text>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tokens
          .filter((t) => t.tier === 'semantic')
          .map((t) => (
            <tr key={t.name} style={{ borderBottom: 'var(--wf-border-width-thin) solid var(--wf-color-border-default)' }}>
              <td style={{ padding: 'var(--wf-space-2)' }}>
                <code style={mono}>{t.name}</code>
              </td>
              {[t, t.dark ?? t].map((v, i) => (
                <td key={i} style={{ padding: 'var(--wf-space-2)' }}>
                  <Stack direction="row" gap={2}>
                    <span
                      style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        background: v.value,
                        border: 'var(--wf-border-width-thin) solid var(--wf-color-border-default)',
                        flex: 'none',
                      }}
                    />
                    <Text as="span" size="sm" tone="muted" style={mono}>
                      {v.aliasOf ?? v.value}
                    </Text>
                  </Stack>
                </td>
              ))}
              <td style={{ padding: 'var(--wf-space-2)' }}>
                <Text as="span" size="sm">
                  {t.description ?? ''}
                </Text>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  ),
};

export const ContrastContract: Story = {
  name: 'Contrast contract',
  parameters: {
    docs: {
      description: {
        story:
          'Every foreground/background pair the components use, checked against WCAG AA in both modes. The build fails if a token change breaks one. The original brand teal #31A3B4 measures 2.99:1 on white, which is why text uses teal-700 and buttons use teal-600.',
      },
    },
  },
  render: () => {
    const results = checkContrastPairs();
    return (
      <Stack gap={4}>
        <Text>
          <strong>{results.filter((r) => r.pass).length}</strong> of {results.length} checks pass.
        </Text>
        <Stack as="ul" direction="row" gap={3} wrap align="stretch">
          {results.map((r) => (
            <li key={`${r.mode}-${r.foreground}-${r.background}`} style={{ width: '15rem', listStyle: 'none' }}>
              <div
                style={{
                  padding: 'var(--wf-space-3)',
                  // Literal values (not CSS vars) so each card shows its own mode regardless of the toolbar theme.
                  background: colorIn(r.background, r.mode),
                  // 3:1 pairs are non-text (borders, focus rings): show them as a border, not as text color.
                  color: colorIn(r.min === 3 ? 'color.text.default' : r.foreground, r.mode),
                  border:
                    r.min === 3
                      ? `var(--wf-border-width-thick) solid ${colorIn(r.foreground, r.mode)}`
                      : 'var(--wf-border-width-thin) solid var(--wf-color-border-default)',
                }}
              >
                <strong>{r.usedBy}</strong>
                <div style={mono}>
                  {r.foreground.replace('color.', '')} on {r.background.replace('color.', '')}
                </div>
              </div>
              <Stack direction="row" gap={2} style={{ marginTop: 'var(--wf-space-1)' }}>
                <Tag size="sm" tone={r.pass ? 'success' : 'danger'}>
                  {r.ratio}:1
                </Tag>
                <Text as="span" size="sm" tone="muted">
                  {r.mode} · needs {r.min}:1
                </Text>
              </Stack>
            </li>
          ))}
        </Stack>
      </Stack>
    );
  },
};

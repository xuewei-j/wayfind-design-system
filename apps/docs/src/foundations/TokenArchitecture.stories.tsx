import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { tokenArchitecture, type SemanticTrace } from '@wayfind/mcp/core';
import { Card, Heading, Stack, Tag, Text } from '@wayfind/react';

/** Counts, aliases and readers all come from tokens.json and the registry, so this page can't go out of date. */
const architecture = tokenArchitecture();

const meta = {
  title: 'Foundations/Token architecture',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `**${architecture.total} tokens.** Color has two public tiers: a palette that says what a color is, and semantic tokens that say where it goes and what it means. Components read only the semantic tier, so dark mode lives entirely in the tokens. Everything else (space, type, radius, shadow, motion) is a single scale. Every number on this page is computed from \`tokens.json\`; the same description is in \`docs/TOKENS.md\` and is served to agents as \`wayfind://tokens/architecture\`.`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const mono = { fontFamily: 'var(--wf-font-family-mono)', fontSize: 'var(--wf-font-size-xs)' };
const outline = 'var(--wf-border-width-thin) solid var(--wf-color-border-default)';

export const Tiers: Story = {
  render: () => (
    <Stack gap={6}>
      <Stack as="ul" direction="row" gap={4} wrap align="stretch" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {architecture.tiers.map((tier) => (
          <Card as="li" key={tier.tier} style={{ flex: '1 1 16rem' }}>
            <Stack gap={3}>
              <Stack direction="row" gap={2} justify="between">
                <Heading level={2} size="lg">
                  {tier.label}
                </Heading>
                <Tag tone={tier.tier === 'semantic' ? 'brand' : 'neutral'}>{tier.count} tokens</Tag>
              </Stack>
              <code style={mono}>{tier.path}</code>
              <Text>
                <strong>Named by.</strong> {tier.namedBy}.
              </Text>
              <Text as="div" size="sm" tone="muted" style={mono}>
                {tier.example}
              </Text>
              <Text size="sm">{tier.rule}</Text>
              <Stack direction="row" gap={2} wrap>
                {tier.groups.map((group) => (
                  <Tag key={group.name} size="sm">
                    {group.name} · {group.count}
                  </Tag>
                ))}
              </Stack>
            </Stack>
          </Card>
        ))}
      </Stack>
      <Card variant="filled">
        <Stack gap={2}>
          <Heading level={2} size="md">
            Why not a third tier?
          </Heading>
          <Text>
            A component’s own values, such as a button’s background on hover, are private custom properties inside its
            stylesheet. With {architecture.components} web components, a public component tier would be names with
            nothing to do. It earns its place when several platforms have to agree on one component value, or when a
            theme has to change a single component.
          </Text>
        </Stack>
      </Card>
    </Stack>
  ),
};

const Swatch = ({ mode, value, alias }: { mode: string; value: string; alias?: string }) => (
  <Stack direction="row" gap={3}>
    <span style={{ width: '2.5rem', height: '2.5rem', flex: 'none', background: value, border: outline }} />
    <Stack gap={0}>
      <Text as="span" size="sm" weight="semibold">
        {mode}
      </Text>
      <Text as="span" size="sm" tone="muted" style={mono}>
        {alias ? `${alias} · ${value}` : value}
      </Text>
    </Stack>
  </Stack>
);

function Trace({ token }: { token: SemanticTrace }) {
  return (
    <Stack gap={5}>
      <Stack gap={1}>
        <code style={{ ...mono, fontSize: 'var(--wf-font-size-md)' }}>{token.name}</code>
        {token.description && <Text tone="muted">{token.description}</Text>}
      </Stack>
      <Stack gap={2}>
        <Heading level={3} size="md">
          Points at
        </Heading>
        <Stack direction="row" gap={6} wrap>
          <Swatch mode="Light" value={token.light.value} alias={token.light.aliasOf} />
          <Swatch mode="Dark" value={token.dark.value} alias={token.dark.aliasOf} />
        </Stack>
      </Stack>
      <Stack gap={2}>
        <Heading level={3} size="md">
          Read by
        </Heading>
        {token.readBy.length ? (
          <Stack direction="row" gap={2} wrap>
            {token.readBy.map((name) => (
              <Tag key={name}>{name}</Tag>
            ))}
          </Stack>
        ) : (
          <Text tone="muted">No component stylesheet. Pages and layouts use it.</Text>
        )}
      </Stack>
      <Stack gap={2}>
        <Heading level={3} size="md">
          Contrast
        </Heading>
        {token.contractPairs ? (
          <Text>
            In {token.contractPairs} pairing{token.contractPairs === 1 ? '' : 's'} of the contrast contract, each checked
            in light and dark.
          </Text>
        ) : token.exception ? (
          <Text>
            Below a contrast floor on purpose. The reason is recorded as <strong>{token.exception}</strong> in the
            exception log.
          </Text>
        ) : (
          <Text tone="muted">Not part of a pairing in the contract.</Text>
        )}
      </Stack>
    </Stack>
  );
}

function FollowOneToken() {
  const id = useId();
  const [name, setName] = useState('color.bg.brand');
  const token = architecture.semantic.find((t) => t.name === name)!;
  return (
    <Stack gap={6}>
      <Stack gap={2} align="start">
        <label htmlFor={id}>
          <Text as="span" weight="semibold">
            Semantic token
          </Text>
        </label>
        <select
          id={id}
          value={name}
          onChange={(event) => setName(event.target.value)}
          style={{
            font: 'inherit',
            color: 'var(--wf-color-text-default)',
            background: 'var(--wf-color-bg-surface)',
            border: 'var(--wf-border-width-thin) solid var(--wf-color-border-strong)',
            borderRadius: 'var(--wf-radius-md)',
            padding: 'var(--wf-space-2) var(--wf-space-3)',
          }}
        >
          {architecture.roles.map((role) => (
            <optgroup key={role.role} label={`${role.role} · ${role.purpose}`}>
              {architecture.semantic
                .filter((t) => t.role === role.role)
                .map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </Stack>
      <Card>
        <Trace token={token} />
      </Card>
    </Stack>
  );
}

export const FollowOne: Story = {
  name: 'Follow one token',
  parameters: {
    docs: {
      description: {
        story:
          'Pick a semantic color and follow it in both directions: down to the palette step it points at in each mode, and up to the components whose stylesheets read it. This is the whole reason for the second tier. To change a mode or a brand you edit the left side, and nothing on the right changes.',
      },
    },
  },
  render: () => <FollowOneToken />,
};

export const Naming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A semantic color is named `color.<role>.<intent>[-<state>]`. The intent says what the color means, never what it looks like, and `text.on-<x>` is the text that sits on `bg.<x>`.',
      },
    },
  },
  render: () => (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          {['Role', 'Tokens', 'For', 'Example'].map((heading) => (
            <th
              key={heading}
              scope="col"
              style={{
                textAlign: 'left',
                padding: 'var(--wf-space-2)',
                borderBottom: 'var(--wf-border-width-thick) solid var(--wf-color-border-strong)',
              }}
            >
              <Text as="span" size="sm" weight="bold">
                {heading}
              </Text>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {architecture.roles.map((role) => (
          <tr key={role.role} style={{ borderBottom: outline }}>
            <th scope="row" style={{ textAlign: 'left', padding: 'var(--wf-space-2)' }}>
              <code style={mono}>{role.role}</code>
            </th>
            <td style={{ padding: 'var(--wf-space-2)' }}>
              <Text as="span" size="sm">
                {role.count}
              </Text>
            </td>
            <td style={{ padding: 'var(--wf-space-2)' }}>
              <Text as="span" size="sm">
                {role.purpose}
              </Text>
            </td>
            <td style={{ padding: 'var(--wf-space-2)' }}>
              <code style={mono}>{role.example}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

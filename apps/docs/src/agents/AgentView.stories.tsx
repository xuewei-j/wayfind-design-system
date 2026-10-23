import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { componentToMarkdown, getComponent, listComponents, searchTokens } from '@wayfind/mcp/core';
import { Button, Heading, Stack, Text, TextField } from '@wayfind/react';

const pre = {
  margin: 0,
  padding: 'var(--wf-space-4)',
  maxHeight: '32rem',
  overflow: 'auto',
  background: 'var(--wf-color-bg-subtle)',
  border: 'var(--wf-border-width-thin) solid var(--wf-color-border-default)',
  fontFamily: 'var(--wf-font-family-mono)',
  fontSize: 'var(--wf-font-size-sm)',
  lineHeight: 'var(--wf-font-line-height-sm)',
  whiteSpace: 'pre-wrap' as const,
};

function AgentView() {
  const names = listComponents().map((c) => c.name);
  const [selected, setSelected] = useState(names[0]!);
  const result = getComponent(selected);

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Heading level={1} size="xl">
          What the agent sees
        </Heading>
        <Text tone="muted">
          The docs pages you read in this Storybook and the response an AI agent gets from <code>get_component</code> are
          generated from the same registry entry. Pick a component to see the agent’s version.
        </Text>
      </Stack>
      <Stack direction="row" gap={2} wrap role="group" aria-label="Component">
        {names.map((name) => (
          <Button
            key={name}
            size="sm"
            variant={name === selected ? 'primary' : 'secondary'}
            aria-pressed={name === selected}
            onClick={() => setSelected(name)}
          >
            {name}
          </Button>
        ))}
      </Stack>
      {/* Scrollable regions need to be focusable so keyboard users can scroll them. */}
      <pre style={pre} tabIndex={0} role="region" aria-label={`get_component("${selected}") response`}>
        {result.found ? componentToMarkdown(result.component) : ''}
      </pre>
    </Stack>
  );
}

function TokenSearch() {
  const [query, setQuery] = useState('muted text');
  const results = searchTokens({ query, limit: 8 });
  return (
    <Stack gap={5}>
      <Stack gap={2}>
        <Heading level={1} size="xl">
          search_tokens
        </Heading>
        <Text tone="muted">Agents look tokens up by intent, by name, or by pasting a color they were about to hard-code.</Text>
      </Stack>
      <div style={{ maxWidth: '24rem' }}>
        <TextField
          label="Query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          hint='Try "button background", "space", or "#3b82f6".'
        />
      </div>
      <pre style={pre} tabIndex={0} role="region" aria-label="search_tokens response">
        {JSON.stringify(results, null, 2)}
      </pre>
    </Stack>
  );
}

const meta = {
  title: 'Agents/What the agent sees',
  parameters: { layout: 'padded' },
  tags: ['!autodocs'],
} satisfies Meta;

export default meta;

export const ComponentDocs: StoryObj = { name: 'get_component', render: () => <AgentView /> };
export const Tokens: StoryObj = { name: 'search_tokens', render: () => <TokenSearch /> };

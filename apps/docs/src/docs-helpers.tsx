import type { ComponentMeta } from '@wayfind/react/registry';

/**
 * Builds the Storybook docs description from the same registry entry the MCP
 * server sends to agents — so the human docs and the agent docs can't diverge.
 */
export function describeComponent(meta: ComponentMeta): string {
  // Registry text mentions elements like <button>; show them as code instead of letting markdown render them.
  const code = (s: string) => s.replace(/<[^>\s][^>]*>/g, (tag) => `\`${tag}\``);
  const list = (items: string[]) => items.map((i) => `- ${code(i)}`).join('\n');
  return `${meta.summary}

**When to use.** ${meta.whenToUse}

\`${meta.import}\`

#### Do
${list(meta.usage.do)}

#### Don't
${list(meta.usage.dont)}

#### Accessibility
${list(meta.accessibility)}

<small>This page and the agent-facing docs (\`get_component("${meta.name}")\` in the MCP server) are generated from the same registry entry.</small>`;
}

export const docsParameters = (meta: ComponentMeta) => ({
  docs: { description: { component: describeComponent(meta) } },
});

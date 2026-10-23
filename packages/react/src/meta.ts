/**
 * Component metadata: the one description of each component that BOTH humans
 * (Storybook) and AI agents (the MCP server) read.
 *
 * `defineMeta<OwnProps>()` makes TypeScript require a doc entry for every
 * prop the component declares, so docs can't drift from the code.
 */

export interface PropDoc {
  type: string;
  description: string;
  default?: string;
  required?: boolean;
}

export interface Example {
  title: string;
  code: string;
}

export interface ComponentMeta<Props = Record<string, unknown>> {
  name: string;
  status: 'stable' | 'beta';
  /** One line, shown in lists. */
  summary: string;
  /** When to reach for this component. */
  whenToUse: string;
  import: string;
  /** Native element the component renders, whose attributes are passed through. */
  extends?: string;
  props: { [K in keyof Required<Props>]: PropDoc };
  usage: { do: string[]; dont: string[] };
  accessibility: string[];
  /** Semantic color tokens the component's CSS reads. Verified against the stylesheet in tests. */
  tokens: string[];
  examples: Example[];
  related?: string[];
}

export const defineMeta =
  <Props>() =>
  (meta: ComponentMeta<Props>): ComponentMeta<Props> =>
    meta;

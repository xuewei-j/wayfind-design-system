import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { tokens, toCss } from '@wayfind/tokens';
import {
  listComponents,
  getComponent,
  componentToMarkdown,
  searchTokens,
  tokenGroups,
  checkStyles,
  fixStyles,
  checkContrast,
  guidelines,
} from './core/index';

export const SERVER_NAME = 'wayfind';
export const SERVER_VERSION = '0.1.0';

const INSTRUCTIONS = `Wayfind is a React design system. Use these tools whenever you write UI for a Wayfind project:
1. list_components → get_component for each component you plan to use.
2. search_tokens for any color, spacing, radius or type value; only use semantic color tokens.
3. check_styles on your final code; fix every error and warning before answering.
Read the wayfind://guidelines resource for house rules.`;

const json = (value: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] });
const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] });
const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

/** Builds a fresh, fully registered server. Transport-agnostic: connect it to stdio, HTTP or an in-memory pair. */
export function createServer(): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION }, { instructions: INSTRUCTIONS });

  server.registerTool(
    'list_components',
    {
      title: 'List components',
      description: 'Lists every Wayfind React component with a one-line summary and when to use it. Start here before writing UI.',
      annotations: readOnly,
    },
    async () => json(listComponents()),
  );

  server.registerTool(
    'get_component',
    {
      title: 'Get component docs',
      description:
        'Full docs for one component: import line, props with allowed values, do/don’t guidance, accessibility notes and copy-pasteable examples.',
      inputSchema: { name: z.string().describe('Component name, e.g. "Button" or "TextField". Case-insensitive.') },
      annotations: readOnly,
    },
    async ({ name }) => {
      const result = getComponent(name);
      if (result.found) return text(componentToMarkdown(result.component));
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: `No Wayfind component named "${name}".${
              result.suggestions.length ? ` Did you mean: ${result.suggestions.join(', ')}?` : ''
            } Call list_components to see all of them.`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'search_tokens',
    {
      title: 'Search design tokens',
      description:
        'Finds design tokens by intent ("button background", "muted text"), by name ("space"), or by value ("#ba4300" returns the nearest colors). Returns the CSS variable to use. Call with no arguments for a table of contents.',
      inputSchema: {
        query: z.string().optional().describe('Words, a token path prefix, or a hex/rgb color.'),
        type: z
          .enum(['color', 'dimension', 'fontFamily', 'fontWeight', 'number', 'shadow', 'duration', 'cubicBezier'])
          .optional(),
        tier: z.enum(['semantic', 'scale', 'primitive']).optional().describe('semantic = use in product code; primitive = raw palette.'),
        limit: z.number().int().min(1).max(100).optional(),
      },
      annotations: readOnly,
    },
    async ({ query, type, tier, limit }) => {
      if (!query && !type && !tier) return json({ total: tokens.length, groups: tokenGroups() });
      return json(searchTokens({ query, type, tier, limit }));
    },
  );

  server.registerTool(
    'check_styles',
    {
      title: 'Lint UI code against Wayfind',
      description:
        'Checks a CSS or JSX/TSX snippet for design-system problems: unknown or primitive tokens, hard-coded colors, off-grid spacing/radius/font sizes, off-system fonts, invalid component props (e.g. variant="tertiary") and missing required props (e.g. a TextField without label). Returns issues with line numbers and suggested replacements. With fix: true it also returns the code with every safe fix applied, plus the issues that still need your judgment. Run it on your output before you finish.',
      inputSchema: {
        code: z.string().min(1).describe('CSS, JSX or TSX source.'),
        fix: z.boolean().optional().describe('Apply machine-safe fixes and return the fixed code.'),
      },
      annotations: readOnly,
    },
    async ({ code, fix }) => {
      if (!fix) return json(checkStyles(code));
      const result = fixStyles(code);
      return {
        content: [
          { type: 'text' as const, text: JSON.stringify({ applied: result.applied, remaining: result.report }, null, 2) },
          { type: 'text' as const, text: result.code },
        ],
      };
    },
  );

  server.registerTool(
    'check_contrast',
    {
      title: 'Check color contrast',
      description:
        'WCAG 2.x contrast between two colors. Accepts token names ("color.text.muted") or hex/rgb values, in light or dark mode. Suggests passing text tokens when the pair fails.',
      inputSchema: {
        foreground: z.string().describe('Text or icon color: token name or hex/rgb.'),
        background: z.string().describe('Background color: token name or hex/rgb.'),
        mode: z.enum(['light', 'dark']).optional(),
      },
      annotations: readOnly,
    },
    async (input) => {
      try {
        return json(checkContrast(input));
      } catch (error) {
        return { isError: true, content: [{ type: 'text' as const, text: (error as Error).message }] };
      }
    },
  );

  server.registerResource(
    'guidelines',
    'wayfind://guidelines',
    { title: 'Wayfind guidelines', description: 'House rules for building UI with Wayfind.', mimeType: 'text/markdown' },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: 'text/markdown', text: guidelines }] }),
  );

  server.registerResource(
    'tokens-css',
    'wayfind://tokens.css',
    { title: 'Token stylesheet', description: 'All tokens as CSS custom properties, light and dark.', mimeType: 'text/css' },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: 'text/css', text: toCss(tokens) }] }),
  );

  server.registerResource(
    'component-docs',
    new ResourceTemplate('wayfind://components/{name}', {
      list: async () => ({
        resources: listComponents().map((c) => ({
          uri: `wayfind://components/${c.name}`,
          name: c.name,
          description: c.summary,
          mimeType: 'text/markdown',
        })),
      }),
    }),
    { title: 'Component docs', description: 'Markdown docs for one component.', mimeType: 'text/markdown' },
    async (uri, { name }) => {
      const result = getComponent(String(name));
      if (!result.found) throw new Error(`Unknown component "${name}"`);
      return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: componentToMarkdown(result.component) }] };
    },
  );

  server.registerPrompt(
    'build-ui',
    {
      title: 'Build UI with Wayfind',
      description: 'Primes the model to build a screen with Wayfind components and verify it with check_styles.',
      argsSchema: { request: z.string().describe('What to build, e.g. "a ticket checkout form".') },
    },
    ({ request }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Build this with the Wayfind design system: ${request}

Work like this:
1. Read wayfind://guidelines.
2. Call list_components, then get_component for every component you use.
3. Use semantic tokens via search_tokens for anything a component doesn't cover.
4. Write the code (React + TypeScript).
5. Run check_styles on it and fix every error and warning. Show the final code only.`,
          },
        },
      ],
    }),
  );

  return server;
}

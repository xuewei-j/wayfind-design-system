import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server';
import { startHttpServer } from '../src/http';

type TextContent = { type: 'text'; text: string };
const textOf = (result: unknown) => ((result as { content: TextContent[] }).content[0]!).text;

async function connectInMemory() {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  await Promise.all([createServer().connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

describe('MCP server (in-memory)', () => {
  let client: Client;
  beforeAll(async () => {
    client = await connectInMemory();
  });
  afterAll(() => client.close());

  it('advertises instructions and read-only tools', async () => {
    expect(client.getInstructions()).toContain('check_styles');
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      'check_contrast',
      'check_styles',
      'get_component',
      'list_components',
      'search_tokens',
    ]);
    expect(tools.every((t) => t.annotations?.readOnlyHint)).toBe(true);
  });

  it('list_components → get_component', async () => {
    const list = JSON.parse(textOf(await client.callTool({ name: 'list_components', arguments: {} })));
    expect(list.map((c: { name: string }) => c.name)).toContain('Button');

    const doc = textOf(await client.callTool({ name: 'get_component', arguments: { name: 'button' } }));
    expect(doc).toContain('# Button');
    expect(doc).toContain("import { Button } from '@wayfind/react';");
    expect(doc).toContain('`variant`');
  });

  it('get_component suggests names on a miss', async () => {
    const result = await client.callTool({ name: 'get_component', arguments: { name: 'Buton' } });
    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain('Did you mean: Button');
  });

  it('search_tokens by intent and by color', async () => {
    const byWords = JSON.parse(textOf(await client.callTool({ name: 'search_tokens', arguments: { query: 'muted text' } })));
    expect(byWords[0]).toMatchObject({ name: 'color.text.muted', usage: 'var(--wf-color-text-muted)' });

    const byColor = JSON.parse(textOf(await client.callTool({ name: 'search_tokens', arguments: { query: '#ba4300', limit: 3 } })));
    expect(byColor[0].value).toBe('#ba4300');

    const toc = JSON.parse(textOf(await client.callTool({ name: 'search_tokens', arguments: {} })));
    expect(toc.total).toBeGreaterThan(100);
  });

  it('check_styles returns structured issues', async () => {
    const report = JSON.parse(
      textOf(await client.callTool({ name: 'check_styles', arguments: { code: '<Button variant="tertiary">Go</Button>' } })),
    );
    expect(report.passed).toBe(false);
    expect(report.issues[0]).toMatchObject({ rule: 'invalid-prop', line: 1 });
  });

  it('check_styles with fix: true returns fixed code', async () => {
    const result = (await client.callTool({
      name: 'check_styles',
      arguments: { code: '.a { padding: 15px; color: #111; }', fix: true },
    })) as { content: TextContent[] };
    expect(JSON.parse(result.content[0]!.text)).toMatchObject({ applied: 2, remaining: { passed: true } });
    expect(result.content[1]!.text).toBe('.a { padding: var(--wf-space-4); color: var(--wf-color-text-default); }');
  });

  it('check_contrast explains the light brand orange and offers passing tokens', async () => {
    const result = JSON.parse(
      textOf(
        await client.callTool({
          name: 'check_contrast',
          arguments: { foreground: 'palette.orange.400', background: 'color.bg.canvas' },
        }),
      ),
    );
    expect(result).toMatchObject({ ratio: 2.97, aaText: false, aaLarge: false });
    expect(result.alternatives).toContain('color.text.brand');

    const bad = await client.callTool({ name: 'check_contrast', arguments: { foreground: 'teal', background: '#fff' } });
    expect(bad.isError).toBe(true);
  });

  it('serves guidelines, tokens.css and per-component resources', async () => {
    const { resources } = await client.listResources();
    expect(resources.map((r) => r.uri)).toEqual(
      expect.arrayContaining(['wayfind://guidelines', 'wayfind://tokens.css', 'wayfind://components/Button']),
    );
    const css = await client.readResource({ uri: 'wayfind://tokens.css' });
    expect((css.contents[0] as { text: string }).text).toContain('--wf-color-bg-brand');
    const card = await client.readResource({ uri: 'wayfind://components/Card' });
    expect((card.contents[0] as { text: string }).text).toContain('# Card');
  });

  it('offers a build-ui prompt', async () => {
    const prompt = await client.getPrompt({ name: 'build-ui', arguments: { request: 'a checkout form' } });
    expect((prompt.messages[0]!.content as TextContent).text).toContain('a checkout form');
  });
});

describe('MCP server (Streamable HTTP)', () => {
  let http: Server;
  let port: number;
  beforeAll(async () => {
    http = await startHttpServer(0);
    port = (http.address() as { port: number }).port;
  });
  afterAll(() => new Promise<void>((resolve) => http.close(() => resolve())));

  it('answers tool calls over HTTP', async () => {
    const client = new Client({ name: 'http-client', version: '1.0.0' });
    await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`)));
    const doc = textOf(await client.callTool({ name: 'get_component', arguments: { name: 'Alert' } }));
    expect(doc).toContain('# Alert');
    await client.close();
  });

  it('has a health check and rejects GET on /mcp', async () => {
    expect((await fetch(`http://127.0.0.1:${port}/health`)).status).toBe(200);
    expect((await fetch(`http://127.0.0.1:${port}/mcp`)).status).toBe(405);
  });
});

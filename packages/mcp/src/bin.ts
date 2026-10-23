#!/usr/bin/env node
/**
 * wayfind-mcp            → stdio (Claude Desktop, Claude Code, Cursor…)
 * wayfind-mcp --http     → Streamable HTTP on http://127.0.0.1:3333/mcp
 * wayfind-mcp --http 8080
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server';
import { startHttpServer } from './http';

const args = process.argv.slice(2);
const httpFlag = args.indexOf('--http');

if (httpFlag !== -1) {
  const port = Number(args[httpFlag + 1] ?? process.env.PORT ?? 3333);
  await startHttpServer(port);
  // stdout is free in HTTP mode; in stdio mode it carries the protocol, so we stay silent there.
  console.log(`Wayfind MCP listening on http://127.0.0.1:${port}/mcp`);
} else {
  await createServer().connect(new StdioServerTransport());
  console.error('Wayfind MCP server running on stdio');
}

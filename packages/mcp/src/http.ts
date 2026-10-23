import { createServer as createHttpServer, type Server } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server';

/**
 * Stateless Streamable HTTP endpoint at POST /mcp — the transport remote
 * clients (ChatGPT apps, Claude custom connectors) use. Every request gets a
 * fresh server, which is fine here because all tools are pure and read-only.
 */
export function startHttpServer(port = 3333, host = '127.0.0.1'): Promise<Server> {
  const http = createHttpServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    if (url.pathname === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ ok: true }));
      return;
    }
    if (url.pathname !== '/mcp') {
      res.writeHead(404).end();
      return;
    }
    if (req.method !== 'POST') {
      // Stateless mode: no server-initiated streams or sessions to resume.
      res
        .writeHead(405, { allow: 'POST', 'content-type': 'application/json' })
        .end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null }));
      return;
    }

    const server = createServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on('close', () => {
      void transport.close();
      void server.close();
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      if (!res.headersSent) {
        res
          .writeHead(500, { 'content-type': 'application/json' })
          .end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32603, message: (error as Error).message }, id: null }));
      }
    }
  });

  return new Promise((resolve) => http.listen(port, host, () => resolve(http)));
}

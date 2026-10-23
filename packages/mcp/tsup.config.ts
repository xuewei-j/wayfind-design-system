import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', 'core/index': 'src/core/index.ts', bin: 'src/bin.ts' },
  format: ['esm'],
  dts: { entry: { index: 'src/index.ts', 'core/index': 'src/core/index.ts' } },
  clean: true,
  sourcemap: true,
  target: 'node22',
  // Bundle the workspace packages so the server runs on its own (`npx`, Claude Desktop config).
  noExternal: [/^@wayfind\//],
});

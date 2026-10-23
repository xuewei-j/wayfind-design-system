/**
 * Runs axe-core against every story of the built Storybook, in light and dark
 * mode, in a real browser. This catches what jsdom unit tests can't see because
 * they don't apply CSS — e.g. a label hidden with `visibility: hidden` silently
 * removing a button's accessible name.
 *
 *   pnpm build-storybook && pnpm --filter @wayfind/docs audit:a11y
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../storybook-static/', import.meta.url));
const axeSource = await readFile(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  try {
    const body = await readFile(join(root, path.endsWith('/') ? `${path}index.html` : path));
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const index = JSON.parse(await readFile(join(root, 'index.json'), 'utf8'));
const stories = Object.values(index.entries).filter((e) => e.type === 'story');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const failures = [];
for (const mode of ['light', 'dark']) {
  for (const story of stories) {
    await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story&globals=theme:${mode}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#storybook-root > *');
    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run(document.querySelector('#storybook-root'), { resultTypes: ['violations'] });
      return result.violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length}×): ${v.nodes[0].target.join(' ')}`);
    });
    for (const v of violations) failures.push(`${mode} · ${story.title} › ${story.name}: ${v}`);
  }
}

await browser.close();
server.close();

const checked = stories.length * 2;
if (failures.length) {
  console.error(failures.join('\n'));
  console.error(`\n✗ ${failures.length} accessibility violation(s) across ${checked} story renders`);
  process.exit(1);
}
console.log(`✓ No axe violations in ${checked} story renders (${stories.length} stories × light/dark)`);

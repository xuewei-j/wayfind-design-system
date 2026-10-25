/**
 * Packs the publishable packages as tarballs that other projects can install
 * straight from GitHub, without an npm registry:
 *
 *   pnpm build && pnpm release:pack
 *
 * Output goes to .release/<version>/. Commit those files to the `releases`
 * branch under <version>/, and they install from
 *   https://raw.githubusercontent.com/xuewei-j/wayfind-design-system/releases/<version>/<file>.tgz
 *
 * `pnpm pack` turns `workspace:*` into a plain version (`0.1.0`), which would
 * send consumers to the npm registry. So @wayfind/react's dependency on
 * @wayfind/tokens is rewritten to the tokens tarball URL.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const packages = ['tokens', 'react', 'mcp'];
const version = JSON.parse(readFileSync(join(root, 'packages/react/package.json'), 'utf8')).version;
const baseUrl = `https://raw.githubusercontent.com/xuewei-j/wayfind-design-system/releases/${version}`;
const out = join(root, '.release', version);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// Use the pnpm that launched this script when there is one; it may not be on PATH.
const execPath = process.env.npm_execpath;
const pnpm = execPath && /pnpm/.test(execPath) ? [process.execPath, execPath] : ['pnpm'];
for (const name of packages) {
  execFileSync(pnpm[0], [...pnpm.slice(1), 'pack', '--pack-destination', out], { cwd: join(root, 'packages', name), stdio: 'inherit' });
}

const tarball = (name) => `wayfind-${name}-${version}.tgz`;
const files = readdirSync(out);
for (const name of packages) {
  if (!files.includes(tarball(name))) throw new Error(`Expected ${tarball(name)} in ${out}, found: ${files.join(', ')}`);
}

// Point @wayfind/react at the tokens tarball instead of the npm registry.
const work = mkdtempSync(join(tmpdir(), 'wayfind-pack-'));
execFileSync('tar', ['-xzf', join(out, tarball('react')), '-C', work]);
const manifestPath = join(work, 'package', 'package.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.dependencies['@wayfind/tokens'] = `${baseUrl}/${tarball('tokens')}`;
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
execFileSync('tar', ['-czf', join(out, tarball('react')), '-C', work, 'package']);
rmSync(work, { recursive: true, force: true });

console.log(`\nPacked ${packages.length} packages into ${out}`);
for (const name of packages) console.log(`  ${baseUrl}/${tarball(name)}`);

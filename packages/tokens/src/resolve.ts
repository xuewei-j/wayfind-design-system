/**
 * Turns a W3C DTCG token tree into a flat, fully resolved list.
 *
 * Kept dependency-free and pure so the same code runs in the build script,
 * in the browser (Storybook) and inside the MCP server.
 */

export type TokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'number'
  | 'shadow'
  | 'duration'
  | 'cubicBezier';

/** Primitive = raw palette. Semantic = intent-named colors. Scale = space, type, radius, motion… */
export type TokenTier = 'primitive' | 'semantic' | 'scale';

export interface ResolvedValue {
  /** Final value after following every alias, e.g. "#267f8c". */
  value: string;
  /** Token this one points at, if it is an alias, e.g. "palette.orange.600". */
  aliasOf?: string;
}

export interface ResolvedToken extends ResolvedValue {
  /** Dot path, e.g. "color.text.default". */
  name: string;
  /** CSS custom property, e.g. "--wf-color-text-default". */
  cssVar: string;
  type: TokenType;
  tier: TokenTier;
  description?: string;
  /** Dark-mode override, only present on tokens that change between modes. */
  dark?: ResolvedValue;
}

interface RawToken {
  $value: string | number;
  $type?: TokenType;
  $description?: string;
  $extensions?: { 'dev.wayfind'?: { modes?: { dark?: string } } };
}

type RawGroup = { [key: string]: RawGroup | RawToken | string | undefined } & {
  $type?: TokenType;
  $description?: string;
};

const PREFIX = 'wf';
const ALIAS = /^\{([^}]+)\}$/;

export const toCssVar = (name: string): string => `--${PREFIX}-${name.split('.').join('-')}`;

const isToken = (node: unknown): node is RawToken =>
  typeof node === 'object' && node !== null && '$value' in node;

const tierOf = (name: string): TokenTier =>
  name.startsWith('palette.') ? 'primitive' : name.startsWith('color.') ? 'semantic' : 'scale';

interface Flat {
  name: string;
  raw: RawToken;
  type: TokenType;
}

function flatten(group: RawGroup, path: string[] = [], inheritedType?: TokenType): Flat[] {
  const out: Flat[] = [];
  const groupType = group.$type ?? inheritedType;
  for (const [key, child] of Object.entries(group)) {
    if (key.startsWith('$') || child === undefined || typeof child === 'string') continue;
    const childPath = [...path, key];
    if (isToken(child)) {
      const type = child.$type ?? groupType;
      if (!type) throw new Error(`Token "${childPath.join('.')}" has no $type (set it on the token or a parent group).`);
      out.push({ name: childPath.join('.'), raw: child, type });
    } else {
      out.push(...flatten(child as RawGroup, childPath, groupType));
    }
  }
  return out;
}

export function resolveTokens(tree: unknown): ResolvedToken[] {
  const flat = flatten(tree as RawGroup);
  const byName = new Map(flat.map((t) => [t.name, t]));

  const follow = (value: string | number, from: string, seen: string[] = []): ResolvedValue => {
    const str = String(value);
    const match = ALIAS.exec(str);
    if (!match) return { value: str };
    const target = match[1]!;
    if (seen.includes(target)) {
      throw new Error(`Circular alias: ${[...seen, target].join(' → ')}`);
    }
    const next = byName.get(target);
    if (!next) throw new Error(`Token "${from}" references unknown token "{${target}}".`);
    // Aliases always resolve against the base (light) value of their target.
    const resolved = follow(next.raw.$value, target, [...seen, target]);
    return { value: resolved.value, aliasOf: target };
  };

  return flat.map(({ name, raw, type }) => {
    const base = follow(raw.$value, name, [name]);
    const darkRaw = raw.$extensions?.['dev.wayfind']?.modes?.dark;
    const token: ResolvedToken = {
      name,
      cssVar: toCssVar(name),
      type,
      tier: tierOf(name),
      ...base,
    };
    if (raw.$description) token.description = raw.$description;
    if (darkRaw !== undefined) token.dark = follow(darkRaw, name, [name]);
    return token;
  });
}

import { tokens, parseColor, colorDistance, valueIn, type ResolvedToken, type TokenTier, type Mode } from '@wayfind/tokens';

export interface TokenSummary {
  name: string;
  cssVar: string;
  /** Ready to paste: `var(--wf-…)`. */
  usage: string;
  type: string;
  tier: TokenTier;
  value: string;
  darkValue?: string;
  aliasOf?: string;
  description?: string;
}

export const summarize = (t: ResolvedToken): TokenSummary => ({
  name: t.name,
  cssVar: t.cssVar,
  usage: `var(${t.cssVar})`,
  type: t.type,
  tier: t.tier,
  value: t.value,
  ...(t.dark && t.dark.value !== t.value ? { darkValue: t.dark.value } : {}),
  ...(t.aliasOf ? { aliasOf: t.aliasOf } : {}),
  ...(t.description ? { description: t.description } : {}),
});

export interface SearchTokensInput {
  /** Free text ("button background"), a token name ("color.text"), or a color ("#31a3b4"). */
  query?: string;
  type?: string;
  tier?: TokenTier;
  limit?: number;
}

/** Semantic tokens first: they are what product code should use. */
const tierRank: Record<TokenTier, number> = { semantic: 0, scale: 1, primitive: 2 };

export function searchTokens({ query, type, tier, limit = 25 }: SearchTokensInput = {}): TokenSummary[] {
  let pool = tokens.filter((t) => (!type || t.type === type) && (!tier || t.tier === tier));

  const color = query ? parseColor(query) : null;
  if (color) {
    return pool
      .filter((t) => t.type === 'color')
      .map((t) => ({ t, d: Math.min(...(['light', 'dark'] as Mode[]).map((m) => colorDistance(color, parseColor(valueIn(t, m).value)!))) }))
      .sort((a, b) => a.d - b.d || tierRank[a.t.tier] - tierRank[b.t.tier])
      .slice(0, limit)
      .map(({ t }) => summarize(t));
  }

  if (query) {
    const words = query.toLowerCase().split(/[\s.,/-]+/).filter(Boolean);
    pool = pool.filter((t) => {
      const haystack = `${t.name} ${t.description ?? ''} ${t.value} ${t.aliasOf ?? ''}`.toLowerCase().replace(/[.-]/g, ' ');
      return words.every((w) => haystack.includes(w));
    });
  }

  return pool
    .slice()
    .sort((a, b) => tierRank[a.tier] - tierRank[b.tier])
    .slice(0, limit)
    .map(summarize);
}

/** Groups (top two path segments) with counts — a cheap table of contents for agents. */
export function tokenGroups(): Array<{ group: string; count: number; example: string }> {
  const groups = new Map<string, ResolvedToken[]>();
  for (const t of tokens) {
    const key = t.name.split('.').slice(0, 2).join('.');
    groups.set(key, [...(groups.get(key) ?? []), t]);
  }
  return [...groups].map(([group, list]) => ({ group, count: list.length, example: list[0]!.name }));
}

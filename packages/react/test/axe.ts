import axe from 'axe-core';

/**
 * Runs axe-core against a rendered container and returns readable violations.
 * color-contrast is disabled because jsdom doesn't compute styles; contrast is
 * enforced at the token level instead (see @wayfind/tokens contract tests).
 */
export async function axeViolations(container: Element): Promise<string[]> {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
  return results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} node(s))`);
}

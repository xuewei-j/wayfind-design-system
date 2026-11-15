/**
 * Decision patterns: the third layer of the system.
 *
 * Tokens say what things look like. Components say how they are built.
 * A decision pattern records WHEN to use which — the judgment a team would
 * otherwise argue again in every review. It lives in the same registry as the
 * component docs, so Storybook (people) and the MCP server (agents) read one source.
 */
import type { Example } from './meta';

export interface DecisionOption {
  /** What to do, e.g. "On the field". */
  choose: string;
  /** The condition that selects this option. */
  when: string;
  /** Components that implement it. Checked against the component registry in tests. */
  components: string[];
  /** Must use only real components and props, and pass `check_styles` (tested). */
  example?: Example;
}

export interface DecisionPattern {
  /** kebab-case, e.g. "form-errors". */
  id: string;
  status: 'stable' | 'draft';
  /** The question people keep asking, in their words. */
  question: string;
  /** The value the answer follows from. */
  principle: string;
  /** At least two: a pattern exists because there is a choice to make. */
  options: DecisionOption[];
  /** What the pattern rules out, each with its reason. */
  avoid: string[];
  /** Where the edge of the pattern is, and what to do when a case falls outside it. */
  boundary: string;
  /** Other pattern ids worth reading next. */
  related?: string[];
}

/**
 * A recorded exception: a place where the system deliberately breaks one of its own rules.
 *
 * An exception has to answer three questions: why the rule doesn't fit here,
 * whether this is a one-off or a sign the system should change, and what to do
 * the next time a similar case shows up.
 */
export interface DecisionException {
  /** "EX-001". Cite it where the rule is broken: `wayfind-ignore EX-001`. */
  id: string;
  /** The rule being broken, in one sentence. */
  rule: string;
  /** The decision pattern it belongs to, when there is one. */
  pattern?: string;
  where: string;
  what: string;
  why: string;
  /** one-off = this place only. standing = allowed wherever the same condition holds. */
  scope: 'one-off' | 'standing';
  /**
   * kept = stays an exception.
   * declined = it was asked for and refused.
   * promoted = the pattern was updated to cover it, and the exception retired.
   */
  outcome: 'kept' | 'declined' | 'promoted';
  /** What the system changed because of it, if anything. */
  changed?: string;
  /** The judgment to reuse next time. */
  nextTime: string;
  /** Components and tokens it touches. Checked against both registries in tests. */
  affects: string[];
  /**
   * A contrast claim the exception depends on. Tests re-measure it, so an
   * exception that is no longer true fails the build instead of going stale.
   */
  evidence?: { foreground: string; background: string; below: number };
  /** ISO date the exception entered the system. */
  recorded: string;
}

export const defineDecision = (pattern: DecisionPattern): DecisionPattern => pattern;

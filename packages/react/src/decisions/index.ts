import type { DecisionPattern } from '../decision';
import { formErrors } from './form-errors';
import { feedbackLoudness } from './feedback-loudness';
import { actionHierarchy } from './action-hierarchy';
import { asyncActions } from './async-actions';
import { emptyStates } from './empty-states';
import { emphasisColor } from './emphasis-color';
import { contrastFloors } from './contrast-floors';

/** Every decision pattern, in the order the docs show them. */
export const decisions: readonly DecisionPattern[] = [
  formErrors,
  feedbackLoudness,
  actionHierarchy,
  asyncActions,
  emptyStates,
  emphasisColor,
  contrastFloors,
];

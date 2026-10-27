import type { ExperimentStep, UserAction } from '@/types/experiment';

export interface ValidationResult {
  valid: boolean;
  message: string;
  partialCredit?: boolean;
}

export function validateStepAction(step: ExperimentStep, action: UserAction): ValidationResult {
  const rule = step.validation;

  // 1. Check action type
  if (action.type !== rule.requiredAction) {
    return {
      valid: false,
      message: rule.errorMessage || `Expected action "${rule.requiredAction}", but received "${action.type}".`,
    };
  }

  // 2. Check target ID if specified
  if (rule.requiredTargetId && action.targetId !== rule.requiredTargetId) {
    return {
      valid: false,
      message: rule.errorMessage || `Please interact with ${rule.requiredTargetId}.`,
    };
  }

  // 3. Check value range if specified
  if (rule.valueRange && typeof action.value === 'number') {
    const [min, max] = rule.valueRange;
    if (action.value < min || action.value > max) {
      return {
        valid: false,
        message: `Value ${action.value} is outside the acceptable range of ${min} to ${max}.`,
      };
    }
  }

  return {
    valid: true,
    message: step.observation || 'Action successfully completed!',
  };
}

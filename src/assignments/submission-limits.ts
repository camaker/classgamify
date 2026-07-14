export const ASSIGNMENT_SUBMISSION_ANSWER_LIMITS = {
  answerMaxLength: 500,
  itemIdMaxLength: 120,
  maxAnswers: 200,
} as const;

export const ASSIGNMENT_SUBMISSION_IDENTITY_LIMITS = {
  anonymousTokenMaxLength: 120,
  anonymousTokenMinLength: 12,
  studentNameMaxLength: 80,
} as const;

export const ASSIGNMENT_SUBMISSION_KEY_LIMITS = {
  maxLength: 80,
  minLength: 16,
} as const;

export const ASSIGNMENT_SUBMISSION_DURATION_RANGE = {
  max: 24 * 60 * 60,
  min: 0,
} as const;

import type { AssignmentSettings } from '@/activities/types';
import { ASSIGNMENT_MANAGED_STATUSES } from '@/assignments/lifecycle';
import { z } from 'zod';

export const defaultAssignmentSettings: AssignmentSettings = {
  collectStudentName: true,
  maxAttempts: 2,
  showCorrectAnswers: true,
  shuffleItems: true,
};

export const ASSIGNMENT_MAX_ATTEMPTS_RANGE = {
  max: 10,
  min: 1,
} as const;

export const ASSIGNMENT_TIME_LIMIT_SECONDS_RANGE = {
  max: 3 * 60 * 60,
  min: 60,
} as const;

export const ASSIGNMENT_TIME_LIMIT_MINUTES_RANGE = {
  max: ASSIGNMENT_TIME_LIMIT_SECONDS_RANGE.max / 60,
  min: ASSIGNMENT_TIME_LIMIT_SECONDS_RANGE.min / 60,
} as const;

const assignmentInstructionsSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim().length === 0 ? undefined : value,
  z.string().trim().max(500).optional()
);

const assignmentLimitedMaxAttemptsSchema = z
  .number()
  .int()
  .min(ASSIGNMENT_MAX_ATTEMPTS_RANGE.min)
  .max(ASSIGNMENT_MAX_ATTEMPTS_RANGE.max);

const assignmentMaxAttemptsSchema = assignmentLimitedMaxAttemptsSchema
  .nullable()
  .optional();

const assignmentTimeLimitSecondsSchema = z
  .number()
  .int()
  .min(ASSIGNMENT_TIME_LIMIT_SECONDS_RANGE.min)
  .max(ASSIGNMENT_TIME_LIMIT_SECONDS_RANGE.max)
  .optional();

export function resolveAssignmentSettings(
  settings?: Partial<AssignmentSettings> | null
): AssignmentSettings {
  const source: Partial<AssignmentSettings> =
    settings && typeof settings === 'object' ? settings : {};

  return {
    collectStudentName: resolveBooleanSetting(
      source.collectStudentName,
      defaultAssignmentSettings.collectStudentName
    ),
    instructions: resolveOptionalStringSetting(source.instructions),
    maxAttempts: resolveMaxAttemptsSetting(source),
    showCorrectAnswers: resolveBooleanSetting(
      source.showCorrectAnswers,
      defaultAssignmentSettings.showCorrectAnswers
    ),
    shuffleItems: resolveBooleanSetting(
      source.shuffleItems,
      defaultAssignmentSettings.shuffleItems
    ),
    timeLimitSeconds: resolveOptionalNumberSetting(
      source.timeLimitSeconds,
      undefined,
      assignmentTimeLimitSecondsSchema
    ),
  };
}

const assignmentSettingsSchema = z.object({
  collectStudentName: z.boolean().default(true),
  instructions: assignmentInstructionsSchema,
  maxAttempts: assignmentMaxAttemptsSchema,
  showCorrectAnswers: z.boolean().default(true),
  shuffleItems: z.boolean().default(true),
  timeLimitSeconds: assignmentTimeLimitSecondsSchema,
});

export const publishAssignmentInputSchema = z.object({
  activityId: z.string().min(1),
  expiresAt: z.string().datetime().optional(),
  settings: assignmentSettingsSchema.default(defaultAssignmentSettings),
  title: z.string().trim().min(3).max(120),
});

export const updateAssignmentStatusInputSchema = z.object({
  assignmentId: z.string().min(1),
  status: z.enum(ASSIGNMENT_MANAGED_STATUSES),
});

export type PublishAssignmentInput = z.infer<
  typeof publishAssignmentInputSchema
>;

export type UpdateAssignmentStatusInput = z.infer<
  typeof updateAssignmentStatusInputSchema
>;

function resolveBooleanSetting(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function resolveOptionalStringSetting(value: unknown) {
  const result = assignmentInstructionsSchema.safeParse(value);
  return result.success ? result.data : undefined;
}

function resolveOptionalNumberSetting(
  value: unknown,
  fallback: number | undefined,
  schema: typeof assignmentTimeLimitSecondsSchema
) {
  const result = schema.safeParse(value);
  return result.success ? (result.data ?? fallback) : fallback;
}

function resolveMaxAttemptsSetting(source: Partial<AssignmentSettings>) {
  if (!Object.hasOwn(source, 'maxAttempts')) {
    return defaultAssignmentSettings.maxAttempts;
  }

  const value = source.maxAttempts;
  if (value === null) return null;
  if (value === undefined) return defaultAssignmentSettings.maxAttempts;

  const result = assignmentLimitedMaxAttemptsSchema.safeParse(value);
  return result.success ? result.data : defaultAssignmentSettings.maxAttempts;
}

import type { AssignmentSettings } from '@/activities/types';
import { z } from 'zod';

export const defaultAssignmentSettings: AssignmentSettings = {
  collectStudentName: true,
  maxAttempts: 2,
  showCorrectAnswers: true,
  shuffleItems: true,
};

const assignmentInstructionsSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && value.trim().length === 0 ? undefined : value,
  z.string().trim().max(500).optional()
);

const assignmentMaxAttemptsSchema = z.number().int().min(1).max(10).optional();

const assignmentTimeLimitSecondsSchema = z
  .number()
  .int()
  .min(60)
  .max(3 * 60 * 60)
  .optional();

export function resolveAssignmentSettings(
  settings?: Partial<AssignmentSettings> | null
): AssignmentSettings {
  const source = settings && typeof settings === 'object' ? settings : {};

  return {
    collectStudentName: resolveBooleanSetting(
      source.collectStudentName,
      defaultAssignmentSettings.collectStudentName
    ),
    instructions: resolveOptionalStringSetting(source.instructions),
    maxAttempts: resolveOptionalNumberSetting(
      source.maxAttempts,
      defaultAssignmentSettings.maxAttempts,
      assignmentMaxAttemptsSchema
    ),
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

export const assignmentSettingsSchema = z.object({
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
  status: z.enum(['published', 'closed']),
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
  schema: typeof assignmentMaxAttemptsSchema
) {
  const result = schema.safeParse(value);
  return result.success ? (result.data ?? fallback) : fallback;
}

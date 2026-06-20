import type { AssignmentSettings } from '@/activities/types';
import { z } from 'zod';

export const defaultAssignmentSettings: AssignmentSettings = {
  collectStudentName: true,
  maxAttempts: 2,
  showCorrectAnswers: true,
  shuffleItems: true,
};

export const assignmentSettingsSchema = z.object({
  collectStudentName: z.boolean().default(true),
  instructions: z.string().trim().max(500).optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),
  showCorrectAnswers: z.boolean().default(true),
  shuffleItems: z.boolean().default(true),
  timeLimitSeconds: z
    .number()
    .int()
    .min(60)
    .max(3 * 60 * 60)
    .optional(),
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

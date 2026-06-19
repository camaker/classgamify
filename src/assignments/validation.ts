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
  maxAttempts: z.number().int().min(1).max(10).optional(),
  showCorrectAnswers: z.boolean().default(true),
  shuffleItems: z.boolean().default(true),
});

export const publishAssignmentInputSchema = z.object({
  activityId: z.string().min(1),
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

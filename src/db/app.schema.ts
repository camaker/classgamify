/**
 * Application database schema (non-auth tables).
 * Add your app tables here; keep Better Auth tables in auth.schema.ts.
 */

import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';
import type {
  ActivityContent,
  ActivityTemplateType,
  ActivityVisibility,
  AssignmentSettings,
  AssignmentStatus,
  AttemptAnswers,
  AttemptResult,
} from '@/activities/types';
import type {
  PaymentScene,
  PaymentStatus,
  PaymentType,
  PlanInterval,
} from '@/payment/types';

/** 
 * Payment: subscription and one-time 
 */
export const payment = sqliteTable(
  'payment',
  {
    id: text('id').primaryKey(),
    priceId: text('price_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    customerId: text('customer_id').notNull(),
    subscriptionId: text('subscription_id'),
    sessionId: text('session_id'),
    invoiceId: text('invoice_id').unique(),
    type: text('type').notNull().$type<PaymentType>(), // 'subscription' | 'one_time'
    scene: text('scene').$type<PaymentScene>(), // 'subscription' | 'lifetime'
    interval: text('interval').$type<PlanInterval>(), // 'month' | 'year'
    status: text('status').notNull().$type<PaymentStatus>(),
    paid: integer('paid', { mode: 'boolean' }).notNull().default(false),
    periodStart: integer('period_start', { mode: 'timestamp_ms' }),
    periodEnd: integer('period_end', { mode: 'timestamp_ms' }),
    cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }),
    trialStart: integer('trial_start', { mode: 'timestamp_ms' }),
    trialEnd: integer('trial_end', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('payment_user_id_idx').on(table.userId),
    index('payment_customer_id_idx').on(table.customerId),
    index('payment_subscription_id_idx').on(table.subscriptionId),
    index('payment_session_id_idx').on(table.sessionId),
    index('payment_invoice_id_idx').on(table.invoiceId),
    index('payment_paid_idx').on(table.paid),
    index('payment_user_paid_idx').on(table.userId, table.paid),
    index('payment_user_paid_created_idx').on(
      table.userId,
      table.paid,
      table.createdAt
    ),
  ]
);

export const paymentRelations = relations(payment, ({ one }) => ({
  user: one(user, { fields: [payment.userId], references: [user.id] }),
}));

/**
 * User files
 * metadata for files uploaded to R2 (path userfiles/{userId}/xxx);
 * filename = stored name on R2 (e.g. uuid.ext);
 * originalName = user's file name.
 */
export const userFiles = sqliteTable(
  'user_files',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    filename: text('filename').notNull(),
    originalName: text('original_name').notNull(),
    contentType: text('content_type').notNull(),
    size: integer('size').notNull(),
    r2Key: text('r2_key').notNull(),
    isPublic: integer('is_public', { mode: 'boolean' }),
    description: text('description'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('user_files_user_id_idx').on(table.userId),
    index('user_files_user_created_idx').on(table.userId, table.createdAt),
    index('user_files_r2_key_idx').on(table.r2Key),
  ]
);

export const userFilesRelations = relations(userFiles, ({ one }) => ({
  user: one(user, {
    fields: [userFiles.userId],
    references: [user.id],
  }),
}));

/**
 * Activity definitions owned by teachers.
 * contentJson is intentionally template-neutral so one lesson can render as
 * quiz, match-up, group sort, fill-blank, and later game templates.
 */
export const activity = sqliteTable(
  'activity',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    templateType: text('template_type').notNull().$type<ActivityTemplateType>(),
    contentJson: text('content_json', { mode: 'json' })
      .notNull()
      .$type<ActivityContent>(),
    derivationSourceActivityId: text('derivation_source_activity_id'),
    derivationSourceUpdatedAt: integer('derivation_source_updated_at', {
      mode: 'timestamp_ms',
    }),
    visibility: text('visibility')
      .notNull()
      .$type<ActivityVisibility>()
      .default('draft'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('activity_owner_id_idx').on(table.ownerId),
    index('activity_template_type_idx').on(table.templateType),
    index('activity_visibility_idx').on(table.visibility),
    index('activity_owner_updated_idx').on(table.ownerId, table.updatedAt),
    index('activity_owner_visibility_updated_idx').on(
      table.ownerId,
      table.visibility,
      table.updatedAt
    ),
    index('activity_owner_template_updated_idx').on(
      table.ownerId,
      table.templateType,
      table.updatedAt
    ),
  ]
);

export const activityRelations = relations(activity, ({ many, one }) => ({
  owner: one(user, { fields: [activity.ownerId], references: [user.id] }),
  assignments: many(assignment),
}));

/**
 * Published delivery instances. One activity can be assigned many times with
 * different settings, share slugs, due windows, or classroom instructions.
 */
export const assignment = sqliteTable(
  'assignment',
  {
    id: text('id').primaryKey(),
    activityId: text('activity_id')
      .notNull()
      .references(() => activity.id, { onDelete: 'cascade' }),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    shareSlug: text('share_slug').notNull().unique(),
    title: text('title').notNull(),
    settingsJson: text('settings_json', { mode: 'json' })
      .notNull()
      .$type<AssignmentSettings>(),
    status: text('status')
      .notNull()
      .$type<AssignmentStatus>()
      .default('draft'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
  },
  (table) => [
    index('assignment_activity_id_idx').on(table.activityId),
    index('assignment_owner_id_idx').on(table.ownerId),
    index('assignment_owner_updated_idx').on(table.ownerId, table.updatedAt),
    index('assignment_owner_status_updated_idx').on(
      table.ownerId,
      table.status,
      table.updatedAt
    ),
    index('assignment_owner_status_expires_updated_idx').on(
      table.ownerId,
      table.status,
      table.expiresAt,
      table.updatedAt
    ),
    index('assignment_share_slug_idx').on(table.shareSlug),
    index('assignment_status_idx').on(table.status),
  ]
);

/**
 * Immutable content snapshot captured when a teacher publishes an assignment.
 * Activity edits should affect future assignments, not already shared links.
 */
export const assignmentSnapshot = sqliteTable(
  'assignment_snapshot',
  {
    assignmentId: text('assignment_id')
      .primaryKey()
      .references(() => assignment.id, { onDelete: 'cascade' }),
    activityTitle: text('activity_title').notNull(),
    activityDescription: text('activity_description'),
    templateType: text('template_type').notNull().$type<ActivityTemplateType>(),
    contentJson: text('content_json', { mode: 'json' })
      .notNull()
      .$type<ActivityContent>(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('assignment_snapshot_template_type_idx').on(table.templateType),
  ]
);

export const assignmentRelations = relations(
  assignment,
  ({ many, one }) => ({
    activity: one(activity, {
      fields: [assignment.activityId],
      references: [activity.id],
    }),
    owner: one(user, { fields: [assignment.ownerId], references: [user.id] }),
    snapshot: one(assignmentSnapshot, {
      fields: [assignment.id],
      references: [assignmentSnapshot.assignmentId],
    }),
    attempts: many(attempt),
  })
);

export const assignmentSnapshotRelations = relations(
  assignmentSnapshot,
  ({ one }) => ({
    assignment: one(assignment, {
      fields: [assignmentSnapshot.assignmentId],
      references: [assignment.id],
    }),
  })
);

/**
 * Student completion sessions. Student identity can stay lightweight for v1:
 * either a typed display name or an anonymous classroom token.
 */
export const attempt = sqliteTable(
  'attempt',
  {
    id: text('id').primaryKey(),
    assignmentId: text('assignment_id')
      .notNull()
      .references(() => assignment.id, { onDelete: 'cascade' }),
    studentName: text('student_name'),
    anonymousToken: text('anonymous_token'),
    submissionKey: text('submission_key'),
    identityKey: text('identity_key'),
    attemptNumber: integer('attempt_number'),
    score: integer('score'),
    maxScore: integer('max_score'),
    answersJson: text('answers_json', { mode: 'json' })
      .notNull()
      .$type<AttemptAnswers>(),
    resultJson: text('result_json', { mode: 'json' }).$type<AttemptResult>(),
    startedAt: integer('started_at', { mode: 'timestamp_ms' }).notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
  },
  (table) => [
    index('attempt_assignment_id_idx').on(table.assignmentId),
    index('attempt_assignment_completed_idx').on(
      table.assignmentId,
      table.completedAt
    ),
    index('attempt_assignment_anonymous_token_idx').on(
      table.assignmentId,
      table.anonymousToken
    ),
    index('attempt_assignment_student_name_idx').on(
      table.assignmentId,
      table.studentName
    ),
    uniqueIndex('attempt_assignment_submission_key_unique').on(
      table.assignmentId,
      table.submissionKey
    ),
    uniqueIndex('attempt_assignment_identity_number_unique').on(
      table.assignmentId,
      table.identityKey,
      table.attemptNumber
    ),
    index('attempt_anonymous_token_idx').on(table.anonymousToken),
    index('attempt_completed_at_idx').on(table.completedAt),
  ]
);

export const attemptRelations = relations(attempt, ({ one }) => ({
  assignment: one(assignment, {
    fields: [attempt.assignmentId],
    references: [assignment.id],
  }),
}));

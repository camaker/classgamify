import { getDb } from '@/db';
import {
  assertPlanAllows,
  getPlanUsageSnapshot,
  recordAiDraftUsage,
} from '@/payment/plan-entitlements-server';
import type { PlanUsageKind } from '@/payment/plan-entitlements';

/**
 * Worker-runtime bindings for plan checks. Server functions that do not
 * otherwise touch the database (such as AI drafts) call these so they never
 * import the D1 client directly.
 */
export function assertPlanAllowsForUser(kind: PlanUsageKind, userId: string) {
  return assertPlanAllows(kind, userId, { db: getDb() });
}

export function recordAiDraftUsageForUser(userId: string) {
  return recordAiDraftUsage(userId, { db: getDb() });
}

export function getPlanUsageSnapshotForUser(userId: string) {
  return getPlanUsageSnapshot(userId, { db: getDb() });
}

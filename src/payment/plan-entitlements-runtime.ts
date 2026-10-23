import { getDb } from '@/db';
import {
  getPlanUsageSnapshot,
  releaseAiDraftReservation,
  reserveAiDraft,
} from '@/payment/plan-entitlements-server';

/**
 * Worker-runtime bindings for plan checks. Server functions that do not
 * otherwise touch the database (AI drafts, plan usage) call these so they
 * never import the D1 client directly.
 */
export function getPlanUsageSnapshotForUser(userId: string) {
  return getPlanUsageSnapshot(userId, { db: getDb() });
}

export function reserveAiDraftForUser(userId: string) {
  return reserveAiDraft(userId, { db: getDb() });
}

/**
 * Gives a reserved AI draft back. A failure here only means the teacher is
 * charged one draft too many this month, so it is logged and never thrown:
 * the draft (or the original error) must still reach the teacher.
 */
export async function releaseAiDraftReservationSafely(reservationId: string) {
  try {
    await releaseAiDraftReservation(reservationId, { db: getDb() });
  } catch (error) {
    console.error('Failed to release AI draft reservation', error);
  }
}

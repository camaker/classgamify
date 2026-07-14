import type { StudentIdentitySource } from '@/assignments/identity';
import { buildStudentIdentityGroupingKey } from '@/assignments/identity';
import {
  canUseAnotherAssignmentAttempt,
  normalizeAssignmentMaxAttempts,
} from '@/assignments/attempt-limits';

export const ATTEMPT_LIMIT_CONCURRENCY_STAGES = [
  stage('normalized-max-attempts', 'domain'),
  stage('normalized-student-identity', 'domain'),
  stage('unlimited-slot-bypass', 'domain'),
  stage('previous-attempt-count', 'domain'),
  stage('attempt-limit-decision', 'domain'),
  stage('next-attempt-number', 'domain'),
  stage('identity-slot-shape', 'domain'),
  stage('bounded-conflict-retry', 'domain'),
  stage('nullable-history-compatibility', 'database'),
  stage('identity-key-column', 'database'),
  stage('attempt-number-column', 'database'),
  stage('assignment-identity-slot-index', 'database'),
  stage('assignment-scoped-uniqueness', 'database'),
  stage('sqlite-slot-conflict', 'database'),
  stage('submission-key-replay-first', 'server'),
  stage('new-submit-lifecycle-gate', 'server'),
  stage('runtime-answer-validation', 'server'),
  stage('deterministic-score-once', 'server'),
  stage('slot-reservation-call', 'server'),
  stage('scored-attempt-slot-insert', 'server'),
  stage('successful-slot-response', 'server'),
  stage('submission-replay-after-conflict', 'server'),
  stage('occupied-slot-query', 'server'),
  stage('attempt-count-refresh', 'server'),
  stage('attempt-limit-error', 'server'),
  stage('shared-public-result-response', 'server'),
  stage('identity-key-private-metadata', 'privacy'),
  stage('attempt-number-private-metadata', 'privacy'),
  stage('teacher-export-boundary', 'privacy'),
  stage('public-payload-boundary', 'privacy'),
] as const;

export type AttemptIdentitySlot = {
  attemptNumber: number | null;
  identityKey: string | null;
};

export type AttemptSlotReservation<TReplay> =
  | {
      previousAttemptCount: number;
      slot: AttemptIdentitySlot;
      type: 'inserted';
    }
  | {
      type: 'limit-reached';
    }
  | {
      replay: TReplay;
      type: 'replay';
    };

export async function persistAttemptWithinIdentityLimit<TReplay>({
  countPreviousAttempts,
  identity,
  insertAttempt,
  isSlotConflict,
  isSlotOccupied,
  maxAttempts,
  recoverReplay,
}: {
  countPreviousAttempts: () => Promise<number>;
  identity: StudentIdentitySource;
  insertAttempt: (slot: AttemptIdentitySlot) => Promise<void>;
  isSlotConflict: (error: unknown) => boolean;
  isSlotOccupied: (slot: AttemptIdentitySlot) => Promise<boolean>;
  maxAttempts?: number | null;
  recoverReplay: () => Promise<TReplay | null>;
}): Promise<AttemptSlotReservation<TReplay>> {
  const normalizedMaxAttempts = normalizeAssignmentMaxAttempts(maxAttempts);
  if (normalizedMaxAttempts === undefined) {
    const slot = buildAttemptIdentitySlot({ identity, maxAttempts: null });
    try {
      await insertAttempt(slot);
      return { previousAttemptCount: 0, slot, type: 'inserted' };
    } catch (error) {
      const replay = await recoverReplay();
      if (replay !== null) return { replay, type: 'replay' };
      throw error;
    }
  }

  for (let retry = 0; retry < normalizedMaxAttempts; retry += 1) {
    const previousAttemptCount = await countPreviousAttempts();
    if (
      !canUseAnotherAssignmentAttempt({
        maxAttempts: normalizedMaxAttempts,
        usedAttempts: previousAttemptCount,
      })
    ) {
      return { type: 'limit-reached' };
    }

    const slot = buildAttemptIdentitySlot({
      identity,
      maxAttempts: normalizedMaxAttempts,
      previousAttemptCount,
    });
    try {
      await insertAttempt(slot);
      return { previousAttemptCount, slot, type: 'inserted' };
    } catch (error) {
      const replay = await recoverReplay();
      if (replay !== null) return { replay, type: 'replay' };
      if (!isSlotConflict(error)) throw error;
      if (!(await isSlotOccupied(slot))) throw error;
    }
  }

  return { type: 'limit-reached' };
}

export function buildAttemptIdentitySlot({
  identity,
  maxAttempts,
  previousAttemptCount = 0,
}: {
  identity: StudentIdentitySource;
  maxAttempts?: number | null;
  previousAttemptCount?: number;
}): AttemptIdentitySlot {
  if (normalizeAssignmentMaxAttempts(maxAttempts) === undefined) {
    return { attemptNumber: null, identityKey: null };
  }

  return {
    attemptNumber: Math.max(0, Math.trunc(previousAttemptCount)) + 1,
    identityKey: buildStudentIdentityGroupingKey(identity),
  };
}

function stage(
  id: string,
  layer: 'database' | 'domain' | 'privacy' | 'server'
) {
  return { id, layer };
}

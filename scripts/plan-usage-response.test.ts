import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPlanUsageMeter } from '@/payment/plan-entitlements';
import { parsePlanUsageResponse } from '@/payment/plan-usage-response';

const validUsage = {
  meters: {
    activities: buildPlanUsageMeter({ kind: 'activities', limit: 15, used: 3 }),
    aiDrafts: buildPlanUsageMeter({ kind: 'aiDrafts', limit: 10, used: 2 }),
    openAssignments: buildPlanUsageMeter({
      kind: 'openAssignments',
      limit: null,
      used: 1,
    }),
  },
  planId: 'free',
  state: 'free',
};

test('plan usage accepts complete usage without inventing limits or counts', () => {
  assert.deepEqual(parsePlanUsageResponse(validUsage), validUsage);
});

test('auth errors and malformed usage cannot become successful query data', () => {
  for (const payload of [
    { error: 'Unauthorized' },
    Response.json({ error: 'Unauthorized' }, { status: 401 }),
    { error: 'Email not verified', code: 'email_not_verified' },
    { ...validUsage, meters: undefined },
    { ...validUsage, meters: { ...validUsage.meters, activities: undefined } },
    {
      ...validUsage,
      meters: { ...validUsage.meters, activities: validUsage.meters.aiDrafts },
    },
    {
      ...validUsage,
      meters: {
        ...validUsage.meters,
        activities: { ...validUsage.meters.activities, used: Number.NaN },
      },
    },
  ]) {
    assert.throws(() => parsePlanUsageResponse(payload));
  }
});

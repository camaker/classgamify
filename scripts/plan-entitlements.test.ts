import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { activity, aiDraftUsage, assignment, payment } from '@/db/app.schema';
import { user } from '@/db/auth.schema';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import {
  buildPlanUsageMeter,
  type EntitlementPaymentRecord,
  formatPlanLimitErrorMessage,
  getAiDraftWindowStart,
  getPlanLimitCopyParams,
  PAST_DUE_GRACE_DAYS,
  PLAN_LIMITS,
  parsePlanLimitError,
  resolveEntitlementPlan,
  wouldExceedPlanLimit,
} from '@/payment/plan-entitlements';
import {
  assertPlanAllows,
  getPlanUsageSnapshot,
  releaseAiDraftReservation,
  reserveAiDraft,
} from '@/payment/plan-entitlements-server';
import {
  buildPlanLimitReachedMessage,
  buildPlanUsageCardView,
  getPlanUsageMeterStatus,
} from '@/payment/plan-usage-view';
import { resolveCurrentBillingPlan } from '@/payment/current-plan';
import type { PricePlan } from '@/payment/types';
import { drizzle } from 'drizzle-orm/sqlite-proxy';

overwriteGetLocale(() => 'en');

const NOW = new Date('2026-10-15T12:00:00.000Z');
const DAY = 24 * 60 * 60 * 1000;

/** Plan resolution without the source record, for compact assertions. */
function plan(
  records: EntitlementPaymentRecord[],
  now: Date = NOW
): Omit<ReturnType<typeof resolveEntitlementPlan>, 'record'> {
  const { record: _record, ...rest } = resolveEntitlementPlan(records, now);
  return rest;
}

function subscription(
  overrides: Partial<EntitlementPaymentRecord> = {}
): EntitlementPaymentRecord {
  return {
    cancelAtPeriodEnd: false,
    paid: true,
    periodEnd: new Date(NOW.getTime() + 20 * DAY),
    priceId: 'price_pro_monthly',
    scene: 'subscription',
    status: 'active',
    type: 'subscription',
    ...overrides,
  };
}

test('no payments, unpaid rows, and dead statuses resolve to the free plan', () => {
  assert.deepEqual(plan([]), {
    planId: 'free',
    state: 'free',
  });
  for (const status of [
    'incomplete',
    'incomplete_expired',
    'unpaid',
    'paused',
    'failed',
  ]) {
    assert.equal(
      resolveEntitlementPlan([subscription({ status })], NOW).planId,
      'free',
      status
    );
  }
  assert.equal(
    resolveEntitlementPlan([subscription({ paid: false })], NOW).planId,
    'free'
  );
});

test('active and trialing subscriptions grant Teacher Pro, even for unknown price ids', () => {
  assert.deepEqual(plan([subscription()]), {
    planId: 'pro',
    state: 'subscribed',
  });
  assert.equal(
    resolveEntitlementPlan([subscription({ status: 'trialing' })], NOW).planId,
    'pro'
  );
  assert.equal(
    resolveEntitlementPlan(
      [subscription({ priceId: 'price_retired_2025' })],
      NOW
    ).planId,
    'pro'
  );
});

test('cancel at period end keeps Teacher Pro until the period ends', () => {
  const periodEnd = new Date(NOW.getTime() + 3 * DAY);
  assert.deepEqual(
    plan([subscription({ cancelAtPeriodEnd: true, periodEnd })]),
    {
      accessEndsAt: periodEnd,
      planId: 'pro',
      state: 'cancel-scheduled',
    }
  );
  assert.equal(
    plan([
      subscription({ cancelAtPeriodEnd: true, periodEnd, status: 'canceled' }),
    ]).planId,
    'pro'
  );
  assert.equal(
    plan([
      subscription({
        cancelAtPeriodEnd: true,
        periodEnd: new Date(NOW.getTime() - DAY),
        status: 'canceled',
      }),
    ]).planId,
    'free'
  );
});

test('a scheduled cancellation whose period already ended is free (missed webhook)', () => {
  assert.equal(
    plan([
      subscription({
        cancelAtPeriodEnd: true,
        periodEnd: new Date(NOW.getTime() - DAY),
        status: 'active',
      }),
    ]).planId,
    'free'
  );
});

test('an immediate cancellation or refund ends access now', () => {
  assert.equal(
    plan([
      subscription({
        cancelAtPeriodEnd: false,
        periodEnd: new Date(NOW.getTime() + 20 * DAY),
        status: 'canceled',
      }),
    ]).planId,
    'free'
  );
});

test('past due subscriptions keep Teacher Pro only during the grace window', () => {
  const periodEnd = new Date(NOW.getTime() - 2 * DAY);
  const withinGrace = resolveEntitlementPlan(
    [subscription({ periodEnd, status: 'past_due' })],
    NOW
  );
  assert.equal(withinGrace.planId, 'pro');
  assert.equal(withinGrace.state, 'past-due');
  assert.equal(
    withinGrace.accessEndsAt?.getTime(),
    periodEnd.getTime() + PAST_DUE_GRACE_DAYS * DAY
  );
  assert.equal(
    resolveEntitlementPlan(
      [
        subscription({
          periodEnd: new Date(NOW.getTime() - (PAST_DUE_GRACE_DAYS + 1) * DAY),
          status: 'past_due',
        }),
      ],
      NOW
    ).planId,
    'free'
  );
  assert.equal(
    resolveEntitlementPlan(
      [subscription({ periodEnd: null, status: 'past_due' })],
      NOW
    ).planId,
    'free'
  );
});

test('past due grace starts when the failure was recorded, even if periodEnd moves', () => {
  const movedPeriodEnd = new Date(NOW.getTime() + 25 * DAY);
  assert.equal(
    plan([
      subscription({
        periodEnd: movedPeriodEnd,
        status: 'past_due',
        updatedAt: new Date(NOW.getTime() - (PAST_DUE_GRACE_DAYS + 1) * DAY),
      }),
    ]).planId,
    'free'
  );
  const recent = plan([
    subscription({
      periodEnd: movedPeriodEnd,
      status: 'past_due',
      updatedAt: new Date(NOW.getTime() - 2 * DAY),
    }),
  ]);
  assert.equal(recent.planId, 'pro');
  assert.equal(
    recent.accessEndsAt?.getTime(),
    NOW.getTime() - 2 * DAY + PAST_DUE_GRACE_DAYS * DAY
  );
});

test('a completed lifetime payment wins and never expires', () => {
  const lifetime: EntitlementPaymentRecord = {
    paid: true,
    priceId: 'price_lifetime',
    scene: 'lifetime',
    status: 'completed',
    type: 'one_time',
  };
  assert.deepEqual(plan([subscription({ status: 'past_due' }), lifetime]), {
    planId: 'lifetime',
    state: 'lifetime',
  });
  assert.equal(
    resolveEntitlementPlan([{ ...lifetime, status: 'processing' }], NOW).planId,
    'free'
  );
});

test('open-ended access beats access that is scheduled to end', () => {
  const resolved = resolveEntitlementPlan(
    [
      subscription({
        cancelAtPeriodEnd: true,
        periodEnd: new Date(NOW.getTime() + DAY),
      }),
      subscription(),
    ],
    NOW
  );
  assert.equal(resolved.state, 'subscribed');
});

test('plan limits keep the full loop free and only cap creation', () => {
  assert.deepEqual(PLAN_LIMITS.free, {
    activities: 15,
    aiDrafts: 10,
    openAssignments: 3,
  });
  assert.equal(PLAN_LIMITS.pro.activities, null);
  assert.equal(PLAN_LIMITS.pro.openAssignments, null);
  assert.equal(PLAN_LIMITS.lifetime.activities, null);
  assert.ok((PLAN_LIMITS.pro.aiDrafts ?? 0) > PLAN_LIMITS.free.aiDrafts);
  assert.deepEqual(getPlanLimitCopyParams(), {
    activities: 15,
    aiDrafts: 10,
    openAssignments: 3,
    paidAiDrafts: 300,
  });
});

test('meters, limit checks, and the AI window are deterministic', () => {
  assert.deepEqual(
    buildPlanUsageMeter({ kind: 'activities', limit: 15, used: 15 }),
    { kind: 'activities', limit: 15, reached: true, remaining: 0, used: 15 }
  );
  assert.deepEqual(
    buildPlanUsageMeter({ kind: 'activities', limit: null, used: 99 }),
    {
      kind: 'activities',
      limit: null,
      reached: false,
      remaining: null,
      used: 99,
    }
  );
  assert.equal(wouldExceedPlanLimit({ limit: 3, used: 2 }), false);
  assert.equal(wouldExceedPlanLimit({ limit: 3, used: 3 }), true);
  assert.equal(wouldExceedPlanLimit({ limit: null, used: 1000 }), false);
  assert.equal(
    getAiDraftWindowStart(NOW).toISOString(),
    '2026-10-01T00:00:00.000Z'
  );
  assert.equal(
    getPlanUsageMeterStatus(
      buildPlanUsageMeter({ kind: 'aiDrafts', limit: 10, used: 8 })
    ),
    'near'
  );
});

test('plan-limit errors round-trip through a plain message', () => {
  const message = formatPlanLimitErrorMessage('openAssignments', 'Close one.');
  assert.deepEqual(parsePlanLimitError(new Error(message)), {
    kind: 'openAssignments',
    message: 'Close one.',
  });
  assert.equal(
    parsePlanLimitError(new Error('Activity not found.')),
    undefined
  );
  assert.equal(parsePlanLimitError(undefined), undefined);
});

test('limit messages say what still works and how to get more', () => {
  assert.match(
    buildPlanLimitReachedMessage({
      kind: 'openAssignments',
      limit: 3,
      planId: 'free',
    }),
    /3 open assignment links[\s\S]*Close a link or upgrade[\s\S]*Students can still finish/
  );
  assert.match(
    buildPlanLimitReachedMessage({
      kind: 'aiDrafts',
      limit: 10,
      planId: 'free',
    }),
    /Teacher Pro includes more AI drafts/
  );
  assert.doesNotMatch(
    buildPlanLimitReachedMessage({
      kind: 'aiDrafts',
      limit: 300,
      planId: 'pro',
    }),
    /Teacher Pro includes more/
  );
});

test('usage card view labels status in text, not only color', () => {
  const view = buildPlanUsageCardView({
    meters: {
      activities: buildPlanUsageMeter({
        kind: 'activities',
        limit: 15,
        used: 15,
      }),
      aiDrafts: buildPlanUsageMeter({ kind: 'aiDrafts', limit: 10, used: 2 }),
      openAssignments: buildPlanUsageMeter({
        kind: 'openAssignments',
        limit: 3,
        used: 1,
      }),
    },
    planId: 'free',
    state: 'free',
  });
  assert.equal(view.showUpgrade, true);
  assert.equal(view.meters[0]?.value, '15 of 15');
  assert.equal(view.meters[0]?.statusLabel, 'Limit reached');
  assert.match(view.meters[0]?.ariaLabel ?? '', /Limit reached/);
  assert.match(view.note, /never count/);

  const pastDue = buildPlanUsageCardView({
    meters: {
      activities: buildPlanUsageMeter({
        kind: 'activities',
        limit: null,
        used: 40,
      }),
      aiDrafts: buildPlanUsageMeter({ kind: 'aiDrafts', limit: 300, used: 1 }),
      openAssignments: buildPlanUsageMeter({
        kind: 'openAssignments',
        limit: null,
        used: 9,
      }),
    },
    planId: 'pro',
    state: 'past-due',
  });
  assert.equal(pastDue.showUpgrade, false);
  assert.ok(pastDue.manageBillingLabel);
  assert.equal(pastDue.meters[0]?.value, '40, no limit');
  assert.match(pastDue.note, /didn't go through/);
});

/** An in-memory SQLite database with every real migration applied. */
function createMigratedDb() {
  const sqlite = new DatabaseSync(':memory:');
  const migrationsDir = 'src/db/migrations';
  for (const file of readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .sort()) {
    for (const statement of readFileSync(`${migrationsDir}/${file}`, 'utf8')
      .split('--> statement-breakpoint')
      .map((part) => part.trim())
      .filter(Boolean)) {
      sqlite.exec(statement);
    }
  }
  const db = drizzle(async (sql, params, method) => {
    const statement = sqlite.prepare(sql);
    statement.setReturnArrays(true);
    const values = params as never[];
    if (method === 'run') {
      statement.run(...values);
      return { rows: [] };
    }
    if (method === 'get') {
      const row = statement.get(...values);
      return { rows: (row ?? undefined) as never };
    }
    return { rows: statement.all(...values) as never };
  });
  return db as never;
}

async function seedTeacher(db: ReturnType<typeof drizzle>, id: string) {
  await db.insert(user).values({
    createdAt: NOW,
    email: `${id}@example.test`,
    emailVerified: true,
    id,
    name: id,
    updatedAt: NOW,
  });
}

let seededActivityCount = 0;

async function seedActivities(
  db: ReturnType<typeof drizzle>,
  ownerId: string,
  count: number,
  visibility: 'archived' | 'draft' = 'draft'
) {
  const ids: string[] = [];
  for (let index = 0; index < count; index += 1) {
    seededActivityCount += 1;
    ids.push(`${ownerId}-${seededActivityCount}`);
    await db.insert(activity).values({
      contentJson: { groups: [], pairs: [], questions: [] } as never,
      createdAt: NOW,
      id: `${ownerId}-${seededActivityCount}`,
      ownerId,
      templateType: 'quiz',
      title: `Activity ${index}`,
      updatedAt: NOW,
      visibility,
    });
  }
  return ids;
}

test('server checks count only live work and block creation past the cap', async () => {
  const db = createMigratedDb();
  await seedTeacher(db, 'free-teacher');
  await seedActivities(db, 'free-teacher', 14);
  await seedActivities(db, 'free-teacher', 5, 'archived');

  await assertPlanAllows('activities', 'free-teacher', { db, now: NOW });
  await seedActivities(db, 'free-teacher', 1);
  await assert.rejects(
    assertPlanAllows('activities', 'free-teacher', { db, now: NOW }),
    (error: Error) => parsePlanLimitError(error)?.kind === 'activities'
  );

  const snapshot = await getPlanUsageSnapshot('free-teacher', {
    db,
    now: NOW,
  });
  assert.equal(snapshot.meters.activities.used, 15);
  assert.equal(snapshot.meters.activities.reached, true);
});

test('closed and expired links free a slot; open links count', async () => {
  const db = createMigratedDb();
  await seedTeacher(db, 'linker');
  const [activityId] = await seedActivities(db, 'linker', 1);
  const base = {
    activityId: activityId ?? '',
    createdAt: NOW,
    ownerId: 'linker',
    settingsJson: {} as never,
    title: 'Link',
    updatedAt: NOW,
  };
  await db.insert(assignment).values([
    { ...base, id: 'a1', shareSlug: 's1', status: 'published' },
    {
      ...base,
      expiresAt: new Date(NOW.getTime() + DAY),
      id: 'a2',
      shareSlug: 's2',
      status: 'published',
    },
    {
      ...base,
      expiresAt: new Date(NOW.getTime() - DAY),
      id: 'a3',
      shareSlug: 's3',
      status: 'published',
    },
    { ...base, id: 'a4', shareSlug: 's4', status: 'closed' },
  ]);

  await assertPlanAllows('openAssignments', 'linker', { db, now: NOW });
  await db.insert(assignment).values({
    ...base,
    id: 'a5',
    shareSlug: 's5',
    status: 'published',
  });
  await assert.rejects(
    assertPlanAllows('openAssignments', 'linker', { db, now: NOW }),
    (error: Error) => parsePlanLimitError(error)?.kind === 'openAssignments'
  );
});

test('AI drafts reset monthly and paid plans lift creation caps', async () => {
  const db = createMigratedDb();
  await seedTeacher(db, 'drafter');
  await db.insert(aiDraftUsage).values({
    createdAt: new Date('2026-09-30T23:59:00.000Z'),
    id: 'last-month',
    userId: 'drafter',
  });
  for (let index = 0; index < 10; index += 1) {
    await reserveAiDraft('drafter', { db, now: NOW });
  }
  await assert.rejects(
    reserveAiDraft('drafter', { db, now: NOW }),
    (error: Error) => /all 10 AI drafts/.test(error.message)
  );
  await reserveAiDraft('drafter', {
    db,
    now: new Date('2026-11-01T00:00:01.000Z'),
  });

  await seedActivities(db, 'drafter', 30);
  await db.insert(payment).values({
    createdAt: NOW,
    customerId: 'cus_1',
    id: 'pay_1',
    paid: true,
    periodEnd: new Date(NOW.getTime() + 10 * DAY),
    priceId: 'price_pro_monthly',
    status: 'active',
    type: 'subscription',
    updatedAt: NOW,
    userId: 'drafter',
  });
  const proPlan = await assertPlanAllows('activities', 'drafter', {
    db,
    now: NOW,
  });
  assert.equal(proPlan.planId, 'pro');
  await reserveAiDraft('drafter', { db, now: NOW });
});

test('parallel AI draft requests cannot overrun the monthly allowance', async () => {
  const db = createMigratedDb();
  await seedTeacher(db, 'racer');
  const results = await Promise.allSettled(
    Array.from({ length: 15 }, () => reserveAiDraft('racer', { db, now: NOW }))
  );
  const reserved = results.filter((result) => result.status === 'fulfilled');
  assert.equal(reserved.length, 10);
  assert.equal(results.length - reserved.length, 5);
  const snapshot = await getPlanUsageSnapshot('racer', { db, now: NOW });
  assert.equal(snapshot.meters.aiDrafts.used, 10);

  // Releasing a reservation (offline fallback or provider error) frees it.
  const first = reserved[0];
  assert.ok(first && first.status === 'fulfilled');
  await releaseAiDraftReservation(first.value, { db });
  await reserveAiDraft('racer', { db, now: NOW });
  await assert.rejects(reserveAiDraft('racer', { db, now: NOW }));
});

test('enforcement runs in the server functions, never on student submission', () => {
  const activitiesApi = readFileSync('src/api/activities.ts', 'utf8');
  const assignmentsApi = readFileSync('src/api/assignments.ts', 'utf8');
  const aiApi = readFileSync('src/api/activity-ai.ts', 'utf8');
  assert.equal(
    activitiesApi.match(/assertPlanAllows\('activities'/g)?.length,
    4,
    'create, duplicate, remix, and restore check the activity cap'
  );
  assert.equal(
    assignmentsApi.match(/assertPlanAllows\('openAssignments'/g)?.length,
    2,
    'publish and reopen check the open-link cap'
  );
  const submitHandler = assignmentsApi.slice(
    assignmentsApi.indexOf('export const submitAttempt')
  );
  assert.doesNotMatch(submitHandler, /assertPlanAllows/);
  assert.match(
    aiApi,
    /reserveAiDraftForUser\(context\.userId\)[\s\S]*generateActivityDraftFromAi[\s\S]*catch[\s\S]*releaseAiDraftReservationSafely[\s\S]*result\.provider !== 'workers-ai'[\s\S]*releaseAiDraftReservationSafely/
  );
});

const BILLING_PLANS = [
  { id: 'free', isFree: true, isLifetime: false, prices: [] },
  { id: 'pro', isFree: false, isLifetime: false, prices: [] },
  { id: 'lifetime', isFree: false, isLifetime: true, prices: [] },
] as unknown as PricePlan[];

function billingRecord(overrides: Partial<EntitlementPaymentRecord> = {}) {
  return {
    ...subscription(overrides),
    createdAt: NOW,
    customerId: 'cus_billing',
    id: 'pay_billing',
    subscriptionId: 'sub_billing',
  };
}

test('billing settings show the same plan enforcement uses, in every state', () => {
  const cases: Array<[string, EntitlementPaymentRecord, string]> = [
    ['active', subscription(), 'pro'],
    [
      'past due in grace',
      subscription({
        periodEnd: new Date(NOW.getTime() - DAY),
        status: 'past_due',
      }),
      'pro',
    ],
    [
      'cancel scheduled',
      subscription({ cancelAtPeriodEnd: true, status: 'active' }),
      'pro',
    ],
    [
      'canceled with future period end',
      subscription({ cancelAtPeriodEnd: true, status: 'canceled' }),
      'pro',
    ],
    ['unknown price id', subscription({ priceId: 'price_retired' }), 'pro'],
    ['expired', subscription({ paid: false, status: 'canceled' }), 'free'],
  ];
  for (const [label, record, expected] of cases) {
    const result = resolveCurrentBillingPlan({
      now: NOW,
      plans: BILLING_PLANS,
      records: [billingRecord(record)],
    });
    assert.equal(result.currentPlan?.id, expected, label);
    assert.equal(
      Boolean(result.subscription),
      expected === 'pro',
      `${label} subscription`
    );
    assert.equal(result.hasBillingAccount, true, `${label} portal`);
  }

  const scheduled = resolveCurrentBillingPlan({
    now: NOW,
    plans: BILLING_PLANS,
    records: [billingRecord({ cancelAtPeriodEnd: true, status: 'canceled' })],
  });
  assert.equal(scheduled.subscription?.cancelAtPeriodEnd, true);

  const none = resolveCurrentBillingPlan({
    now: NOW,
    plans: BILLING_PLANS,
    records: [],
  });
  assert.equal(none.currentPlan?.id, 'free');
  assert.equal(none.hasBillingAccount, false);
  assert.equal(
    resolveCurrentBillingPlan({
      customerId: 'cus_only',
      now: NOW,
      plans: BILLING_PLANS,
      records: [],
    }).hasBillingAccount,
    true
  );
});

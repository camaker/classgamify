import { createFileRoute } from '@tanstack/react-router';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getStarterActivity } from '@/activities/catalog';
import { getDb } from '@/db';
import { activity, aiDraftUsage, payment } from '@/db/app.schema';
import { user } from '@/db/auth.schema';
import { APP_ENTITY_ID_LENGTH } from '@/lib/entity-id';

const TEST_API_SECRET = 'classgamify-e2e-secret';
const DAY_MS = 24 * 60 * 60 * 1000;
const SUBSCRIPTION_STATUSES = new Set([
  'active',
  'canceled',
  'past_due',
  'trialing',
  'unpaid',
]);

function assertE2EAccess(request: Request) {
  const isLocalE2EMode =
    import.meta.env.DEV === true && import.meta.env.MODE === 'e2e';
  if (
    !isLocalE2EMode ||
    request.headers.get('x-e2e-secret') !== TEST_API_SECRET
  ) {
    return Response.json({ error: 'Not Found' }, { status: 404 });
  }
  return null;
}

function isE2EEmail(email: string) {
  return email.startsWith('e2e-') && email.endsWith('@example.test');
}

function toCount(value: unknown, max: number) {
  return typeof value === 'number' && Number.isInteger(value)
    ? Math.min(Math.max(value, 0), max)
    : 0;
}

/**
 * Local E2E fixture for plan limits: seeds activities, AI draft usage, and a
 * fake paid subscription or lifetime payment for an `e2e-*@example.test`
 * teacher. No payment provider is called.
 */
export const Route = createFileRoute('/api/e2e/plan')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const accessError = assertE2EAccess(request);
        if (accessError) return accessError;

        const body = (await request.json()) as {
          activities?: unknown;
          aiDrafts?: unknown;
          email?: unknown;
          lifetime?: unknown;
          subscription?: {
            cancelAtPeriodEnd?: unknown;
            periodEndDays?: unknown;
            status?: unknown;
          };
        };
        const email = typeof body.email === 'string' ? body.email : '';
        if (!isE2EEmail(email)) {
          return Response.json(
            { error: 'Invalid test email' },
            { status: 400 }
          );
        }

        const db = getDb();
        const [owner] = await db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.email, email))
          .limit(1);
        if (!owner) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const now = new Date();
        const starter = getStarterActivity('english-food-quiz');
        const activityCount = toCount(body.activities, 50);
        for (let index = 0; index < activityCount; index += 1) {
          await db.insert(activity).values({
            contentJson: starter.content,
            createdAt: now,
            description: starter.description,
            id: nanoid(APP_ENTITY_ID_LENGTH.generated),
            ownerId: owner.id,
            templateType: 'quiz',
            title: `E2E plan activity ${index + 1}`,
            updatedAt: now,
            visibility: 'private',
          });
        }

        const aiDraftCount = toCount(body.aiDrafts, 400);
        for (let index = 0; index < aiDraftCount; index += 1) {
          await db.insert(aiDraftUsage).values({
            createdAt: now,
            id: nanoid(APP_ENTITY_ID_LENGTH.generated),
            userId: owner.id,
          });
        }

        const status =
          typeof body.subscription?.status === 'string'
            ? body.subscription.status
            : undefined;
        if (status && SUBSCRIPTION_STATUSES.has(status)) {
          const periodEndDays =
            typeof body.subscription?.periodEndDays === 'number'
              ? body.subscription.periodEndDays
              : 30;
          await db.insert(payment).values({
            cancelAtPeriodEnd: body.subscription?.cancelAtPeriodEnd === true,
            createdAt: now,
            customerId: `e2e-customer-${owner.id}`,
            id: nanoid(APP_ENTITY_ID_LENGTH.generated),
            interval: 'month',
            paid: true,
            periodEnd: new Date(now.getTime() + periodEndDays * DAY_MS),
            periodStart: now,
            priceId: 'e2e-teacher-pro-monthly',
            scene: 'subscription',
            status: status as 'active',
            type: 'subscription',
            updatedAt: now,
            userId: owner.id,
          });
        }

        if (body.lifetime === true) {
          await db.insert(payment).values({
            createdAt: now,
            customerId: `e2e-customer-${owner.id}`,
            id: nanoid(APP_ENTITY_ID_LENGTH.generated),
            paid: true,
            priceId: 'e2e-early-supporter',
            scene: 'lifetime',
            status: 'completed',
            type: 'one_time',
            updatedAt: now,
            userId: owner.id,
          });
        }

        return Response.json({ ok: true });
      },
    },
  },
});

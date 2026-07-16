import { createFileRoute } from '@tanstack/react-router';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getStarterActivity } from '@/activities/catalog';
import {
  type ActivityTemplateType,
  type AssignmentSettings,
  isActivityTemplateType,
} from '@/activities/types';
import { getDb } from '@/db';
import { activity, assignment, assignmentSnapshot } from '@/db/app.schema';
import { user } from '@/db/auth.schema';
import { APP_ENTITY_ID_LENGTH } from '@/lib/entity-id';

const TEST_API_SECRET = 'classgamify-e2e-secret';

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

export const Route = createFileRoute('/api/e2e/assignments')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const accessError = assertE2EAccess(request);
        if (accessError) return accessError;

        const body = (await request.json()) as {
          email?: unknown;
          templateType?: unknown;
        };
        const email = typeof body.email === 'string' ? body.email : '';
        if (!isE2EEmail(email) || !isActivityTemplateType(body.templateType)) {
          return Response.json(
            { error: 'Invalid fixture input' },
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
        const activityId = nanoid(APP_ENTITY_ID_LENGTH.generated);
        const assignmentId = nanoid(APP_ENTITY_ID_LENGTH.generated);
        const shareSlug = `e2e-${body.templateType}-${nanoid(10)}`;
        const starter = getStarterActivity('english-food-quiz');
        const title = `E2E ${body.templateType} runner`;
        const settings: AssignmentSettings = {
          collectStudentName: true,
          maxAttempts: 2,
          showCorrectAnswers: true,
          shuffleItems: false,
        };

        await db.batch([
          db.insert(activity).values({
            contentJson: starter.content,
            createdAt: now,
            description: starter.description,
            id: activityId,
            ownerId: owner.id,
            templateType: body.templateType,
            title,
            updatedAt: now,
            visibility: 'private',
          }),
          db.insert(assignment).values({
            activityId,
            createdAt: now,
            expiresAt: null,
            id: assignmentId,
            ownerId: owner.id,
            settingsJson: settings,
            shareSlug,
            status: 'published',
            title,
            updatedAt: now,
          }),
          db.insert(assignmentSnapshot).values({
            activityDescription: starter.description,
            activityTitle: title,
            assignmentId,
            contentJson: starter.content,
            createdAt: now,
            templateType: body.templateType,
          }),
        ]);

        return Response.json({
          shareSlug,
          templateType: body.templateType,
          title,
        });
      },
    },
  },
});

import { createFileRoute } from '@tanstack/react-router';
import { eq, inArray, like } from 'drizzle-orm';
import { getDb } from '@/db';
import { account, session, user } from '@/db/auth.schema';
import { payment, userFiles } from '@/db/app.schema';

const TEST_EMAIL_PATTERN = 'e2e-%@example.test';
const TEST_API_SECRET = 'classgamify-e2e-secret';

function assertE2EAccess(request: Request) {
  const requestSecret = request.headers.get('x-e2e-secret');
  const isLocalE2EMode =
    import.meta.env.DEV === true && import.meta.env.MODE === 'e2e';

  if (!isLocalE2EMode || requestSecret !== TEST_API_SECRET) {
    return Response.json({ error: 'Not Found' }, { status: 404 });
  }

  return null;
}

function isE2EEmail(email: string) {
  return email.startsWith('e2e-') && email.endsWith('@example.test');
}

export const Route = createFileRoute('/api/e2e/users')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const accessError = assertE2EAccess(request);
        if (accessError) return accessError;

        const body = (await request.json()) as {
          contentType?: unknown;
          email?: unknown;
          filename?: unknown;
          id?: unknown;
          originalName?: unknown;
          r2Key?: unknown;
          size?: unknown;
        };
        const email = typeof body.email === 'string' ? body.email : '';

        if (!isE2EEmail(email)) {
          return Response.json(
            { error: 'Invalid test email' },
            { status: 400 }
          );
        }

        const [owner] = await getDb()
          .select({ id: user.id })
          .from(user)
          .where(eq(user.email, email))
          .limit(1);

        if (!owner) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const now = new Date();
        const id =
          typeof body.id === 'string' && body.id.trim()
            ? body.id.trim()
            : `e2e-file-${Date.now()}`;
        const filename =
          typeof body.filename === 'string' && body.filename.trim()
            ? body.filename.trim()
            : id;
        const originalName =
          typeof body.originalName === 'string' && body.originalName.trim()
            ? body.originalName.trim()
            : filename;
        const contentType =
          typeof body.contentType === 'string' && body.contentType.trim()
            ? body.contentType.trim()
            : 'application/octet-stream';
        const r2Key =
          typeof body.r2Key === 'string' && body.r2Key.trim()
            ? body.r2Key.trim()
            : `userfiles/${owner.id}/${filename}`;
        const size =
          typeof body.size === 'number' && Number.isFinite(body.size)
            ? Math.max(0, Math.floor(body.size))
            : 0;

        const [file] = await getDb()
          .insert(userFiles)
          .values({
            contentType,
            createdAt: now,
            filename,
            id,
            isPublic: false,
            originalName,
            r2Key,
            size,
            updatedAt: now,
            userId: owner.id,
          })
          .returning();

        return Response.json({ file });
      },
      PATCH: async ({ request }) => {
        const accessError = assertE2EAccess(request);
        if (accessError) return accessError;

        const body = (await request.json()) as {
          email?: unknown;
          emailVerified?: unknown;
          role?: unknown;
        };
        const email = typeof body.email === 'string' ? body.email : '';

        if (!isE2EEmail(email)) {
          return Response.json(
            { error: 'Invalid test email' },
            { status: 400 }
          );
        }

        const updates: {
          emailVerified?: boolean;
          role?: string | null;
          updatedAt: Date;
        } = { updatedAt: new Date() };

        if (typeof body.emailVerified === 'boolean') {
          updates.emailVerified = body.emailVerified;
        }
        if (
          body.role === null ||
          body.role === 'admin' ||
          body.role === 'user'
        ) {
          updates.role = body.role === 'user' ? null : body.role;
        }

        const [updatedUser] = await getDb()
          .update(user)
          .set(updates)
          .where(eq(user.email, email))
          .returning({
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            role: user.role,
          });

        if (!updatedUser) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return Response.json({ user: updatedUser });
      },
      DELETE: async ({ request }) => {
        const accessError = assertE2EAccess(request);
        if (accessError) return accessError;

        const db = getDb();
        const rows = await db
          .select({ id: user.id })
          .from(user)
          .where(like(user.email, TEST_EMAIL_PATTERN));
        const userIds = rows.map((row) => row.id);

        if (userIds.length === 0) {
          return Response.json({ deleted: 0 });
        }

        await db.delete(session).where(inArray(session.userId, userIds));
        await db.delete(account).where(inArray(account.userId, userIds));
        await db.delete(payment).where(inArray(payment.userId, userIds));
        await db.delete(userFiles).where(inArray(userFiles.userId, userIds));
        await db.delete(user).where(inArray(user.id, userIds));

        return Response.json({ deleted: userIds.length });
      },
    },
  },
});

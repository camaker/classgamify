import { auth } from '@/auth/auth';
import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { Routes } from '@/lib/routes';

/**
 * Auth middleware: requires authenticated user.
 * Use in route definitions via server: { middleware: [authMiddleware] }.
 * https://www.better-auth.com/docs/integrations/tanstack#middleware
 */
export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    throw redirect({ to: Routes.Login });
  }

  return await next();
});

/**
 * Auth API middleware: same as authMiddleware but returns 401 JSON for API routes.
 * Passes context: { userId } so server function handlers can use context.userId.
 */
export const authApiMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return await next({ context: { userId: session.user.id } });
});

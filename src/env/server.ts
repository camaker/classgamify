import { createEnv } from '@t3-oss/env-core';
import * as z from 'zod';

/**
 * Server-side env (runtime process.env; Worker vars/secrets populate it).
 * Use only in server code (auth, mail, storage, etc.).
 */
export const serverEnv = createEnv({
  server: {
    VITE_BASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    STORAGE_PUBLIC_URL: z.string().optional(),
  },
  runtimeEnv: process.env,
});

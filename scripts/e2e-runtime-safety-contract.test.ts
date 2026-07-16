import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const START_SOURCE = readFileSync('src/start.tsx', 'utf8');
const MAIL_SOURCE = readFileSync('src/mail/index.ts', 'utf8');
const SEND_EMAIL_SOURCE = MAIL_SOURCE.slice(
  MAIL_SOURCE.indexOf('export async function sendEmail')
);

test('server functions use the TanStack CSRF request middleware', () => {
  assert.match(
    START_SOURCE,
    /createCsrfMiddleware\(\{[\s\S]*context\.handlerType === 'serverFn'[\s\S]*requestMiddleware: \[csrfMiddleware\]/
  );
});

test('local E2E mail bypass cannot activate in production or normal dev', () => {
  assert.match(
    SEND_EMAIL_SOURCE,
    /import\.meta\.env\.DEV === true && import\.meta\.env\.MODE === 'e2e'/
  );
  assert.match(
    SEND_EMAIL_SOURCE,
    /return \{ success: true, messageId: 'e2e-mail-skipped' \}/
  );
  assert.ok(
    SEND_EMAIL_SOURCE.indexOf("import.meta.env.MODE === 'e2e'") <
      SEND_EMAIL_SOURCE.indexOf('getMailProvider()')
  );
});

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const START_SOURCE = readFileSync('src/start.tsx', 'utf8');
const MAIL_SOURCE = readFileSync('src/mail/index.ts', 'utf8');
const SEND_EMAIL_SOURCE = MAIL_SOURCE.slice(
  MAIL_SOURCE.indexOf('export async function sendEmail')
);
const ASSIGNMENT_FIXTURE_SOURCE = readFileSync(
  'src/routes/api/e2e/assignments.ts',
  'utf8'
);
const TEMPLATE_RUNNER_SPEC_SOURCE = readFileSync(
  'tests/e2e/specs/interactive-template-runners.spec.ts',
  'utf8'
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

test('interactive assignment fixtures stay local, secret-gated, and scoped', () => {
  assert.match(
    ASSIGNMENT_FIXTURE_SOURCE,
    /import\.meta\.env\.DEV === true && import\.meta\.env\.MODE === 'e2e'/
  );
  assert.match(ASSIGNMENT_FIXTURE_SOURCE, /x-e2e-secret[\s\S]*TEST_API_SECRET/);
  assert.match(ASSIGNMENT_FIXTURE_SOURCE, /isE2EEmail\(email\)/);
  assert.match(ASSIGNMENT_FIXTURE_SOURCE, /isActivityTemplateType/);
  assert.match(
    ASSIGNMENT_FIXTURE_SOURCE,
    /db\.batch\(\[[\s\S]*db\.insert\(activity\)[\s\S]*db\.insert\(assignment\)[\s\S]*db\.insert\(assignmentSnapshot\)/
  );
  assert.doesNotMatch(ASSIGNMENT_FIXTURE_SOURCE, /insert\(attempt\)/);
});

test('interactive template E2E submits every production runner surface', () => {
  assert.match(TEMPLATE_RUNNER_SPEC_SOURCE, /ACTIVITY_TEMPLATE_TYPES/);
  assert.match(TEMPLATE_RUNNER_SPEC_SOURCE, /data-runtime-surface/);
  assert.match(TEMPLATE_RUNNER_SPEC_SOURCE, /Submit answers/);
  assert.match(TEMPLATE_RUNNER_SPEC_SOURCE, /Submit anyway/);
  assert.match(TEMPLATE_RUNNER_SPEC_SOURCE, /student-runner-result-status/);
});

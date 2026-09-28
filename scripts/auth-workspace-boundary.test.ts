import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  AUTH_WORKSPACE_BOUNDARY_ITEM_IDS,
  buildAuthWorkspaceBoundaryView,
} from '@/auth/workspace-boundary';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const AUTH_CARD_SOURCE = readFileSync(
  'src/components/auth/auth-card.tsx',
  'utf8'
);

const SECRET_ANSWER_KEY = 'SECRET_TEACHER_ANSWER_KEY';
const SECRET_CALLBACK_URL = 'https://evil.example/auth?callback=secret';
const SECRET_CLIENT_SECRET = 'google-oauth-client-secret';
const SECRET_PASSWORD = 'teacher-password-value';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/key.pdf';
const SECRET_STUDENT_ATTEMPT = 'raw-student-attempt-record';
const SECRET_STUDENT_TOKEN = 'anonymous-browser-token';
const SECRET_TEACHER_EMAIL = 'teacher-private@example.test';

test('auth workspace boundary lists the teacher workspace items', () => {
  const boundaryView = buildAuthWorkspaceBoundaryView();

  assert.deepEqual(
    boundaryView.items.map((item) => item.id),
    [...AUTH_WORKSPACE_BOUNDARY_ITEM_IDS]
  );
  assert.equal(boundaryView.items.length, 5);
  assertNoPrivateAuthText(JSON.stringify(boundaryView));
});

test('auth pages keep internal workspace handoff out of public DOM', () => {
  assert.match(
    AUTH_CARD_SOURCE,
    /AuthWorkspaceBoundaryView[\s\S]*workspaceBoundary\?: AuthWorkspaceBoundaryView[\s\S]*AuthWorkspaceBoundaryPanel[\s\S]*view\.items\.map\(\(item\) =>[\s\S]*key=\{item\.id\}[\s\S]*item\.label[\s\S]*item\.description/,
    'AuthCard should keep the visible teacher workspace boundary panel.'
  );
  assert.doesNotMatch(
    AUTH_CARD_SOURCE,
    /auth-workspace-handoff|data-handoff|data-handoff-item|view\.itemViews\.map/,
    'Public auth pages must not render internal workspace handoff audit markup.'
  );
});

test('auth workspace boundary localizes Chinese classroom boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const boundaryView = buildAuthWorkspaceBoundaryView();

    assert.equal(boundaryView.title, '教师工作区边界');
    assertNoPrivateAuthText(JSON.stringify(boundaryView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function assertNoPrivateAuthText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_KEY,
    SECRET_CALLBACK_URL,
    SECRET_CLIENT_SECRET,
    SECRET_PASSWORD,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_ATTEMPT,
    SECRET_STUDENT_TOKEN,
    SECRET_TEACHER_EMAIL,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Auth workspace handoff leaked private text: ${privateValue}`
    );
  }
}

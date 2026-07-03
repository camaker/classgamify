import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildMailTransactionalWorkspaceHandoffView,
  MAIL_TRANSACTIONAL_TEMPLATE_IDS,
  MAIL_TRANSACTIONAL_WORKSPACE_HANDOFF_ITEM_IDS,
  type MailTransactionalWorkspaceHandoffItemId,
  type MailTransactionalWorkspaceHandoffView,
} from '@/mail/workspace-boundary';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ACTION_URL = 'https://classgamify.example/reset?token=secret';
const SECRET_CONTACT_MESSAGE = 'Please call this private student number.';
const SECRET_EMAIL = 'teacher-private@example.test';
const SECRET_NAME = 'Private Teacher Name';
const SECRET_RAW_ERROR = 'raw-provider-stack-trace';
const SECRET_STORAGE_KEY = 'private/storage/key.pdf';
const SECRET_STUDENT_TOKEN = 'raw-student-token';

test('transactional mail handoff exposes 20 localized workspace slices', () => {
  const handoffView = buildMailTransactionalWorkspaceHandoffView({
    locale: 'en',
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...MAIL_TRANSACTIONAL_WORKSPACE_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 20);
  assert.equal(
    handoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    exposesActionUrls: false,
    exposesContactMessageText: false,
    exposesRawErrors: false,
    exposesRecipientEmail: false,
    exposesRecipientName: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentIdentifiers: false,
    itemIds,
    rendersSharedBoundaryPanel: true,
    scope: 'transactional-email-workspace-boundary',
    templateIds: [...MAIL_TRANSACTIONAL_TEMPLATE_IDS],
    usesLocalizedSubjects: true,
  });

  assert.equal(getHandoffItemValue(handoffView, 'template-set'), '4 templates');
  assert.equal(
    getHandoffItemValue(handoffView, 'verify-email-template'),
    'Verify your ClassGamify teacher workspace email'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'forgot-password-template'),
    'Reset your ClassGamify teacher workspace password'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'newsletter-template'),
    'ClassGamify classroom updates enabled'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'contact-template'),
    'ClassGamify classroom and product inquiry'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'localized-subjects'),
    'Message keys'
  );
  assert.equal(getHandoffItemValue(handoffView, 'html-language'), 'en');
  assert.equal(
    getHandoffItemValue(handoffView, 'plain-text-render'),
    'HTML and text'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'shared-layout'),
    'EmailLayout'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'boundary-panel'),
    'Workspace boundary'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'activities-scope'),
    'Activities and templates'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'assignments-scope'),
    'Assignment links'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'attempt-results-scope'),
    'Student attempts and results'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'ai-draft-scope'),
    'AI drafts and source materials'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'source-material-safety'),
    'No storage keys'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'worksheet-workflow-scope'),
    'Worksheet workflows'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'contact-classroom-fields'),
    'Structured fields'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'action-link-placement'),
    'After boundary'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'legacy-copy-guard'),
    'ClassGamify only'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'private-data-guard'),
    'Private data omitted'
  );
  assertNoPrivateMailText(JSON.stringify(handoffView));
});

test('transactional mail handoff localizes Chinese subjects and boundaries', () => {
  const handoffView = buildMailTransactionalWorkspaceHandoffView({
    locale: 'zh',
  });

  assert.equal(handoffView.title, '事务邮件工作区交接');
  assert.equal(getHandoffItemValue(handoffView, 'template-set'), '4 个模板');
  assert.equal(
    getHandoffItemValue(handoffView, 'verify-email-template'),
    '验证你的 ClassGamify 教师工作区邮箱'
  );
  assert.equal(getHandoffItemValue(handoffView, 'html-language'), 'zh');
  assert.equal(
    getHandoffItemValue(handoffView, 'boundary-panel'),
    '工作区边界'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'activities-scope'),
    '活动与模板'
  );
  assert.equal(
    getHandoffItemValue(handoffView, 'private-data-guard'),
    '已省略私有数据'
  );
  assertNoPrivateMailText(JSON.stringify(handoffView));
});

test('transactional mail handoff falls back for unsupported locales', () => {
  assert.deepEqual(
    buildMailTransactionalWorkspaceHandoffView({
      locale: 'not-supported',
    }).itemViews,
    buildMailTransactionalWorkspaceHandoffView({ locale: 'en' }).itemViews
  );
});

function getHandoffItemValue(
  view: MailTransactionalWorkspaceHandoffView,
  id: MailTransactionalWorkspaceHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing transactional mail handoff item ${id}`);
  return item.value;
}

function assertNoPrivateMailText(serializedView: string) {
  for (const privateValue of [
    SECRET_ACTION_URL,
    SECRET_CONTACT_MESSAGE,
    SECRET_EMAIL,
    SECRET_NAME,
    SECRET_RAW_ERROR,
    SECRET_STORAGE_KEY,
    SECRET_STUDENT_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Transactional mail handoff leaked private text: ${privateValue}`
    );
  }
}

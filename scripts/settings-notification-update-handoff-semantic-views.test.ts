import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSettingsNotificationUpdateHandoffView,
  buildSettingsNotificationWorkspaceSummaryView,
  SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS,
  type SettingsNotificationUpdateHandoffItemId,
  type SettingsNotificationUpdateHandoffView,
} from '@/settings/notifications-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_PROVIDER_ERROR = 'raw-provider-stack-trace';
const SECRET_MUTATION_PAYLOAD = 'raw-newsletter-mutation-payload';
const SECRET_SOURCE_STORAGE_KEY = 'source-material/private/storage-key.pdf';
const SECRET_STUDENT_TOKEN = 'raw-student-token';
const SECRET_TEACHER_EMAIL = 'teacher-private@example.test';

test('notification settings handoff exposes 30 classroom update slices', () => {
  const handoffView = buildSettingsNotificationUpdateHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
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
    changesActivityContent: false,
    changesActivityLibrary: false,
    changesAssignmentDeliveryRules: false,
    changesAssignmentSnapshots: false,
    changesAttemptRecords: false,
    changesPublicAssignmentLinks: false,
    changesResultExports: false,
    exposesRawMutationPayload: false,
    exposesRawProviderErrors: false,
    exposesRecipientEmail: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentIdentifiers: false,
    itemIds,
    notifiesLearners: false,
    readsSourceMaterialFiles: false,
    scope: 'teacher-classroom-update-settings',
    sendsStudentAssignmentReminders: false,
    teacherCanPauseUpdates: true,
    updatesTeacherProductEmailOnly: true,
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['update-scope', 'Teacher product updates'],
      ['template-updates', 'Template updates'],
      ['worksheet-workflows', 'Worksheet workflows'],
      ['assignment-review', 'Assignment review'],
      ['teacher-control', 'Teacher control'],
      ['newsletter-card', 'ClassGamify update emails'],
      ['subscription-form', 'ClassGamify update emails subscription controls'],
      ['subscription-switch', 'Receive ClassGamify updates'],
      ['email-requirement', 'Email is required to receive ClassGamify updates'],
      ['status-loading', 'Disable while syncing'],
      ['subscribe-action', 'ClassGamify updates enabled'],
      ['unsubscribe-action', 'ClassGamify updates paused'],
      ['error-feedback', 'An error occurred while updating your subscription'],
      ['scope-note', 'Update scope'],
      ['provider-visibility', 'Configuration gate'],
      ['email-channel', 'Teacher email only'],
      ['subscription-status-source', 'Newsletter provider status'],
      ['update-frequency', 'Occasional updates'],
      ['activity-library-boundary', 'No library changes'],
      ['activity-content-boundary', 'No content changes'],
      ['assignment-snapshot-boundary', 'Snapshots unchanged'],
      ['attempt-record-boundary', 'Attempts unchanged'],
      ['result-export-boundary', 'Exports unchanged'],
      ['source-material-read-boundary', 'No file reads'],
      ['mutation-payload-guard', 'Payload hidden'],
      ['student-reminder-boundary', 'No student reminders'],
      ['public-link-boundary', 'No link changes'],
      ['learner-notification-boundary', 'No learner notifications'],
      ['private-data-guard', 'Private data omitted'],
      ['legacy-copy-guard', 'ClassGamify only'],
    ]
  );
  assertNoPrivateNotificationText(JSON.stringify(handoffView));
});

test('notification workspace summary attaches the handoff contract', () => {
  const workspaceSummaryView = buildSettingsNotificationWorkspaceSummaryView();

  assert.deepEqual(
    workspaceSummaryView.handoffView.itemViews.map((item) => item.id),
    [...SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS]
  );
  assert.equal(workspaceSummaryView.handoffView.itemViews.length, 30);
  assert.equal(
    getHandoffItemValue(
      workspaceSummaryView.handoffView,
      'student-reminder-boundary'
    ),
    'No student reminders'
  );
  assertNoPrivateNotificationText(
    JSON.stringify(workspaceSummaryView.handoffView)
  );
});

test('notification settings handoff localizes Chinese boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildSettingsNotificationUpdateHandoffView();

    assert.equal(handoffView.title, '课堂更新交接');
    assert.equal(
      getHandoffItemValue(handoffView, 'update-scope'),
      '教师产品更新'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'student-reminder-boundary'),
      '不发送学生提醒'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'email-channel'),
      '仅教师邮箱'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'assignment-snapshot-boundary'),
      '快照不变'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'source-material-read-boundary'),
      '不读取文件'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'public-link-boundary'),
      '不改链接'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'learner-notification-boundary'),
      '不通知学习者'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'private-data-guard'),
      '已省略私有数据'
    );
    assertNoPrivateNotificationText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffItemValue(
  view: SettingsNotificationUpdateHandoffView,
  id: SettingsNotificationUpdateHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing notification handoff item ${id}`);
  return item.value;
}

function assertNoPrivateNotificationText(serializedView: string) {
  for (const privateValue of [
    SECRET_PROVIDER_ERROR,
    SECRET_MUTATION_PAYLOAD,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_TOKEN,
    SECRET_TEACHER_EMAIL,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Notification handoff leaked private text: ${privateValue}`
    );
  }
}

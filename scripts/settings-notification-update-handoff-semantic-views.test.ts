import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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

const NOTIFICATION_ROUTE_SOURCE = readFileSync(
  'src/routes/settings/notifications.tsx',
  'utf8'
);
const NOTIFICATION_SUMMARY_SOURCE = readFileSync(
  'src/components/settings/notification/notification-workspace-summary.tsx',
  'utf8'
);
const NEWSLETTER_CARD_SOURCE = readFileSync(
  'src/components/settings/notification/newsletter-form-card.tsx',
  'utf8'
);
const NEWSLETTER_HOOK_SOURCE = readFileSync(
  'src/hooks/use-newsletter.ts',
  'utf8'
);
const NEWSLETTER_API_SOURCE = readFileSync('src/api/newsletter.ts', 'utf8');

const LEGACY_NOTIFICATION_COPY_MARKERS = [
  'Lang Study',
  'getlangstudy',
  'HSK',
  'Hanzi',
  'saved character',
  'Chinese level',
  'generic SaaS announcements',
] as const;

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

test('notification settings page wires update boundary before newsletter control', () => {
  assert.match(
    NOTIFICATION_ROUTE_SOURCE,
    /beforeLoad: \(\) => \{[\s\S]*isSettingsNotificationsEnabled\(\)[\s\S]*throw notFound\(\{ routeId: rootRouteId \}\);[\s\S]*\}/,
    'Notification settings route should remain feature-gated by the shared helper.'
  );
  assert.match(
    NOTIFICATION_ROUTE_SOURCE,
    /const pageView = buildSettingsNotificationPageViewModel\(\);[\s\S]*breadcrumbs=\{pageView\.breadcrumbs\}[\s\S]*title=\{pageView\.title\}[\s\S]*description=\{pageView\.description\}/,
    'Notification settings route should consume the prepared page view model.'
  );
  assert.match(
    NOTIFICATION_ROUTE_SOURCE,
    /<NotificationWorkspaceSummary view=\{pageView\.workspaceSummaryView\} \/>[\s\S]*<NewsletterFormCard view=\{pageView\.newsletterCardView\} \/>/,
    'Notification workspace boundary should render before the newsletter control card.'
  );
  assert.match(
    NOTIFICATION_SUMMARY_SOURCE,
    /view\.itemViews\.map\(\(itemView\) =>[\s\S]*key=\{itemView\.id\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*itemView\.label[\s\S]*itemView\.description/,
    'Notification workspace summary should render prepared summary items by stable ids.'
  );
  assert.match(
    NOTIFICATION_SUMMARY_SOURCE,
    /<NotificationUpdateHandoff handoffView=\{view\.handoffView\} \/>[\s\S]*handoffView\.itemViews\.map[\s\S]*key=\{itemView\.id\}[\s\S]*<output aria-label=\{itemView\.ariaLabel\}/,
    'Notification workspace summary should render the 30-slice handoff outputs.'
  );
  assertNoLegacyNotificationCopy(NOTIFICATION_ROUTE_SOURCE);
  assertNoLegacyNotificationCopy(NOTIFICATION_SUMMARY_SOURCE);
});

test('newsletter settings control mutates only teacher product email state', () => {
  assert.match(
    NEWSLETTER_CARD_SOURCE,
    /useNewsletterStatus\([\s\S]*notificationsEnabled \? currentUser\?\.email : undefined[\s\S]*\)/,
    'Newsletter card should query status only for the signed-in teacher email.'
  );
  assert.match(
    NEWSLETTER_CARD_SOURCE,
    /await subscribeMutation\.mutateAsync\(currentUser\.email\);[\s\S]*await unsubscribeMutation\.mutateAsync\(currentUser\.email\);/,
    'Newsletter card should mutate only the current teacher email subscription.'
  );
  assert.match(
    NEWSLETTER_CARD_SOURCE,
    /toast\.error\(view\.emailRequiredMessage\)[\s\S]*toast\.success\(view\.subscribeSuccessMessage\)[\s\S]*toast\.success\(view\.unsubscribeSuccessMessage\)[\s\S]*toast\.error\(view\.errorMessage\)/,
    'Newsletter card should use prepared localized feedback for every state.'
  );
  assert.match(
    NEWSLETTER_CARD_SOURCE,
    /catch \{[\s\S]*console\.error\('newsletter subscription update failed'\);[\s\S]*toast\.error\(view\.errorMessage\)/,
    'Newsletter card should log only a stable failure event and show localized copy.'
  );
  assert.doesNotMatch(
    NEWSLETTER_CARD_SOURCE,
    /console\.error\([^)]*,|err\.message|error\.message|statusError\?\.message|subscribeMutation\.error\?\.message|unsubscribeMutation\.error\?\.message/,
    'Newsletter card should not expose raw mutation errors or provider payloads.'
  );
  assert.match(
    NEWSLETTER_HOOK_SOURCE,
    /queryKey: newsletterKeys\.status\(email \?\? ''\)[\s\S]*queryFn: \(\) => getNewsletterStatus\(\{ data: \{ email: email! \} \}\)[\s\S]*enabled: !!email/,
    'Newsletter status hook should be email-scoped and disabled without email.'
  );
  assert.match(
    NEWSLETTER_HOOK_SOURCE,
    /mutationFn: \(email: string\) => subscribeNewsletter\(\{ data: \{ email \} \}\)[\s\S]*invalidateQueries\(\{ queryKey: newsletterKeys\.status\(email\) \}\)[\s\S]*mutationFn: \(email: string\) => unsubscribeNewsletter\(\{ data: \{ email \} \}\)[\s\S]*invalidateQueries\(\{ queryKey: newsletterKeys\.status\(email\) \}\)/,
    'Newsletter mutations should send and invalidate only the teacher email status.'
  );
  assertNoNewsletterDataMutationSurface(NEWSLETTER_HOOK_SOURCE);
  assertNoLegacyNotificationCopy(NEWSLETTER_CARD_SOURCE);
});

test('newsletter server functions sanitize provider failures and mail context', () => {
  assert.match(
    NEWSLETTER_API_SOURCE,
    /const emailSchema = z\.email\(m\.newsletter_email_invalid\(\)\);[\s\S]*\.validator\(z\.object\(\{ email: emailSchema \}\)\)/,
    'Newsletter API should validate only the teacher email input.'
  );
  assert.match(
    NEWSLETTER_API_SOURCE,
    /template: 'subscribeNewsletter'[\s\S]*context: \{ email: data\.email, locale: getLocale\(\) \}/,
    'Newsletter API should send the localized classroom update welcome email.'
  );
  assert.match(
    NEWSLETTER_API_SOURCE,
    /catch \{[\s\S]*console\.error\('Newsletter status check failed'\);[\s\S]*throw new Error\(m\.newsletter_error_generic\(\)\);/,
    'Newsletter status failures should log a stable event and return generic localized copy.'
  );
  assert.match(
    NEWSLETTER_API_SOURCE,
    /catch \{[\s\S]*console\.error\('Newsletter welcome email failed'\);[\s\S]*catch \{[\s\S]*console\.error\('Newsletter subscribe failed'\);[\s\S]*throw new Error\(m\.newsletter_error\(\)\);/,
    'Newsletter subscribe failures should not serialize provider errors.'
  );
  assert.match(
    NEWSLETTER_API_SOURCE,
    /catch \{[\s\S]*console\.error\('Newsletter unsubscribe failed'\);[\s\S]*throw new Error\(m\.newsletter_error_unsubscribe\(\)\);/,
    'Newsletter unsubscribe failures should not serialize provider errors.'
  );
  assert.doesNotMatch(
    NEWSLETTER_API_SOURCE,
    /console\.error\([^)]*,|throw new Error\(\s*(?:error|err|e)\.message|error instanceof Error|err instanceof Error/,
    'Newsletter API should not expose raw provider errors to logs or clients.'
  );
  assertNoNewsletterDataMutationSurface(NEWSLETTER_API_SOURCE);
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

function assertNoLegacyNotificationCopy(value: string) {
  for (const marker of LEGACY_NOTIFICATION_COPY_MARKERS) {
    assert.equal(
      value.includes(marker),
      false,
      `Notification settings copied legacy text: ${marker}`
    );
  }
}

function assertNoNewsletterDataMutationSurface(source: string) {
  assert.doesNotMatch(
    source,
    /@\/(?:activities|assignments|storage|db)|activityId|assignmentId|attemptId|studentId|shareSlug|sourceMaterial|storageKey|publicLink|learner/i,
    'Newsletter settings should not import or mutate classroom activity, assignment, attempt, student, public-link, or source-material data.'
  );
}

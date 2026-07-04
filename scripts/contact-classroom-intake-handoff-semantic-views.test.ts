import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildContactClassroomIntakeHandoffView,
  CONTACT_CLASSROOM_INTAKE_HANDOFF_ITEM_IDS,
  type ContactClassroomIntakeHandoffItemId,
  type ContactClassroomIntakeHandoffView,
} from '@/contact/inquiry-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_FILE_BYTES = 'raw-private-file-bytes';
const SECRET_PRIVATE_FILE_URL =
  'https://files.example.test/private/worksheet.pdf?token=secret';
const SECRET_PROVIDER_ERROR = 'raw-provider-stack-trace';
const SECRET_SOURCE_STORAGE_KEY = 'source-material/private/storage-key.pdf';
const SECRET_STUDENT_TOKEN = 'raw-student-token';

test('contact classroom intake handoff exposes 20 safe intake slices', () => {
  const handoffView = buildContactClassroomIntakeHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...CONTACT_CLASSROOM_INTAKE_HANDOFF_ITEM_IDS]);
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
    createsAssignmentLinks: false,
    exposesPrivateFileUrls: false,
    exposesRawProviderErrors: false,
    exposesRawStudentIdentifiers: false,
    exposesRecipientEmailInView: false,
    exposesSourceMaterialStorageKeys: false,
    forwardsLocaleToMail: true,
    itemIds,
    notifiesLearners: false,
    persistsActivityContent: false,
    readsFileBytes: false,
    scope: 'public-classroom-inquiry-intake',
    usesStructuredFields: true,
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['classroom-intent', 'Classroom workflow'],
      ['subject-routing', 'ClassGamify classroom workflow'],
      ['message-template', 'Prompted context'],
      ['learners-field', 'Learners'],
      ['grade-field', 'Class or grade'],
      ['material-field', 'Activity material'],
      ['routine-field', 'Weekly routine'],
      ['need-field', 'Main need'],
      ['message-body', 'Message'],
      ['name-field', 'Name'],
      ['email-field', 'Email'],
      ['field-normalization', 'Trimmed NFKC text'],
      ['field-limits', 'Bounded fields'],
      ['structured-payload', 'classroomInquiry'],
      ['api-intent-normalization', 'Server normalized'],
      ['mail-context', 'Contact email'],
      ['locale-forwarding', 'Request locale'],
      ['safe-context-boundary', 'Safe classroom context'],
      ['private-data-guard', 'Private data omitted'],
      ['legacy-copy-guard', 'ClassGamify only'],
    ]
  );
  assertNoPrivateContactText(JSON.stringify(handoffView));
});

test('contact classroom intake handoff localizes Chinese boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildContactClassroomIntakeHandoffView();

    assert.equal(handoffView.title, '课堂咨询收集');
    assert.match(handoffView.description, /20 切片课堂咨询收集契约/);
    assert.equal(
      getHandoffItemValue(handoffView, 'classroom-intent'),
      '课堂工作流'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'field-normalization'),
      '已裁剪 NFKC 文本'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'safe-context-boundary'),
      '安全课堂上下文'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'private-data-guard'),
      '已省略私有数据'
    );
    assertNoPrivateContactText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffItemValue(
  view: ContactClassroomIntakeHandoffView,
  id: ContactClassroomIntakeHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing contact classroom intake handoff item ${id}`);
  return item.value;
}

function assertNoPrivateContactText(serializedView: string) {
  for (const privateValue of [
    SECRET_FILE_BYTES,
    SECRET_PRIVATE_FILE_URL,
    SECRET_PROVIDER_ERROR,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Contact classroom intake handoff leaked private text: ${privateValue}`
    );
  }
}

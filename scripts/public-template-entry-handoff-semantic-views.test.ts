import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS,
  buildPublicTemplateEntryHandoffView,
  buildTemplatesPageViewModel,
  buildWorksheetsPageViewModel,
  type PublicTemplateEntryHandoffItemId,
  type PublicTemplateEntryHandoffView,
} from '@/activities/entry-page-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import { Routes } from '@/lib/routes';

overwriteGetLocale(() => 'en');

const SECRET_ACTIVITY_CONTENT = 'SECRET_ACTIVITY_CONTENT';
const SECRET_ANSWER_KEY = 'SECRET_ANSWER_KEY';
const SECRET_ATTEMPT = 'SECRET_ATTEMPT';
const SECRET_STUDENT_IDENTITY = 'SECRET_STUDENT_IDENTITY';
const SECRET_STORAGE_KEY = 'userfiles/teacher/private-template-source.pdf';

test('public template entry handoff exposes 30 safe creation slices', () => {
  const handoffView = buildPublicTemplateEntryHandoffView({
    surface: 'templates',
  });
  const itemIds = handoffView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [...PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.ok(
    handoffView.itemViews.every(
      (itemView) =>
        itemView.ariaLabel &&
        itemView.description &&
        itemView.label &&
        itemView.value
    )
  );
  assert.deepEqual(handoffView.privacy, {
    exposesActivityContent: false,
    exposesAnswerKeys: false,
    exposesAssignmentAttempts: false,
    exposesRawStudentIdentity: false,
    exposesSourceMaterialStorageKeys: false,
    exposesTeacherPrivateWorkspaceData: false,
    itemIds,
    mutatesTeacherData: false,
    opensCreateEditorOnly: true,
    preservesSharedActivityAssignmentModel: true,
    scope: 'public-template-entry',
    surface: 'templates',
  });

  assert.equal(
    getHandoffValue(handoffView, 'entry-surface'),
    'Template directory'
  );
  assert.equal(
    getHandoffValue(handoffView, 'templates-route'),
    Routes.Templates
  );
  assert.equal(
    getHandoffValue(handoffView, 'worksheets-route'),
    Routes.Worksheets
  );
  assert.equal(getHandoffValue(handoffView, 'template-count'), '8');
  assert.equal(getHandoffValue(handoffView, 'worksheet-mode-count'), '4');
  assert.equal(getHandoffValue(handoffView, 'default-template'), 'Quiz');
  assert.equal(
    getHandoffValue(handoffView, 'hero-create-action'),
    'Create from template'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-preview-action'),
    'Open student preview'
  );
  assert.equal(
    getHandoffValue(handoffView, 'footer-create-action'),
    'Create activity'
  );
  assert.equal(
    getHandoffValue(handoffView, 'worksheet-primary-action'),
    'Create fill blanks'
  );
  assert.equal(getHandoffValue(handoffView, 'worksheet-hero-actions'), '4');
  assert.equal(getHandoffValue(handoffView, 'worksheet-mode-actions'), '4');
  assert.equal(
    getHandoffValue(handoffView, 'templates-source-param'),
    'source=templates'
  );
  assert.equal(
    getHandoffValue(handoffView, 'worksheets-source-param'),
    'source=worksheets'
  );
  assert.equal(
    getHandoffValue(handoffView, 'template-search-param'),
    'template'
  );
  assert.equal(
    getHandoffValue(handoffView, 'scaffold-loading'),
    'Scaffold loaded'
  );
  assert.equal(
    getHandoffValue(handoffView, 'shared-editor-contract'),
    'CreateActivityInput'
  );
  assert.equal(getHandoffValue(handoffView, 'content-requirements'), '3');
  assert.equal(getHandoffValue(handoffView, 'card-entry-steps'), '3');
  assert.equal(
    getHandoffValue(handoffView, 'worksheet-delivery-loop'),
    'Activity -> Assignment -> Attempt -> Results'
  );
  assert.equal(
    getHandoffValue(handoffView, 'workflow-create'),
    'Create content'
  );
  assert.equal(getHandoffValue(handoffView, 'workflow-assign'), 'Choose mode');
  assert.equal(
    getHandoffValue(handoffView, 'workflow-student-submit'),
    'Publish link'
  );
  assert.equal(
    getHandoffValue(handoffView, 'workflow-review'),
    'Review results'
  );
  assert.equal(
    getHandoffValue(handoffView, 'assignment-snapshot-boundary'),
    'AssignmentSnapshot'
  );
  assert.equal(
    getHandoffValue(handoffView, 'results-export-boundary'),
    'Results model'
  );
  assert.equal(
    getHandoffValue(handoffView, 'printable-extension-boundary'),
    'Same assignment'
  );
  assert.equal(
    getHandoffValue(handoffView, 'legacy-product-guard'),
    'No legacy product'
  );
  assert.equal(getHandoffValue(handoffView, 'indexing-scope'), 'Public entry');
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private data hidden'
  );

  assertNoPrivateEntryText(JSON.stringify(handoffView));
});

test('template and worksheet pages attach the matching public entry surface', () => {
  const templatesPage = buildTemplatesPageViewModel();
  const worksheetsPage = buildWorksheetsPageViewModel();

  assert.equal(templatesPage.handoffView.privacy.surface, 'templates');
  assert.equal(worksheetsPage.handoffView.privacy.surface, 'worksheets');
  assert.equal(
    getHandoffValue(templatesPage.handoffView, 'entry-surface'),
    'Template directory'
  );
  assert.equal(
    getHandoffValue(worksheetsPage.handoffView, 'entry-surface'),
    'Worksheet entry'
  );
});

test('public template entry handoff localizes the surface without changing ids', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildPublicTemplateEntryHandoffView({
      surface: 'worksheets',
    });

    assert.deepEqual(
      handoffView.itemViews.map((itemView) => itemView.id),
      [...PUBLIC_TEMPLATE_ENTRY_HANDOFF_ITEM_IDS]
    );
    assert.equal(getHandoffValue(handoffView, 'entry-surface'), '练习纸入口');
    assert.equal(getHandoffValue(handoffView, 'template-count'), '8');
    assert.equal(getHandoffValue(handoffView, 'worksheet-mode-count'), '4');
    assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '私有数据隐藏');
    assertNoPrivateEntryText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffValue(
  view: PublicTemplateEntryHandoffView,
  id: PublicTemplateEntryHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing public template entry handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateEntryText(serializedView: string) {
  for (const privateValue of [
    SECRET_ACTIVITY_CONTENT,
    SECRET_ANSWER_KEY,
    SECRET_ATTEMPT,
    SECRET_STUDENT_IDENTITY,
    SECRET_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Public template entry handoff leaked private text: ${privateValue}`
    );
  }
}

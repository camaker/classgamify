import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildHomePageViewModel,
  HOME_PAGE_PRODUCT_LOOP_HANDOFF_ITEM_IDS,
  type HomePageProductLoopHandoffItemId,
  type HomePageProductLoopHandoffView,
} from '@/pages/public-page-view';
import { Routes } from '@/lib/routes';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const HOME_ROUTE_SOURCE = readFileSync('src/routes/index.tsx', 'utf8');

const SECRET_ANSWER_KEY = 'SECRET_TEACHER_ANSWER_KEY';
const SECRET_ATTEMPT_RECORD = 'SECRET_STUDENT_ATTEMPT_RECORD';
const SECRET_FILE_BYTES = 'raw-private-worksheet-bytes';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/key.pdf';
const SECRET_STUDENT_TOKEN = 'raw-anonymous-student-token';
const SECRET_TEACHER_CONTENT = 'SECRET_TEACHER_ACTIVITY_CONTENT';

test('homepage route keeps internal product-loop handoff out of public DOM', () => {
  assert.doesNotMatch(
    HOME_ROUTE_SOURCE,
    /HomePageProductLoopHandoff|data-handoff|data-handoff-item|pageView\.handoffView/,
    'Homepage route must not render internal product-loop handoff markup on the public page.'
  );
});

test('homepage product-loop handoff exposes 30 public entry slices', () => {
  const pageView = buildHomePageViewModel();
  const handoffView = pageView.handoffView;
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...HOME_PAGE_PRODUCT_LOOP_HANDOFF_ITEM_IDS]);
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
    createsAssignmentLinks: false,
    exposesAnswerKeys: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds,
    keepsLegacyEntrypointsOut: true,
    mutatesTeacherData: false,
    previewIsStarterOnly: true,
    routeActionsUseSharedConstants: true,
    scope: 'public-home-product-loop',
  });

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-loop', 'Activity -> Assignment -> Attempt -> Results'],
      ['homepage-surface', 'Public homepage'],
      ['hero-create-route', Routes.Create],
      ['hero-template-route', Routes.Templates],
      ['hero-worksheet-route', Routes.Worksheets],
      ['create-route', Routes.Create],
      ['templates-route', Routes.Templates],
      ['worksheets-route', Routes.Worksheets],
      ['starter-preview-source', 'Sample preview'],
      ['starter-preview-activity', 'Sample activity'],
      ['starter-preview-assignment', 'Sample assignment'],
      ['starter-preview-submit-boundary', 'Read-only sample'],
      ['feature-section', '4 items'],
      ['feature-structured-activities', 'Structured activities'],
      ['feature-template-switching', 'Template switching'],
      ['feature-assignment-links', 'Assignment links'],
      ['feature-teacher-results', 'Teacher results'],
      ['signal-panel', '3 items'],
      ['signal-templates', '8 first'],
      ['signal-delivery', 'Share link'],
      ['signal-results', 'Attempt log'],
      ['activity-content-model', 'ActivityContent'],
      ['assignment-snapshot-boundary', 'AssignmentSnapshot'],
      ['student-runner-boundary', 'Public practice'],
      ['result-review-boundary', 'Teacher results'],
      ['worksheet-extension-boundary', Routes.Worksheets],
      ['ai-draft-boundary', 'Teacher-reviewed'],
      ['legacy-entrypoint-guard', 'ClassGamify paths'],
      ['indexing-scope', 'Public entrypoint'],
      ['privacy-guard', 'Private data hidden'],
    ]
  );
  assertNoPrivateHomepageText(JSON.stringify(handoffView));
});

test('homepage product-loop handoff localizes Chinese public boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildHomePageViewModel().handoffView;

    assert.equal(handoffView.title, '首页课堂流程摘要');
    assert.match(handoffView.description, /首页摘要/);
    assert.equal(
      getHandoffValue(handoffView, 'product-loop'),
      'Activity -> Assignment -> Attempt -> Results'
    );
    assert.equal(getHandoffValue(handoffView, 'homepage-surface'), '公开首页');
    assert.equal(getHandoffValue(handoffView, 'feature-section'), '4 个项目');
    assert.equal(getHandoffValue(handoffView, 'signal-panel'), '3 个项目');
    assert.equal(
      getHandoffValue(handoffView, 'starter-preview-submit-boundary'),
      '只读示例'
    );
    assert.equal(
      getHandoffValue(handoffView, 'legacy-entrypoint-guard'),
      'ClassGamify 入口'
    );
    assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '私密数据隐藏');
    assertNoPrivateHomepageText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('homepage visual model and handoff share route constants', () => {
  const pageView = buildHomePageViewModel();

  assert.equal(pageView.hero.primaryAction.to, Routes.Create);
  assert.equal(pageView.hero.browseTemplatesAction.to, Routes.Templates);
  assert.equal(pageView.hero.worksheetAction.to, Routes.Worksheets);
  assert.equal(
    getHandoffValue(pageView.handoffView, 'hero-create-route'),
    Routes.Create
  );
  assert.equal(
    getHandoffValue(pageView.handoffView, 'hero-template-route'),
    Routes.Templates
  );
  assert.equal(
    getHandoffValue(pageView.handoffView, 'hero-worksheet-route'),
    Routes.Worksheets
  );
  assert.equal(
    pageView.handoffView.privacy.routeActionsUseSharedConstants,
    true
  );
});

function getHandoffValue(
  view: HomePageProductLoopHandoffView,
  id: HomePageProductLoopHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing homepage product-loop handoff item ${id}`);
  return item.value;
}

function assertNoPrivateHomepageText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_KEY,
    SECRET_ATTEMPT_RECORD,
    SECRET_FILE_BYTES,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_TOKEN,
    SECRET_TEACHER_CONTENT,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Homepage product-loop handoff leaked private text: ${privateValue}`
    );
  }
}

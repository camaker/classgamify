import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getActivityTemplates } from '@/activities/catalog';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import { Routes } from '@/lib/routes';
import {
  buildTeachersPageViewModel,
  TEACHERS_PAGE_HANDOFF_ITEM_IDS,
  type TeachersPageHandoffItemId,
  type TeachersPageHandoffView,
} from '@/pages/public-page-view';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_KEY = 'SECRET_TEACHER_ANSWER_KEY';
const SECRET_ATTEMPT_RECORD = 'SECRET_STUDENT_ATTEMPT_RECORD';
const SECRET_FILE_BYTES = 'raw-private-worksheet-bytes';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/teacher-page.pdf';
const SECRET_STUDENT_TOKEN = 'raw-anonymous-student-token';
const SECRET_TEACHER_CONTENT = 'SECRET_TEACHER_ACTIVITY_CONTENT';

const TEACHERS_ROUTE_SOURCE = readFileSync(
  'src/routes/(pages)/teachers.tsx',
  'utf8'
);

test('teachers public handoff exposes 30 safe product-loop slices', () => {
  const pageView = buildTeachersPageViewModel();
  const handoffView = pageView.handoffView;
  const itemIds = handoffView.itemViews.map((item) => item.id);
  const templateNames = getActivityTemplates().map((template) => template.name);

  assert.deepEqual(itemIds, [...TEACHERS_PAGE_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(handoffView.title, 'Teachers page classroom flow summary');
  assert.match(handoffView.description, /Teachers page summary/);
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
    mutatesTeacherWorkspace: false,
    routeActionsUseSharedConstants: true,
    scope: 'public-teachers-product-loop',
    templateModesComeFromCatalog: true,
    usesClassGamifyCopy: true,
    usesPreparedViewModel: true,
  });

  assert.equal(getHandoffValue(handoffView, 'teachers-route'), Routes.Teachers);
  assert.equal(
    getHandoffValue(handoffView, 'teacher-audience'),
    'Teachers, tutors, schools, and learning centers'
  );
  assert.equal(
    getHandoffValue(handoffView, 'primary-create-action'),
    Routes.Create
  );
  assert.equal(
    getHandoffValue(handoffView, 'secondary-contact-action'),
    Routes.ContactClassroom
  );
  assert.equal(getHandoffValue(handoffView, 'workflow-section'), '3 items');
  assert.equal(
    getHandoffValue(handoffView, 'workflow-draft'),
    'Start from lesson content'
  );
  assert.equal(
    getHandoffValue(handoffView, 'workflow-publish'),
    'Choose a game template'
  );
  assert.equal(
    getHandoffValue(handoffView, 'workflow-share'),
    'Publish an assignment'
  );
  assert.equal(getHandoffValue(handoffView, 'use-case-section'), '3 items');
  assert.equal(
    getHandoffValue(handoffView, 'use-case-results'),
    'Result follow-up'
  );
  assert.equal(
    getHandoffValue(handoffView, 'template-count'),
    `${templateNames.length} items`
  );
  assert.equal(
    getHandoffValue(handoffView, 'template-mode-coverage'),
    `${templateNames.length} catalog modes`
  );
  assert.equal(
    getHandoffValue(handoffView, 'template-classroom-mode-label'),
    'Classroom mode'
  );
  assert.deepEqual(
    [
      'template-quiz',
      'template-match-up',
      'template-group-sort',
      'template-fill-blank',
      'template-listening',
      'template-matching-pairs',
      'template-line-match',
      'template-open-box',
    ].map((id) =>
      getHandoffValue(handoffView, id as TeachersPageHandoffItemId)
    ),
    [
      templateNames[0],
      templateNames[1],
      templateNames[3],
      templateNames[4],
      templateNames[5],
      templateNames[6],
      templateNames[2],
      templateNames[7],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'school-contact-route'),
    Routes.ContactClassroom
  );
  assert.equal(
    getHandoffValue(handoffView, 'activity-assignment-loop'),
    'Activity -> Assignment -> Attempt -> Results'
  );
  assert.equal(
    getHandoffValue(handoffView, 'legacy-copy-guard'),
    'ClassGamify only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private data hidden'
  );
  assertNoPrivateTeachersText(JSON.stringify(handoffView));
});

test('teachers route renders the prepared public handoff view', () => {
  assert.match(
    TEACHERS_ROUTE_SOURCE,
    /<TeachersPageHandoffPanel view=\{pageView\.handoffView\} \/>/,
    'Teachers route should render the prepared product-loop handoff view.'
  );
  assert.match(
    TEACHERS_ROUTE_SOURCE,
    /data-handoff="teachers-page-product-loop"[\s\S]*view\.itemViews\.map\(\(item\) =>[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*aria-label=\{item\.ariaLabel\}/,
    'Teachers handoff panel should expose stable item ids and aria labels.'
  );
  assert.doesNotMatch(
    TEACHERS_ROUTE_SOURCE,
    /data-handoff="teachers-page-product-loop"[\s\S]*Routes\./,
    'Teachers handoff route values should stay inside the prepared page model.'
  );
});

test('teachers public handoff localizes Chinese product boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildTeachersPageViewModel().handoffView;

    assert.equal(handoffView.title, '教师页课堂流程摘要');
    assert.match(handoffView.description, /教师页摘要/);
    assert.equal(getHandoffValue(handoffView, 'teachers-route'), '/teachers');
    assert.equal(
      getHandoffValue(handoffView, 'teacher-audience'),
      '老师、辅导老师、学校和学习中心'
    );
    assert.equal(getHandoffValue(handoffView, 'workflow-section'), '3 个项目');
    assert.equal(getHandoffValue(handoffView, 'use-case-section'), '3 个项目');
    assert.equal(getHandoffValue(handoffView, 'template-count'), '8 个项目');
    assert.equal(
      getHandoffValue(handoffView, 'template-mode-coverage'),
      '8 个目录模式'
    );
    assert.equal(
      getHandoffValue(handoffView, 'template-classroom-mode-label'),
      '课堂模式'
    );
    assert.equal(
      getHandoffValue(handoffView, 'school-contact-route'),
      '/contact?subject=classroom'
    );
    assert.equal(
      getHandoffValue(handoffView, 'legacy-copy-guard'),
      '仅 ClassGamify'
    );
    assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '私密数据隐藏');
    assertNoPrivateTeachersText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffValue(
  view: TeachersPageHandoffView,
  id: TeachersPageHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing teachers page handoff item ${id}`);
  return item.value;
}

function assertNoPrivateTeachersText(serializedView: string) {
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
      `Teachers page handoff leaked private text: ${privateValue}`
    );
  }
}

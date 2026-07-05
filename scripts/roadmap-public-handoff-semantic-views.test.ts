import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRoadmapPageViewModel,
  ROADMAP_PUBLIC_HANDOFF_ITEM_IDS,
  type RoadmapPublicHandoffItemId,
  type RoadmapPublicHandoffView,
} from '@/pages/public-page-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import { Routes } from '@/lib/routes';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_KEY = 'SECRET_TEACHER_ANSWER_KEY';
const SECRET_ATTEMPT_RECORD = 'SECRET_STUDENT_ATTEMPT_RECORD';
const SECRET_STUDENT_TOKEN = 'raw-anonymous-student-token';
const SECRET_STORAGE_KEY = 'source-materials/private/worksheet.pdf';
const SECRET_TEACHER_ACTIVITY_CONTENT = 'SECRET_TEACHER_ACTIVITY_CONTENT';
const SECRET_WORKSHEET_BYTES = 'raw-private-worksheet-bytes';

test('roadmap handoff exposes 30 safe public product-boundary slices', () => {
  const handoffView = buildRoadmapPageViewModel().handoffView;
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ROADMAP_PUBLIC_HANDOFF_ITEM_IDS]);
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
    describesCurrentUsableLoop: true,
    describesPublicRoadmapSurface: true,
    exposesAnswerKeys: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    itemIds,
    keepsLegacyCopyOut: true,
    keepsPlannedBetsExploratory: true,
    mutatesTeacherWorkspace: false,
    readsSourceMaterialFileBytes: false,
    rendersTaskEvidence: true,
    rendersTaskNextSteps: true,
    rendersValidationCriteria: true,
    routeActionsUseSharedConstants: true,
    scope: 'public-roadmap-product-boundary',
    usesPreparedViewModel: true,
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['current-loop', 'Activity -> Assignment -> Attempt -> Results'],
      ['roadmap-surface', '/roadmap'],
      ['available-count', '3'],
      ['improving-count', '2'],
      ['planned-count', '2'],
      ['column-board', '3 columns'],
      ['status-label-boundary', 'Prepared status labels'],
      ['activity-assignment-loop', 'Live'],
      ['template-foundation', 'Live'],
      ['ai-draft-capability', 'Live'],
      ['results-reteach-focus', 'Improving'],
      ['worksheet-delivery-focus', 'Improving'],
      ['worksheet-extraction-boundary', 'Exploring'],
      ['school-workflow-boundary', 'Exploring'],
      ['task-evidence-boundary', 'Public evidence only'],
      ['task-next-step-boundary', 'Shared next steps'],
      ['hero-action-boundary', 'Prepared CTA routes'],
      ['create-route', Routes.Create],
      ['templates-route', Routes.Templates],
      ['feedback-route', Routes.ContactClassroom],
      ['snapshot-panel', '3 snapshots'],
      ['snapshot-live-core', 'Usable classroom core'],
      ['snapshot-template-depth', 'Template depth now'],
      ['snapshot-ai-expansion', 'AI drafts now, extraction next'],
      ['principle-focus-boundary', 'Core loop before breadth'],
      ['principle-model-boundary', 'One content model'],
      [
        'validation-decision-boundary',
        'Every roadmap item needs classroom proof',
      ],
      ['public-copy-boundary', 'Prepared product copy'],
      ['legacy-copy-guard', 'ClassGamify only'],
      ['privacy-guard', 'Private data hidden'],
    ]
  );
  assertNoPrivateRoadmapText(JSON.stringify(handoffView));
});

test('roadmap handoff localizes Chinese product boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildRoadmapPageViewModel().handoffView;

    assert.equal(handoffView.title, '公开路线图交接');
    assert.match(handoffView.description, /30 切片公开路线图边界/);
    assert.equal(
      getHandoffItemValue(handoffView, 'current-loop'),
      'Activity -> Assignment -> Attempt -> Results'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'roadmap-surface'),
      '/roadmap'
    );
    assert.equal(getHandoffItemValue(handoffView, 'available-count'), '3');
    assert.equal(getHandoffItemValue(handoffView, 'column-board'), '3 个栏目');
    assert.equal(
      getHandoffItemValue(handoffView, 'status-label-boundary'),
      '已准备状态标签'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'snapshot-panel'),
      '3 个快照'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'principle-model-boundary'),
      '一套内容模型'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'validation-decision-boundary'),
      '每个路线图项目都需要课堂证据'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'public-copy-boundary'),
      '已准备产品文案'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'legacy-copy-guard'),
      '仅 ClassGamify'
    );
    assert.equal(
      getHandoffItemValue(handoffView, 'privacy-guard'),
      '私密数据隐藏'
    );
    assertNoPrivateRoadmapText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffItemValue(
  view: RoadmapPublicHandoffView,
  id: RoadmapPublicHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing roadmap handoff item ${id}`);
  return item.value;
}

function assertNoPrivateRoadmapText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_KEY,
    SECRET_ATTEMPT_RECORD,
    SECRET_STUDENT_TOKEN,
    SECRET_STORAGE_KEY,
    SECRET_TEACHER_ACTIVITY_CONTENT,
    SECRET_WORKSHEET_BYTES,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Roadmap handoff leaked private text: ${privateValue}`
    );
  }
}

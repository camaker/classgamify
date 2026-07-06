import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_DELIVERY_POLICY_HANDOFF_ITEM_IDS,
  buildAssignmentDeliveryPolicyHandoffView,
  buildAssignmentSettingsSummaryView,
  buildPublicAssignmentRuleSummaryViewFromSettings,
  formatAssignmentDeliveryPolicyText,
  type AssignmentDeliveryPolicyHandoffItemId,
  type AssignmentDeliveryPolicyHandoffView,
} from '@/assignments/delivery-summary';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER_KEY = 'SECRET_TEACHER_ANSWER_KEY';
const SECRET_RAW_SETTINGS = '{"answerKey":"SECRET_TEACHER_ANSWER_KEY"}';
const SECRET_SHARE_SLUG = 'private-share-slug';
const SECRET_SOURCE_STORAGE_KEY = 'source-materials/private/policy.pdf';
const SECRET_STUDENT_ANSWER = 'student wrote the private answer';
const SECRET_STUDENT_NAME = 'Private Student';

const ASSIGNMENT_SETTINGS_SUMMARY_SOURCE = readFileSync(
  'src/components/assignments/assignment-settings-summary.tsx',
  'utf8'
);
const ASSIGNMENT_LIST_CARD_SOURCE = readFileSync(
  'src/components/assignments/assignment-list-card.tsx',
  'utf8'
);
const ASSIGNMENT_LIST_VIEW_SOURCE = readFileSync(
  'src/assignments/list-view.ts',
  'utf8'
);
const ASSIGNMENT_RESULTS_HEADER_SOURCE = readFileSync(
  'src/components/assignments/assignment-results-header-card.tsx',
  'utf8'
);
const ASSIGNMENT_RESULT_VIEW_SOURCE = readFileSync(
  'src/assignments/result-view.ts',
  'utf8'
);
const ASSIGNMENT_PUBLISH_SOURCE = readFileSync(
  'src/assignments/publish-input.ts',
  'utf8'
);
const PUBLIC_ASSIGNMENT_RULES_SOURCE = readFileSync(
  'src/components/assignments/public-assignment-rules.tsx',
  'utf8'
);
const STUDENT_RUNNER_HEADER_SOURCE = readFileSync(
  'src/components/assignments/student-runner-header-card.tsx',
  'utf8'
);
const STUDENT_RUNNER_VIEW_SOURCE = readFileSync(
  'src/assignments/student-runner-view.ts',
  'utf8'
);

const SAMPLE_SETTINGS = {
  collectStudentName: false,
  instructions: 'Read rules before starting.',
  maxAttempts: null,
  showCorrectAnswers: false,
  shuffleItems: false,
  timeLimitSeconds: 15 * 60,
};

test('assignment delivery policy handoff exposes 30 safe summary slices', () => {
  const handoffView = buildAssignmentDeliveryPolicyHandoffView({
    itemCount: 4,
    settings: SAMPLE_SETTINGS,
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ASSIGNMENT_DELIVERY_POLICY_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(handoffView.title, 'Assignment delivery policy handoff');
  assert.match(handoffView.description, /30-slice assignment delivery policy/);
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
    exposesRawSettingsJson: false,
    exposesShareSlug: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerText: false,
    exposesStudentNames: false,
    itemIds,
    mutatesAssignment: false,
    publicRulesAreSanitized: true,
    scope: 'assignment-delivery-policy-summary',
    settingsResolveThroughDomain: true,
    surfacesShareSummaryView: true,
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['domain-helper-source', 'delivery-summary.ts'],
      ['settings-resolution', 'Resolved settings'],
      [
        'settings-summary-surface',
        'Publish dialog + assignment card + result header',
      ],
      ['public-rules-surface', 'Student runner'],
      ['publish-dialog-surface', 'Publish dialog'],
      ['assignment-card-surface', 'AssignmentSettingsSummaryView'],
      ['result-header-surface', 'AssignmentSettingsSummaryView'],
      ['student-runner-surface', 'PublicAssignmentRuleSummaryView'],
      ['item-count-rule', '4 items'],
      ['attempts-rule', 'Open'],
      ['timer-rule', '15 min'],
      ['close-time-rule', 'No close time'],
      ['identity-rule', 'Anonymous'],
      ['answer-reveal-rule', 'Hidden'],
      ['item-order-rule', 'Fixed order'],
      ['instructions-rule', 'Read rules before starting.'],
      [
        'delivery-rule-order',
        'attempts -> timer -> closes -> identity -> answerReveal -> itemOrder',
      ],
      ['public-rule-count', '7 rules'],
      ['settings-rule-count', '6 rules'],
      ['status-derivation', 'Timer on'],
      ['default-attempts', '2 max'],
      ['unlimited-attempts', 'Open'],
      ['timer-normalization', '15 min'],
      ['close-time-normalization', 'No close time'],
      [
        'policy-text-export',
        'Student instructions: Read rules before starting.; Attempts: Open; Timer: 15 min; Closes: No close time; Student identity: Anonymous; Answer reveal: Hidden; Item order: Fixed order',
      ],
      ['snapshot-boundary', 'AssignmentSnapshot'],
      ['public-payload-boundary', 'Sanitized rules'],
      ['result-export-boundary', 'Policy text'],
      ['legacy-copy-guard', 'ClassGamify delivery policy'],
      ['privacy-guard', 'Private data hidden'],
    ]
  );
  assertNoPrivateDeliveryPolicyText(JSON.stringify(handoffView));
});

test('assignment delivery policy handoff stays aligned with shared helpers', () => {
  const settingsSummary = buildAssignmentSettingsSummaryView({
    expiresAt: undefined,
    settings: SAMPLE_SETTINGS,
  });
  const publicRules = buildPublicAssignmentRuleSummaryViewFromSettings({
    expiresAt: undefined,
    itemCount: 4,
    settings: SAMPLE_SETTINGS,
  });
  const handoffView = buildAssignmentDeliveryPolicyHandoffView({
    itemCount: 4,
    settings: SAMPLE_SETTINGS,
  });

  assert.equal(
    getHandoffValue(handoffView, 'attempts-rule'),
    settingsSummary.items.find((item) => item.id === 'attempts')?.value
  );
  assert.equal(
    getHandoffValue(handoffView, 'timer-rule'),
    settingsSummary.items.find((item) => item.id === 'timer')?.value
  );
  assert.equal(
    getHandoffValue(handoffView, 'item-count-rule'),
    publicRules.items.find((item) => item.id === 'items')?.value
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-rule-count'),
    `${publicRules.summary.ruleCount} rules`
  );
  assert.equal(
    getHandoffValue(handoffView, 'settings-rule-count'),
    `${settingsSummary.summary.deliveryRuleCount} rules`
  );
  assert.equal(
    getHandoffValue(handoffView, 'policy-text-export'),
    formatAssignmentDeliveryPolicyText({
      expiresAt: undefined,
      settings: SAMPLE_SETTINGS,
    })
  );
});

test('assignment delivery policy surfaces consume prepared summary views', () => {
  assert.match(
    ASSIGNMENT_SETTINGS_SUMMARY_SOURCE,
    /'view' in props[\s\S]*buildAssignmentSettingsSummaryView/
  );
  assert.match(
    ASSIGNMENT_PUBLISH_SOURCE,
    /const settingsSummaryView = buildAssignmentSettingsSummaryView\(\{[\s\S]*settingsSummaryView[\s\S]*deliveryRuleCount = settingsSummaryView\.summary\.deliveryRuleCount/
  );
  assert.match(
    ASSIGNMENT_LIST_VIEW_SOURCE,
    /settingsSummaryView: buildAssignmentSettingsSummaryView\(\{[\s\S]*settings: assignment\.settingsJson/
  );
  assert.match(
    ASSIGNMENT_LIST_CARD_SOURCE,
    /<AssignmentSettingsSummary view=\{assignment\.settingsSummaryView\} \/>/
  );
  assert.match(
    ASSIGNMENT_RESULT_VIEW_SOURCE,
    /settingsSummaryView: buildAssignmentSettingsSummaryView\(\{[\s\S]*settings: assignment\.settingsJson/
  );
  assert.match(
    ASSIGNMENT_RESULTS_HEADER_SOURCE,
    /<AssignmentSettingsSummary view=\{headerView\.settingsSummaryView\} \/>/
  );
  assert.match(
    STUDENT_RUNNER_VIEW_SOURCE,
    /const ruleSummaryView = buildPublicAssignmentRuleSummaryViewFromSettings\(\{[\s\S]*ruleSummaryView/
  );
  assert.match(
    STUDENT_RUNNER_HEADER_SOURCE,
    /<PublicAssignmentRules summaryView=\{view\.ruleSummaryView\} \/>/
  );
  assert.match(
    PUBLIC_ASSIGNMENT_RULES_SOURCE,
    /summaryView\.items\.map\(\(rule\) =>[\s\S]*<PublicAssignmentRuleItem key=\{rule\.id\} rule=\{rule\} \/>/
  );
});

test('assignment delivery policy handoff localizes Chinese summary boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildAssignmentDeliveryPolicyHandoffView({
      itemCount: 4,
      settings: {
        ...SAMPLE_SETTINGS,
        instructions: '请先阅读规则。',
      },
    });

    assert.equal(handoffView.title, '作业分发策略交接');
    assert.match(handoffView.description, /30 切片作业分发策略交接/);
    assert.equal(
      getHandoffValue(handoffView, 'settings-resolution'),
      '已解析设置'
    );
    assert.equal(
      getHandoffValue(handoffView, 'settings-summary-surface'),
      '发布弹窗 + 作业卡片 + 结果页头'
    );
    assert.equal(
      getHandoffValue(handoffView, 'public-rules-surface'),
      '学生作答器'
    );
    assert.equal(getHandoffValue(handoffView, 'item-count-rule'), '4 项');
    assert.equal(getHandoffValue(handoffView, 'attempts-rule'), '不限次数');
    assert.equal(getHandoffValue(handoffView, 'timer-rule'), '15 分钟');
    assert.equal(
      getHandoffValue(handoffView, 'close-time-rule'),
      '不设关闭时间'
    );
    assert.equal(getHandoffValue(handoffView, 'identity-rule'), '匿名');
    assert.equal(getHandoffValue(handoffView, 'answer-reveal-rule'), '隐藏');
    assert.equal(getHandoffValue(handoffView, 'item-order-rule'), '固定顺序');
    assert.equal(
      getHandoffValue(handoffView, 'instructions-rule'),
      '请先阅读规则。'
    );
    assert.equal(getHandoffValue(handoffView, 'public-rule-count'), '7 条规则');
    assert.equal(
      getHandoffValue(handoffView, 'settings-rule-count'),
      '6 条规则'
    );
    assert.equal(
      getHandoffValue(handoffView, 'status-derivation'),
      '已开启计时'
    );
    assert.equal(getHandoffValue(handoffView, 'default-attempts'), '最多 2 次');
    assert.equal(
      getHandoffValue(handoffView, 'unlimited-attempts'),
      '不限次数'
    );
    assert.equal(
      getHandoffValue(handoffView, 'policy-text-export'),
      '学生说明：请先阅读规则。；作答次数：不限次数；计时：15 分钟；关闭时间：不设关闭时间；学生身份：匿名；答案显示：隐藏；题目顺序：固定顺序'
    );
    assert.equal(
      getHandoffValue(handoffView, 'legacy-copy-guard'),
      'ClassGamify 分发策略'
    );
    assert.equal(getHandoffValue(handoffView, 'privacy-guard'), '私密数据隐藏');
    assertNoPrivateDeliveryPolicyText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

function getHandoffValue(
  view: AssignmentDeliveryPolicyHandoffView,
  id: AssignmentDeliveryPolicyHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing assignment delivery policy handoff item ${id}`);
  return item.value;
}

function assertNoPrivateDeliveryPolicyText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_KEY,
    SECRET_RAW_SETTINGS,
    SECRET_SHARE_SLUG,
    SECRET_SOURCE_STORAGE_KEY,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_NAME,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Assignment delivery policy handoff leaked private text: ${privateValue}`
    );
  }
}

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type { ActivityContent, AssignmentSettings } from '@/activities/types';
import {
  buildPublicAssignmentLookupResult,
  type PublicAssignmentUnavailablePayload,
} from '@/assignments/public';
import {
  buildStudentRunnerUnavailableSafetyView,
  type StudentRunnerMissingPageView,
} from '@/assignments/student-runner-state';
import {
  buildStudentRunnerMissingView,
  type StudentRunnerMissingReason,
} from '@/assignments/student-submission';
import {
  buildPublicAssignmentUnavailableAccessHandoffView,
  PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS,
  type PublicAssignmentUnavailableAccessHandoffItemId,
  type PublicAssignmentUnavailableAccessHandoffView,
} from '@/assignments/unavailable-access';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER = 'SECRET_UNAVAILABLE_TEACHER_ANSWER';
const SECRET_CHOICE = 'SECRET_UNAVAILABLE_CHOICE';
const SECRET_EXPLANATION = 'SECRET_UNAVAILABLE_EXPLANATION';
const SECRET_PROMPT = 'SECRET_UNAVAILABLE_PROMPT';
const SECRET_SHARE_SLUG = 'secret-unavailable-share-slug';
const SECRET_SOURCE_KEY = 'source-materials/private/unavailable.pdf';
const SECRET_STUDENT_ANSWER = 'SECRET_UNAVAILABLE_STUDENT_ANSWER';
const SECRET_TOKEN = 'raw-unavailable-anonymous-token';

test('closed assignment unavailable access exposes 30 safe cross-layer slices', () => {
  const lookupResult = buildPublicAssignmentLookupResult(
    buildPublicAssignmentSource({
      status: 'closed',
    })
  );
  assert.equal(lookupResult.status, 'unavailable');
  const missingView = buildMissingPageView(
    lookupResult.reason,
    lookupResult.unavailable
  );
  const handoffView = buildPublicAssignmentUnavailableAccessHandoffView({
    lookupResult,
    missingView,
    shareSlug: ` ${SECRET_SHARE_SLUG} `,
  });
  assert.ok(handoffView);
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS,
  ]);
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
    exposesActualShareSlug: false,
    exposesAnswerKeys: false,
    exposesAssignmentTitle: false,
    exposesBrowserLabel: false,
    exposesExplanations: false,
    exposesRawAnonymousToken: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesStudentAnswerText: false,
    exposesTeacherMaterials: false,
    itemIds,
  });

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['access-status', 'Unavailable'],
      ['unavailable-reason', 'Closed'],
      ['share-link-boundary', 'Normalized share id hidden'],
      ['missing-route-state', 'Closed'],
      ['student-message', 'Assignment closed'],
      ['status-scope', 'Closed'],
      ['next-step-scope', 'Contact teacher'],
      ['activity-content-scope', 'Hidden'],
      ['browser-identity-scope', 'Private'],
      ['submission-scope', 'Blocked'],
      ['safety-panel', 'What stays private'],
      ['safety-item-count', '5 safety items'],
      ['runtime-content-policy', 'Hidden'],
      ['answer-key-policy', 'Hidden'],
      ['explanation-policy', 'Hidden'],
      ['teacher-material-policy', 'Private'],
      ['browser-label-policy', 'Private'],
      ['raw-token-policy', 'Private'],
      ['submission-policy', 'Blocked'],
      ['sanitized-payload-policy', 'Policy metadata only'],
      ['public-access-handoff', '30 access items'],
      ['lifecycle-helper', 'Shared lifecycle'],
      ['submission-error', 'This assignment is closed.'],
      ['direct-submit-guard', 'Server rejects'],
      ['teacher-list-alignment', 'Share actions blocked'],
      ['result-page-alignment', 'Results retained'],
      ['results-retention', 'Attempts retained'],
      ['reopen-guidance', 'Teacher can reopen'],
      ['route-indexing-policy', 'noindex'],
      ['privacy-guard', 'Private data omitted'],
    ]
  );
  assertNoUnavailablePrivateText(JSON.stringify(handoffView));
});

test('expired assignment unavailable access blocks runtime content and submit', () => {
  const lookupResult = buildPublicAssignmentLookupResult(
    buildPublicAssignmentSource({
      expiresAt: new Date('2026-01-01T00:00:00.000Z'),
      status: 'published',
    }),
    Date.parse('2026-01-02T00:00:00.000Z')
  );
  assert.equal(lookupResult.status, 'unavailable');
  const handoffView = requireHandoffView(
    buildPublicAssignmentUnavailableAccessHandoffView({
      lookupResult,
      missingView: buildMissingPageView(
        lookupResult.reason,
        lookupResult.unavailable
      ),
      shareSlug: SECRET_SHARE_SLUG,
    })
  );

  assert.deepEqual(
    handoffView.itemViews.map((item) => item.id),
    [...PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS]
  );
  assert.equal(getHandoffValue(handoffView, 'unavailable-reason'), 'Expired');
  assert.equal(getHandoffValue(handoffView, 'missing-route-state'), 'Expired');
  assert.equal(
    getHandoffValue(handoffView, 'submission-error'),
    'This assignment has expired.'
  );
  assert.equal(
    getHandoffValue(handoffView, 'runtime-content-policy'),
    'Hidden'
  );
  assert.equal(getHandoffValue(handoffView, 'submission-policy'), 'Blocked');
  assert.equal(
    getHandoffValue(handoffView, 'direct-submit-guard'),
    'Server rejects'
  );
  assert.equal(
    getHandoffValue(handoffView, 'reopen-guidance'),
    'New window required'
  );
  assertNoUnavailablePrivateText(JSON.stringify(handoffView));
});

test('draft unavailable access localizes publish-first boundary', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const lookupResult = buildPublicAssignmentLookupResult(
      buildPublicAssignmentSource({
        status: 'draft',
      })
    );
    assert.equal(lookupResult.status, 'unavailable');
    const handoffView = requireHandoffView(
      buildPublicAssignmentUnavailableAccessHandoffView({
        lookupResult,
        missingView: buildMissingPageView(
          lookupResult.reason,
          lookupResult.unavailable
        ),
        shareSlug: SECRET_SHARE_SLUG,
      })
    );

    assert.equal(handoffView.title, '不可用作业访问交接');
    assert.match(handoffView.description, /30 切片不可用公开作业访问交接/);
    assert.equal(getHandoffValue(handoffView, 'access-status'), '不可访问');
    assert.equal(getHandoffValue(handoffView, 'unavailable-reason'), '草稿');
    assert.equal(
      getHandoffValue(handoffView, 'student-message'),
      '作业尚未发布'
    );
    assert.equal(
      getHandoffValue(handoffView, 'sanitized-payload-policy'),
      '仅策略元数据'
    );
    assert.equal(
      getHandoffValue(handoffView, 'submission-error'),
      '这份作业还没有发布给学生。'
    );
    assert.equal(
      getHandoffValue(handoffView, 'teacher-list-alignment'),
      '需要发布'
    );
    assert.equal(getHandoffValue(handoffView, 'results-retention'), '尚无快照');
    assert.equal(getHandoffValue(handoffView, 'reopen-guidance'), '先发布');
    assertNoUnavailablePrivateText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('student missing panel renders 20 visible unavailable DOM semantics', () => {
  const panelSource = readFileSync(
    'src/components/assignments/student-runner-missing-panel.tsx',
    'utf8'
  );
  const visibleDomSlices: Array<[string, RegExp]> = [
    [
      'imports prepared safety item contract',
      /StudentRunnerUnavailableSafetyItemView/,
    ],
    [
      'prepares stable title id',
      /const titleId = 'student-runner-missing-title'/,
    ],
    [
      'prepares stable description id',
      /const descriptionId = 'student-runner-missing-description'/,
    ],
    [
      'prepares stable safety title id',
      /const safetyTitleId = 'student-runner-unavailable-safety-title'/,
    ],
    [
      'prepares stable safety description id',
      /const safetyDescriptionId =[\s\S]*'student-runner-unavailable-safety-description'/,
    ],
    [
      'binds main unavailable section',
      /<section[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}/,
    ],
    ['renders prepared badge label', /view\.badgeLabel/],
    ['binds missing title heading', /<h1 id=\{titleId\}[\s\S]*view\.title/],
    [
      'binds missing description',
      /id=\{descriptionId\}[\s\S]*view\.description/,
    ],
    [
      'renders missing scope as labelled dl',
      /<dl[\s\S]*aria-labelledby=\{titleId\}[\s\S]*view\.scopeItems\.map/,
    ],
    [
      'delegates missing scope item',
      /StudentRunnerMissingScopeItem item=\{item\} key=\{item\.id\}/,
    ],
    [
      'derives missing item dom ids',
      /const labelId = `student-runner-missing-scope-\$\{item\.id\}-label`[\s\S]*const valueId = `student-runner-missing-scope-\$\{item\.id\}-value`[\s\S]*const descriptionId = `student-runner-missing-scope-\$\{item\.id\}-description`/,
    ],
    [
      'marks missing scope item identity',
      /data-missing-scope-item=\{item\.id\}/,
    ],
    [
      'renders missing label as dt',
      /<dt id=\{labelId\}[\s\S]*item\.label[\s\S]*<\/dt>/,
    ],
    [
      'renders missing value as accessible output',
      /<output[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*item\.value/,
    ],
    [
      'renders missing description',
      /id=\{descriptionId\}[\s\S]*item\.description/,
    ],
    [
      'binds safety section',
      /view\.unavailableSafetyView[\s\S]*aria-describedby=\{safetyDescriptionId\}[\s\S]*aria-labelledby=\{safetyTitleId\}/,
    ],
    [
      'renders safety items as labelled dl',
      /<dl[\s\S]*aria-describedby=\{safetyDescriptionId\}[\s\S]*aria-labelledby=\{safetyTitleId\}[\s\S]*view\.unavailableSafetyView\.items\.map/,
    ],
    [
      'derives safety item dom ids',
      /const labelId = `student-runner-unavailable-safety-\$\{item\.id\}-label`[\s\S]*const valueId = `student-runner-unavailable-safety-\$\{item\.id\}-value`[\s\S]*const descriptionId = `student-runner-unavailable-safety-\$\{item\.id\}-description`/,
    ],
    [
      'renders safety value as accessible output',
      /data-unavailable-safety-item=\{item\.id\}[\s\S]*<dt id=\{labelId\}[\s\S]*item\.label[\s\S]*<output[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*item\.value[\s\S]*item\.description/,
    ],
  ];

  assert.equal(visibleDomSlices.length, 20);
  for (const [sliceName, pattern] of visibleDomSlices) {
    assert.match(panelSource, pattern, sliceName);
  }
  assert.doesNotMatch(panelSource, /data-handoff=/);
});

test('student missing panel omits unavailable access semantic handoffs from public DOM', () => {
  const panelSource = readFileSync(
    'src/components/assignments/student-runner-missing-panel.tsx',
    'utf8'
  );
  const routeSource = readFileSync('src/routes/play/$shareId.tsx', 'utf8');

  assert.doesNotMatch(
    panelSource,
    /data-handoff="public-assignment-unavailable-access"[\s\S]*view\.itemViews\.map/
  );
  assert.doesNotMatch(
    panelSource,
    /PublicAssignmentAccessHandoff|StudentRunnerUnavailableAccessHandoff/
  );
  assert.doesNotMatch(
    routeSource,
    /buildPublicAssignmentUnavailableAccessHandoffView\(\{[\s\S]*lookupResult: data,[\s\S]*missingView: runnerPageView\.missingView,[\s\S]*shareSlug: normalizedShareId/
  );
  assert.doesNotMatch(
    routeSource,
    /unavailableAccessHandoffView=\{unavailableAccessHandoffView\}/
  );
  assert.doesNotMatch(
    routeSource,
    /buildPublicAssignmentAccessHandoffView|accessHandoffView=/
  );
});

function buildPublicAssignmentSource({
  expiresAt = null,
  settings = {
    collectStudentName: true,
    maxAttempts: null,
    showCorrectAnswers: false,
    shuffleItems: false,
  },
  status,
}: {
  expiresAt?: Date | null;
  settings?: AssignmentSettings;
  status: 'closed' | 'draft' | 'published';
}) {
  return {
    activity: {
      contentJson: buildActivityContent(),
      description: 'Unavailable weather vocabulary practice.',
      id: 'unavailable-weather-activity',
      templateType: 'quiz' as const,
      title: 'Unavailable weather quiz',
      visibility: 'private' as const,
    },
    assignment: {
      expiresAt,
      id: 'secret-unavailable-assignment-id',
      settingsJson: settings,
      shareSlug: SECRET_SHARE_SLUG,
      status,
      title: 'Secret unavailable homework',
    },
    snapshot: {
      activityDescription: 'Frozen unavailable weather practice.',
      activityTitle: 'Frozen unavailable quiz',
      contentJson: buildActivityContent(),
      templateType: 'quiz' as const,
    },
  };
}

function buildActivityContent(): ActivityContent {
  return {
    difficulty: 'core',
    gradeBand: 'Grade 4',
    groups: [],
    language: 'en',
    learningGoal: 'Students can review unavailable-link boundaries.',
    pairs: [],
    questions: [
      {
        answer: SECRET_ANSWER,
        explanation: SECRET_EXPLANATION,
        id: 'question-unavailable',
        options: [
          { id: 'secret-choice', isCorrect: true, text: SECRET_CHOICE },
          { id: 'safe-choice', text: 'safe visible text' },
        ],
        prompt: SECRET_PROMPT,
      },
    ],
    sourceMaterials: [
      {
        fileId: 'secret-unavailable-source-file-id',
        kind: 'worksheet-document',
        originalName: SECRET_SOURCE_KEY,
      },
    ],
    sourceSummary: SECRET_SOURCE_KEY,
    subject: 'English',
    teacherNotes: [SECRET_EXPLANATION],
    vocabulary: ['closed', 'expired'],
  };
}

function buildMissingPageView(
  reason: StudentRunnerMissingReason,
  unavailable: PublicAssignmentUnavailablePayload
): StudentRunnerMissingPageView {
  const missingView = buildStudentRunnerMissingView(reason, unavailable);

  return {
    badgeLabel: 'Student runner',
    browseTemplatesLabel: 'Browse templates',
    description: missingView.description,
    reason: missingView.reason,
    scopeItems: missingView.scopeItems,
    title: missingView.title,
    unavailable: missingView.unavailable,
    unavailableSafetyView: buildStudentRunnerUnavailableSafetyView(unavailable),
  };
}

function requireHandoffView(
  view: PublicAssignmentUnavailableAccessHandoffView | undefined
) {
  assert.ok(view, 'Expected unavailable access handoff view');
  return view;
}

function getHandoffValue(
  view: PublicAssignmentUnavailableAccessHandoffView,
  id: PublicAssignmentUnavailableAccessHandoffItemId
) {
  const item = view.itemViews.find((handoffItem) => handoffItem.id === id);
  assert.ok(item, `Missing unavailable access handoff item ${id}`);
  return item.value;
}

function assertNoUnavailablePrivateText(value: string) {
  for (const privateValue of [
    SECRET_ANSWER,
    SECRET_CHOICE,
    SECRET_EXPLANATION,
    SECRET_PROMPT,
    SECRET_SHARE_SLUG,
    SECRET_SOURCE_KEY,
    SECRET_STUDENT_ANSWER,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      value.includes(privateValue),
      false,
      `Unavailable access handoff leaked private text: ${privateValue}`
    );
  }
}

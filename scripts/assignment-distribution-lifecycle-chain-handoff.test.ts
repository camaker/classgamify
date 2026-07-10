import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { ASSIGNMENT_DELIVERY_POLICY_HANDOFF_ITEM_IDS } from '@/assignments/delivery-summary';
import {
  ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_SOURCE_FILES,
  buildAssignmentDistributionLifecycleChainHandoffView,
  type AssignmentDistributionLifecycleChainHandoffItemId,
  type AssignmentDistributionLifecycleChainHandoffView,
} from '@/assignments/assignment-distribution-lifecycle-chain';
import {
  ASSIGNMENT_LIST_PAGE_HANDOFF_ITEM_IDS,
  buildAssignmentListCardViewModel,
  buildAssignmentListPageViewModel,
  type AssignmentListCardSource,
} from '@/assignments/list-view';
import {
  buildAssignmentListDismissPublishedRouteSearch,
  buildAssignmentListFilterRouteSearch,
  buildAssignmentListRouteSearch,
  buildAssignmentListValidatedSearch,
} from '@/assignments/list-filters';
import {
  PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS,
  PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES,
} from '@/assignments/published-assignment-delivery-chain';
import {
  buildPublishedAssignmentPanelContext,
  buildPublishedAssignmentPanelNextStepViews,
  findPublishedAssignmentInList,
  resolvePublishedAssignmentPanelAssignment,
} from '@/assignments/published-assignment';
import { ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS } from '@/assignments/publish-input';
import { PRINTABLE_WORKSHEET_HANDOFF_ITEM_IDS } from '@/assignments/printable-worksheet-view';
import {
  ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS,
  buildAssignmentShareLinkActionView,
  buildAssignmentShareLinkCopyExecutionPlan,
  buildAssignmentShareLinkHandoffView,
  buildAssignmentSharePath,
} from '@/assignments/share-link';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { STUDENT_RUNNER_START_HANDOFF_ITEM_IDS } from '@/assignments/student-runner-state';
import { TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS } from '@/assignments/teacher-results-review-chain';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const API_ASSIGNMENTS_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const HOOK_SOURCE = readFileSync('src/hooks/use-assignments.ts', 'utf8');
const LIST_FILTERS_SOURCE = readFileSync(
  'src/assignments/list-filters.ts',
  'utf8'
);
const LIST_VIEW_SOURCE = readFileSync('src/assignments/list-view.ts', 'utf8');
const PUBLISHED_ASSIGNMENT_SOURCE = readFileSync(
  'src/assignments/published-assignment.ts',
  'utf8'
);
const SHARE_LINK_SOURCE = readFileSync('src/assignments/share-link.ts', 'utf8');
const ASSIGNMENTS_ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/assignments.tsx',
  'utf8'
);
const PUBLISHED_PANEL_SOURCE = readFileSync(
  'src/components/assignments/published-assignment-panel.tsx',
  'utf8'
);
const ASSIGNMENT_CARD_SOURCE = readFileSync(
  'src/components/assignments/assignment-list-card.tsx',
  'utf8'
);
const COPY_BUTTON_SOURCE = readFileSync(
  'src/components/assignments/copy-assignment-share-link-button.tsx',
  'utf8'
);
const SHARE_HANDOFF_SOURCE = readFileSync(
  'src/components/assignments/assignment-share-link-handoff.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const SECRET_INTERNAL_ASSIGNMENT_ID = 'SECRET_INTERNAL_ASSIGNMENT_ID';
const SECRET_RAW_SETTINGS_JSON = '{"SECRET_RAW_SETTINGS_JSON":true}';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const SECRET_STUDENT_NAME = 'SECRET_STUDENT_NAME';
const SECRET_TEACHER_NOTE = 'SECRET_TEACHER_NOTE';
const SECRET_TOKEN = 'SECRET_RAW_ANONYMOUS_TOKEN';
const SECRET_STORAGE_KEY = 'source-materials/private/distribution.pdf';
const NOW = Date.parse('2026-07-10T00:00:00.000Z');

test('assignment distribution lifecycle chain exposes 30 safe slices', () => {
  const handoffView = buildAssignmentDistributionLifecycleChainHandoffView();
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(handoffView.title, 'Assignment distribution lifecycle chain');
  assert.match(handoffView.description, /Thirty-slice assignment distribution/);
  assert.equal(handoffView.itemViews.length, 30);
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
    chainSourceFileCount:
      ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_SOURCE_FILES.length,
    changesAttemptsOrResults: false,
    changesPublicRunner: false,
    createsAssignments: false,
    exposesAnswerKeys: false,
    exposesInternalAssignmentIds: false,
    exposesRawAnonymousTokens: false,
    exposesRawSettingsJson: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAnswerText: false,
    exposesStudentNames: false,
    exposesTeacherNotes: false,
    itemIds,
    requiresOwnerScopedAssignmentList: true,
    sourceFiles: [...ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_SOURCE_FILES],
    usesAbsoluteStudentUrl: true,
    usesNormalizedShareSlug: true,
    usesPreparedShareActions: true,
    usesSharedCopyPlan: true,
  });
  assertNoPrivateDistributionText(JSON.stringify(handoffView));
});

test('assignment distribution lifecycle summarizes each handoff boundary', () => {
  const handoffView = buildAssignmentDistributionLifecycleChainHandoffView();

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['product-distribution-policy', 'Immediate next step'],
      ['publish-redirect-context', 'published=:shareId'],
      ['published-query-parser', 'Validated search'],
      ['published-dismiss-search', 'Context removed'],
      ['owner-scoped-published-lookup', 'Owner list query'],
      ['published-list-fallback', 'Visible list fallback'],
      ['published-panel-found-state', 'Found'],
      ['published-panel-loading-state', 'Loading'],
      ['published-panel-missing-state', 'Missing'],
      ['share-slug-normalization', 'normalizeAssignmentShareSlug'],
      ['share-path-builder', '/play/:shareId'],
      ['absolute-share-url', 'Student URL'],
      ['share-link-availability', 'Lifecycle guarded'],
      ['copy-execution-plan', 'Shared copy plan'],
      ['copy-feedback', 'Toast mapped'],
      ['preview-route-action', 'Student runner link'],
      ['distribution-status', 'Ready or collecting'],
      ['copy-step-readiness', 'Copy step'],
      ['preview-step-readiness', 'Preview step'],
      ['print-step-readiness', 'Print step'],
      ['results-step-readiness', 'Results step'],
      ['list-card-action-parity', 'Card actions'],
      ['published-panel-action-parity', 'Panel actions'],
      ['hidden-share-handoff', '30 share slices'],
      ['filter-scope-alignment', 'Owner scope'],
      ['delivery-policy-summary', 'Shared settings'],
      ['student-runner-boundary', 'Public /play'],
      ['printable-handout-boundary', 'Teacher print'],
      ['result-review-boundary', 'Teacher results'],
      ['distribution-lifecycle-gate', '30 source files'],
    ]
  );
  assert.equal(
    getHandoffValue(handoffView, 'published-panel-action-parity'),
    'Panel actions'
  );
});

test('assignment distribution lifecycle is backed by adjacent gates', () => {
  assert.equal(ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_SOURCE_FILES.length, 30);
  for (const filePath of ASSIGNMENT_DISTRIBUTION_LIFECYCLE_CHAIN_SOURCE_FILES) {
    assert.ok(
      existsSync(filePath),
      `Missing assignment distribution lifecycle file ${filePath}`
    );
  }

  assert.equal(PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES.length, 30);
  assert.deepEqual(
    [
      ASSIGNMENT_LIST_PAGE_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_PUBLISH_HANDOFF_ITEM_IDS.length,
      ASSIGNMENT_DELIVERY_POLICY_HANDOFF_ITEM_IDS.length,
      PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS.length,
      STUDENT_RUNNER_START_HANDOFF_ITEM_IDS.length,
      PRINTABLE_WORKSHEET_HANDOFF_ITEM_IDS.length,
      TEACHER_RESULTS_REVIEW_CHAIN_HANDOFF_ITEM_IDS.length,
    ],
    Array.from({ length: 8 }, () => 30)
  );
});

test('published assignment context keeps distribution states and actions aligned', () => {
  const assignment = buildAssignmentSource();
  const cardView = buildAssignmentListCardViewModel(assignment);
  const foundContext = buildPublishedAssignmentPanelContext({
    assignment: {
      id: assignment.assignment.id,
      shareSlug: assignment.assignment.shareSlug,
      title: assignment.assignment.title,
    },
    isLoading: false,
    shareSlug: ' classroom-link ',
  });
  const loadingContext = buildPublishedAssignmentPanelContext({
    assignment: undefined,
    isLoading: true,
    shareSlug: ' classroom-link ',
  });
  const missingContext = buildPublishedAssignmentPanelContext({
    assignment: undefined,
    isLoading: false,
    shareSlug: ' classroom-link ',
  });
  const pageView = buildAssignmentListPageViewModel({
    data: {
      items: [assignment],
      publishedAssignment: {
        id: assignment.assignment.id,
        shareSlug: assignment.assignment.shareSlug,
        title: assignment.assignment.title,
      },
      total: 1,
    },
    isLoading: false,
    search: { published: ' classroom-link ' },
  });

  assert.equal(cardView.shareSlug, 'classroom-link');
  assert.equal(cardView.distributionView.status, 'ready-to-share');
  assert.deepEqual(
    cardView.distributionView.stepViews.map((step) => [step.id, step.status]),
    [
      ['copy-link', 'ready'],
      ['preview-link', 'ready'],
      ['print-worksheet', 'optional'],
      ['review-results', 'waiting'],
    ]
  );
  assert.equal(
    cardView.actionView.shareAction?.sharePath,
    '/play/classroom-link'
  );
  assert.equal(cardView.actionView.shareAction?.isAvailable, true);
  assert.equal(
    cardView.actionView.printAction?.assignmentId,
    assignment.assignment.id
  );
  assert.equal(
    cardView.actionView.resultAction?.assignmentId,
    assignment.assignment.id
  );
  assert.deepEqual(cardView.actionView.printAction?.search, {
    answerKey: undefined,
  });

  assert.equal(foundContext.status, 'found');
  assert.equal(foundContext.sharePath, '/play/classroom-link');
  assert.equal(
    foundContext.actionView.shareAction?.sharePath,
    '/play/classroom-link'
  );
  assert.equal(
    foundContext.actionView.printAction?.assignmentId,
    assignment.assignment.id
  );
  assert.equal(
    foundContext.actionView.resultAction?.assignmentId,
    assignment.assignment.id
  );
  assert.deepEqual(
    foundContext.nextStepViews.map((step) => [step.id, step.status]),
    [
      ['copy-link', 'ready'],
      ['preview-link', 'ready'],
      ['print-worksheet', 'optional'],
      ['review-results', 'after-submissions'],
    ]
  );
  assert.equal(loadingContext.status, 'loading');
  assert.equal(loadingContext.actionView.printAction, undefined);
  assert.equal(loadingContext.actionView.resultAction, undefined);
  assert.deepEqual(
    loadingContext.nextStepViews.map((step) => step.id),
    ['copy-link', 'preview-link']
  );
  assert.equal(missingContext.status, 'missing');
  assert.equal(missingContext.showMissingHint, true);
  assert.deepEqual(
    missingContext.nextStepViews.map((step) => step.id),
    ['copy-link', 'preview-link']
  );

  assert.equal(pageView.publishedPanelContext?.status, 'found');
  assert.equal(
    pageView.filterScopeBoundary.publishedShareContextStatus,
    'found'
  );
  assert.equal(
    getAssignmentListHandoffValue(
      pageView.handoffView,
      'published-share-context'
    ),
    'Ready: /play/classroom-link'
  );
  assert.equal(
    getAssignmentListHandoffValue(
      pageView.handoffView,
      'distribution-copy-link'
    ),
    'Ready now'
  );
  assert.equal(
    getAssignmentListHandoffValue(
      pageView.handoffView,
      'distribution-preview-link'
    ),
    'Ready now'
  );
  assert.equal(
    getAssignmentListHandoffValue(
      pageView.handoffView,
      'distribution-review-results'
    ),
    'After submissions'
  );
});

test('share-link helpers normalize route state and copy plans', () => {
  const action = buildAssignmentShareLinkActionView({
    label: 'Open student preview',
    shareSlug: ' classroom-link ',
  });
  const handoffView = buildAssignmentShareLinkHandoffView(action, {
    surface: 'publish-success',
  });
  const blockedPlan = buildAssignmentShareLinkCopyExecutionPlan({
    disabled: true,
    disabledReasonCode: 'closed',
    disabledMessage: 'Closed link',
    shareSlug: action.shareSlug,
    shareUrl: action.shareUrl,
  });
  const copyPlan = buildAssignmentShareLinkCopyExecutionPlan({
    disabled: false,
    shareSlug: action.shareSlug,
    shareUrl: action.shareUrl,
  });

  assert.equal(
    normalizeAssignmentShareSlug(' classroom-link '),
    'classroom-link'
  );
  assert.equal(
    buildAssignmentSharePath(' classroom-link '),
    '/play/classroom-link'
  );
  assert.equal(action.shareSlug, 'classroom-link');
  assert.equal(action.sharePath, '/play/classroom-link');
  assert.equal(action.isAvailable, true);
  assert.equal(handoffView.surface, 'publish-success');
  assert.equal(handoffView.itemViews.length, 30);
  assert.equal(
    getShareHandoffValue(handoffView, 'publish-success-surface'),
    'Active'
  );
  assert.equal(
    getShareHandoffValue(handoffView, 'assignment-list-surface'),
    'Compatible'
  );
  assert.equal(copyPlan.type, 'copy-link');
  assert.match(
    copyPlan.type === 'copy-link' ? copyPlan.url : '',
    /\/play\/classroom-link$/
  );
  assert.equal(blockedPlan.type, 'blocked');
  assert.equal(
    buildAssignmentListValidatedSearch({
      page: '2',
      published: ' classroom-link ',
      q: '  unit   one  ',
      status: 'published',
    }).published,
    'classroom-link'
  );
  assert.deepEqual(
    buildAssignmentListRouteSearch({
      page: 1,
      published: ' classroom-link ',
      q: ' ',
      status: 'all',
    }),
    {
      page: undefined,
      published: 'classroom-link',
      q: undefined,
      status: undefined,
    }
  );
  assert.deepEqual(
    buildAssignmentListFilterRouteSearch({
      current: { q: '', status: 'all' },
      next: { q: 'homework' },
      published: ' classroom-link ',
    }),
    {
      page: undefined,
      published: 'classroom-link',
      q: 'homework',
      status: undefined,
    }
  );
  assert.deepEqual(
    buildAssignmentListDismissPublishedRouteSearch({
      current: { page: 2, q: 'homework', status: 'open' },
    }),
    { page: 2, published: undefined, q: 'homework', status: 'open' }
  );
});

test('published assignment lookup resolves owner list and focused rows', () => {
  const listItem = buildAssignmentSource();
  const focusedAssignment = {
    id: 'focused-assignment',
    shareSlug: 'focused-link',
    title: 'Focused Link',
  };

  assert.equal(
    findPublishedAssignmentInList({
      items: [listItem],
      shareSlug: ' classroom-link ',
    })?.id,
    listItem.assignment.id
  );
  assert.equal(
    resolvePublishedAssignmentPanelAssignment({
      assignment: focusedAssignment,
      items: [listItem],
      shareSlug: 'focused-link',
    })?.id,
    'focused-assignment'
  );
  assert.equal(
    resolvePublishedAssignmentPanelAssignment({
      assignment: focusedAssignment,
      items: [listItem],
      shareSlug: ' classroom-link ',
    })?.id,
    listItem.assignment.id
  );
  assert.deepEqual(
    buildPublishedAssignmentPanelNextStepViews('found').map((step) => [
      step.id,
      step.status,
    ]),
    [
      ['copy-link', 'ready'],
      ['preview-link', 'ready'],
      ['print-worksheet', 'optional'],
      ['review-results', 'after-submissions'],
    ]
  );
});

test('assignment distribution lifecycle sources preserve route, DOM, and API boundaries', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Teacher assignment pages should support the real distribution workflow:[\s\S]*copy the absolute `\/play\/:id`[\s\S]*newly published share link with copy, student[\s\S]*printable worksheet[\s\S]*results actions/,
    'docs/product.md should keep post-publish distribution as a first-class teacher workflow.'
  );
  assert.match(
    API_ASSIGNMENTS_SOURCE,
    /publishedShareSlug[\s\S]*buildPublishedAssignmentListItemSelect\(\)[\s\S]*buildAssignmentDetailOwnerShareWhere\(\{[\s\S]*shareSlug: data\.publishedShareSlug,[\s\S]*userId/,
    'Assignments API should resolve published share context through owner-scoped share lookup.'
  );
  assert.match(
    HOOK_SOURCE,
    /publishedShareSlug[\s\S]*listAssignments\(\{[\s\S]*data: \{ pageIndex, pageSize, publishedShareSlug, search, status \}[\s\S]*queryKey: assignmentsKeys\.list\(\{[\s\S]*publishedShareSlug/,
    'Assignments hook should include published share context in request data and cache keys.'
  );
  assert.match(
    LIST_FILTERS_SOURCE,
    /normalizeAssignmentListPublishedSearch[\s\S]*normalizeAssignmentShareSlug\(value\)[\s\S]*buildAssignmentListRouteSearch[\s\S]*published: normalizeAssignmentListPublishedSearch\(published\)[\s\S]*buildAssignmentListDismissPublishedRouteSearch[\s\S]*return buildAssignmentListRouteSearch\(current\)/,
    'Assignment list route helpers should normalize published context and dismiss only that context.'
  );
  assert.match(
    ASSIGNMENTS_ROUTE_SOURCE,
    /validateSearch: buildAssignmentListValidatedSearch[\s\S]*publishedShareSlug: published[\s\S]*<PublishedAssignmentPanel[\s\S]*buildAssignmentListDismissPublishedRouteSearch[\s\S]*<AssignmentListCard/,
    'Dashboard assignments route should validate published context, fetch it owner-scoped, render the panel, and keep list cards as consumers.'
  );
  assert.match(
    PUBLISHED_ASSIGNMENT_SOURCE,
    /resolvePublishedAssignmentPanelAssignment[\s\S]*findPublishedAssignmentInList[\s\S]*buildPublishedAssignmentPanelContext[\s\S]*shareUrl: shareAction\.shareUrl[\s\S]*buildPublishedAssignmentPanelActionView[\s\S]*printAction[\s\S]*resultAction[\s\S]*shareAction/,
    'Published assignment domain should resolve focused/list rows and prepare share, print, and result actions.'
  );
  assert.match(
    SHARE_LINK_SOURCE,
    /ASSIGNMENT_SHARE_ROUTE_TARGET = '\/play\/\$shareId'[\s\S]*buildAssignmentSharePath[\s\S]*encodeURIComponent\(normalizeAssignmentShareSlug\(shareSlug\)\)[\s\S]*buildAssignmentShareLinkCopyExecutionPlan[\s\S]*type: 'copy-link'/,
    'Share-link domain should own route target, path encoding, and copy execution planning.'
  );
  assert.match(
    LIST_VIEW_SOURCE,
    /publishedPanelContext[\s\S]*buildAssignmentListFilterScopeBoundary[\s\S]*publishedShareContextStatus[\s\S]*buildAssignmentListDistributionView[\s\S]*copy-link[\s\S]*preview-link[\s\S]*print-worksheet[\s\S]*review-results[\s\S]*buildAssignmentListCardActionView/,
    'Assignment list view model should keep published context, distribution steps, and action preparation together.'
  );
  assert.match(
    PUBLISHED_PANEL_SOURCE,
    /(?=[\s\S]*buildAssignmentShareLinkHandoffView\(action, \{[\s\S]*surface: 'publish-success')(?=[\s\S]*<AssignmentShareLinkHandoff handoff=\{handoffView\} \/>)(?=[\s\S]*<PublishedAssignmentSharePreviewAction)(?=[\s\S]*<CopyAssignmentShareLinkButton)(?=[\s\S]*<PublishedAssignmentPrintActionLink)(?=[\s\S]*<PublishedAssignmentResultsActionLink)/,
    'Published assignment panel should render the hidden share handoff and prepared preview, copy, print, and result actions.'
  );
  assert.match(
    ASSIGNMENT_CARD_SOURCE,
    /(?=[\s\S]*buildAssignmentShareLinkHandoffView\(action, \{[\s\S]*surface: 'assignment-list')(?=[\s\S]*<AssignmentShareLinkHandoff handoff=\{handoffView\} \/>)(?=[\s\S]*<AssignmentListSharePreviewAction)(?=[\s\S]*<CopyAssignmentShareLinkButton)(?=[\s\S]*<AssignmentListPrintActionLink)(?=[\s\S]*<AssignmentListResultActionLink)/,
    'Assignment list cards should render the hidden share handoff and prepared preview, copy, print, and result actions.'
  );
  assert.match(
    COPY_BUTTON_SOURCE,
    /buildAssignmentShareLinkCopyExecutionPlan\(\{[\s\S]*copyTextToClipboard\(executionPlan\.url\)[\s\S]*toast\.success\(executionPlan\.successMessage\)[\s\S]*toast\.error\(executionPlan\.failureMessage\)/,
    'Copy button should execute the shared copy plan and map feedback through localized messages.'
  );
  assert.match(
    SHARE_HANDOFF_SOURCE,
    /data-handoff="assignment-share-link"[\s\S]*data-handoff-scope=\{handoff\.privacy\.scope\}[\s\S]*data-handoff-item=\{item\.id\}/,
    'Share-link handoff should keep hidden semantic coverage for all distribution surfaces.'
  );
});

test('assignment distribution lifecycle focused gate is documented', () => {
  assert.match(
    TEST_CATALOG_SOURCE,
    /Assignment distribution lifecycle chain has a fast script-level gate via[\s\S]*scripts\/assignment-distribution-lifecycle-chain-handoff\.test\.ts/,
    'TEST-CATALOG should document the assignment distribution lifecycle gate.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /post-publish route context[\s\S]*owner-scoped published lookup[\s\S]*absolute student URLs[\s\S]*copy[\s\S]*preview[\s\S]*print[\s\S]*results actions[\s\S]*assignment-list[\s\S]*distribution steps/,
    'TEST-CATALOG should describe the distribution lifecycle scope.'
  );
});

function buildAssignmentSource(
  stats = { averageScore: 0.82, completions: 0 }
): AssignmentListCardSource {
  return {
    activity: {
      description: 'Classroom distribution activity.',
      templateType: 'quiz',
    },
    assignment: {
      expiresAt: new Date('2026-07-15T10:00:00.000Z'),
      id: SECRET_INTERNAL_ASSIGNMENT_ID,
      settingsJson: {
        collectStudentName: true,
        instructions: 'Review the rules before starting.',
        maxAttempts: 2,
        showCorrectAnswers: false,
        shuffleItems: false,
        timeLimitSeconds: 600,
      },
      shareSlug: ' classroom-link ',
      status: 'published',
      title: ' Distribution Assignment ',
    },
    now: NOW,
    snapshot: {
      activityDescription: 'Frozen distribution snapshot.',
      templateType: 'quiz',
    },
    stats,
  };
}

function getHandoffValue(
  view: AssignmentDistributionLifecycleChainHandoffView,
  id: AssignmentDistributionLifecycleChainHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing assignment distribution lifecycle item ${id}`);
  return item.value;
}

function getAssignmentListHandoffValue(
  view: ReturnType<typeof buildAssignmentListPageViewModel>['handoffView'],
  id: (typeof ASSIGNMENT_LIST_PAGE_HANDOFF_ITEM_IDS)[number]
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing assignment list handoff item ${id}`);
  return item.value;
}

function getShareHandoffValue(
  view: ReturnType<typeof buildAssignmentShareLinkHandoffView>,
  id: (typeof ASSIGNMENT_SHARE_LINK_HANDOFF_ITEM_IDS)[number]
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing assignment share-link handoff item ${id}`);
  return item.value;
}

function assertNoPrivateDistributionText(serializedView: string) {
  for (const privateValue of [
    SECRET_INTERNAL_ASSIGNMENT_ID,
    SECRET_RAW_SETTINGS_JSON,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_NAME,
    SECRET_TEACHER_NOTE,
    SECRET_TOKEN,
    SECRET_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Assignment distribution lifecycle leaked private text: ${privateValue}`
    );
  }
}

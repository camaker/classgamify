import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  countMatchingStudentIdentityAttempts,
  resolveAttemptIdentityCountStrategy,
  resolveAttemptSubmissionIdentity,
} from '@/assignments/attempt-identity-query';
import {
  ASSIGNMENT_IDENTITY_HANDOFF_ITEM_IDS,
  buildAssignmentIdentityHandoffView,
  type AssignmentIdentityHandoffEvidence,
  type AssignmentIdentityHandoffItemId,
  type AssignmentIdentityHandoffView,
} from '@/assignments/identity-handoff';
import {
  buildAnonymousAttemptTokenStorageKey,
  buildAnonymousIdentityKey,
  buildStudentIdentityGroupingKey,
  buildStudentNameIdentityKey,
  createStudentIdentityResolver,
  getAnonymousBrowserLabel,
  getOrCreateAnonymousAttemptToken,
  isSameStudentIdentity,
  normalizeAnonymousToken,
  normalizeStudentName,
} from '@/assignments/identity';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANONYMOUS_TOKEN = ' secret anonymous token ';
const SECRET_CREATED_TOKEN = ' created anonymous token ';
const SECRET_SHARE_SLUG = ' secret-share-slug ';
const SECRET_STUDENT_NAME = '  Ａlice   Chen  ';

const API_ASSIGNMENTS_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const ATTEMPT_IDENTITY_QUERY_SOURCE = readFileSync(
  'src/assignments/attempt-identity-query.ts',
  'utf8'
);
const IDENTITY_SOURCE = readFileSync('src/assignments/identity.ts', 'utf8');
const RESULT_FILTERS_SOURCE = readFileSync(
  'src/assignments/result-filters.ts',
  'utf8'
);
const RESULTS_SOURCE = readFileSync('src/assignments/results.ts', 'utf8');
const STUDENT_SUBMISSION_SOURCE = readFileSync(
  'src/assignments/student-submission.ts',
  'utf8'
);

const EVIDENCE = buildIdentityHandoffEvidence();

test('assignment identity handoff exposes 30 safe identity slices', () => {
  const handoffView = buildAssignmentIdentityHandoffView(EVIDENCE);
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ASSIGNMENT_IDENTITY_HANDOFF_ITEM_IDS]);
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
    exposesAnonymousToken: false,
    exposesBrowserStorageKey: false,
    exposesRawGroupingKey: false,
    exposesRawStudentName: false,
    exposesResultStudentKey: false,
    itemIds,
    mutatesAttempts: false,
    readsBrowserStorage: false,
    scope: 'assignment-attempt-identity-boundary',
    usesSharedIdentityHelpers: true,
  });
  assertNoPrivateIdentityHandoffText(JSON.stringify(handoffView));
});

test('assignment identity handoff summarizes normalization and privacy state', () => {
  const handoffView = buildAssignmentIdentityHandoffView(EVIDENCE);

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['identity-scope', 'Attempt identity'],
      ['name-whitespace-normalization', 'Whitespace collapsed'],
      ['name-unicode-normalization', 'NFKC applied'],
      ['name-case-grouping', 'Case-insensitive key'],
      ['name-priority', 'Student name wins'],
      ['anonymous-token-normalization', 'Whitespace removed'],
      ['anonymous-storage-key', 'Share-scoped key'],
      ['anonymous-existing-token', 'Existing token reused'],
      ['anonymous-sanitized-write', 'Sanitized token stored'],
      ['anonymous-created-token', 'Created when missing'],
      ['browser-label', 'Browser code only'],
      ['grouping-name-key', 'Stable name key'],
      ['grouping-anonymous-key', 'Stable token key'],
      ['unknown-identity', 'Anonymous fallback'],
      ['same-name-comparison', 'Matched'],
      ['same-token-comparison', 'Matched'],
      ['distinct-token-comparison', 'Separated'],
      ['name-attempt-count', '2 attempts'],
      ['token-attempt-count', '2 attempts'],
      ['submission-name-strategy', 'Student name'],
      ['submission-token-strategy', 'Anonymous token'],
      ['submission-missing-strategy', 'Missing'],
      ['previous-name-strategy', 'Normalized name'],
      ['previous-token-strategy', 'Anonymous token'],
      ['resolver-name-label', 'Name label prepared'],
      ['resolver-anonymous-label', 'Anonymous label prepared'],
      ['resolver-ordering', 'Chronological labels'],
      ['result-display-key', 'Display key only'],
      ['raw-token-guard', 'Raw token hidden'],
      ['privacy-guard', 'Private identity hidden'],
    ]
  );
  assertNoPrivateIdentityHandoffText(JSON.stringify(handoffView));
});

test('assignment identity handoff localizes Chinese identity boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildAssignmentIdentityHandoffView(
      buildIdentityHandoffEvidence()
    );

    assert.equal(handoffView.title, '作答身份交接');
    assert.match(handoffView.description, /30 切片/);
    assert.equal(
      getIdentityHandoffValue(handoffView, 'name-whitespace-normalization'),
      '空白已折叠'
    );
    assert.equal(
      getIdentityHandoffValue(handoffView, 'name-attempt-count'),
      '2 次作答'
    );
    assert.equal(
      getIdentityHandoffValue(handoffView, 'browser-label'),
      '仅浏览器代码'
    );
    assert.equal(
      getIdentityHandoffValue(handoffView, 'raw-token-guard'),
      'Raw token 隐藏'
    );
    assert.equal(
      getIdentityHandoffValue(handoffView, 'privacy-guard'),
      '私有身份隐藏'
    );
    assertNoPrivateIdentityHandoffText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('assignment identity evidence comes from shared identity helpers', () => {
  assert.equal(EVIDENCE.nameWhitespaceCollapsed, true);
  assert.equal(EVIDENCE.nameUnicodeNormalized, true);
  assert.equal(EVIDENCE.nameCaseInsensitiveGrouping, true);
  assert.equal(EVIDENCE.nameTakesPriorityOverAnonymousToken, true);
  assert.equal(EVIDENCE.anonymousTokenWhitespaceRemoved, true);
  assert.equal(EVIDENCE.anonymousTokenExistingReused, true);
  assert.equal(EVIDENCE.anonymousTokenSanitizedInStorage, true);
  assert.equal(EVIDENCE.anonymousTokenCreatedWhenMissing, true);
  assert.equal(EVIDENCE.anonymousBrowserLabelHidesToken, true);
  assert.equal(EVIDENCE.nameAttemptMatchCount, 2);
  assert.equal(EVIDENCE.anonymousAttemptMatchCount, 2);
  assert.equal(EVIDENCE.submissionNameStrategyType, 'student-name');
  assert.equal(EVIDENCE.submissionAnonymousStrategyType, 'anonymous-token');
  assert.equal(EVIDENCE.submissionMissingStrategyType, 'missing');
  assert.equal(EVIDENCE.previousNameStrategyType, 'normalized-student-name');
  assert.equal(EVIDENCE.previousTokenStrategyType, 'anonymous-token');
  assert.equal(EVIDENCE.resultDisplayKeyHidesRawToken, true);
  assert.match(IDENTITY_SOURCE, /normalize\('NFKC'\)/);
  assert.match(IDENTITY_SOURCE, /buildStudentIdentityGroupingKey/);
  assert.match(
    ATTEMPT_IDENTITY_QUERY_SOURCE,
    /countMatchingStudentIdentityAttempts/
  );
  assert.match(API_ASSIGNMENTS_SOURCE, /resolveAttemptSubmissionIdentity/);
  assert.match(API_ASSIGNMENTS_SOURCE, /countPreviousIdentityAttempts/);
  assert.match(RESULTS_SOURCE, /createStudentIdentityResolver/);
  assert.match(RESULT_FILTERS_SOURCE, /createStudentIdentityResolver/);
  assert.match(STUDENT_SUBMISSION_SOURCE, /normalizeAnonymousToken/);
  assertNoPrivateIdentityHandoffText(JSON.stringify(EVIDENCE));
});

function buildIdentityHandoffEvidence(): AssignmentIdentityHandoffEvidence {
  const normalizedStudentName = normalizeStudentName(SECRET_STUDENT_NAME);
  const normalizedAnonymousToken = normalizeAnonymousToken(
    SECRET_ANONYMOUS_TOKEN
  );
  const existingStorageKey =
    buildAnonymousAttemptTokenStorageKey(SECRET_SHARE_SLUG);
  const existingStorage = createMemoryStorage({
    [existingStorageKey]: SECRET_ANONYMOUS_TOKEN,
  });
  const existingAnonymousToken = getOrCreateAnonymousAttemptToken({
    shareId: SECRET_SHARE_SLUG,
    storage: existingStorage.storage,
  });
  const createdStorage = createMemoryStorage();
  const createdAnonymousToken = getOrCreateAnonymousAttemptToken({
    createToken: () => SECRET_CREATED_TOKEN,
    shareId: SECRET_SHARE_SLUG,
    storage: createdStorage.storage,
  });
  const browserLabel = getAnonymousBrowserLabel(SECRET_ANONYMOUS_TOKEN);
  const nameGroupingKey = buildStudentIdentityGroupingKey({
    anonymousToken: SECRET_ANONYMOUS_TOKEN,
    studentName: SECRET_STUDENT_NAME,
  });
  const anonymousGroupingKey = buildStudentIdentityGroupingKey({
    anonymousToken: SECRET_ANONYMOUS_TOKEN,
  });
  const attempts = [
    {
      anonymousToken: 'other-token',
      studentName: SECRET_STUDENT_NAME,
    },
    {
      studentName: ' alice chen ',
    },
    {
      anonymousToken: SECRET_ANONYMOUS_TOKEN,
    },
    {
      anonymousToken: normalizedAnonymousToken,
    },
    {
      anonymousToken: 'different-token',
    },
  ];
  const submissionNameStrategy = resolveAttemptSubmissionIdentity({
    anonymousToken: SECRET_ANONYMOUS_TOKEN,
    collectStudentName: true,
    studentName: SECRET_STUDENT_NAME,
  });
  const submissionAnonymousStrategy = resolveAttemptSubmissionIdentity({
    anonymousToken: SECRET_ANONYMOUS_TOKEN,
    collectStudentName: false,
  });
  const submissionMissingStrategy = resolveAttemptSubmissionIdentity({
    collectStudentName: true,
    studentName: '   ',
  });
  const previousNameStrategy = resolveAttemptIdentityCountStrategy({
    anonymousToken: SECRET_ANONYMOUS_TOKEN,
    studentName: SECRET_STUDENT_NAME,
  });
  const previousTokenStrategy = resolveAttemptIdentityCountStrategy({
    anonymousToken: SECRET_ANONYMOUS_TOKEN,
  });
  const identityResolver = createStudentIdentityResolver([
    {
      anonymousToken: 'later-anonymous-token',
      completedAt: '2026-07-05T00:02:00.000Z',
    },
    {
      anonymousToken: SECRET_ANONYMOUS_TOKEN,
      completedAt: '2026-07-05T00:01:00.000Z',
    },
    {
      completedAt: '2026-07-05T00:03:00.000Z',
      studentName: SECRET_STUDENT_NAME,
    },
  ]);
  const resolverNameIdentity = identityResolver.resolve({
    studentName: 'alice chen',
  });
  const resolverAnonymousIdentity = identityResolver.resolve({
    anonymousToken: SECRET_ANONYMOUS_TOKEN,
  });
  const resolverLaterAnonymousIdentity = identityResolver.resolve({
    anonymousToken: 'later-anonymous-token',
  });

  return {
    anonymousAttemptMatchCount: countMatchingStudentIdentityAttempts({
      attempts,
      identity: { anonymousToken: SECRET_ANONYMOUS_TOKEN },
    }),
    anonymousBrowserLabelHasSafeCode:
      browserLabel !== getAnonymousBrowserLabel() &&
      /[A-Z0-9]{6}$/.test(browserLabel),
    anonymousBrowserLabelHidesToken:
      !browserLabel.includes(SECRET_ANONYMOUS_TOKEN) &&
      !browserLabel.includes(normalizedAnonymousToken),
    anonymousGroupingKeyReady:
      anonymousGroupingKey ===
        buildAnonymousIdentityKey(SECRET_ANONYMOUS_TOKEN) &&
      anonymousGroupingKey.startsWith('anonymous:'),
    anonymousStorageKeyScoped:
      existingStorageKey.startsWith('classgamify:attempt-token:') &&
      existingStorageKey !== buildAnonymousAttemptTokenStorageKey('other-link'),
    anonymousTokenCreatedWhenMissing:
      createdAnonymousToken === normalizeAnonymousToken(SECRET_CREATED_TOKEN) &&
      createdStorage.writes.some(
        ([, value]) => value === normalizeAnonymousToken(SECRET_CREATED_TOKEN)
      ),
    anonymousTokenExistingReused:
      existingAnonymousToken === normalizedAnonymousToken,
    anonymousTokenSanitizedInStorage: existingStorage.writes.some(
      ([, value]) => value === normalizedAnonymousToken
    ),
    anonymousTokenWhitespaceRemoved:
      normalizedAnonymousToken === 'secretanonymoustoken',
    distinctAnonymousTokensSeparated: !isSameStudentIdentity(
      { anonymousToken: SECRET_ANONYMOUS_TOKEN },
      { anonymousToken: 'different-token' }
    ),
    nameAttemptMatchCount: countMatchingStudentIdentityAttempts({
      attempts,
      identity: { studentName: 'ALICE CHEN' },
    }),
    nameCaseInsensitiveGrouping:
      buildStudentNameIdentityKey(normalizedStudentName) ===
      buildStudentNameIdentityKey('alice chen'),
    nameGroupingKeyReady:
      nameGroupingKey === buildStudentNameIdentityKey(normalizedStudentName) &&
      nameGroupingKey.startsWith('name:'),
    nameTakesPriorityOverAnonymousToken:
      nameGroupingKey === buildStudentNameIdentityKey(normalizedStudentName),
    nameUnicodeNormalized: normalizedStudentName === 'Alice Chen',
    nameWhitespaceCollapsed: normalizedStudentName === 'Alice Chen',
    previousNameStrategyType: previousNameStrategy.type,
    previousTokenStrategyType: previousTokenStrategy.type,
    resolverAnonymousLabelReady:
      resolverAnonymousIdentity.label === 'Anonymous student 1',
    resolverNameLabelReady:
      resolverNameIdentity.label === normalizedStudentName,
    resolverOrderingStable:
      resolverAnonymousIdentity.key === 'anonymous:1' &&
      resolverLaterAnonymousIdentity.key === 'anonymous:2',
    resultDisplayKeyHidesRawToken:
      !resolverAnonymousIdentity.key.includes(normalizedAnonymousToken) &&
      !resolverAnonymousIdentity.label.includes(normalizedAnonymousToken),
    sameAnonymousTokenMatched: isSameStudentIdentity(
      { anonymousToken: SECRET_ANONYMOUS_TOKEN },
      { anonymousToken: normalizedAnonymousToken }
    ),
    sameNameMatched: isSameStudentIdentity(
      { studentName: SECRET_STUDENT_NAME },
      { studentName: 'alice chen' }
    ),
    studentNameHiddenFromHandoff: true,
    submissionAnonymousStrategyType: submissionAnonymousStrategy.type,
    submissionMissingStrategyType: submissionMissingStrategy.type,
    submissionNameStrategyType: submissionNameStrategy.type,
    unknownIdentityUsesFallback:
      buildStudentIdentityGroupingKey({}) === 'anonymous:unknown',
  };
}

type MemoryStorage = {
  storage: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
  };
  writes: Array<[string, string]>;
};

function createMemoryStorage(
  initialValues: Record<string, string> = {}
): MemoryStorage {
  const values = new Map(Object.entries(initialValues));
  const writes: Array<[string, string]> = [];

  return {
    storage: {
      getItem(key) {
        return values.get(key) ?? null;
      },
      setItem(key, value) {
        values.set(key, value);
        writes.push([key, value]);
      },
    },
    writes,
  };
}

function getIdentityHandoffValue(
  view: AssignmentIdentityHandoffView,
  id: AssignmentIdentityHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing assignment identity handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateIdentityHandoffText(serializedView: string) {
  const normalizedStudentName = normalizeStudentName(SECRET_STUDENT_NAME);
  const normalizedAnonymousToken = normalizeAnonymousToken(
    SECRET_ANONYMOUS_TOKEN
  );
  const storageKey = buildAnonymousAttemptTokenStorageKey(SECRET_SHARE_SLUG);

  for (const privateValue of [
    SECRET_ANONYMOUS_TOKEN,
    SECRET_CREATED_TOKEN,
    SECRET_SHARE_SLUG,
    SECRET_STUDENT_NAME,
    normalizedAnonymousToken,
    normalizedStudentName,
    storageKey,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Assignment identity handoff leaked private text: ${privateValue}`
    );
  }
}

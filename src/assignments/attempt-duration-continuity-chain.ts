import { ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS } from '@/assignments/attempt-duration-handoff';

export const ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS =
  ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS;

export const ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/attempts/duration.ts',
  'src/assignments/attempt-duration.ts',
  'src/assignments/attempt-duration-handoff.ts',
  'src/api/assignments.ts',
  'src/routes/play/$shareId.tsx',
  'src/assignments/student-runner-state.ts',
  'src/assignments/student-submission.ts',
  'src/assignments/public.ts',
  'src/assignments/validation.ts',
  'src/assignments/attempt-persistence.ts',
  'src/assignments/attempt-persistence-handoff.ts',
  'src/assignments/attempt-stats.ts',
  'src/assignments/attempt-stats-handoff.ts',
  'src/assignments/attempt-stats-continuity-chain.ts',
  'src/assignments/results.ts',
  'src/assignments/result-view.ts',
  'src/assignments/result-display.ts',
  'src/assignments/result-summary-format.ts',
  'src/assignments/results-export.ts',
  'src/assignments/student-follow-up-summary.ts',
  'src/assignments/scored-attempt-result-chain.ts',
  'src/assignments/student-runner-submission-chain.ts',
  'src/assignments/student-runner-play-chain.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'src/components/assignments/student-runner-attempt-shell.tsx',
  'src/components/assignments/student-runner-header-card.tsx',
  'src/components/assignments/assignment-results-attempts-table.tsx',
  'scripts/assignment-attempt-duration-handoff-semantic-views.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type AssignmentAttemptDurationContinuityChainHandoffItemId =
  (typeof ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS)[number];

export type AssignmentAttemptDurationContinuityChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentAttemptDurationContinuityChainHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentAttemptDurationContinuityChainPrivacyContract = {
  chainSourceFileCount: number;
  exposesAnswerText: false;
  exposesAttemptStartedAt: false;
  exposesCsvDataUrl: false;
  exposesPromptText: false;
  exposesRawAnonymousTokens: false;
  exposesRuntimeItemIds: false;
  exposesStudentDisplayLabels: false;
  exposesTeacherAnswerKeys: false;
  itemIds: AssignmentAttemptDurationContinuityChainHandoffItemId[];
  mutatesAssignmentSnapshots: false;
  sourceFiles: string[];
  startsClockAfterPlayableRuntimeReady: true;
  usesServerNormalizedStoredDuration: true;
  usesSharedAssignmentDurationFormatting: true;
};

export type AssignmentAttemptDurationContinuityChainHandoffView = {
  description: string;
  itemViews: AssignmentAttemptDurationContinuityChainHandoffItemView[];
  privacy: AssignmentAttemptDurationContinuityChainPrivacyContract;
  title: string;
};

const ITEM_VALUES: Record<
  AssignmentAttemptDurationContinuityChainHandoffItemId,
  string
> = {
  'duration-unit-contract': 'Whole seconds',
  'time-limit-normalization': 'Positive timer seconds',
  'duration-rounding': 'Nearest whole second',
  'duration-cap': 'Assignment timer maximum',
  'negative-duration-guard': 'Clamped to zero',
  'nonfinite-duration-guard': 'Missing duration',
  'zero-duration-display': 'Empty display value',
  'readable-format': 'Teacher duration label',
  'timer-format': 'Student timer label',
  'display-view': 'Prepared duration output',
  'capped-display-view': 'Timer-aware output',
  'timer-state-elapsed': 'Elapsed whole seconds',
  'timer-state-remaining': 'Remaining whole seconds',
  'timer-state-expiry': 'Deterministic expiry',
  'started-at-derivation': 'Ready-state clock origin',
  'submission-duration-resolution': 'Browser elapsed seconds',
  'submission-input-duration': 'Submitted duration field',
  'runner-clock-start-plan': 'Playable runtime ready',
  'route-clock-effect': 'Runner clock effect',
  'runner-tick-plan': 'One-second tick plan',
  'timer-badge': 'Student timer badge',
  'time-expired-control': 'Submit control expiry',
  'start-handoff-boundary': 'Pre-attempt state',
  'submission-handoff-boundary': 'Submission state',
  'result-display-boundary': 'Student result duration',
  'result-analysis-boundary': 'Teacher attempt analysis',
  'result-view-boundary': 'Teacher result rows',
  'export-average-duration': 'CSV average duration',
  'export-attempt-duration': 'CSV attempt duration',
  'privacy-guard': 'Duration metadata only',
};

export function buildAssignmentAttemptDurationContinuityChainHandoffView(): AssignmentAttemptDurationContinuityChainHandoffView {
  const itemViews =
    ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS.map((id) => {
      const label = id
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');
      const value = ITEM_VALUES[id];

      return {
        ariaLabel: `${label}: ${value}`,
        description: `${label} stays aligned from playable student runtime readiness through server-normalized persistence and teacher result consumers.`,
        id,
        label,
        value,
      };
    });

  return {
    description:
      'Thirty-slice attempt duration continuity chain from playable runner clock start and browser elapsed time through server normalization, timer caps, scored persistence, student feedback, teacher statistics, result rows, and CSV export.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_SOURCE_FILES.length,
      exposesAnswerText: false,
      exposesAttemptStartedAt: false,
      exposesCsvDataUrl: false,
      exposesPromptText: false,
      exposesRawAnonymousTokens: false,
      exposesRuntimeItemIds: false,
      exposesStudentDisplayLabels: false,
      exposesTeacherAnswerKeys: false,
      itemIds: [
        ...ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_HANDOFF_ITEM_IDS,
      ],
      mutatesAssignmentSnapshots: false,
      sourceFiles: [
        ...ASSIGNMENT_ATTEMPT_DURATION_CONTINUITY_CHAIN_SOURCE_FILES,
      ],
      startsClockAfterPlayableRuntimeReady: true,
      usesServerNormalizedStoredDuration: true,
      usesSharedAssignmentDurationFormatting: true,
    },
    title: 'Assignment attempt duration continuity chain',
  };
}

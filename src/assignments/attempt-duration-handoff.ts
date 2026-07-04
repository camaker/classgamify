import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS = [
  'duration-unit-contract',
  'time-limit-normalization',
  'duration-rounding',
  'duration-cap',
  'negative-duration-guard',
  'nonfinite-duration-guard',
  'zero-duration-display',
  'readable-format',
  'timer-format',
  'display-view',
  'capped-display-view',
  'timer-state-elapsed',
  'timer-state-remaining',
  'timer-state-expiry',
  'started-at-derivation',
  'submission-duration-resolution',
  'submission-input-duration',
  'runner-clock-start-plan',
  'route-clock-effect',
  'runner-tick-plan',
  'timer-badge',
  'time-expired-control',
  'start-handoff-boundary',
  'submission-handoff-boundary',
  'result-display-boundary',
  'result-analysis-boundary',
  'result-view-boundary',
  'export-average-duration',
  'export-attempt-duration',
  'privacy-guard',
] as const;

export type AssignmentAttemptDurationHandoffItemId =
  (typeof ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS)[number];

export type AssignmentAttemptDurationHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentAttemptDurationHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentAttemptDurationHandoffEvidence = {
  cappedDisplayLabel: string;
  cappedDurationSeconds?: number;
  displayLabel: string;
  durationRoundedSeconds?: number;
  durationUnits: {
    millisecondsPerSecond: number;
    secondsPerMinute: number;
    timerSecondPaddingLength: number;
  };
  expiredDurationSeconds: number;
  expiredStateTimeExpired: boolean;
  exportAttemptUsesDisplayContract: boolean;
  exportAverageUsesDisplayContract: boolean;
  nonFiniteDurationRecorded: boolean;
  normalizedTimeLimitSeconds?: number;
  negativeDurationSeconds?: number;
  privacyGuardsPrivateData: boolean;
  readableDurationLabel: string;
  resultAnalysisUsesDurationHelper: boolean;
  resultDisplayDurationLabel: string;
  resultViewUsesDisplayContract: boolean;
  routeUsesClockStartPlan: boolean;
  runnerClockStartPlanType: 'skip' | 'start';
  runnerTickIntervalMs?: number;
  runnerTickPlanType: 'skip' | 'tick';
  startHandoffHasTimerBoundary: boolean;
  startedAtDeltaSeconds: number;
  submissionDurationSeconds?: number;
  submissionHandoffHasAttemptDuration: boolean;
  submissionInputDurationSeconds?: number;
  timeExpiredControlsDisabled: boolean;
  timeExpiredNoticeShown: boolean;
  timerBadgeLabel: string;
  timerBadgeShows: boolean;
  timerDurationLabel: string;
  timerStateElapsedSeconds: number;
  timerStateRemainingSeconds?: number;
  zeroDurationLabel: string;
};

export type AssignmentAttemptDurationHandoffPrivacyContract = {
  exposesAnonymousToken: false;
  exposesAnswerText: false;
  exposesRawStartedAt: false;
  exposesRawSubmissionPayload: false;
  exposesRuntimeItemIds: false;
  exposesStudentName: false;
  exposesTeacherOnlyAnswers: false;
  itemIds: AssignmentAttemptDurationHandoffItemId[];
  mutatesAttempts: false;
  readsBrowserStorage: false;
  scope: 'assignment-attempt-duration-boundary';
  usesSharedDurationHelpers: true;
};

export type AssignmentAttemptDurationHandoffView = {
  description: string;
  itemViews: AssignmentAttemptDurationHandoffItemView[];
  privacy: AssignmentAttemptDurationHandoffPrivacyContract;
  title: string;
};

type AssignmentAttemptDurationHandoffItemContext =
  AssignmentAttemptDurationHandoffEvidence & {
    id: AssignmentAttemptDurationHandoffItemId;
  };

export function buildAssignmentAttemptDurationHandoffView(
  evidence: AssignmentAttemptDurationHandoffEvidence
): AssignmentAttemptDurationHandoffView {
  const itemViews = ASSIGNMENT_ATTEMPT_DURATION_HANDOFF_ITEM_IDS.map((id) =>
    buildAssignmentAttemptDurationHandoffItemView({ ...evidence, id })
  );

  return {
    description: m.assignment_attempt_duration_handoff_description(),
    itemViews,
    privacy: buildAssignmentAttemptDurationHandoffPrivacyContract(itemViews),
    title: m.assignment_attempt_duration_handoff_title(),
  };
}

function buildAssignmentAttemptDurationHandoffItemView(
  context: AssignmentAttemptDurationHandoffItemContext
): AssignmentAttemptDurationHandoffItemView {
  const item = buildAssignmentAttemptDurationHandoffItem(context);

  return {
    ...item,
    ariaLabel: m.assignment_attempt_duration_handoff_item_aria_label({
      description: item.description,
      label: item.label,
      value: item.value,
    }),
  };
}

function buildAssignmentAttemptDurationHandoffItem(
  context: AssignmentAttemptDurationHandoffItemContext
): Omit<AssignmentAttemptDurationHandoffItemView, 'ariaLabel'> {
  switch (context.id) {
    case 'duration-unit-contract':
      return buildStaticItem({
        context,
        value: m.assignment_attempt_duration_handoff_unit_value({
          milliseconds: context.durationUnits.millisecondsPerSecond,
          seconds: context.durationUnits.secondsPerMinute,
        }),
      });
    case 'time-limit-normalization':
      return buildStaticItem({
        context,
        value: formatSecondsValue(context.normalizedTimeLimitSeconds),
      });
    case 'duration-rounding':
      return buildStaticItem({
        context,
        value: formatSecondsValue(context.durationRoundedSeconds),
      });
    case 'duration-cap':
      return buildStaticItem({
        context,
        value: formatSecondsValue(context.cappedDurationSeconds),
      });
    case 'negative-duration-guard':
      return buildStaticItem({
        context,
        value: formatSecondsValue(context.negativeDurationSeconds),
      });
    case 'nonfinite-duration-guard':
      return buildStaticItem({
        context,
        value: context.nonFiniteDurationRecorded
          ? m.assignment_attempt_duration_handoff_needs_review_value()
          : m.assignment_attempt_duration_handoff_ignored_value(),
      });
    case 'zero-duration-display':
      return buildStaticItem({
        context,
        value: context.zeroDurationLabel,
      });
    case 'readable-format':
      return buildStaticItem({
        context,
        value: context.readableDurationLabel,
      });
    case 'timer-format':
      return buildStaticItem({
        context,
        value: context.timerDurationLabel,
      });
    case 'display-view':
      return buildStaticItem({
        context,
        value: context.displayLabel,
      });
    case 'capped-display-view':
      return buildStaticItem({
        context,
        value: context.cappedDisplayLabel,
      });
    case 'timer-state-elapsed':
      return buildStaticItem({
        context,
        value: formatSecondsValue(context.timerStateElapsedSeconds),
      });
    case 'timer-state-remaining':
      return buildStaticItem({
        context,
        value: formatSecondsValue(context.timerStateRemainingSeconds),
      });
    case 'timer-state-expiry':
      return buildStaticItem({
        context,
        value: context.expiredStateTimeExpired
          ? m.assignment_attempt_duration_handoff_expired_value({
              seconds: context.expiredDurationSeconds,
            })
          : m.assignment_attempt_duration_handoff_needs_review_value(),
      });
    case 'started-at-derivation':
      return buildStaticItem({
        context,
        value: m.assignment_attempt_duration_handoff_started_delta_value({
          seconds: context.startedAtDeltaSeconds,
        }),
      });
    case 'submission-duration-resolution':
      return buildStaticItem({
        context,
        value: formatSecondsValue(context.submissionDurationSeconds),
      });
    case 'submission-input-duration':
      return buildStaticItem({
        context,
        value: m.assignment_attempt_duration_handoff_submitted_value({
          seconds: context.submissionInputDurationSeconds ?? 0,
        }),
      });
    case 'runner-clock-start-plan':
      return buildStaticItem({
        context,
        value:
          context.runnerClockStartPlanType === 'start'
            ? m.assignment_attempt_duration_handoff_after_load_value()
            : m.assignment_attempt_duration_handoff_needs_review_value(),
      });
    case 'route-clock-effect':
      return buildBooleanBoundaryItem({
        context,
        ok: context.routeUsesClockStartPlan,
      });
    case 'runner-tick-plan':
      return buildStaticItem({
        context,
        value:
          context.runnerTickPlanType === 'tick' && context.runnerTickIntervalMs
            ? m.assignment_attempt_duration_handoff_tick_value({
                milliseconds: context.runnerTickIntervalMs,
              })
            : m.assignment_attempt_duration_handoff_needs_review_value(),
      });
    case 'timer-badge':
      return buildStaticItem({
        context,
        value:
          context.timerBadgeShows && context.timerBadgeLabel
            ? m.assignment_attempt_duration_handoff_timer_badge_value({
                label: context.timerBadgeLabel,
              })
            : m.assignment_attempt_duration_handoff_needs_review_value(),
      });
    case 'time-expired-control':
      return buildBooleanBoundaryItem({
        context,
        ok:
          context.timeExpiredControlsDisabled && context.timeExpiredNoticeShown,
        value: m.assignment_attempt_duration_handoff_disabled_value(),
      });
    case 'start-handoff-boundary':
      return buildBooleanBoundaryItem({
        context,
        ok: context.startHandoffHasTimerBoundary,
      });
    case 'submission-handoff-boundary':
      return buildBooleanBoundaryItem({
        context,
        ok: context.submissionHandoffHasAttemptDuration,
      });
    case 'result-display-boundary':
      return buildStaticItem({
        context,
        value: context.resultDisplayDurationLabel,
      });
    case 'result-analysis-boundary':
      return buildBooleanBoundaryItem({
        context,
        ok: context.resultAnalysisUsesDurationHelper,
      });
    case 'result-view-boundary':
      return buildBooleanBoundaryItem({
        context,
        ok: context.resultViewUsesDisplayContract,
      });
    case 'export-average-duration':
      return buildBooleanBoundaryItem({
        context,
        ok: context.exportAverageUsesDisplayContract,
      });
    case 'export-attempt-duration':
      return buildBooleanBoundaryItem({
        context,
        ok: context.exportAttemptUsesDisplayContract,
      });
    case 'privacy-guard':
      return buildBooleanBoundaryItem({
        context,
        ok: context.privacyGuardsPrivateData,
        value:
          m.assignment_attempt_duration_handoff_private_data_hidden_value(),
      });
  }
}

function buildStaticItem({
  context,
  value,
}: {
  context: AssignmentAttemptDurationHandoffItemContext;
  value: string;
}): Omit<AssignmentAttemptDurationHandoffItemView, 'ariaLabel'> {
  return {
    description: getAssignmentAttemptDurationHandoffItemDescription(context.id),
    id: context.id,
    label: getAssignmentAttemptDurationHandoffItemLabel(context.id),
    value,
  };
}

function buildBooleanBoundaryItem({
  context,
  ok,
  value,
}: {
  context: AssignmentAttemptDurationHandoffItemContext;
  ok: boolean;
  value?: string;
}): Omit<AssignmentAttemptDurationHandoffItemView, 'ariaLabel'> {
  return buildStaticItem({
    context,
    value:
      value ??
      (ok
        ? m.assignment_attempt_duration_handoff_ready_value()
        : m.assignment_attempt_duration_handoff_needs_review_value()),
  });
}

function buildAssignmentAttemptDurationHandoffPrivacyContract(
  itemViews: AssignmentAttemptDurationHandoffItemView[]
): AssignmentAttemptDurationHandoffPrivacyContract {
  return {
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesRawStartedAt: false,
    exposesRawSubmissionPayload: false,
    exposesRuntimeItemIds: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    itemIds: itemViews.map((item) => item.id),
    mutatesAttempts: false,
    readsBrowserStorage: false,
    scope: 'assignment-attempt-duration-boundary',
    usesSharedDurationHelpers: true,
  };
}

function getAssignmentAttemptDurationHandoffItemLabel(
  id: AssignmentAttemptDurationHandoffItemId
) {
  switch (id) {
    case 'duration-unit-contract':
      return m.assignment_attempt_duration_handoff_duration_unit_contract_label();
    case 'time-limit-normalization':
      return m.assignment_attempt_duration_handoff_time_limit_normalization_label();
    case 'duration-rounding':
      return m.assignment_attempt_duration_handoff_duration_rounding_label();
    case 'duration-cap':
      return m.assignment_attempt_duration_handoff_duration_cap_label();
    case 'negative-duration-guard':
      return m.assignment_attempt_duration_handoff_negative_duration_guard_label();
    case 'nonfinite-duration-guard':
      return m.assignment_attempt_duration_handoff_nonfinite_duration_guard_label();
    case 'zero-duration-display':
      return m.assignment_attempt_duration_handoff_zero_duration_display_label();
    case 'readable-format':
      return m.assignment_attempt_duration_handoff_readable_format_label();
    case 'timer-format':
      return m.assignment_attempt_duration_handoff_timer_format_label();
    case 'display-view':
      return m.assignment_attempt_duration_handoff_display_view_label();
    case 'capped-display-view':
      return m.assignment_attempt_duration_handoff_capped_display_view_label();
    case 'timer-state-elapsed':
      return m.assignment_attempt_duration_handoff_timer_state_elapsed_label();
    case 'timer-state-remaining':
      return m.assignment_attempt_duration_handoff_timer_state_remaining_label();
    case 'timer-state-expiry':
      return m.assignment_attempt_duration_handoff_timer_state_expiry_label();
    case 'started-at-derivation':
      return m.assignment_attempt_duration_handoff_started_at_derivation_label();
    case 'submission-duration-resolution':
      return m.assignment_attempt_duration_handoff_submission_duration_resolution_label();
    case 'submission-input-duration':
      return m.assignment_attempt_duration_handoff_submission_input_duration_label();
    case 'runner-clock-start-plan':
      return m.assignment_attempt_duration_handoff_runner_clock_start_plan_label();
    case 'route-clock-effect':
      return m.assignment_attempt_duration_handoff_route_clock_effect_label();
    case 'runner-tick-plan':
      return m.assignment_attempt_duration_handoff_runner_tick_plan_label();
    case 'timer-badge':
      return m.assignment_attempt_duration_handoff_timer_badge_label();
    case 'time-expired-control':
      return m.assignment_attempt_duration_handoff_time_expired_control_label();
    case 'start-handoff-boundary':
      return m.assignment_attempt_duration_handoff_start_handoff_boundary_label();
    case 'submission-handoff-boundary':
      return m.assignment_attempt_duration_handoff_submission_handoff_boundary_label();
    case 'result-display-boundary':
      return m.assignment_attempt_duration_handoff_result_display_boundary_label();
    case 'result-analysis-boundary':
      return m.assignment_attempt_duration_handoff_result_analysis_boundary_label();
    case 'result-view-boundary':
      return m.assignment_attempt_duration_handoff_result_view_boundary_label();
    case 'export-average-duration':
      return m.assignment_attempt_duration_handoff_export_average_duration_label();
    case 'export-attempt-duration':
      return m.assignment_attempt_duration_handoff_export_attempt_duration_label();
    case 'privacy-guard':
      return m.assignment_attempt_duration_handoff_privacy_guard_label();
  }
}

function getAssignmentAttemptDurationHandoffItemDescription(
  id: AssignmentAttemptDurationHandoffItemId
) {
  switch (id) {
    case 'duration-unit-contract':
      return m.assignment_attempt_duration_handoff_duration_unit_contract_description();
    case 'time-limit-normalization':
      return m.assignment_attempt_duration_handoff_time_limit_normalization_description();
    case 'duration-rounding':
      return m.assignment_attempt_duration_handoff_duration_rounding_description();
    case 'duration-cap':
      return m.assignment_attempt_duration_handoff_duration_cap_description();
    case 'negative-duration-guard':
      return m.assignment_attempt_duration_handoff_negative_duration_guard_description();
    case 'nonfinite-duration-guard':
      return m.assignment_attempt_duration_handoff_nonfinite_duration_guard_description();
    case 'zero-duration-display':
      return m.assignment_attempt_duration_handoff_zero_duration_display_description();
    case 'readable-format':
      return m.assignment_attempt_duration_handoff_readable_format_description();
    case 'timer-format':
      return m.assignment_attempt_duration_handoff_timer_format_description();
    case 'display-view':
      return m.assignment_attempt_duration_handoff_display_view_description();
    case 'capped-display-view':
      return m.assignment_attempt_duration_handoff_capped_display_view_description();
    case 'timer-state-elapsed':
      return m.assignment_attempt_duration_handoff_timer_state_elapsed_description();
    case 'timer-state-remaining':
      return m.assignment_attempt_duration_handoff_timer_state_remaining_description();
    case 'timer-state-expiry':
      return m.assignment_attempt_duration_handoff_timer_state_expiry_description();
    case 'started-at-derivation':
      return m.assignment_attempt_duration_handoff_started_at_derivation_description();
    case 'submission-duration-resolution':
      return m.assignment_attempt_duration_handoff_submission_duration_resolution_description();
    case 'submission-input-duration':
      return m.assignment_attempt_duration_handoff_submission_input_duration_description();
    case 'runner-clock-start-plan':
      return m.assignment_attempt_duration_handoff_runner_clock_start_plan_description();
    case 'route-clock-effect':
      return m.assignment_attempt_duration_handoff_route_clock_effect_description();
    case 'runner-tick-plan':
      return m.assignment_attempt_duration_handoff_runner_tick_plan_description();
    case 'timer-badge':
      return m.assignment_attempt_duration_handoff_timer_badge_description();
    case 'time-expired-control':
      return m.assignment_attempt_duration_handoff_time_expired_control_description();
    case 'start-handoff-boundary':
      return m.assignment_attempt_duration_handoff_start_handoff_boundary_description();
    case 'submission-handoff-boundary':
      return m.assignment_attempt_duration_handoff_submission_handoff_boundary_description();
    case 'result-display-boundary':
      return m.assignment_attempt_duration_handoff_result_display_boundary_description();
    case 'result-analysis-boundary':
      return m.assignment_attempt_duration_handoff_result_analysis_boundary_description();
    case 'result-view-boundary':
      return m.assignment_attempt_duration_handoff_result_view_boundary_description();
    case 'export-average-duration':
      return m.assignment_attempt_duration_handoff_export_average_duration_description();
    case 'export-attempt-duration':
      return m.assignment_attempt_duration_handoff_export_attempt_duration_description();
    case 'privacy-guard':
      return m.assignment_attempt_duration_handoff_privacy_guard_description();
  }
}

function formatSecondsValue(seconds: number | undefined) {
  if (seconds === undefined) {
    return m.assignment_attempt_duration_handoff_not_recorded_value();
  }

  return m.assignment_attempt_duration_handoff_seconds_value({ seconds });
}

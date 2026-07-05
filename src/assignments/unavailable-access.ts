import {
  buildPublicAssignmentAccessHandoffView,
  type PublicAssignmentAccessHandoffView,
  type PublicAssignmentLookupResult,
  type PublicAssignmentUnavailablePayload,
  type PublicAssignmentUnavailableReason,
} from '@/assignments/public';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import type {
  StudentRunnerMissingPageView,
  StudentRunnerUnavailableSafetyView,
} from '@/assignments/student-runner-state';
import type { StudentRunnerMissingScopeItem } from '@/assignments/student-submission';
import { m } from '@/locale/paraglide/messages';

export const PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS = [
  'access-status',
  'unavailable-reason',
  'share-link-boundary',
  'missing-route-state',
  'student-message',
  'status-scope',
  'next-step-scope',
  'activity-content-scope',
  'browser-identity-scope',
  'submission-scope',
  'safety-panel',
  'safety-item-count',
  'runtime-content-policy',
  'answer-key-policy',
  'explanation-policy',
  'teacher-material-policy',
  'browser-label-policy',
  'raw-token-policy',
  'submission-policy',
  'sanitized-payload-policy',
  'public-access-handoff',
  'lifecycle-helper',
  'submission-error',
  'direct-submit-guard',
  'teacher-list-alignment',
  'result-page-alignment',
  'results-retention',
  'reopen-guidance',
  'route-indexing-policy',
  'privacy-guard',
] as const;

export type PublicAssignmentUnavailableAccessHandoffItemId =
  (typeof PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS)[number];

export type PublicAssignmentUnavailableAccessHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: PublicAssignmentUnavailableAccessHandoffItemId;
  label: string;
  value: string;
};

export type PublicAssignmentUnavailableAccessHandoffPrivacyView = {
  exposesActualShareSlug: false;
  exposesAnswerKeys: false;
  exposesAssignmentTitle: false;
  exposesBrowserLabel: false;
  exposesExplanations: false;
  exposesRawAnonymousToken: false;
  exposesRuntimeChoiceText: false;
  exposesRuntimeItemIds: false;
  exposesRuntimePromptText: false;
  exposesStudentAnswerText: false;
  exposesTeacherMaterials: false;
  itemIds: PublicAssignmentUnavailableAccessHandoffItemId[];
};

export type PublicAssignmentUnavailableAccessHandoffView = {
  description: string;
  itemViews: PublicAssignmentUnavailableAccessHandoffItemView[];
  privacy: PublicAssignmentUnavailableAccessHandoffPrivacyView;
  title: string;
};

export function buildPublicAssignmentUnavailableAccessHandoffView({
  lookupResult,
  missingView,
  shareSlug,
}: {
  lookupResult: PublicAssignmentLookupResult | null | undefined;
  missingView: StudentRunnerMissingPageView | undefined;
  shareSlug?: string;
}): PublicAssignmentUnavailableAccessHandoffView | undefined {
  if (lookupResult?.status !== 'unavailable' || !missingView?.unavailable) {
    return undefined;
  }

  const accessHandoffView = buildPublicAssignmentAccessHandoffView({
    lookupResult,
    shareSlug,
  });
  const context: PublicAssignmentUnavailableAccessHandoffContext = {
    accessHandoffView,
    missingView,
    normalizedShareSlug: normalizeAssignmentShareSlug(shareSlug ?? ''),
    reason: lookupResult.reason,
    safetyView: missingView.unavailableSafetyView,
    unavailable: missingView.unavailable,
  };
  const itemViews = PUBLIC_ASSIGNMENT_UNAVAILABLE_ACCESS_HANDOFF_ITEM_IDS.map(
    (id) =>
      buildPublicAssignmentUnavailableAccessHandoffItemView({
        ...context,
        id,
      })
  );

  return {
    description: m.public_assignment_unavailable_access_handoff_description(),
    itemViews,
    privacy:
      buildPublicAssignmentUnavailableAccessHandoffPrivacyView(itemViews),
    title: m.public_assignment_unavailable_access_handoff_title(),
  };
}

type PublicAssignmentUnavailableAccessHandoffContext = {
  accessHandoffView: PublicAssignmentAccessHandoffView;
  missingView: StudentRunnerMissingPageView;
  normalizedShareSlug: string;
  reason: PublicAssignmentUnavailableReason;
  safetyView?: StudentRunnerUnavailableSafetyView;
  unavailable: PublicAssignmentUnavailablePayload;
};

type PublicAssignmentUnavailableAccessHandoffItemBuildContext =
  PublicAssignmentUnavailableAccessHandoffContext & {
    id: PublicAssignmentUnavailableAccessHandoffItemId;
  };

function buildPublicAssignmentUnavailableAccessHandoffItemView(
  context: PublicAssignmentUnavailableAccessHandoffItemBuildContext
): PublicAssignmentUnavailableAccessHandoffItemView {
  const label = getPublicAssignmentUnavailableAccessHandoffItemLabel(
    context.id
  );
  const description =
    getPublicAssignmentUnavailableAccessHandoffItemDescription(context.id);
  const value = getPublicAssignmentUnavailableAccessHandoffItemValue(context);

  return {
    ariaLabel: m.public_assignment_unavailable_access_handoff_item_aria({
      description,
      label,
      value,
    }),
    description,
    id: context.id,
    label,
    value,
  };
}

function getPublicAssignmentUnavailableAccessHandoffItemLabel(
  id: PublicAssignmentUnavailableAccessHandoffItemId
) {
  switch (id) {
    case 'access-status':
      return m.public_assignment_access_handoff_access_label();
    case 'unavailable-reason':
      return m.public_assignment_access_handoff_lifecycle_label();
    case 'share-link-boundary':
      return m.public_assignment_access_handoff_share_label();
    case 'missing-route-state':
      return m.public_assignment_unavailable_access_handoff_route_state_label();
    case 'student-message':
      return m.public_assignment_unavailable_access_handoff_student_message_label();
    case 'status-scope':
      return m.student_runner_missing_scope_status_label();
    case 'next-step-scope':
      return m.student_runner_missing_scope_next_step_label();
    case 'activity-content-scope':
      return m.student_runner_missing_scope_activity_content_label();
    case 'browser-identity-scope':
      return m.student_runner_missing_scope_browser_identity_label();
    case 'submission-scope':
      return m.student_runner_missing_scope_submissions_label();
    case 'safety-panel':
      return m.public_assignment_unavailable_access_handoff_safety_panel_label();
    case 'safety-item-count':
      return m.public_assignment_unavailable_access_handoff_safety_items_label();
    case 'runtime-content-policy':
      return m.student_runner_unavailable_safety_activity_content_label();
    case 'answer-key-policy':
      return m.public_assignment_access_handoff_answer_keys_label();
    case 'explanation-policy':
      return m.public_assignment_access_handoff_explanations_label();
    case 'teacher-material-policy':
      return m.student_runner_unavailable_safety_source_materials_label();
    case 'browser-label-policy':
      return m.student_runner_unavailable_safety_browser_identity_label();
    case 'raw-token-policy':
      return m.public_assignment_unavailable_access_handoff_raw_token_label();
    case 'submission-policy':
      return m.public_assignment_access_handoff_submission_label();
    case 'sanitized-payload-policy':
      return m.public_assignment_access_handoff_sanitized_payload_label();
    case 'public-access-handoff':
      return m.public_assignment_unavailable_access_handoff_access_handoff_label();
    case 'lifecycle-helper':
      return m.public_assignment_unavailable_access_handoff_lifecycle_helper_label();
    case 'submission-error':
      return m.assignment_lifecycle_handoff_submission_gate_label();
    case 'direct-submit-guard':
      return m.public_assignment_unavailable_access_handoff_direct_submit_label();
    case 'teacher-list-alignment':
      return m.assignment_lifecycle_handoff_teacher_list_state_label();
    case 'result-page-alignment':
      return m.assignment_lifecycle_handoff_result_page_state_label();
    case 'results-retention':
      return m.assignment_lifecycle_handoff_attempt_review_retention_label();
    case 'reopen-guidance':
      return m.public_assignment_unavailable_access_handoff_reopen_guidance_label();
    case 'route-indexing-policy':
      return m.public_assignment_unavailable_access_handoff_route_indexing_label();
    case 'privacy-guard':
      return m.public_assignment_access_handoff_privacy_label();
  }
}

function getPublicAssignmentUnavailableAccessHandoffItemDescription(
  id: PublicAssignmentUnavailableAccessHandoffItemId
) {
  switch (id) {
    case 'access-status':
      return m.public_assignment_access_handoff_access_description();
    case 'unavailable-reason':
      return m.public_assignment_access_handoff_lifecycle_description();
    case 'share-link-boundary':
      return m.public_assignment_unavailable_access_handoff_share_description();
    case 'missing-route-state':
      return m.public_assignment_unavailable_access_handoff_route_state_description();
    case 'student-message':
      return m.public_assignment_unavailable_access_handoff_student_message_description();
    case 'status-scope':
      return m.public_assignment_unavailable_access_handoff_status_scope_description();
    case 'next-step-scope':
      return m.public_assignment_unavailable_access_handoff_next_step_description();
    case 'activity-content-scope':
      return m.student_runner_missing_scope_activity_content_description();
    case 'browser-identity-scope':
      return m.student_runner_missing_scope_browser_identity_description();
    case 'submission-scope':
      return m.student_runner_missing_scope_submissions_description();
    case 'safety-panel':
      return m.student_runner_unavailable_safety_description();
    case 'safety-item-count':
      return m.public_assignment_unavailable_access_handoff_safety_items_description();
    case 'runtime-content-policy':
      return m.student_runner_unavailable_safety_activity_content_description();
    case 'answer-key-policy':
      return m.public_assignment_access_handoff_answer_keys_unavailable_description();
    case 'explanation-policy':
      return m.public_assignment_access_handoff_explanations_unavailable_description();
    case 'teacher-material-policy':
      return m.student_runner_unavailable_safety_source_materials_description();
    case 'browser-label-policy':
      return m.student_runner_unavailable_safety_browser_identity_description();
    case 'raw-token-policy':
      return m.public_assignment_unavailable_access_handoff_raw_token_description();
    case 'submission-policy':
      return m.public_assignment_access_handoff_submission_blocked_description();
    case 'sanitized-payload-policy':
      return m.public_assignment_unavailable_access_handoff_sanitized_payload_description();
    case 'public-access-handoff':
      return m.public_assignment_unavailable_access_handoff_access_handoff_description();
    case 'lifecycle-helper':
      return m.public_assignment_unavailable_access_handoff_lifecycle_helper_description();
    case 'submission-error':
      return m.assignment_lifecycle_handoff_submission_gate_description();
    case 'direct-submit-guard':
      return m.public_assignment_unavailable_access_handoff_direct_submit_description();
    case 'teacher-list-alignment':
      return m.public_assignment_unavailable_access_handoff_teacher_list_description();
    case 'result-page-alignment':
      return m.public_assignment_unavailable_access_handoff_result_page_description();
    case 'results-retention':
      return m.assignment_lifecycle_handoff_attempt_review_retention_description();
    case 'reopen-guidance':
      return m.public_assignment_unavailable_access_handoff_reopen_guidance_description();
    case 'route-indexing-policy':
      return m.public_assignment_unavailable_access_handoff_route_indexing_description();
    case 'privacy-guard':
      return m.public_assignment_access_handoff_privacy_description();
  }
}

function getPublicAssignmentUnavailableAccessHandoffItemValue(
  context: PublicAssignmentUnavailableAccessHandoffItemBuildContext
) {
  switch (context.id) {
    case 'access-status':
      return m.public_assignment_access_handoff_access_unavailable();
    case 'unavailable-reason':
      return formatUnavailableReason(context.reason);
    case 'share-link-boundary':
      return context.normalizedShareSlug
        ? m.public_assignment_unavailable_access_handoff_share_hidden_value()
        : m.public_assignment_access_handoff_missing_value();
    case 'missing-route-state':
      return formatMissingRouteState(context.missingView.reason);
    case 'student-message':
      return context.missingView.title;
    case 'status-scope':
      return getMissingScopeValue(
        context.missingView.scopeItems,
        'link-status'
      );
    case 'next-step-scope':
      return getMissingScopeValue(context.missingView.scopeItems, 'next-step');
    case 'activity-content-scope':
      return getMissingScopeValue(
        context.missingView.scopeItems,
        'activity-content'
      );
    case 'browser-identity-scope':
      return getMissingScopeValue(
        context.missingView.scopeItems,
        'browser-identity'
      );
    case 'submission-scope':
      return getMissingScopeValue(
        context.missingView.scopeItems,
        'submissions'
      );
    case 'safety-panel':
      return (
        context.safetyView?.title ??
        m.public_assignment_access_handoff_hidden_value()
      );
    case 'safety-item-count':
      return m.public_assignment_unavailable_access_handoff_safety_items_value({
        count: context.safetyView?.items.length ?? 0,
      });
    case 'runtime-content-policy':
      return context.unavailable.contentPolicy.runtimeItemsHidden
        ? m.student_runner_unavailable_safety_activity_content_value()
        : m.public_assignment_unavailable_access_handoff_unexpected_available_value();
    case 'answer-key-policy':
      return context.unavailable.contentPolicy.answerKeysHidden
        ? m.student_runner_unavailable_safety_answer_feedback_value()
        : m.public_assignment_unavailable_access_handoff_unexpected_available_value();
    case 'explanation-policy':
      return context.unavailable.contentPolicy.explanationsHidden
        ? m.student_runner_unavailable_safety_answer_feedback_value()
        : m.public_assignment_unavailable_access_handoff_unexpected_available_value();
    case 'teacher-material-policy':
      return context.unavailable.contentPolicy.teacherMaterialsHidden
        ? m.student_runner_unavailable_safety_source_materials_value()
        : m.public_assignment_unavailable_access_handoff_unexpected_available_value();
    case 'browser-label-policy':
      return context.unavailable.identityPolicy.browserLabelHidden
        ? m.student_runner_unavailable_safety_browser_identity_value()
        : m.public_assignment_unavailable_access_handoff_unexpected_available_value();
    case 'raw-token-policy':
      return context.unavailable.identityPolicy.rawAnonymousTokenHidden
        ? m.student_runner_unavailable_safety_browser_identity_value()
        : m.public_assignment_unavailable_access_handoff_unexpected_available_value();
    case 'submission-policy':
      return context.unavailable.submissionPolicy.submissionsBlocked
        ? m.student_runner_unavailable_safety_submissions_value()
        : m.public_assignment_unavailable_access_handoff_unexpected_available_value();
    case 'sanitized-payload-policy':
      return m.public_assignment_unavailable_access_handoff_policy_only_value();
    case 'public-access-handoff':
      return m.public_assignment_unavailable_access_handoff_access_handoff_value(
        {
          count: context.accessHandoffView.itemViews.length,
        }
      );
    case 'lifecycle-helper':
      return m.public_assignment_unavailable_access_handoff_lifecycle_helper_value();
    case 'submission-error':
      return formatUnavailableSubmissionError(context.reason);
    case 'direct-submit-guard':
      return m.public_assignment_unavailable_access_handoff_direct_submit_value();
    case 'teacher-list-alignment':
      return formatTeacherListAlignment(context.reason);
    case 'result-page-alignment':
      return formatResultPageAlignment(context.reason);
    case 'results-retention':
      return formatResultsRetention(context.reason);
    case 'reopen-guidance':
      return formatReopenGuidance(context.reason);
    case 'route-indexing-policy':
      return m.public_assignment_unavailable_access_handoff_noindex_value();
    case 'privacy-guard':
      return m.public_assignment_access_handoff_private_data_omitted_value();
  }
}

function buildPublicAssignmentUnavailableAccessHandoffPrivacyView(
  itemViews: PublicAssignmentUnavailableAccessHandoffItemView[]
): PublicAssignmentUnavailableAccessHandoffPrivacyView {
  return {
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
    itemIds: itemViews.map((item) => item.id),
  };
}

function getMissingScopeValue(
  scopeItems: StudentRunnerMissingScopeItem[],
  id: StudentRunnerMissingScopeItem['id']
) {
  return (
    scopeItems.find((item) => item.id === id)?.value ??
    m.public_assignment_access_handoff_hidden_value()
  );
}

function formatUnavailableReason(reason: PublicAssignmentUnavailableReason) {
  switch (reason) {
    case 'closed':
      return m.public_assignment_access_handoff_lifecycle_closed();
    case 'draft':
      return m.public_assignment_access_handoff_lifecycle_draft();
    case 'expired':
      return m.public_assignment_access_handoff_lifecycle_expired();
  }
}

function formatMissingRouteState(
  reason: StudentRunnerMissingPageView['reason']
) {
  switch (reason) {
    case 'closed':
      return m.public_assignment_access_handoff_lifecycle_closed();
    case 'draft':
      return m.public_assignment_access_handoff_lifecycle_draft();
    case 'expired':
      return m.public_assignment_access_handoff_lifecycle_expired();
    case 'not-found':
      return m.student_runner_missing_scope_status_not_found_value();
  }
}

function formatUnavailableSubmissionError(
  reason: PublicAssignmentUnavailableReason
) {
  switch (reason) {
    case 'closed':
      return m.assignment_api_error_assignment_closed();
    case 'draft':
      return m.assignment_api_error_assignment_not_published();
    case 'expired':
      return m.assignment_api_error_assignment_expired();
  }
}

function formatTeacherListAlignment(reason: PublicAssignmentUnavailableReason) {
  if (reason === 'draft') {
    return m.public_assignment_unavailable_access_handoff_teacher_list_publish_value();
  }

  return m.public_assignment_unavailable_access_handoff_teacher_list_blocked_value();
}

function formatResultPageAlignment(reason: PublicAssignmentUnavailableReason) {
  if (reason === 'draft') {
    return m.public_assignment_unavailable_access_handoff_result_page_unavailable_value();
  }

  return m.public_assignment_unavailable_access_handoff_result_page_retained_value();
}

function formatResultsRetention(reason: PublicAssignmentUnavailableReason) {
  if (reason === 'draft') {
    return m.public_assignment_unavailable_access_handoff_results_no_snapshot_value();
  }

  return m.public_assignment_unavailable_access_handoff_results_retained_value();
}

function formatReopenGuidance(reason: PublicAssignmentUnavailableReason) {
  switch (reason) {
    case 'closed':
      return m.public_assignment_unavailable_access_handoff_reopen_closed_value();
    case 'draft':
      return m.public_assignment_unavailable_access_handoff_reopen_draft_value();
    case 'expired':
      return m.public_assignment_unavailable_access_handoff_reopen_expired_value();
  }
}

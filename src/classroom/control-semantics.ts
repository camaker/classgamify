import { m } from '@/locale/paraglide/messages';

export const CLASSROOM_CONTROL_SEMANTICS_HANDOFF_ITEM_IDS = [
  'ai-source-textarea',
  'ai-safe-source-note',
  'ai-source-readiness',
  'ai-material-safety',
  'ai-source-capabilities',
  'ai-synced-provenance',
  'ai-focus-control',
  'ai-generate-action',
  'ai-draft-summary',
  'activity-source-filter',
  'assignment-status-filter',
  'publish-title-field',
  'publish-instructions-field',
  'publish-attempt-limit-field',
  'publish-timer-field',
  'publish-close-time-field',
  'publish-delivery-toggles',
  'publish-preview-region',
  'result-student-search',
  'result-student-sort',
  'result-item-sort',
  'result-answer-review-filter',
  'result-review-scope',
  'result-copy-scope',
  'result-csv-coverage',
  'printable-answer-key-toggle',
  'printable-print-action',
  'student-identity-input',
  'student-submit-button',
  'privacy-guard',
] as const;

export const CLASSROOM_CONTROL_SEMANTICS_HANDOFF_ROUTE_SCOPES = [
  '/create',
  '/dashboard',
  '/play',
  '/print',
] as const;

export type ClassroomControlSemanticsHandoffItemId =
  (typeof CLASSROOM_CONTROL_SEMANTICS_HANDOFF_ITEM_IDS)[number];

export type ClassroomControlSemanticsHandoffRouteScope =
  (typeof CLASSROOM_CONTROL_SEMANTICS_HANDOFF_ROUTE_SCOPES)[number];

export type ClassroomControlSemanticsHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ClassroomControlSemanticsHandoffItemId;
  label: string;
  value: string;
};

export type ClassroomControlSemanticsHandoffPrivacyContract = {
  exposesActivityContentText: false;
  exposesAnswerKeys: false;
  exposesAssignmentTitleText: false;
  exposesCsvDataUrl: false;
  exposesPromptText: false;
  exposesRawAnonymousTokens: false;
  exposesStudentAnswers: false;
  exposesStudentName: false;
  itemIds: ClassroomControlSemanticsHandoffItemId[];
  mutatesActivity: false;
  mutatesAssignment: false;
  scope: 'classroom-control-semantics';
  submitsAttempt: false;
  usesPreparedViewModels: true;
};

export type ClassroomControlSemanticsHandoffView = {
  description: string;
  itemViews: ClassroomControlSemanticsHandoffItemView[];
  privacy: ClassroomControlSemanticsHandoffPrivacyContract;
  title: string;
};

type ClassroomControlSemanticsHandoffValueKind =
  | 'prepared-control'
  | 'prepared-help'
  | 'prepared-state'
  | 'route-state'
  | 'semantic-region'
  | 'private-data-hidden';

export function buildClassroomControlSemanticsHandoffView(): ClassroomControlSemanticsHandoffView {
  const itemViews = CLASSROOM_CONTROL_SEMANTICS_HANDOFF_ITEM_IDS.map((id) =>
    buildClassroomControlSemanticsHandoffItemView(id)
  );

  return {
    description: m.classroom_control_semantics_handoff_description(),
    itemViews,
    privacy: buildClassroomControlSemanticsHandoffPrivacyContract(itemViews),
    title: m.classroom_control_semantics_handoff_title(),
  };
}

export function shouldRenderClassroomControlSemanticsHandoff(pathname: string) {
  const normalizedPathname =
    normalizeClassroomControlSemanticsPathname(pathname);

  return CLASSROOM_CONTROL_SEMANTICS_HANDOFF_ROUTE_SCOPES.some((scope) => {
    if (scope === '/create') {
      return normalizedPathname === scope;
    }

    return (
      normalizedPathname === scope || normalizedPathname.startsWith(`${scope}/`)
    );
  });
}

function normalizeClassroomControlSemanticsPathname(pathname: string) {
  const pathOnly = pathname.split('?')[0]?.split('#')[0] ?? '/';

  if (pathOnly.length > 1 && pathOnly.endsWith('/')) {
    return pathOnly.slice(0, -1);
  }

  return pathOnly || '/';
}

function buildClassroomControlSemanticsHandoffItemView(
  id: ClassroomControlSemanticsHandoffItemId
): ClassroomControlSemanticsHandoffItemView {
  const label = getClassroomControlSemanticsHandoffLabel(id);
  const description = getClassroomControlSemanticsHandoffDescription(id);
  const value = getClassroomControlSemanticsHandoffValue(
    getClassroomControlSemanticsHandoffValueKind(id)
  );

  return {
    ariaLabel: m.classroom_control_semantics_handoff_item_aria({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

function buildClassroomControlSemanticsHandoffPrivacyContract(
  itemViews: ClassroomControlSemanticsHandoffItemView[]
): ClassroomControlSemanticsHandoffPrivacyContract {
  return {
    exposesActivityContentText: false,
    exposesAnswerKeys: false,
    exposesAssignmentTitleText: false,
    exposesCsvDataUrl: false,
    exposesPromptText: false,
    exposesRawAnonymousTokens: false,
    exposesStudentAnswers: false,
    exposesStudentName: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesActivity: false,
    mutatesAssignment: false,
    scope: 'classroom-control-semantics',
    submitsAttempt: false,
    usesPreparedViewModels: true,
  };
}

function getClassroomControlSemanticsHandoffValueKind(
  id: ClassroomControlSemanticsHandoffItemId
): ClassroomControlSemanticsHandoffValueKind {
  switch (id) {
    case 'ai-safe-source-note':
    case 'ai-source-readiness':
    case 'ai-material-safety':
    case 'ai-source-capabilities':
    case 'ai-synced-provenance':
      return 'prepared-help';
    case 'ai-draft-summary':
    case 'publish-preview-region':
    case 'result-review-scope':
    case 'result-copy-scope':
    case 'result-csv-coverage':
      return 'semantic-region';
    case 'activity-source-filter':
    case 'assignment-status-filter':
    case 'result-student-search':
    case 'result-student-sort':
    case 'result-item-sort':
    case 'result-answer-review-filter':
      return 'route-state';
    case 'privacy-guard':
      return 'private-data-hidden';
    case 'student-submit-button':
      return 'prepared-state';
    default:
      return 'prepared-control';
  }
}

function getClassroomControlSemanticsHandoffValue(
  valueKind: ClassroomControlSemanticsHandoffValueKind
) {
  switch (valueKind) {
    case 'prepared-control':
      return m.classroom_control_semantics_prepared_control_value();
    case 'prepared-help':
      return m.classroom_control_semantics_prepared_help_value();
    case 'prepared-state':
      return m.classroom_control_semantics_prepared_state_value();
    case 'route-state':
      return m.classroom_control_semantics_route_state_value();
    case 'semantic-region':
      return m.classroom_control_semantics_semantic_region_value();
    case 'private-data-hidden':
      return m.classroom_control_semantics_private_data_hidden_value();
  }
}

function getClassroomControlSemanticsHandoffLabel(
  id: ClassroomControlSemanticsHandoffItemId
) {
  switch (id) {
    case 'ai-source-textarea':
      return m.classroom_control_semantics_ai_source_textarea_label();
    case 'ai-safe-source-note':
      return m.classroom_control_semantics_ai_safe_source_note_label();
    case 'ai-source-readiness':
      return m.classroom_control_semantics_ai_source_readiness_label();
    case 'ai-material-safety':
      return m.classroom_control_semantics_ai_material_safety_label();
    case 'ai-source-capabilities':
      return m.classroom_control_semantics_ai_source_capabilities_label();
    case 'ai-synced-provenance':
      return m.classroom_control_semantics_ai_synced_provenance_label();
    case 'ai-focus-control':
      return m.classroom_control_semantics_ai_focus_control_label();
    case 'ai-generate-action':
      return m.classroom_control_semantics_ai_generate_action_label();
    case 'ai-draft-summary':
      return m.classroom_control_semantics_ai_draft_summary_label();
    case 'activity-source-filter':
      return m.classroom_control_semantics_activity_source_filter_label();
    case 'assignment-status-filter':
      return m.classroom_control_semantics_assignment_status_filter_label();
    case 'publish-title-field':
      return m.classroom_control_semantics_publish_title_field_label();
    case 'publish-instructions-field':
      return m.classroom_control_semantics_publish_instructions_field_label();
    case 'publish-attempt-limit-field':
      return m.classroom_control_semantics_publish_attempt_limit_field_label();
    case 'publish-timer-field':
      return m.classroom_control_semantics_publish_timer_field_label();
    case 'publish-close-time-field':
      return m.classroom_control_semantics_publish_close_time_field_label();
    case 'publish-delivery-toggles':
      return m.classroom_control_semantics_publish_delivery_toggles_label();
    case 'publish-preview-region':
      return m.classroom_control_semantics_publish_preview_region_label();
    case 'result-student-search':
      return m.classroom_control_semantics_result_student_search_label();
    case 'result-student-sort':
      return m.classroom_control_semantics_result_student_sort_label();
    case 'result-item-sort':
      return m.classroom_control_semantics_result_item_sort_label();
    case 'result-answer-review-filter':
      return m.classroom_control_semantics_result_answer_review_filter_label();
    case 'result-review-scope':
      return m.classroom_control_semantics_result_review_scope_label();
    case 'result-copy-scope':
      return m.classroom_control_semantics_result_copy_scope_label();
    case 'result-csv-coverage':
      return m.classroom_control_semantics_result_csv_coverage_label();
    case 'printable-answer-key-toggle':
      return m.classroom_control_semantics_printable_answer_key_toggle_label();
    case 'printable-print-action':
      return m.classroom_control_semantics_printable_print_action_label();
    case 'student-identity-input':
      return m.classroom_control_semantics_student_identity_input_label();
    case 'student-submit-button':
      return m.classroom_control_semantics_student_submit_button_label();
    case 'privacy-guard':
      return m.classroom_control_semantics_privacy_guard_label();
  }
}

function getClassroomControlSemanticsHandoffDescription(
  id: ClassroomControlSemanticsHandoffItemId
) {
  switch (id) {
    case 'ai-source-textarea':
      return m.classroom_control_semantics_ai_source_textarea_description();
    case 'ai-safe-source-note':
      return m.classroom_control_semantics_ai_safe_source_note_description();
    case 'ai-source-readiness':
      return m.classroom_control_semantics_ai_source_readiness_description();
    case 'ai-material-safety':
      return m.classroom_control_semantics_ai_material_safety_description();
    case 'ai-source-capabilities':
      return m.classroom_control_semantics_ai_source_capabilities_description();
    case 'ai-synced-provenance':
      return m.classroom_control_semantics_ai_synced_provenance_description();
    case 'ai-focus-control':
      return m.classroom_control_semantics_ai_focus_control_description();
    case 'ai-generate-action':
      return m.classroom_control_semantics_ai_generate_action_description();
    case 'ai-draft-summary':
      return m.classroom_control_semantics_ai_draft_summary_description();
    case 'activity-source-filter':
      return m.classroom_control_semantics_activity_source_filter_description();
    case 'assignment-status-filter':
      return m.classroom_control_semantics_assignment_status_filter_description();
    case 'publish-title-field':
      return m.classroom_control_semantics_publish_title_field_description();
    case 'publish-instructions-field':
      return m.classroom_control_semantics_publish_instructions_field_description();
    case 'publish-attempt-limit-field':
      return m.classroom_control_semantics_publish_attempt_limit_field_description();
    case 'publish-timer-field':
      return m.classroom_control_semantics_publish_timer_field_description();
    case 'publish-close-time-field':
      return m.classroom_control_semantics_publish_close_time_field_description();
    case 'publish-delivery-toggles':
      return m.classroom_control_semantics_publish_delivery_toggles_description();
    case 'publish-preview-region':
      return m.classroom_control_semantics_publish_preview_region_description();
    case 'result-student-search':
      return m.classroom_control_semantics_result_student_search_description();
    case 'result-student-sort':
      return m.classroom_control_semantics_result_student_sort_description();
    case 'result-item-sort':
      return m.classroom_control_semantics_result_item_sort_description();
    case 'result-answer-review-filter':
      return m.classroom_control_semantics_result_answer_review_filter_description();
    case 'result-review-scope':
      return m.classroom_control_semantics_result_review_scope_description();
    case 'result-copy-scope':
      return m.classroom_control_semantics_result_copy_scope_description();
    case 'result-csv-coverage':
      return m.classroom_control_semantics_result_csv_coverage_description();
    case 'printable-answer-key-toggle':
      return m.classroom_control_semantics_printable_answer_key_toggle_description();
    case 'printable-print-action':
      return m.classroom_control_semantics_printable_print_action_description();
    case 'student-identity-input':
      return m.classroom_control_semantics_student_identity_input_description();
    case 'student-submit-button':
      return m.classroom_control_semantics_student_submit_button_description();
    case 'privacy-guard':
      return m.classroom_control_semantics_privacy_guard_description();
  }
}

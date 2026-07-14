export type ClassroomQueryIndexContractKind =
  | 'index'
  | 'primary-key'
  | 'unique';

export type ClassroomQueryIndexContractItem = {
  columns: readonly string[];
  id: string;
  indexName: string;
  kind: ClassroomQueryIndexContractKind;
  surface: string;
  table:
    | 'activity'
    | 'assignment'
    | 'assignment_snapshot'
    | 'attempt'
    | 'payment'
    | 'user_files';
};

export const CLASSROOM_QUERY_INDEX_CONTRACT = [
  path(
    'activity-owner-list',
    'activity',
    'activity_owner_updated_idx',
    ['owner_id', 'updated_at'],
    'Teacher activity library'
  ),
  path(
    'activity-active-list',
    'activity',
    'activity_owner_updated_idx',
    ['owner_id', 'updated_at'],
    'Active activity library'
  ),
  path(
    'activity-archived-list',
    'activity',
    'activity_owner_visibility_updated_idx',
    ['owner_id', 'visibility', 'updated_at'],
    'Archived activity library'
  ),
  path(
    'activity-template-list',
    'activity',
    'activity_owner_template_updated_idx',
    ['owner_id', 'template_type', 'updated_at'],
    'Template-filtered activity library'
  ),
  path(
    'activity-status-summary',
    'activity',
    'activity_owner_updated_idx',
    ['owner_id', 'updated_at'],
    'Activity status summary'
  ),
  primaryPath(
    'activity-owner-detail',
    'activity',
    'id',
    'Owner activity detail'
  ),
  primaryPath(
    'activity-created-panel',
    'activity',
    'id',
    'Created activity panel'
  ),
  primaryPath(
    'activity-derivative-source',
    'activity',
    'id',
    'Duplicate and remix source'
  ),
  path(
    'assignment-owner-list',
    'assignment',
    'assignment_owner_updated_idx',
    ['owner_id', 'updated_at'],
    'Teacher assignment library'
  ),
  path(
    'assignment-status-list',
    'assignment',
    'assignment_owner_status_updated_idx',
    ['owner_id', 'status', 'updated_at'],
    'Status-filtered assignment library'
  ),
  path(
    'assignment-expiry-list',
    'assignment',
    'assignment_owner_status_expires_updated_idx',
    ['owner_id', 'status', 'expires_at', 'updated_at'],
    'Open and expired assignment filters'
  ),
  uniquePath(
    'assignment-public-share',
    'assignment',
    'assignment_share_slug_unique',
    'share_slug',
    'Public assignment lookup'
  ),
  uniquePath(
    'assignment-owner-share',
    'assignment',
    'assignment_share_slug_unique',
    'share_slug',
    'Published assignment panel'
  ),
  primaryPath(
    'assignment-owner-detail',
    'assignment',
    'id',
    'Owner assignment detail'
  ),
  path(
    'assignment-activity-join',
    'assignment',
    'assignment_activity_id_idx',
    ['activity_id'],
    'Assignment source activity join'
  ),
  primaryPath(
    'assignment-snapshot-join',
    'assignment_snapshot',
    'assignment_id',
    'Frozen assignment snapshot join'
  ),
  primaryPath(
    'assignment-status-transition',
    'assignment',
    'id',
    'Assignment lifecycle transition'
  ),
  path(
    'attempt-result-review',
    'attempt',
    'attempt_assignment_completed_idx',
    ['assignment_id', 'completed_at'],
    'Teacher result review'
  ),
  path(
    'attempt-assignment-summary',
    'attempt',
    'attempt_assignment_id_idx',
    ['assignment_id'],
    'Assignment list attempt summary'
  ),
  path(
    'attempt-named-identity',
    'attempt',
    'attempt_assignment_student_name_idx',
    ['assignment_id', 'student_name'],
    'Named student attempt limit'
  ),
  path(
    'attempt-anonymous-identity',
    'attempt',
    'attempt_assignment_anonymous_token_idx',
    ['assignment_id', 'anonymous_token'],
    'Anonymous student attempt limit'
  ),
  path(
    'attempt-scored-filter',
    'attempt',
    'attempt_assignment_completed_idx',
    ['assignment_id', 'completed_at'],
    'Scored attempt result filter'
  ),
  path(
    'attempt-assignment-page',
    'attempt',
    'attempt_assignment_id_idx',
    ['assignment_id'],
    'Visible assignment page stats'
  ),
  path(
    'attempt-completed-order',
    'attempt',
    'attempt_assignment_completed_idx',
    ['assignment_id', 'completed_at'],
    'Latest submitted attempt order'
  ),
  path(
    'file-owner-list',
    'user_files',
    'user_files_user_created_idx',
    ['user_id', 'created_at'],
    'Teacher source-material library'
  ),
  primaryPath(
    'file-owner-detail',
    'user_files',
    'id',
    'Owner file detail and delete'
  ),
  path(
    'file-storage-proxy',
    'user_files',
    'user_files_r2_key_idx',
    ['r2_key'],
    'Owner-scoped storage proxy'
  ),
  path(
    'payment-current-plan',
    'payment',
    'payment_user_paid_created_idx',
    ['user_id', 'paid', 'created_at'],
    'Current teacher plan'
  ),
  path(
    'payment-session-return',
    'payment',
    'payment_session_id_idx',
    ['session_id'],
    'Hosted checkout return'
  ),
  path(
    'payment-subscription-webhook',
    'payment',
    'payment_subscription_id_idx',
    ['subscription_id'],
    'Subscription webhook update'
  ),
] as const satisfies readonly ClassroomQueryIndexContractItem[];

function path(
  id: string,
  table: ClassroomQueryIndexContractItem['table'],
  indexName: string,
  columns: readonly string[],
  surface: string
): ClassroomQueryIndexContractItem {
  return { columns, id, indexName, kind: 'index', surface, table };
}

function primaryPath(
  id: string,
  table: ClassroomQueryIndexContractItem['table'],
  column: string,
  surface: string
): ClassroomQueryIndexContractItem {
  return {
    columns: [column],
    id,
    indexName: `${table}_${column}_primary_key`,
    kind: 'primary-key',
    surface,
    table,
  };
}

function uniquePath(
  id: string,
  table: ClassroomQueryIndexContractItem['table'],
  indexName: string,
  column: string,
  surface: string
): ClassroomQueryIndexContractItem {
  return {
    columns: [column],
    id,
    indexName,
    kind: 'unique',
    surface,
    table,
  };
}

export type ClassroomQueryExecutionMode =
  | 'barrier'
  | 'conditional-read'
  | 'dependent-read'
  | 'invariant'
  | 'parallel-read'
  | 'post-process'
  | 'precondition';

export type ClassroomQueryExecutionSurface =
  | 'activity-library'
  | 'assignment-library'
  | 'file-library'
  | 'file-material-picker'
  | 'shared';

export const CLASSROOM_QUERY_EXECUTION_CONTRACT = [
  step('activity-owner-where', 'activity-library', 'precondition'),
  step('activity-matching-read', 'activity-library', 'parallel-read'),
  step('activity-summary-read', 'activity-library', 'parallel-read'),
  step('activity-created-read', 'activity-library', 'conditional-read'),
  step('activity-initial-barrier', 'activity-library', 'barrier'),
  step('activity-source-filter', 'activity-library', 'post-process'),
  step('activity-pagination', 'activity-library', 'post-process'),
  step('activity-summary-assembly', 'activity-library', 'post-process'),
  step('assignment-owner-where', 'assignment-library', 'precondition'),
  step('assignment-count-read', 'assignment-library', 'parallel-read'),
  step('assignment-summary-read', 'assignment-library', 'parallel-read'),
  step(
    'assignment-attempt-summary-read',
    'assignment-library',
    'parallel-read'
  ),
  step('assignment-published-read', 'assignment-library', 'conditional-read'),
  step('assignment-page-read', 'assignment-library', 'parallel-read'),
  step('assignment-initial-barrier', 'assignment-library', 'barrier'),
  step('assignment-page-ids', 'assignment-library', 'post-process'),
  step('assignment-page-attempt-read', 'assignment-library', 'dependent-read'),
  step('assignment-page-stats', 'assignment-library', 'post-process'),
  step('assignment-summary-assembly', 'assignment-library', 'post-process'),
  step('assignment-response-assembly', 'assignment-library', 'post-process'),
  step('file-owner-where', 'file-library', 'precondition'),
  step('file-count-read', 'file-library', 'parallel-read'),
  step('file-page-read', 'file-library', 'parallel-read'),
  step('file-summary-read', 'file-library', 'parallel-read'),
  step('file-initial-barrier', 'file-library', 'barrier'),
  step('file-summary-assembly', 'file-library', 'post-process'),
  step('material-count-read', 'file-material-picker', 'parallel-read'),
  step('material-page-read', 'file-material-picker', 'parallel-read'),
  step('material-initial-barrier', 'file-material-picker', 'barrier'),
  step('read-only-privacy-boundary', 'shared', 'invariant'),
] as const;

function step(
  id: string,
  surface: ClassroomQueryExecutionSurface,
  mode: ClassroomQueryExecutionMode
) {
  return { id, mode, surface };
}

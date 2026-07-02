import { formatAssignmentDisplayTitle } from '@/assignments/assignment-display';
import {
  buildAssignmentClassroomBrief,
  type AssignmentClassroomBrief,
} from '@/assignments/classroom-brief';
import {
  buildAssignmentItemReviewSummary,
  type AssignmentItemReviewSummary,
} from '@/assignments/item-review-summary';
import {
  buildAssignmentReteachPlan,
  type AssignmentReteachPlan,
} from '@/assignments/reteach-plan';
import {
  countAssignmentResultCopyLines,
  joinAssignmentResultCopyLines,
} from '@/assignments/result-copy-format';
import {
  buildAssignmentResultsCsv,
  buildAssignmentResultsCsvDataUrl,
  buildAssignmentResultsCsvFilename,
  type AssignmentResultsExportData,
} from '@/assignments/results-export';
import type {
  AssignmentItemAnalysis,
  AssignmentResultsAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { formatAssignmentResultNumber } from '@/assignments/result-format';
import {
  buildAssignmentStudentFollowUpSummary,
  type AssignmentStudentFollowUpSummary,
} from '@/assignments/student-follow-up-summary';
import { m } from '@/locale/paraglide/messages';

export type AssignmentResultAction =
  | 'copy-brief'
  | 'copy-follow-up'
  | 'copy-item-review'
  | 'copy-reteach-plan'
  | 'export-csv';

export type AssignmentResultCopyAction = Exclude<
  AssignmentResultAction,
  'export-csv'
>;

export type AssignmentResultActionDataScope =
  | 'current-review'
  | 'full-assignment-results';

export type AssignmentResultActionButtonId =
  `${AssignmentResultAction}:${AssignmentResultActionDataScope}`;

export type AssignmentResultActionScopeView = {
  ariaLabel: string;
  dataScope: AssignmentResultActionDataScope;
  description: string;
  label: string;
  value: string;
};

export type AssignmentResultActionBlockedReason =
  | 'brief-not-ready'
  | 'missing-attempts'
  | 'missing-items'
  | 'missing-students';

export type AssignmentResultActionStatusTone = 'blocked' | 'ready';

export type AssignmentResultActionStatusView = {
  ariaLabel: string;
  description: string;
  label: string;
  tone: AssignmentResultActionStatusTone;
  value: string;
};

export type AssignmentResultActionGate =
  | {
      type: 'ready';
    }
  | {
      message: string;
      reason: AssignmentResultActionBlockedReason;
      type: 'blocked';
    };

type AssignmentResultActionCopy = {
  description: string;
  failureMessage: string;
  label: string;
  successMessage: string;
};

export type AssignmentResultActionDescriptor =
  | {
      action: AssignmentResultCopyAction;
      dataScope: Extract<AssignmentResultActionDataScope, 'current-review'>;
      kind: 'copy-text';
    }
  | {
      action: 'export-csv';
      dataScope: Extract<
        AssignmentResultActionDataScope,
        'full-assignment-results'
      >;
      kind: 'download-csv';
    };

export type AssignmentResultActionButton =
  | {
      action: AssignmentResultCopyAction;
      ariaLabel: string;
      dataScope: Extract<AssignmentResultActionDataScope, 'current-review'>;
      description: string;
      disabled: boolean;
      disabledReason?: string;
      failureMessage: string;
      gate: AssignmentResultActionGate;
      id: AssignmentResultActionButtonId;
      kind: 'copy-text';
      label: string;
      scopeView: AssignmentResultActionScopeView;
      statusView: AssignmentResultActionStatusView;
      successMessage: string;
    }
  | {
      action: 'export-csv';
      ariaLabel: string;
      dataScope: Extract<
        AssignmentResultActionDataScope,
        'full-assignment-results'
      >;
      description: string;
      disabled: boolean;
      disabledReason?: string;
      failureMessage: string;
      gate: AssignmentResultActionGate;
      id: AssignmentResultActionButtonId;
      kind: 'download-csv';
      label: string;
      scopeView: AssignmentResultActionScopeView;
      statusView: AssignmentResultActionStatusView;
      successMessage: string;
    };

export type AssignmentResultActionPayload =
  | {
      kind: 'copy-text';
      text: string;
    }
  | {
      csv: string;
      filename: string;
      kind: 'download-csv';
    };

export type AssignmentResultActionExecutionPlan =
  | {
      dataScope: AssignmentResultActionDataScope;
      failureMessage: string;
      message: string;
      reason: AssignmentResultActionBlockedReason | 'missing-data';
      type: 'blocked';
    }
  | {
      dataScope: AssignmentResultActionDataScope;
      failureMessage: string;
      successMessage: string;
      text: string;
      type: 'copy-text';
    }
  | {
      dataScope: AssignmentResultActionDataScope;
      failureMessage: string;
      filename: string;
      successMessage: string;
      type: 'download-csv';
      url: string;
    };

type AssignmentResultActionButtonBase = {
  ariaLabel: string;
  description: string;
  disabled: boolean;
  disabledReason?: string;
  failureMessage: string;
  gate: AssignmentResultActionGate;
  label: string;
  scopeView: AssignmentResultActionScopeView;
  statusView: AssignmentResultActionStatusView;
  successMessage: string;
};

export type AssignmentResultActionState = {
  attemptCount: number;
  classroomBriefReady: boolean;
  itemCount: number;
  studentCount: number;
};

type AssignmentResultActionStats = {
  averageDurationSeconds: number | null | undefined;
  averagePoints: number;
  averageScore: number;
  completions: number;
};

export type AssignmentResultActionData = AssignmentResultsExportData;

export type AssignmentResultCopyActionAnalysis = AssignmentResultsAnalysis & {
  perItem: AssignmentItemAnalysis[];
  students: AssignmentStudentSummary[];
};

export type AssignmentResultCopyActionData = AssignmentResultActionData & {
  analysis: AssignmentResultCopyActionAnalysis;
  copyScopeView?: AssignmentResultCopyArtifactPreviewScope;
};

export type AssignmentResultActionDataSet = {
  copyActionData: AssignmentResultCopyActionData | null;
  exportActionData: AssignmentResultActionData | null;
  scope: {
    copyActionData: Extract<AssignmentResultActionDataScope, 'current-review'>;
    exportActionData: Extract<
      AssignmentResultActionDataScope,
      'full-assignment-results'
    >;
  };
};

type AssignmentResultActionDataSetInput = Pick<
  AssignmentResultActionDataSet,
  'copyActionData' | 'exportActionData'
>;

type AssignmentResultCopyArtifactData = {
  analysis: Pick<
    AssignmentResultsAnalysis,
    'attempts' | 'perItem' | 'students'
  >;
  assignment: {
    title: string;
  };
  copyScopeView?: AssignmentResultCopyArtifactPreviewScope;
  stats: AssignmentResultActionStats;
};

export type AssignmentResultCopyArtifacts = {
  classroomBrief: AssignmentClassroomBrief;
  reteachPlan: AssignmentReteachPlan;
  itemReviewSummary: AssignmentItemReviewSummary;
  studentFollowUpSummary: AssignmentStudentFollowUpSummary;
};

export type AssignmentResultCopyArtifactPreview = {
  action: AssignmentResultCopyAction;
  actionButtonId: AssignmentResultActionButtonId;
  copyScopeView: AssignmentResultCopyArtifactPreviewScope;
  dataScope: Extract<AssignmentResultActionDataScope, 'current-review'>;
  description: string;
  id: AssignmentResultCopyArtifactPreviewId;
  label: string;
  metaItems: AssignmentResultCopyArtifactPreviewMetaItem[];
  summaryLabel: string;
  text: string;
};

export type AssignmentResultCopyArtifactPreviewId =
  `preview:${AssignmentResultCopyAction}`;

export type AssignmentResultCopyArtifactPreviewScopeItemId =
  | 'items'
  | 'review'
  | 'students';

export type AssignmentResultCopyArtifactPreviewScopeItem = {
  description: string;
  id: AssignmentResultCopyArtifactPreviewScopeItemId;
  label: string;
  value: string;
};

export type AssignmentResultCopyArtifactPreviewScopeSummaryItemId =
  | 'answer-reviews'
  | 'attempts'
  | 'items'
  | 'students';

export type AssignmentResultCopyArtifactPreviewScopeSummaryItem = {
  ariaLabel: string;
  description: string;
  id: AssignmentResultCopyArtifactPreviewScopeSummaryItemId;
  label: string;
  value: string;
};

export type AssignmentResultCopyArtifactPreviewScope = {
  description: string;
  itemViews: AssignmentResultCopyArtifactPreviewScopeItem[];
  summaryItems: AssignmentResultCopyArtifactPreviewScopeSummaryItem[];
  title: string;
};

export type AssignmentResultCopyArtifactPreviewMetaItem = {
  key: AssignmentResultCopyArtifactPreviewMetaKey;
  label: string;
  value: string;
};

export type AssignmentResultCopyArtifactPreviewMetaKey =
  | 'focus-items'
  | 'follow-up-students'
  | 'latest-attempt-times'
  | 'latest-attempts'
  | 'lines'
  | 'next-steps'
  | 'review-items'
  | 'review-needed-students'
  | 'student-last-submitted'
  | 'students';

export const assignmentResultActionDescriptors = [
  {
    action: 'copy-brief',
    dataScope: 'current-review',
    kind: 'copy-text',
  },
  {
    action: 'copy-reteach-plan',
    dataScope: 'current-review',
    kind: 'copy-text',
  },
  {
    action: 'copy-item-review',
    dataScope: 'current-review',
    kind: 'copy-text',
  },
  {
    action: 'copy-follow-up',
    dataScope: 'current-review',
    kind: 'copy-text',
  },
  {
    action: 'export-csv',
    dataScope: 'full-assignment-results',
    kind: 'download-csv',
  },
] satisfies AssignmentResultActionDescriptor[];

export const assignmentResultActionOrder =
  assignmentResultActionDescriptors.map((descriptor) => descriptor.action);

export function buildAssignmentResultActionState({
  attemptCount,
  classroomBriefReady = false,
  itemCount,
  studentCount,
}: {
  attemptCount: number;
  classroomBriefReady?: boolean;
  itemCount: number;
  studentCount: number;
}): AssignmentResultActionState {
  return {
    attemptCount: normalizeAssignmentResultActionCount(attemptCount),
    classroomBriefReady,
    itemCount: normalizeAssignmentResultActionCount(itemCount),
    studentCount: normalizeAssignmentResultActionCount(studentCount),
  };
}

export function buildAssignmentResultActionButtons({
  attemptCount,
  classroomBriefReady,
  itemCount,
  studentCount,
}: AssignmentResultActionState): AssignmentResultActionButton[] {
  return assignmentResultActionDescriptors.map((descriptor) => {
    const gate = getAssignmentResultActionGate({
      action: descriptor.action,
      attemptCount,
      classroomBriefReady,
      itemCount,
      studentCount,
    });
    const actionCopy = getAssignmentResultActionCopy(descriptor.action);
    const disabledReason = getAssignmentResultActionDisabledReason(gate);
    const scopeView = buildAssignmentResultActionScopeView(
      descriptor.dataScope
    );
    const statusView = buildAssignmentResultActionStatusView(gate);
    const base = {
      ariaLabel: m.assignment_result_action_button_aria({
        description: actionCopy.description,
        label: actionCopy.label,
        scope: scopeView.ariaLabel,
        status: statusView.ariaLabel,
      }),
      description: actionCopy.description,
      disabled: Boolean(disabledReason),
      ...(disabledReason ? { disabledReason } : {}),
      failureMessage: actionCopy.failureMessage,
      gate,
      label: actionCopy.label,
      scopeView,
      statusView,
      successMessage: actionCopy.successMessage,
    } satisfies AssignmentResultActionButtonBase;
    const id = getAssignmentResultActionButtonId(descriptor);

    if (descriptor.kind === 'download-csv') {
      return {
        ...base,
        action: descriptor.action,
        dataScope: descriptor.dataScope,
        id,
        kind: 'download-csv',
      };
    }

    return {
      ...base,
      action: descriptor.action,
      dataScope: descriptor.dataScope,
      id,
      kind: 'copy-text',
    };
  });
}

export function getAssignmentResultActionButtonId({
  action,
  dataScope,
}: Pick<
  AssignmentResultActionDescriptor,
  'action' | 'dataScope'
>): AssignmentResultActionButtonId {
  return `${action}:${dataScope}`;
}

export function getAssignmentResultActionGateFromState({
  action,
  state,
}: {
  action: AssignmentResultAction;
  state: AssignmentResultActionState;
}): AssignmentResultActionGate {
  return getAssignmentResultActionGate({
    action,
    attemptCount: state.attemptCount,
    classroomBriefReady: state.classroomBriefReady,
    itemCount: state.itemCount,
    studentCount: state.studentCount,
  });
}

export function getAssignmentResultActionDisabledReason(
  gate: AssignmentResultActionGate
) {
  return gate.type === 'blocked' ? gate.message : undefined;
}

export function buildAssignmentResultActionScopeView(
  dataScope: AssignmentResultActionDataScope
): AssignmentResultActionScopeView {
  const label = m.assignment_result_action_scope_label();
  const value =
    dataScope === 'current-review'
      ? m.assignment_result_action_scope_current_review_value()
      : m.assignment_result_action_scope_full_assignment_value();
  const description =
    dataScope === 'current-review'
      ? m.assignment_result_action_scope_current_review_description()
      : m.assignment_result_action_scope_full_assignment_description();

  return {
    ariaLabel: m.assignment_result_action_scope_aria_label({
      description,
      label,
      value,
    }),
    dataScope,
    description,
    label,
    value,
  };
}

export function buildAssignmentResultActionStatusView(
  gate: AssignmentResultActionGate
): AssignmentResultActionStatusView {
  const label = m.assignment_result_action_status_label();

  if (gate.type === 'blocked') {
    const value = m.assignment_result_action_status_blocked_value();
    const description = m.assignment_result_action_status_blocked_description({
      reason: gate.message,
    });

    return {
      ariaLabel: m.assignment_result_action_status_aria_label({
        description,
        label,
        value,
      }),
      description,
      label,
      tone: 'blocked',
      value,
    };
  }

  const value = m.assignment_result_action_status_ready_value();
  const description = m.assignment_result_action_status_ready_description();

  return {
    ariaLabel: m.assignment_result_action_status_aria_label({
      description,
      label,
      value,
    }),
    description,
    label,
    tone: 'ready',
    value,
  };
}

export function buildAssignmentResultCopyArtifacts(
  data: AssignmentResultCopyArtifactData
): AssignmentResultCopyArtifacts {
  const assignmentTitle = formatAssignmentDisplayTitle(data.assignment.title);
  const items = data.analysis.perItem;
  const students = data.analysis.students;
  const copyScopeView =
    'copyScopeView' in data ? data.copyScopeView : undefined;
  const artifacts = {
    classroomBrief: buildAssignmentClassroomBrief({
      assignmentTitle,
      attempts: data.analysis.attempts,
      items,
      stats: buildAssignmentResultClassroomBriefStats(data.stats),
      students,
    }),
    reteachPlan: buildAssignmentReteachPlan({
      assignmentTitle,
      attempts: data.analysis.attempts,
      items,
      students,
    }),
    itemReviewSummary: buildAssignmentItemReviewSummary({
      assignmentTitle,
      items,
    }),
    studentFollowUpSummary: buildAssignmentStudentFollowUpSummary({
      assignmentTitle,
      attempts: data.analysis.attempts,
      students,
    }),
  };

  return copyScopeView
    ? appendAssignmentResultCopyScopeToArtifacts({
        artifacts,
        copyScopeView,
      })
    : artifacts;
}

export function buildAssignmentResultCopyActionData({
  attempts,
  copyScopeView,
  data,
  items,
  students,
}: {
  attempts?: AssignmentAttemptReview[];
  copyScopeView?: AssignmentResultCopyArtifactPreviewScope;
  data: AssignmentResultActionData;
  items: AssignmentItemAnalysis[];
  students: AssignmentStudentSummary[];
}): AssignmentResultCopyActionData {
  return {
    ...data,
    analysis: {
      ...data.analysis,
      attempts: attempts ?? data.analysis.attempts,
      perItem: items,
      students,
    },
    ...(copyScopeView ? { copyScopeView } : {}),
  };
}

export function buildAssignmentResultActionDataSet({
  copyActionData,
  exportActionData,
}: AssignmentResultActionDataSetInput): AssignmentResultActionDataSet {
  return {
    copyActionData,
    exportActionData,
    scope: {
      copyActionData: 'current-review',
      exportActionData: 'full-assignment-results',
    },
  };
}

export function getAssignmentResultActionExecutionData({
  actionButton,
  dataSet,
}: {
  actionButton: AssignmentResultActionButton;
  dataSet: AssignmentResultActionDataSet | null | undefined;
}) {
  if (!dataSet) return null;

  return actionButton.kind === 'copy-text'
    ? dataSet.copyActionData
    : dataSet.exportActionData;
}

export function getAssignmentResultActionExecutionDataScope({
  actionButton,
  dataSet,
}: {
  actionButton: AssignmentResultActionButton;
  dataSet: AssignmentResultActionDataSet | null | undefined;
}): AssignmentResultActionDataScope {
  if (!dataSet) {
    return (
      actionButton.dataScope ??
      getAssignmentResultActionDataScope(actionButton.action)
    );
  }

  return actionButton.kind === 'copy-text'
    ? dataSet.scope.copyActionData
    : dataSet.scope.exportActionData;
}

export function getAssignmentResultActionDataScope(
  action: AssignmentResultAction
): AssignmentResultActionDataScope {
  return action === 'export-csv' ? 'full-assignment-results' : 'current-review';
}

export function getAssignmentResultCopyArtifactText({
  action,
  artifacts,
}: {
  action: AssignmentResultCopyAction;
  artifacts: AssignmentResultCopyArtifacts;
}) {
  if (action === 'copy-brief') {
    return artifacts.classroomBrief.text;
  }

  if (action === 'copy-reteach-plan') {
    return artifacts.reteachPlan.text;
  }

  if (action === 'copy-item-review') {
    return artifacts.itemReviewSummary.text;
  }

  return artifacts.studentFollowUpSummary.text;
}

export function buildAssignmentResultCopyArtifactPreviews({
  artifacts,
  copyScopeView,
}: {
  artifacts: AssignmentResultCopyArtifacts;
  copyScopeView: AssignmentResultCopyArtifactPreviewScope;
}): AssignmentResultCopyArtifactPreview[] {
  return assignmentResultActionDescriptors.flatMap((descriptor) => {
    if (descriptor.kind !== 'copy-text') return [];

    const actionCopy = getAssignmentResultActionCopy(descriptor.action);

    return [
      {
        action: descriptor.action,
        actionButtonId: getAssignmentResultActionButtonId(descriptor),
        copyScopeView:
          buildAssignmentResultCopyArtifactPreviewScope(copyScopeView),
        dataScope: descriptor.dataScope,
        description: actionCopy.description,
        id: getAssignmentResultCopyArtifactPreviewId(descriptor.action),
        label: actionCopy.label,
        metaItems: buildAssignmentResultCopyArtifactPreviewMetaItems({
          action: descriptor.action,
          artifacts,
        }),
        summaryLabel: getAssignmentResultCopyArtifactPreviewSummary({
          action: descriptor.action,
          artifacts,
        }),
        text: getAssignmentResultCopyArtifactText({
          action: descriptor.action,
          artifacts,
        }),
      },
    ];
  });
}

function buildAssignmentResultCopyArtifactPreviewScope(
  copyScopeView: AssignmentResultCopyArtifactPreviewScope
): AssignmentResultCopyArtifactPreviewScope {
  return {
    description: copyScopeView.description,
    itemViews: copyScopeView.itemViews.map((itemView) => ({
      description: itemView.description,
      id: itemView.id,
      label: itemView.label,
      value: itemView.value,
    })),
    summaryItems: copyScopeView.summaryItems.map((summaryItem) => ({
      ariaLabel: summaryItem.ariaLabel,
      description: summaryItem.description,
      id: summaryItem.id,
      label: summaryItem.label,
      value: summaryItem.value,
    })),
    title: copyScopeView.title,
  };
}

function appendAssignmentResultCopyScopeToArtifacts({
  artifacts,
  copyScopeView,
}: {
  artifacts: AssignmentResultCopyArtifacts;
  copyScopeView: AssignmentResultCopyArtifactPreviewScope;
}): AssignmentResultCopyArtifacts {
  const classroomBriefText = appendAssignmentResultCopyScopeText({
    copyScopeView,
    text: artifacts.classroomBrief.text,
  });

  return {
    classroomBrief: {
      ...artifacts.classroomBrief,
      copyPreview: {
        ...artifacts.classroomBrief.copyPreview,
        text: classroomBriefText,
      },
      text: classroomBriefText,
    },
    itemReviewSummary: {
      ...artifacts.itemReviewSummary,
      text: appendAssignmentResultCopyScopeText({
        copyScopeView,
        text: artifacts.itemReviewSummary.text,
      }),
    },
    reteachPlan: {
      ...artifacts.reteachPlan,
      text: appendAssignmentResultCopyScopeText({
        copyScopeView,
        text: artifacts.reteachPlan.text,
      }),
    },
    studentFollowUpSummary: {
      ...artifacts.studentFollowUpSummary,
      text: appendAssignmentResultCopyScopeText({
        copyScopeView,
        text: artifacts.studentFollowUpSummary.text,
      }),
    },
  };
}

function appendAssignmentResultCopyScopeText({
  copyScopeView,
  text,
}: {
  copyScopeView: AssignmentResultCopyArtifactPreviewScope;
  text: string;
}) {
  const scopeLines = buildAssignmentResultCopyScopeTextLines(copyScopeView);
  if (scopeLines.length === 0) return text;

  return joinAssignmentResultCopyLines([
    ...text.split(/\r?\n/),
    '',
    ...scopeLines,
  ]);
}

function buildAssignmentResultCopyScopeTextLines(
  copyScopeView: AssignmentResultCopyArtifactPreviewScope
) {
  return [
    m.assignment_result_copy_scope_text_heading(),
    copyScopeView.description,
    ...copyScopeView.itemViews.map((itemView) =>
      m.assignment_result_copy_scope_text_line({
        description: itemView.description,
        label: itemView.label,
        value: itemView.value,
      })
    ),
    ...(copyScopeView.summaryItems.length > 0
      ? [
          '',
          m.assignment_result_copy_scope_text_summary_heading(),
          ...copyScopeView.summaryItems.map((summaryItem) =>
            m.assignment_result_copy_scope_text_summary_line({
              label: summaryItem.label,
              value: summaryItem.value,
            })
          ),
        ]
      : []),
  ];
}

export function getAssignmentResultCopyArtifactPreviewId(
  action: AssignmentResultCopyAction
): AssignmentResultCopyArtifactPreviewId {
  return `preview:${action}`;
}

export function getAssignmentResultCopyArtifactPreviewSummary({
  action,
  artifacts,
}: {
  action: AssignmentResultCopyAction;
  artifacts: AssignmentResultCopyArtifacts;
}) {
  if (action === 'copy-brief') {
    return m.assignment_result_copy_preview_summary_brief({
      focusItems: formatAssignmentResultNumber(
        artifacts.classroomBrief.focusItems.length,
        { min: 0 }
      ),
      students: formatAssignmentResultNumber(
        artifacts.classroomBrief.followUpStudents.length,
        { min: 0 }
      ),
    });
  }

  if (action === 'copy-reteach-plan') {
    return m.assignment_result_copy_preview_summary_reteach({
      items: formatAssignmentResultNumber(
        artifacts.reteachPlan.reviewItems.length,
        { min: 0 }
      ),
      students: formatAssignmentResultNumber(
        artifacts.reteachPlan.reviewStudents.length,
        { min: 0 }
      ),
    });
  }

  if (action === 'copy-item-review') {
    return m.assignment_result_copy_preview_summary_item_review({
      items: formatAssignmentResultNumber(
        artifacts.itemReviewSummary.items.length,
        { min: 0 }
      ),
    });
  }

  return m.assignment_result_copy_preview_summary_follow_up({
    students: formatAssignmentResultNumber(
      artifacts.studentFollowUpSummary.students.length,
      { min: 0 }
    ),
  });
}

export function buildAssignmentResultCopyArtifactPreviewMetaItems({
  action,
  artifacts,
}: {
  action: AssignmentResultCopyAction;
  artifacts: AssignmentResultCopyArtifacts;
}): AssignmentResultCopyArtifactPreviewMetaItem[] {
  const text = getAssignmentResultCopyArtifactText({ action, artifacts });
  const lineCount = countAssignmentResultCopyLines(text);

  if (action === 'copy-brief') {
    return [
      buildAssignmentResultCopyArtifactPreviewMetaItem({
        key: 'focus-items',
        label: m.assignment_result_copy_preview_meta_focus_items(),
        value: artifacts.classroomBrief.focusItems.length,
      }),
      buildAssignmentResultCopyArtifactPreviewMetaItem({
        key: 'follow-up-students',
        label: m.assignment_result_copy_preview_meta_follow_up_students(),
        value: artifacts.classroomBrief.followUpStudents.length,
      }),
      buildAssignmentResultCopyArtifactPreviewMetaItem({
        key: 'next-steps',
        label: m.assignment_result_copy_preview_meta_next_steps(),
        value: artifacts.classroomBrief.followUpStudentViews.length,
      }),
      ...buildAssignmentResultCopyArtifactStudentAttemptMetaItems(
        artifacts.classroomBrief.followUpStudentViews
      ),
      buildAssignmentResultCopyArtifactPreviewMetaItem({
        key: 'lines',
        label: m.assignment_result_copy_preview_meta_lines(),
        value: lineCount,
      }),
    ];
  }

  if (action === 'copy-reteach-plan') {
    return [
      buildAssignmentResultCopyArtifactPreviewMetaItem({
        key: 'review-items',
        label: m.assignment_result_copy_preview_meta_review_items(),
        value: artifacts.reteachPlan.reviewItems.length,
      }),
      buildAssignmentResultCopyArtifactPreviewMetaItem({
        key: 'follow-up-students',
        label: m.assignment_result_copy_preview_meta_follow_up_students(),
        value: artifacts.reteachPlan.reviewStudents.length,
      }),
      buildAssignmentResultCopyArtifactPreviewMetaItem({
        key: 'next-steps',
        label: m.assignment_result_copy_preview_meta_next_steps(),
        value: artifacts.reteachPlan.studentViews.length,
      }),
      ...buildAssignmentResultCopyArtifactStudentAttemptMetaItems(
        artifacts.reteachPlan.studentViews
      ),
      buildAssignmentResultCopyArtifactPreviewMetaItem({
        key: 'lines',
        label: m.assignment_result_copy_preview_meta_lines(),
        value: lineCount,
      }),
    ];
  }

  if (action === 'copy-item-review') {
    return [
      buildAssignmentResultCopyArtifactPreviewMetaItem({
        key: 'review-items',
        label: m.assignment_result_copy_preview_meta_review_items(),
        value: artifacts.itemReviewSummary.items.length,
      }),
      buildAssignmentResultCopyArtifactPreviewMetaItem({
        key: 'lines',
        label: m.assignment_result_copy_preview_meta_lines(),
        value: lineCount,
      }),
    ];
  }

  return [
    ...artifacts.studentFollowUpSummary.coverageViews.flatMap(
      (coverageView) => {
        const key = getAssignmentResultCopyArtifactPreviewCoverageMetaKey(
          coverageView.id
        );
        if (!key) return [];

        return [
          {
            key,
            label: coverageView.label,
            value: coverageView.value,
          },
        ];
      }
    ),
    buildAssignmentResultCopyArtifactPreviewMetaItem({
      key: 'next-steps',
      label: m.assignment_result_copy_preview_meta_next_steps(),
      value: artifacts.studentFollowUpSummary.studentViews.length,
    }),
    ...buildAssignmentResultCopyArtifactStudentAttemptMetaItems(
      artifacts.studentFollowUpSummary.studentViews
    ),
    buildAssignmentResultCopyArtifactPreviewMetaItem({
      key: 'lines',
      label: m.assignment_result_copy_preview_meta_lines(),
      value: lineCount,
    }),
  ];
}

function buildAssignmentResultCopyArtifactPreviewMetaItem({
  key,
  label,
  value,
}: {
  key: AssignmentResultCopyArtifactPreviewMetaKey;
  label: string;
  value: number;
}): AssignmentResultCopyArtifactPreviewMetaItem {
  return {
    key,
    label,
    value: formatAssignmentResultNumber(value, { min: 0 }),
  };
}

function getAssignmentResultCopyArtifactPreviewCoverageMetaKey(
  id: string
): Extract<
  AssignmentResultCopyArtifactPreviewMetaKey,
  'review-needed-students' | 'students'
> | null {
  return id === 'students' || id === 'review-needed-students' ? id : null;
}

function buildAssignmentResultCopyArtifactStudentAttemptMetaItems(
  studentViews: Array<{
    lastSubmittedLabel: string | null;
    latestAttemptCompletedAtLabel: string | null;
    latestAttemptSummaryLabel: string | null;
  }>
) {
  return [
    buildAssignmentResultCopyArtifactPreviewMetaItem({
      key: 'latest-attempts',
      label: m.assignment_result_copy_preview_meta_latest_attempts(),
      value: countAssignmentResultCopyLatestAttemptViews(studentViews),
    }),
    buildAssignmentResultCopyArtifactPreviewMetaItem({
      key: 'latest-attempt-times',
      label: m.assignment_result_copy_preview_meta_latest_attempt_times(),
      value: countAssignmentResultCopyLatestAttemptTimeViews(studentViews),
    }),
    buildAssignmentResultCopyArtifactPreviewMetaItem({
      key: 'student-last-submitted',
      label: m.assignment_result_copy_preview_meta_student_last_submitted(),
      value: countAssignmentResultCopyStudentLastSubmittedViews(studentViews),
    }),
  ];
}

function countAssignmentResultCopyLatestAttemptViews(
  studentViews: Array<{ latestAttemptSummaryLabel: string | null }>
) {
  return studentViews.filter((studentView) =>
    Boolean(studentView.latestAttemptSummaryLabel)
  ).length;
}

function countAssignmentResultCopyLatestAttemptTimeViews(
  studentViews: Array<{ latestAttemptCompletedAtLabel: string | null }>
) {
  return studentViews.filter((studentView) =>
    Boolean(studentView.latestAttemptCompletedAtLabel)
  ).length;
}

function countAssignmentResultCopyStudentLastSubmittedViews(
  studentViews: Array<{ lastSubmittedLabel: string | null }>
) {
  return studentViews.filter((studentView) =>
    Boolean(studentView.lastSubmittedLabel)
  ).length;
}

export function buildAssignmentResultCopyText({
  action,
  data,
}: {
  action: AssignmentResultCopyAction;
  data: AssignmentResultActionData;
}) {
  return getAssignmentResultCopyArtifactText({
    action,
    artifacts: buildAssignmentResultCopyArtifacts(data),
  });
}

export function buildAssignmentResultActionPayload({
  actionButton,
  data,
}: {
  actionButton: AssignmentResultActionButton;
  data: AssignmentResultActionData;
}): AssignmentResultActionPayload {
  if (actionButton.gate.type === 'blocked') {
    throw new Error(actionButton.gate.message);
  }

  if (actionButton.kind === 'download-csv') {
    return {
      csv: buildAssignmentResultsCsv(data),
      filename: buildAssignmentResultsCsvFilename(data),
      kind: 'download-csv',
    };
  }

  const artifacts = buildAssignmentResultCopyArtifacts(data);

  return {
    kind: 'copy-text',
    text: getAssignmentResultCopyArtifactText({
      action: actionButton.action,
      artifacts,
    }),
  };
}

export function buildAssignmentResultActionExecutionPlan({
  actionButton,
  data,
  dataSet,
}: {
  actionButton: AssignmentResultActionButton;
  data?: AssignmentResultActionData | null;
  dataSet?: AssignmentResultActionDataSet | null;
}): AssignmentResultActionExecutionPlan {
  const dataScope = getAssignmentResultActionExecutionDataScope({
    actionButton,
    dataSet,
  });

  if (actionButton.gate.type === 'blocked') {
    return {
      dataScope,
      failureMessage: actionButton.failureMessage,
      message: actionButton.gate.message,
      reason: actionButton.gate.reason,
      type: 'blocked',
    };
  }

  const executionData =
    dataSet === undefined
      ? (data ?? null)
      : getAssignmentResultActionExecutionData({ actionButton, dataSet });

  if (!executionData) {
    return {
      dataScope,
      failureMessage: actionButton.failureMessage,
      message: actionButton.failureMessage,
      reason: 'missing-data',
      type: 'blocked',
    };
  }

  const payload = buildAssignmentResultActionPayload({
    actionButton,
    data: executionData,
  });

  if (payload.kind === 'download-csv') {
    return {
      dataScope,
      failureMessage: actionButton.failureMessage,
      filename: payload.filename,
      successMessage: actionButton.successMessage,
      type: 'download-csv',
      url: buildAssignmentResultsCsvDataUrl(payload.csv),
    };
  }

  return {
    dataScope,
    failureMessage: actionButton.failureMessage,
    successMessage: actionButton.successMessage,
    text: payload.text,
    type: 'copy-text',
  };
}

export function getAssignmentResultActionGate({
  action,
  attemptCount,
  classroomBriefReady = false,
  itemCount,
  studentCount,
}: {
  action: AssignmentResultAction;
  attemptCount: number;
  classroomBriefReady?: boolean;
  itemCount: number;
  studentCount: number;
}): AssignmentResultActionGate {
  const normalizedAttemptCount =
    normalizeAssignmentResultActionCount(attemptCount);
  const normalizedItemCount = normalizeAssignmentResultActionCount(itemCount);
  const normalizedStudentCount =
    normalizeAssignmentResultActionCount(studentCount);

  if (action === 'copy-item-review') {
    return normalizedItemCount > 0
      ? { type: 'ready' }
      : buildBlockedAssignmentResultActionGate({
          message: m.assignment_result_action_gate_add_items_item_review(),
          reason: 'missing-items',
        });
  }

  if (action === 'copy-follow-up') {
    return normalizedStudentCount > 0
      ? { type: 'ready' }
      : buildBlockedAssignmentResultActionGate({
          message: m.assignment_result_action_gate_submit_attempt_follow_up(),
          reason: 'missing-students',
        });
  }

  if (action === 'copy-brief' && !classroomBriefReady) {
    return buildBlockedAssignmentResultActionGate({
      message: m.assignment_result_action_gate_submit_attempt_brief(),
      reason: 'brief-not-ready',
    });
  }

  if (normalizedAttemptCount > 0) return { type: 'ready' };

  return buildBlockedAssignmentResultActionGate({
    message: getNoAttemptResultActionMessage(action),
    reason: 'missing-attempts',
  });
}

export function getAssignmentResultActionCopy(
  action: AssignmentResultAction
): AssignmentResultActionCopy {
  switch (action) {
    case 'copy-brief':
      return {
        description: m.assignment_result_action_copy_brief_description(),
        failureMessage: m.assignment_result_action_copy_brief_failure(),
        label: m.assignment_result_action_copy_brief_label(),
        successMessage: m.assignment_result_action_copy_brief_success(),
      };
    case 'copy-follow-up':
      return {
        description: m.assignment_result_action_copy_follow_up_description(),
        failureMessage: m.assignment_result_action_copy_follow_up_failure(),
        label: m.assignment_result_action_copy_follow_up_label(),
        successMessage: m.assignment_result_action_copy_follow_up_success(),
      };
    case 'copy-item-review':
      return {
        description: m.assignment_result_action_copy_item_review_description(),
        failureMessage: m.assignment_result_action_copy_item_review_failure(),
        label: m.assignment_result_action_copy_item_review_label(),
        successMessage: m.assignment_result_action_copy_item_review_success(),
      };
    case 'copy-reteach-plan':
      return {
        description: m.assignment_result_action_copy_reteach_plan_description(),
        failureMessage: m.assignment_result_action_copy_reteach_plan_failure(),
        label: m.assignment_result_action_copy_reteach_plan_label(),
        successMessage: m.assignment_result_action_copy_reteach_plan_success(),
      };
    case 'export-csv':
      return {
        description: m.assignment_result_action_export_csv_description(),
        failureMessage: m.assignment_result_action_export_csv_failure(),
        label: m.assignment_result_action_export_csv_label(),
        successMessage: m.assignment_result_action_export_csv_success(),
      };
  }
}

export function buildAssignmentResultClassroomBriefStats({
  averageDurationSeconds,
  averagePoints,
  averageScore,
  completions,
}: AssignmentResultActionStats) {
  return {
    averageDurationSeconds: averageDurationSeconds ?? null,
    averagePoints,
    averageScore,
    completions,
  };
}

function getNoAttemptResultActionMessage(action: AssignmentResultAction) {
  if (action === 'export-csv') {
    return m.assignment_result_action_gate_submit_attempt_export();
  }

  if (action === 'copy-reteach-plan') {
    return m.assignment_result_action_gate_submit_attempt_reteach();
  }

  return m.assignment_result_action_gate_submit_attempt_brief();
}

function buildBlockedAssignmentResultActionGate({
  message,
  reason,
}: {
  message: string;
  reason: AssignmentResultActionBlockedReason;
}): AssignmentResultActionGate {
  return {
    message,
    reason,
    type: 'blocked',
  };
}

function normalizeAssignmentResultActionCount(value: number) {
  if (!Number.isFinite(value)) return 0;

  return Math.max(0, Math.floor(value));
}

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
import { countAssignmentResultCopyLines } from '@/assignments/result-copy-format';
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

export type AssignmentResultActionGate =
  | {
      type: 'ready';
    }
  | {
      message: string;
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
      kind: 'copy-text';
    }
  | {
      action: 'export-csv';
      kind: 'download-csv';
    };

export type AssignmentResultActionButton =
  | {
      action: AssignmentResultCopyAction;
      description: string;
      disabled: boolean;
      disabledReason?: string;
      failureMessage: string;
      gate: AssignmentResultActionGate;
      kind: 'copy-text';
      label: string;
      successMessage: string;
    }
  | {
      action: 'export-csv';
      description: string;
      disabled: boolean;
      disabledReason?: string;
      failureMessage: string;
      gate: AssignmentResultActionGate;
      kind: 'download-csv';
      label: string;
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
      failureMessage: string;
      message: string;
      type: 'blocked';
    }
  | {
      failureMessage: string;
      successMessage: string;
      text: string;
      type: 'copy-text';
    }
  | {
      failureMessage: string;
      filename: string;
      successMessage: string;
      type: 'download-csv';
      url: string;
    };

type AssignmentResultActionButtonBase = {
  description: string;
  disabled: boolean;
  disabledReason?: string;
  failureMessage: string;
  gate: AssignmentResultActionGate;
  label: string;
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
};

export type AssignmentResultActionDataSet = {
  copyActionData: AssignmentResultCopyActionData | null;
  exportActionData: AssignmentResultActionData | null;
};

type AssignmentResultCopyArtifactData = {
  analysis: Pick<
    AssignmentResultsAnalysis,
    'attempts' | 'perItem' | 'students'
  >;
  assignment: {
    title: string;
  };
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
  description: string;
  label: string;
  metaItems: AssignmentResultCopyArtifactPreviewMetaItem[];
  summaryLabel: string;
  text: string;
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
  | 'student-last-submitted'
  | 'students';

export const assignmentResultActionDescriptors = [
  {
    action: 'copy-brief',
    kind: 'copy-text',
  },
  {
    action: 'copy-reteach-plan',
    kind: 'copy-text',
  },
  {
    action: 'copy-item-review',
    kind: 'copy-text',
  },
  {
    action: 'copy-follow-up',
    kind: 'copy-text',
  },
  {
    action: 'export-csv',
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
    attemptCount,
    classroomBriefReady,
    itemCount,
    studentCount,
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
    const base = {
      description: actionCopy.description,
      disabled: Boolean(disabledReason),
      ...(disabledReason ? { disabledReason } : {}),
      failureMessage: actionCopy.failureMessage,
      gate,
      label: actionCopy.label,
      successMessage: actionCopy.successMessage,
    } satisfies AssignmentResultActionButtonBase;

    if (descriptor.kind === 'download-csv') {
      return {
        ...base,
        action: descriptor.action,
        kind: 'download-csv',
      };
    }

    return {
      ...base,
      action: descriptor.action,
      kind: 'copy-text',
    };
  });
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

export function buildAssignmentResultCopyArtifacts(
  data: AssignmentResultCopyArtifactData
): AssignmentResultCopyArtifacts {
  const assignmentTitle = formatAssignmentDisplayTitle(data.assignment.title);
  const items = data.analysis.perItem;
  const students = data.analysis.students;

  return {
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
}

export function buildAssignmentResultCopyActionData({
  data,
  items,
  students,
}: {
  data: AssignmentResultActionData;
  items: AssignmentItemAnalysis[];
  students: AssignmentStudentSummary[];
}): AssignmentResultCopyActionData {
  return {
    ...data,
    analysis: {
      ...data.analysis,
      perItem: items,
      students,
    },
  };
}

export function buildAssignmentResultActionDataSet({
  copyActionData,
  exportActionData,
}: AssignmentResultActionDataSet): AssignmentResultActionDataSet {
  return {
    copyActionData,
    exportActionData,
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

export function buildAssignmentResultCopyArtifactPreviews(
  artifacts: AssignmentResultCopyArtifacts
): AssignmentResultCopyArtifactPreview[] {
  return assignmentResultActionDescriptors.flatMap((descriptor) => {
    if (descriptor.kind !== 'copy-text') return [];

    const actionCopy = getAssignmentResultActionCopy(descriptor.action);

    return [
      {
        action: descriptor.action,
        description: actionCopy.description,
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
    buildAssignmentResultCopyArtifactPreviewMetaItem({
      key: 'students',
      label: m.assignment_result_copy_preview_meta_students(),
      value: artifacts.studentFollowUpSummary.students.length,
    }),
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
  if (actionButton.gate.type === 'blocked') {
    return {
      failureMessage: actionButton.failureMessage,
      message: actionButton.gate.message,
      type: 'blocked',
    };
  }

  const executionData =
    dataSet === undefined
      ? (data ?? null)
      : getAssignmentResultActionExecutionData({ actionButton, dataSet });

  if (!executionData) {
    return {
      failureMessage: actionButton.failureMessage,
      message: actionButton.failureMessage,
      type: 'blocked',
    };
  }

  const payload = buildAssignmentResultActionPayload({
    actionButton,
    data: executionData,
  });

  if (payload.kind === 'download-csv') {
    return {
      failureMessage: actionButton.failureMessage,
      filename: payload.filename,
      successMessage: actionButton.successMessage,
      type: 'download-csv',
      url: buildAssignmentResultsCsvDataUrl(payload.csv),
    };
  }

  return {
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
  if (action === 'copy-item-review') {
    return itemCount > 0
      ? { type: 'ready' }
      : {
          message: m.assignment_result_action_gate_add_items_item_review(),
          type: 'blocked',
        };
  }

  if (action === 'copy-follow-up') {
    return studentCount > 0
      ? { type: 'ready' }
      : {
          message: m.assignment_result_action_gate_submit_attempt_follow_up(),
          type: 'blocked',
        };
  }

  if (action === 'copy-brief' && !classroomBriefReady) {
    return {
      message: m.assignment_result_action_gate_submit_attempt_brief(),
      type: 'blocked',
    };
  }

  if (attemptCount > 0) return { type: 'ready' };

  return {
    message: getNoAttemptResultActionMessage(action),
    type: 'blocked',
  };
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

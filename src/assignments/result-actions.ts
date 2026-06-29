import { formatAssignmentDisplayTitle } from '@/assignments/assignment-display';
import { buildAssignmentClassroomBrief } from '@/assignments/classroom-brief';
import { buildAssignmentItemReviewSummary } from '@/assignments/item-review-summary';
import { buildAssignmentReteachPlan } from '@/assignments/reteach-plan';
import {
  buildAssignmentResultsCsv,
  buildAssignmentResultsCsvDataUrl,
  buildAssignmentResultsCsvFilename,
  type AssignmentResultsExportData,
} from '@/assignments/results-export';
import { buildAssignmentStudentFollowUpSummary } from '@/assignments/student-follow-up-summary';
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

export function buildAssignmentResultCopyText({
  action,
  data,
}: {
  action: AssignmentResultCopyAction;
  data: AssignmentResultActionData;
}) {
  const assignmentTitle = formatAssignmentDisplayTitle(data.assignment.title);
  const items = data.analysis.perItem;
  const students = data.analysis.students;

  if (action === 'copy-brief') {
    return buildAssignmentClassroomBrief({
      assignmentTitle,
      items,
      stats: buildAssignmentResultClassroomBriefStats(data.stats),
      students,
    }).text;
  }

  if (action === 'copy-reteach-plan') {
    return buildAssignmentReteachPlan({
      assignmentTitle,
      items,
      students,
    }).text;
  }

  if (action === 'copy-item-review') {
    return buildAssignmentItemReviewSummary({
      assignmentTitle,
      items,
    });
  }

  return buildAssignmentStudentFollowUpSummary({
    assignmentTitle,
    students,
  }).text;
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

  return {
    kind: 'copy-text',
    text: buildAssignmentResultCopyText({
      action: actionButton.action,
      data,
    }),
  };
}

export function buildAssignmentResultActionExecutionPlan({
  actionButton,
  data,
}: {
  actionButton: AssignmentResultActionButton;
  data?: AssignmentResultActionData | null;
}): AssignmentResultActionExecutionPlan {
  if (actionButton.gate.type === 'blocked') {
    return {
      failureMessage: actionButton.failureMessage,
      message: actionButton.gate.message,
      type: 'blocked',
    };
  }

  if (!data) {
    return {
      failureMessage: actionButton.failureMessage,
      message: actionButton.failureMessage,
      type: 'blocked',
    };
  }

  const payload = buildAssignmentResultActionPayload({
    actionButton,
    data,
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

import { formatAssignmentDisplayTitle } from '@/assignments/assignment-display';
import {
  buildPrintableAssignmentSearch,
  type PrintableAssignmentSearch,
} from '@/assignments/printable-worksheet';
import {
  type AssignmentShareLinkActionView,
  buildAssignmentSharePath,
  buildAssignmentShareLinkActionView,
} from '@/assignments/share-link';
import {
  isSameAssignmentShareSlug,
  normalizeAssignmentShareSlug,
} from '@/assignments/share-slug';
import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';

type PublishedAssignmentListItem = {
  assignment: {
    id: string;
    shareSlug: string;
    title: string;
  };
};

export type PublishedAssignmentPanelAssignment = {
  id: string;
  shareSlug: string;
  title: string;
};

export type PublishedAssignmentPanelDismissAction = {
  label: string;
};

export type PublishedAssignmentPanelPrintAction = {
  assignmentId: string;
  label: string;
  search: PrintableAssignmentSearch;
  to: typeof Routes.PrintAssignmentWorksheet;
};

export type PublishedAssignmentPanelResultAction = {
  assignmentId: string;
  label: string;
  to: typeof Routes.DashboardAssignmentResults;
};

export type PublishedAssignmentPanelShareAction = AssignmentShareLinkActionView;

export type PublishedAssignmentPanelActionView = {
  dismissAction: PublishedAssignmentPanelDismissAction | undefined;
  printAction: PublishedAssignmentPanelPrintAction | undefined;
  resultAction: PublishedAssignmentPanelResultAction | undefined;
  shareAction: PublishedAssignmentPanelShareAction | undefined;
};

export type PublishedAssignmentPanelStatus = 'found' | 'loading' | 'missing';

export type PublishedAssignmentPanelNextStepId =
  | 'copy-link'
  | 'preview-link'
  | 'review-results';

export type PublishedAssignmentPanelNextStepView = {
  id: PublishedAssignmentPanelNextStepId;
  label: string;
};

export function findPublishedAssignmentInList<
  TItem extends PublishedAssignmentListItem,
>({ items, shareSlug }: { items: TItem[]; shareSlug?: string }) {
  const normalizedShareSlug = normalizeOptionalAssignmentShareSlug(shareSlug);
  if (!normalizedShareSlug) return undefined;

  return items.find((item) =>
    isSameAssignmentShareSlug(item.assignment.shareSlug, normalizedShareSlug)
  )?.assignment;
}

export function resolvePublishedAssignmentPanelAssignment<
  TItem extends PublishedAssignmentListItem,
>({
  assignment,
  items,
  shareSlug,
}: {
  assignment?: PublishedAssignmentPanelAssignment | null;
  items: TItem[];
  shareSlug?: string;
}) {
  const normalizedShareSlug = normalizeOptionalAssignmentShareSlug(shareSlug);
  if (!normalizedShareSlug) return undefined;
  if (
    assignment &&
    isSameAssignmentShareSlug(assignment.shareSlug, normalizedShareSlug)
  ) {
    return assignment;
  }

  return findPublishedAssignmentInList({
    items,
    shareSlug: normalizedShareSlug,
  });
}

export type PublishedAssignmentPanelContext = {
  actionView: PublishedAssignmentPanelActionView;
  assignment?: PublishedAssignmentPanelAssignment;
  body: string;
  nextSteps: string[];
  nextStepViews: PublishedAssignmentPanelNextStepView[];
  sharePath: string;
  sharePathLabel: string;
  showMissingHint: boolean;
  status: PublishedAssignmentPanelStatus;
  title: string;
};

export function buildPublishedAssignmentPanelContext({
  assignment,
  isLoading,
  shareSlug,
}: {
  assignment?: PublishedAssignmentPanelAssignment;
  isLoading: boolean;
  shareSlug: string;
}): PublishedAssignmentPanelContext {
  const normalizedShareSlug = normalizeAssignmentShareSlug(shareSlug);
  const sharePath = buildAssignmentSharePath(normalizedShareSlug);
  const foundNextStepViews =
    buildPublishedAssignmentPanelNextStepViews('found');
  const loadingNextStepViews =
    buildPublishedAssignmentPanelNextStepViews('loading');
  const missingNextStepViews =
    buildPublishedAssignmentPanelNextStepViews('missing');

  if (assignment) {
    return {
      actionView: buildPublishedAssignmentPanelActionView({
        assignment,
        shareSlug: normalizedShareSlug,
        status: 'found',
      }),
      assignment,
      body: m.assignment_published_panel_found_body(),
      nextSteps: getPublishedAssignmentPanelNextStepLabels(foundNextStepViews),
      nextStepViews: foundNextStepViews,
      sharePath,
      sharePathLabel: m.assignment_published_panel_share_path_label(),
      showMissingHint: false,
      status: 'found',
      title: formatAssignmentDisplayTitle(assignment.title),
    };
  }

  if (isLoading) {
    return {
      actionView: buildPublishedAssignmentPanelActionView({
        assignment,
        shareSlug: normalizedShareSlug,
        status: 'loading',
      }),
      body: m.assignment_published_panel_loading_body(),
      nextSteps:
        getPublishedAssignmentPanelNextStepLabels(loadingNextStepViews),
      nextStepViews: loadingNextStepViews,
      sharePath,
      sharePathLabel: m.assignment_published_panel_share_path_label(),
      showMissingHint: false,
      status: 'loading',
      title: m.assignment_published_panel_loading_title(),
    };
  }

  return {
    actionView: buildPublishedAssignmentPanelActionView({
      assignment,
      shareSlug: normalizedShareSlug,
      status: 'missing',
    }),
    body: m.assignment_published_panel_missing_body(),
    nextSteps: getPublishedAssignmentPanelNextStepLabels(missingNextStepViews),
    nextStepViews: missingNextStepViews,
    sharePath,
    sharePathLabel: m.assignment_published_panel_share_path_label(),
    showMissingHint: true,
    status: 'missing',
    title: m.assignment_published_panel_missing_title(),
  };
}

function buildPublishedAssignmentPanelActionView({
  assignment,
  shareSlug,
  status,
}: {
  assignment?: PublishedAssignmentPanelAssignment;
  shareSlug: string;
  status: PublishedAssignmentPanelStatus;
}): PublishedAssignmentPanelActionView {
  const hasAssignment = status === 'found' && assignment;

  return {
    dismissAction: {
      label: m.assignment_list_action_dismiss(),
    },
    printAction: hasAssignment
      ? {
          assignmentId: assignment.id,
          label: m.assignment_list_action_print_worksheet(),
          search: buildPrintableAssignmentSearch({ answerKey: false }),
          to: Routes.PrintAssignmentWorksheet,
        }
      : undefined,
    resultAction: hasAssignment
      ? {
          assignmentId: assignment.id,
          label: m.assignment_list_action_view_results(),
          to: Routes.DashboardAssignmentResults,
        }
      : undefined,
    shareAction: buildAssignmentShareLinkActionView({
      label: m.assignment_list_action_open_published_link(),
      shareSlug,
    }),
  };
}

export function buildPublishedAssignmentPanelNextStepViews(
  status: PublishedAssignmentPanelStatus
) {
  const baseSteps = [
    {
      id: 'copy-link',
      label: m.assignment_published_panel_next_step_copy_link(),
    },
    {
      id: 'preview-link',
      label: m.assignment_published_panel_next_step_preview_link(),
    },
  ] satisfies PublishedAssignmentPanelNextStepView[];

  return status === 'found'
    ? [
        ...baseSteps,
        {
          id: 'review-results',
          label: m.assignment_published_panel_next_step_review_results(),
        },
      ]
    : baseSteps;
}

function getPublishedAssignmentPanelNextStepLabels(
  nextSteps: PublishedAssignmentPanelNextStepView[]
) {
  return nextSteps.map((step) => step.label);
}

function normalizeOptionalAssignmentShareSlug(shareSlug?: string) {
  return shareSlug ? normalizeAssignmentShareSlug(shareSlug) : '';
}

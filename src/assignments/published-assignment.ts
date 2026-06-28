import { formatAssignmentDisplayTitle } from '@/assignments/assignment-display';
import { buildAssignmentSharePath } from '@/assignments/share-link';
import {
  isSameAssignmentShareSlug,
  normalizeAssignmentShareSlug,
} from '@/assignments/share-slug';
import { m } from '@/locale/paraglide/messages';

type PublishedAssignmentListItem = {
  assignment: {
    id: string;
    shareSlug: string;
    title: string;
  };
};

type PublishedAssignmentPanelAssignment =
  PublishedAssignmentListItem['assignment'];

export type PublishedAssignmentPanelActionView = {
  dismissAction:
    | {
        label: string;
      }
    | undefined;
  printAction:
    | {
        assignmentId: string;
        label: string;
      }
    | undefined;
  resultAction:
    | {
        assignmentId: string;
        label: string;
      }
    | undefined;
  shareAction:
    | {
        label: string;
        sharePath: string;
        shareSlug: string;
      }
    | undefined;
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
  sharePath: string;
  showMissingHint: boolean;
  status: 'found' | 'loading' | 'missing';
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

  if (assignment) {
    return {
      actionView: buildPublishedAssignmentPanelActionView({
        assignment,
        sharePath,
        shareSlug: normalizedShareSlug,
        status: 'found',
      }),
      assignment,
      body: m.assignment_published_panel_found_body(),
      sharePath,
      showMissingHint: false,
      status: 'found',
      title: formatAssignmentDisplayTitle(assignment.title),
    };
  }

  if (isLoading) {
    return {
      actionView: buildPublishedAssignmentPanelActionView({
        assignment,
        sharePath,
        shareSlug: normalizedShareSlug,
        status: 'loading',
      }),
      body: m.assignment_published_panel_loading_body(),
      sharePath,
      showMissingHint: false,
      status: 'loading',
      title: m.assignment_published_panel_loading_title(),
    };
  }

  return {
    actionView: buildPublishedAssignmentPanelActionView({
      assignment,
      sharePath,
      shareSlug: normalizedShareSlug,
      status: 'missing',
    }),
    body: m.assignment_published_panel_missing_body(),
    sharePath,
    showMissingHint: true,
    status: 'missing',
    title: m.assignment_published_panel_missing_title(),
  };
}

function buildPublishedAssignmentPanelActionView({
  assignment,
  sharePath,
  shareSlug,
  status,
}: {
  assignment?: PublishedAssignmentPanelAssignment;
  sharePath: string;
  shareSlug: string;
  status: PublishedAssignmentPanelContext['status'];
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
        }
      : undefined,
    resultAction: hasAssignment
      ? {
          assignmentId: assignment.id,
          label: m.assignment_list_action_view_results(),
        }
      : undefined,
    shareAction: {
      label: m.assignment_list_action_open_published_link(),
      sharePath,
      shareSlug,
    },
  };
}

function normalizeOptionalAssignmentShareSlug(shareSlug?: string) {
  return shareSlug ? normalizeAssignmentShareSlug(shareSlug) : '';
}

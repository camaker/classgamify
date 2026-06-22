import { buildAssignmentSharePath } from '@/assignments/share-link';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { m } from '@/locale/paraglide/messages';

export type PublishedAssignmentListItem = {
  assignment: {
    id: string;
    shareSlug: string;
    title: string;
  };
};

type PublishedAssignmentPanelAssignment =
  PublishedAssignmentListItem['assignment'];

export function findPublishedAssignmentInList<
  TItem extends PublishedAssignmentListItem,
>({ items, shareSlug }: { items: TItem[]; shareSlug?: string }) {
  const normalizedShareSlug = normalizeOptionalAssignmentShareSlug(shareSlug);
  if (!normalizedShareSlug) return undefined;

  return items.find((item) => item.assignment.shareSlug === normalizedShareSlug)
    ?.assignment;
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
  if (assignment?.shareSlug === normalizedShareSlug) return assignment;

  return findPublishedAssignmentInList({
    items,
    shareSlug: normalizedShareSlug,
  });
}

export type PublishedAssignmentPanelContext = {
  assignment?: PublishedAssignmentPanelAssignment;
  body: string;
  sharePath: string;
  showDismissAction: boolean;
  showMissingHint: boolean;
  showResultsAction: boolean;
  showShareActions: boolean;
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

  if (assignment) {
    return {
      assignment,
      body: m.assignment_published_panel_found_body(),
      sharePath: buildAssignmentSharePath(normalizedShareSlug),
      showDismissAction: true,
      showMissingHint: false,
      showResultsAction: true,
      showShareActions: true,
      status: 'found',
      title: assignment.title,
    };
  }

  if (isLoading) {
    return {
      body: m.assignment_published_panel_loading_body(),
      sharePath: buildAssignmentSharePath(normalizedShareSlug),
      showDismissAction: true,
      showMissingHint: false,
      showResultsAction: false,
      showShareActions: true,
      status: 'loading',
      title: m.assignment_published_panel_loading_title(),
    };
  }

  return {
    body: m.assignment_published_panel_missing_body(),
    sharePath: buildAssignmentSharePath(normalizedShareSlug),
    showDismissAction: true,
    showMissingHint: true,
    showResultsAction: false,
    showShareActions: true,
    status: 'missing',
    title: m.assignment_published_panel_missing_title(),
  };
}

function normalizeOptionalAssignmentShareSlug(shareSlug?: string) {
  return shareSlug ? normalizeAssignmentShareSlug(shareSlug) : '';
}

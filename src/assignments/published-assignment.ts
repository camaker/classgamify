import { buildAssignmentSharePath } from '@/assignments/share-link';
import { m } from '@/locale/paraglide/messages';

export type PublishedAssignmentListItem = {
  assignment: {
    id: string;
    shareSlug: string;
    title: string;
  };
};

export function findPublishedAssignmentInList<
  TItem extends PublishedAssignmentListItem,
>({ items, shareSlug }: { items: TItem[]; shareSlug?: string }) {
  if (!shareSlug) return undefined;

  return items.find((item) => item.assignment.shareSlug === shareSlug)
    ?.assignment;
}

export type PublishedAssignmentPanelContext = {
  assignment?: PublishedAssignmentListItem['assignment'];
  body: string;
  sharePath: string;
  showDismissAction: boolean;
  showMissingHint: boolean;
  showResultsAction: boolean;
  showShareActions: boolean;
  status: 'found' | 'loading' | 'missing';
  title: string;
};

export function buildPublishedAssignmentPanelContext<
  TItem extends PublishedAssignmentListItem,
>({
  isLoading,
  items,
  shareSlug,
}: {
  isLoading: boolean;
  items: TItem[];
  shareSlug: string;
}): PublishedAssignmentPanelContext {
  const assignment = findPublishedAssignmentInList({ items, shareSlug });

  if (assignment) {
    return {
      assignment,
      body: m.assignment_published_panel_found_body(),
      sharePath: buildAssignmentSharePath(shareSlug),
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
      sharePath: buildAssignmentSharePath(shareSlug),
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
    sharePath: buildAssignmentSharePath(shareSlug),
    showDismissAction: true,
    showMissingHint: true,
    showResultsAction: false,
    showShareActions: true,
    status: 'missing',
    title: m.assignment_published_panel_missing_title(),
  };
}

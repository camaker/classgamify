import { buildAssignmentSharePath } from '@/assignments/share-link';

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
      body: 'Copy the student link for your class, open the student preview, or jump into the results page before submissions arrive.',
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
      body: 'Loading the newly published assignment link and classroom actions.',
      sharePath: buildAssignmentSharePath(shareSlug),
      showDismissAction: true,
      showMissingHint: false,
      showResultsAction: false,
      showShareActions: true,
      status: 'loading',
      title: 'Student share link is being prepared.',
    };
  }

  return {
    body: 'Copy the student link for your class or open the student preview. Results will appear once the assignment is visible in this list.',
    sharePath: buildAssignmentSharePath(shareSlug),
    showDismissAction: true,
    showMissingHint: true,
    showResultsAction: false,
    showShareActions: true,
    status: 'missing',
    title: 'Student share link is ready.',
  };
}

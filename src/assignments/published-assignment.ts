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

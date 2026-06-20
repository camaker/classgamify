export type AssignmentRuntimeOrderItem = {
  id: string;
};

export function orderAssignmentRuntimeItems<
  TItem extends AssignmentRuntimeOrderItem,
>({
  items,
  shareSlug,
  shuffleItems,
}: {
  items: TItem[];
  shareSlug: string;
  shuffleItems: boolean;
}) {
  return shuffleItems ? stableShuffle(items, shareSlug) : items;
}

export function stableShuffle<TItem>(items: TItem[], seed: string) {
  const copy = [...items];
  let state = hashSeed(seed);

  for (let index = copy.length - 1; index > 0; index--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function hashSeed(seed: string) {
  return seed.split('').reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) >>> 0;
  }, 2166136261);
}

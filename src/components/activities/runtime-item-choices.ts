import type { PublicRuntimeItem } from '@/assignments/public';

export function getUniqueRuntimeChoices(items: PublicRuntimeItem[]) {
  const choices = new Set<string>();

  for (const item of items) {
    for (const choice of item.choices ?? []) {
      choices.add(choice);
    }
  }

  return [...choices];
}

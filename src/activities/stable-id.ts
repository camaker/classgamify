export function makeActivityStableId(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

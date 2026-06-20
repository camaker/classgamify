export function parseDashboardPageSearch(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;

  const page = Number(value);
  return Number.isInteger(page) && page > 1 ? page : undefined;
}

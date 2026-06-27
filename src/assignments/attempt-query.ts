import { attempt } from '@/db/app.schema';
import { and, isNotNull, type SQL } from 'drizzle-orm';

export function buildScoredAttemptWhere(...filters: SQL[]) {
  return and(...filters, isNotNull(attempt.resultJson));
}

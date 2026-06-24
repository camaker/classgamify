import { sql, type SQL } from 'drizzle-orm';
import type { SQLWrapper } from 'drizzle-orm/sql/sql';

export function buildSqlLikeContainsPattern(value: string) {
  return `%${escapeSqlLikePattern(value)}%`;
}

export function sqlLikeContains(column: SQLWrapper, value: string): SQL {
  return sql`${column} like ${buildSqlLikeContainsPattern(value)} escape '\\'`;
}

function escapeSqlLikePattern(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

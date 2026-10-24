import assert from 'node:assert/strict';
import type { SQLInputValue } from 'node:sqlite';
import type { SQL } from 'drizzle-orm';
import type { SQLiteSyncDialect } from 'drizzle-orm/sqlite-core';

/** Fail closed when a contract accidentally removes the SQL predicate. */
export function compileSqliteTestQuery(
  dialect: SQLiteSyncDialect,
  where: SQL | undefined
) {
  assert.ok(
    where,
    'The contract query must contain an owner-scoped predicate.'
  );
  const query = dialect.sqlToQuery(where);
  return { ...query, params: query.params.map(sqliteTestBinding) };
}

export function sqliteTestBinding(value: unknown): SQLInputValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    value instanceof Uint8Array
  )
    return value;
  throw new TypeError('Unsupported SQLite test binding.');
}

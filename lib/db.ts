import postgres from "postgres";

/**
 * Postgres connection for the website's own writes (newsletter leads).
 *
 * Server-only: DATABASE_URL carries a password, so it must never be prefixed
 * NEXT_PUBLIC_ and this module must only be imported from server code (server
 * actions, route handlers).
 *
 * Returns null when DATABASE_URL is unset, so a deployment without a database
 * degrades to "sign-ups unavailable" instead of crashing at import time.
 *
 * The client is created lazily and cached on globalThis: Next's dev server
 * re-evaluates modules on every edit, and a fresh pool per reload would leak
 * connections until the database refuses new ones.
 */

type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as { __aceSql?: Sql };

export function getSql(): Sql | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  if (!globalForDb.__aceSql) {
    globalForDb.__aceSql = postgres(url, {
      // A marketing site writes a handful of rows a day; two connections is
      // plenty and keeps us well inside small/pooled database limits.
      max: 2,
      idle_timeout: 20,
      connect_timeout: 10,
      // Poolers in transaction mode (Neon's -pooler host, PgBouncer) cannot
      // keep prepared statements between transactions.
      prepare: false,
    });
  }
  return globalForDb.__aceSql;
}

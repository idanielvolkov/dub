import mysql, { ResultSetHeader } from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

// The upstream app uses PlanetScale's HTTP driver here. Self-hosted MySQL
// exposes the native MySQL protocol instead, so keep the small `execute`
// interface used throughout the app and back it with a connection pool.
const pool = mysql.createPool(databaseUrl);

export const conn = {
  async execute<T = Record<string, unknown>>(
    query: string,
    params: unknown[] = [],
  ) {
    const [result, fields] = await pool.execute(query, params);
    const rows = Array.isArray(result) ? (result as T[]) : [];
    const header = Array.isArray(result) ? undefined : (result as ResultSetHeader);

    return {
      rows,
      fields,
      size: rows.length,
      statement: query,
      insertId: header?.insertId?.toString(),
      rowsAffected: header?.affectedRows ?? 0,
    };
  },
};

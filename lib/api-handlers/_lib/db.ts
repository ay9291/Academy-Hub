import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../../../shared/schema";

declare global {
  var pgPool: Pool | undefined;
}

function getPool() {
  if (!globalThis.pgPool) {
    const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("Database connection string not found");
    }
    globalThis.pgPool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return globalThis.pgPool;
}

export const pool = getPool();
export const db = drizzle(pool, { schema });

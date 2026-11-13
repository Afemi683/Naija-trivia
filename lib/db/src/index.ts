import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isSslNeeded =
  connectionString.includes("neon.tech") ||
  connectionString.includes("sslmode=require");

export const pool = new Pool({
  connectionString,
  ssl: isSslNeeded ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });

export * from "./schema";

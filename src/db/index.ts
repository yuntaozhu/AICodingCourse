import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.ts";

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const host =
      process.env.SQL_HOST ||
      process.env.PGHOST ||
      process.env.POSTGRES_HOST;
    const user =
      process.env.SQL_USER ||
      process.env.PGUSER ||
      process.env.POSTGRES_USER;
    const password =
      process.env.SQL_PASSWORD ||
      process.env.PGPASSWORD ||
      process.env.POSTGRES_PASSWORD;
    const database =
      process.env.SQL_DB_NAME ||
      process.env.PGDATABASE ||
      process.env.POSTGRES_DATABASE;

    const isRemoteTlsHost = Boolean(
      host &&
        !host.startsWith("/") &&
        host !== "localhost" &&
        host !== "127.0.0.1"
    );

    global._postgresPool = new Pool({
      host,
      user,
      password,
      database,
      ...(isRemoteTlsHost ? { ssl: { rejectUnauthorized: true } } : {}),
      max: isRemoteTlsHost ? 5 : 10,
      connectionTimeoutMillis: 15000,
    });

    global._postgresPool.on("error", (err) => {
      console.error("Unexpected error on idle SQL pool client:", err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });

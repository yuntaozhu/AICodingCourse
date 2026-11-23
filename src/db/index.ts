import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.ts";

declare global {
  var _postgresPool: Pool | undefined;
}

export function resolvePostgresPoolConfig(env: NodeJS.ProcessEnv) {
  if (!env.SQL_HOST) {
    const connectionString =
      env.DATABASE_URL ||
      env.POSTGRES_URL ||
      env.POSTGRES_PRISMA_URL ||
      env.POSTGRES_URL_NON_POOLING;

    if (connectionString) {
      const isRemoteTls =
        !connectionString.includes("localhost") &&
        !connectionString.includes("127.0.0.1") &&
        !connectionString.includes("socket");

      return {
        connectionString,
        ...(isRemoteTls ? { ssl: { rejectUnauthorized: true } } : {}),
        max: isRemoteTls ? 5 : 10,
        connectionTimeoutMillis: 15000,
      };
    }
  }

  const host = env.SQL_HOST || env.PGHOST || env.POSTGRES_HOST;
  const user = env.SQL_USER || env.PGUSER || env.POSTGRES_USER;
  const password = env.SQL_PASSWORD || env.PGPASSWORD || env.POSTGRES_PASSWORD;
  const database =
    env.SQL_DB_NAME || env.PGDATABASE || env.POSTGRES_DATABASE;

  const isRemoteTlsHost = Boolean(
    host &&
      !host.startsWith("/") &&
      host !== "localhost" &&
      host !== "127.0.0.1"
  );

  return {
    host,
    user,
    password,
    database,
    ...(isRemoteTlsHost ? { ssl: { rejectUnauthorized: true } } : {}),
    max: isRemoteTlsHost ? 5 : 10,
    connectionTimeoutMillis: 15000,
  };
}

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool(resolvePostgresPoolConfig(process.env));

    global._postgresPool.on("error", (err) => {
      console.error("Unexpected error on idle SQL pool client:", err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });

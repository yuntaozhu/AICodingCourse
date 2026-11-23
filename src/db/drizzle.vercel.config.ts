import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

const host =
  process.env.PGHOST_UNPOOLED ||
  process.env.PGHOST ||
  process.env.POSTGRES_HOST ||
  process.env.SQL_HOST;
const database =
  process.env.PGDATABASE ||
  process.env.POSTGRES_DATABASE ||
  process.env.SQL_DB_NAME;
const user =
  process.env.PGUSER ||
  process.env.POSTGRES_USER ||
  process.env.SQL_ADMIN_USER ||
  process.env.SQL_USER;
const password =
  process.env.PGPASSWORD ||
  process.env.POSTGRES_PASSWORD ||
  process.env.SQL_ADMIN_PASSWORD ||
  process.env.SQL_PASSWORD;

if (!connectionUrl && (!host || !database || !user || !password)) {
  throw new Error(
    "Missing DATABASE_URL or PG*/POSTGRES_*/SQL_* credentials for Drizzle schema push."
  );
}

const isRemoteTlsHost =
  host && !host.startsWith("/") && host !== "localhost" && host !== "127.0.0.1";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: connectionUrl
    ? { url: connectionUrl }
    : {
        host: host!,
        user: user!,
        password: password!,
        database: database!,
        ssl: isRemoteTlsHost ? { rejectUnauthorized: true } : false,
      },
  verbose: true,
});

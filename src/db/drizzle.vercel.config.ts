import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

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

if (!host || !database || !user || !password) {
  throw new Error(
    "Missing PG*/POSTGRES_* or SQL_* credentials for Drizzle schema push."
  );
}

const isRemoteTlsHost =
  !host.startsWith("/") && host !== "localhost" && host !== "127.0.0.1";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    host,
    user,
    password,
    database,
    ssl: isRemoteTlsHost ? { rejectUnauthorized: true } : false,
  },
  verbose: true,
});

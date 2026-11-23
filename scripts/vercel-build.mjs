import { execSync } from "node:child_process";
import process from "node:process";

execSync("npx vite build", { stdio: "inherit" });

const hasVercelPostgres = Boolean(
  process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.PGHOST ||
    process.env.PGHOST_UNPOOLED ||
    process.env.POSTGRES_HOST
);
const hasCloudSql = Boolean(process.env.SQL_HOST);

if (hasVercelPostgres && !hasCloudSql) {
  console.log(
    "[vercel-build] Detected Vercel/Neon Postgres credentials. Syncing Drizzle schema..."
  );
  execSync(
    "npx drizzle-kit push --config=src/db/drizzle.vercel.config.ts --force",
    {
      stdio: "inherit",
    }
  );
} else {
  console.log(
    "[vercel-build] Skipping Neon schema push (Cloud SQL active or Postgres env not present)."
  );
}

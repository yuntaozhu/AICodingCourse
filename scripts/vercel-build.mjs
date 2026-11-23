import { execSync } from "node:child_process";
import process from "node:process";

execSync("npx vite build", { stdio: "inherit" });

const hasVercelPostgres = Boolean(
  process.env.PGHOST ||
    process.env.PGHOST_UNPOOLED ||
    process.env.POSTGRES_HOST
);
const hasCloudSql = Boolean(process.env.SQL_HOST);

if (hasVercelPostgres && !hasCloudSql) {
  console.log(
    "[vercel-build] Detected Vercel/Neon Postgres credentials. Syncing Drizzle schema..."
  );
  execSync("npx drizzle-kit push --config=src/db/drizzle.vercel.config.ts", {
    stdio: "inherit",
  });
} else {
  console.log(
    "[vercel-build] Skipping Neon schema push (Cloud SQL active or PG* env not present)."
  );
}

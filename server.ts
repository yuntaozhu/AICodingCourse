import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { app } from "./src/server/app.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : true,
      },
      appType: "spa",
    });
    app.use((req, res, next) => {
      if (req.url?.startsWith("/api/")) {
        return next();
      }
      return vite.middlewares(req, res, next);
    });
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AICodingCourse LMS Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

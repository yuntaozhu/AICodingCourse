import fs from "node:fs";
import path from "node:path";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let cachedAuth: Auth | null | undefined;

function readProjectId(): string | null {
  const envProjectId =
    process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  if (envProjectId) {
    return envProjectId;
  }

  const candidatePaths: Array<string | URL> = [
    path.resolve(process.cwd(), "firebase-applet-config.json"),
  ];

  if (typeof import.meta !== "undefined" && typeof import.meta.url === "string") {
    try {
      candidatePaths.push(
        new URL("../firebase-applet-config.json", import.meta.url),
        new URL("../../firebase-applet-config.json", import.meta.url)
      );
    } catch {
      // Ignore invalid URL resolution in bundled environments
    }
  }

  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate)) {
        const raw = fs.readFileSync(candidate, "utf8");
        const parsed = JSON.parse(raw) as { projectId?: string };
        if (parsed.projectId) {
          return parsed.projectId;
        }
      }
    } catch {
      // Try next candidate
    }
  }

  return null;
}

export function getAdminAuth(): Auth | null {
  if (cachedAuth !== undefined) {
    return cachedAuth;
  }

  try {
    if (!getApps().length) {
      const projectId = readProjectId();
      if (!projectId) {
        cachedAuth = null;
        return null;
      }
      initializeApp({ projectId });
    }
    cachedAuth = getAuth();
    return cachedAuth;
  } catch (err) {
    console.warn("[firebase-admin] Firebase Admin Auth unavailable:", err);
    cachedAuth = null;
    return null;
  }
}

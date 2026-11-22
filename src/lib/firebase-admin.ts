import fs from "node:fs";
import path from "node:path";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function readProjectId(): string {
  const envProjectId =
    process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  if (envProjectId) {
    return envProjectId;
  }
  const cwdPath = path.resolve(process.cwd(), "firebase-applet-config.json");
  const raw = fs.existsSync(cwdPath)
    ? fs.readFileSync(cwdPath, "utf8")
    : fs.readFileSync(
        new URL("../../firebase-applet-config.json", import.meta.url),
        "utf8"
      );
  const parsed = JSON.parse(raw) as { projectId?: string };
  if (!parsed.projectId) {
    throw new Error("Missing projectId in firebase-applet-config.json");
  }
  return parsed.projectId;
}

if (!getApps().length) {
  initializeApp({
    projectId: readProjectId(),
  });
}

export const adminAuth = getAuth();

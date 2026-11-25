import { auth } from "@/lib/firebase";

let inMemoryIdToken: string | null = null;

export function setMemoryIdToken(token: string | null): void {
  inMemoryIdToken = token;
}

export function getMemoryIdToken(): string | null {
  return inMemoryIdToken;
}

export async function getFreshIdToken(forceRefresh = false): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(forceRefresh);
      setMemoryIdToken(token);
      return token;
    }
  } catch {
    // Fallback to local JWT token
  }
  return getMemoryIdToken();
}

export async function getAuthHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = await getFreshIdToken(false);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

import { auth } from "@/lib/firebase";

const LOCAL_TOKEN_KEY = "aicoding_jwt_token_v1";

let inMemoryIdToken: string | null = (() => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LOCAL_TOKEN_KEY);
  } catch {
    return null;
  }
})();

export function setMemoryIdToken(token: string | null): void {
  inMemoryIdToken = token;
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

export function getMemoryIdToken(): string | null {
  if (inMemoryIdToken) return inMemoryIdToken;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LOCAL_TOKEN_KEY);
  } catch {
    return null;
  }
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

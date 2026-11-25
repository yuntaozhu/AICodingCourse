import { createContext, useContext } from "react";
import type { User } from "firebase/auth";
import type { AuthSessionData } from "@/lib/apiClient";

export interface AuthContextValue {
  firebaseUser: User | null;
  session: AuthSessionData | null;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshSession: () => Promise<AuthSessionData | null>;
  claimInitialAdmin: (bootstrapToken?: string) => Promise<void>;
  requestEmailOtp: (email: string) => Promise<{
    deliveryMode: "email" | "dev_preview";
    cooldownSeconds: number;
    devPreviewCode?: string;
  }>;
  verifyEmailOtp: (email: string, code: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

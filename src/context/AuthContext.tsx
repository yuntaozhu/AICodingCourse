import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onIdTokenChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  claimFirstAdminApi,
  fetchMySession,
  type AuthSessionData,
} from "@/lib/apiClient";
import { setMemoryIdToken } from "@/lib/authTokenStore";
import { auth, googleAuthProvider } from "@/lib/firebase";

interface AuthContextValue {
  firebaseUser: User | null;
  session: AuthSessionData | null;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshSession: () => Promise<AuthSessionData | null>;
  claimInitialAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSessionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadBackendSession = useCallback(async (user: User | null) => {
    if (!user) {
      setMemoryIdToken(null);
      setSession(null);
      setLoading(false);
      return null;
    }
    try {
      const token = await user.getIdToken();
      setMemoryIdToken(token);
      const data = await fetchMySession();
      setSession(data);
      setAuthError(null);
      return data;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "账号会话校验失败，请重试登录。");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (user) => {
      setFirebaseUser(user);
      void loadBackendSession(user);
    });
    return () => unsubscribe();
  }, [loadBackendSession]);

  const refreshSession = useCallback(async () => {
    if (!auth.currentUser) {
      setSession(null);
      return null;
    }
    return await loadBackendSession(auth.currentUser);
  }, [loadBackendSession]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      await loadBackendSession(cred.user);
    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : "登录取消或失败";
      if (!msg.includes("popup-closed-by-user")) {
        setAuthError(msg);
      }
    }
  }, [loadBackendSession]);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    setMemoryIdToken(null);
    setSession(null);
    await signOut(auth);
  }, []);

  const claimInitialAdmin = useCallback(async () => {
    await claimFirstAdminApi();
    await refreshSession();
  }, [refreshSession]);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        session,
        loading,
        authError,
        clearAuthError: () => setAuthError(null),
        signInWithGoogle,
        signOutUser,
        refreshSession,
        claimInitialAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

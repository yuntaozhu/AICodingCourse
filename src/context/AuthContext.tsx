import {
  useCallback,
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
  loginWithEmail as loginWithEmailApi,
  type AuthSessionData,
} from "@/lib/apiClient";
import { getMemoryIdToken, setMemoryIdToken } from "@/lib/authTokenStore";
import { auth, googleAuthProvider } from "@/lib/firebase";
import { AuthContext } from "./authContextCore";

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
    const existingToken = getMemoryIdToken();
    if (existingToken) {
      void loadBackendSession(null).then(async () => {
        try {
          const data = await fetchMySession();
          setSession(data);
          setAuthError(null);
        } catch {
          setMemoryIdToken(null);
          setSession(null);
        } finally {
          setLoading(false);
        }
      });
    } else {
      const unsubscribe = onIdTokenChanged(auth, (user) => {
        setFirebaseUser(user);
        void loadBackendSession(user);
      });
      return () => unsubscribe();
    }
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

  const signInWithEmail = useCallback(async (email: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await loginWithEmailApi(email);
      setMemoryIdToken(res.token);
      const data = await fetchMySession();
      setSession(data);
      setAuthError(null);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "邮箱登录失败");
    } finally {
      setLoading(false);
    }
  }, []);

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
        signInWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

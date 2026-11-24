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
  requestEmailOtpApi,
  verifyEmailOtpApi,
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
    let cancelled = false;
    const existingToken = getMemoryIdToken();
    if (existingToken) {
      void fetchMySession()
        .then((data) => {
          if (cancelled) return;
          setSession(data);
          setAuthError(null);
        })
        .catch(() => {
          if (cancelled) return;
          setMemoryIdToken(null);
          setSession(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    const unsubscribe = onIdTokenChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        void loadBackendSession(user);
      } else if (!getMemoryIdToken()) {
        setSession(null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [loadBackendSession]);

  const refreshSession = useCallback(async () => {
    if (auth.currentUser) {
      return await loadBackendSession(auth.currentUser);
    }
    if (getMemoryIdToken()) {
      try {
        const data = await fetchMySession();
        setSession(data);
        setAuthError(null);
        return data;
      } catch (err) {
        setMemoryIdToken(null);
        setSession(null);
        setAuthError(err instanceof Error ? err.message : "会话已过期，请重新登录。");
        return null;
      }
    }
    setSession(null);
    return null;
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

  const requestEmailOtp = useCallback(async (email: string) => {
    setAuthError(null);
    try {
      const res = await requestEmailOtpApi(email);
      return {
        deliveryMode: res.deliveryMode,
        cooldownSeconds: res.cooldownSeconds,
        devPreviewCode: res.devPreviewCode,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "发送邮箱验证码失败";
      setAuthError(msg);
      throw err;
    }
  }, []);

  const verifyEmailOtp = useCallback(async (email: string, code: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await verifyEmailOtpApi(email, code);
      setMemoryIdToken(res.token);
      const data = await fetchMySession();
      setSession(data);
      setAuthError(null);
    } catch (err) {
      setMemoryIdToken(null);
      const msg = err instanceof Error ? err.message : "验证码校验失败";
      setAuthError(msg);
      throw err;
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
        requestEmailOtp,
        verifyEmailOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

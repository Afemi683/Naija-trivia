import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isGuest: boolean;
  /** True when the user entered guest mode automatically due to no network. */
  isOfflineGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  /** Attempt to re-authenticate with a stored token (called on reconnect). */
  tryRestoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "naija_trivia_auth_token";
const GUEST_KEY = "naija_trivia_guest_mode";

const API_BASE = "";

async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const data: unknown = await res.json();
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && "error" in data
        ? String((data as Record<string, unknown>).error)
        : "Request failed";
    throw new Error(msg);
  }
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isOfflineGuest, setIsOfflineGuest] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, guestFlag] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(GUEST_KEY),
        ]);

        if (guestFlag === "true") {
          setIsGuest(true);
          setIsLoading(false);
          return;
        }

        if (storedToken) {
          try {
            const data = await apiFetch("/api/auth/me", {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            const { user: u } = data as { user: AuthUser };
            setUser(u);
            setToken(storedToken);
          } catch (err) {
            const isNetworkError = isOfflineError(err);
            if (isNetworkError) {
              // Network unavailable — keep the token stored and enter offline
              // guest mode so the app still loads.  On reconnect, tryRestoreSession
              // will pick this up and re-authenticate silently.
              setIsOfflineGuest(true);
              setIsGuest(true);
            } else {
              // Token is genuinely invalid — clear it.
              await AsyncStorage.removeItem(TOKEN_KEY);
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /** Silently re-authenticate using a stored token (e.g. after reconnect). */
  const tryRestoreSession = useCallback(async () => {
    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
    if (!storedToken) return;
    try {
      const data = await apiFetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      const { user: u } = data as { user: AuthUser };
      setUser(u);
      setToken(storedToken);
      setIsGuest(false);
      setIsOfflineGuest(false);
    } catch {
      // Still offline or token expired — leave state as-is.
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const { token: t, user: u } = data as { token: string; user: AuthUser };
    await AsyncStorage.setItem(TOKEN_KEY, t);
    await AsyncStorage.removeItem(GUEST_KEY);
    setToken(t);
    setUser(u);
    setIsGuest(false);
    setIsOfflineGuest(false);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      const { token: t, user: u } = data as { token: string; user: AuthUser };
      await AsyncStorage.setItem(TOKEN_KEY, t);
      await AsyncStorage.removeItem(GUEST_KEY);
      setToken(t);
      setUser(u);
      setIsGuest(false);
      setIsOfflineGuest(false);
    },
    []
  );

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, GUEST_KEY]);
    setToken(null);
    setUser(null);
    setIsGuest(false);
    setIsOfflineGuest(false);
  }, []);

  const continueAsGuest = useCallback(() => {
    AsyncStorage.setItem(GUEST_KEY, "true").catch(() => null);
    setIsGuest(true);
    setIsOfflineGuest(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isGuest,
        isOfflineGuest,
        login,
        register,
        logout,
        continueAsGuest,
        tryRestoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Heuristic: is this error likely a network/connectivity failure? */
function isOfflineError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("failed to fetch") ||
    msg.includes("econnrefused") ||
    msg.includes("etimedout") ||
    msg.includes("network request failed")
  );
}

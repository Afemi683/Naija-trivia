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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
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
          } catch {
            await AsyncStorage.removeItem(TOKEN_KEY);
          }
        }
      } finally {
        setIsLoading(false);
      }
    })();
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
    },
    []
  );

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, GUEST_KEY]);
    setToken(null);
    setUser(null);
    setIsGuest(false);
  }, []);

  const continueAsGuest = useCallback(() => {
    AsyncStorage.setItem(GUEST_KEY, "true").catch(() => null);
    setIsGuest(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isGuest,
        login,
        register,
        logout,
        continueAsGuest,
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

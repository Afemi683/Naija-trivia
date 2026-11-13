import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export interface AuthUser {
  id: string;
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
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  tryRestoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const GUEST_KEY = "naija_trivia_guest_mode";
const LOCAL_USER_KEY = "naija_trivia_local_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isOfflineGuest, setIsOfflineGuest] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const guestFlag = await AsyncStorage.getItem(GUEST_KEY);
        if (guestFlag === "true") {
          setIsGuest(true);
          setIsLoading(false);
          return;
        }

        if (isSupabaseConfigured) {
          // Check Supabase active session
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session && !error) {
            const rawUser = session.user;
            const displayName =
              rawUser.user_metadata?.name ||
              rawUser.user_metadata?.full_name ||
              rawUser.email?.split("@")[0] ||
              "Naija Explorer";

            setUser({
              id: rawUser.id,
              email: rawUser.email || "",
              name: displayName,
            });
            setToken(session.access_token);
            setIsGuest(false);
          }
        } else {
          // Offline/Demo fallback if custom credentials aren't plugged in yet
          const localUserStr = await AsyncStorage.getItem(LOCAL_USER_KEY);
          if (localUserStr) {
            try {
              const parsed = JSON.parse(localUserStr);
              setUser(parsed);
              setToken("local-demo-token");
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        setIsOfflineGuest(true);
        setIsGuest(true);
      } finally {
        setIsLoading(false);
      }
    })();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session) {
            const rawUser = session.user;
            const displayName =
              rawUser.user_metadata?.name ||
              rawUser.user_metadata?.full_name ||
              rawUser.email?.split("@")[0] ||
              "Naija Explorer";

            setUser({
              id: rawUser.id,
              email: rawUser.email || "",
              name: displayName,
            });
            setToken(session.access_token);
            setIsGuest(false);
            setIsOfflineGuest(false);
          } else {
            setUser(null);
            setToken(null);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user && data.session) {
        const displayName =
          data.user.user_metadata?.name ||
          data.user.user_metadata?.full_name ||
          data.user.email?.split("@")[0] ||
          "Naija Explorer";

        const authUser: AuthUser = {
          id: data.user.id,
          name: displayName,
          email: data.user.email || email,
        };
        setUser(authUser);
        setToken(data.session.access_token);
        await AsyncStorage.removeItem(GUEST_KEY);
        setIsGuest(false);
        setIsOfflineGuest(false);
      }
    } else {
      // Demo / Local authentication mode
      const authUser: AuthUser = {
        id: "local-" + Date.now(),
        name: email.split("@")[0],
        email: email.toLowerCase(),
      };
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser));
      await AsyncStorage.removeItem(GUEST_KEY);
      setUser(authUser);
      setToken("local-token");
      setIsGuest(false);
      setIsOfflineGuest(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name.trim() },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            name: name.trim(),
            email: data.user.email || email,
          };
          setUser(authUser);
          if (data.session) {
            setToken(data.session.access_token);
          }
          await AsyncStorage.removeItem(GUEST_KEY);
          setIsGuest(false);
          setIsOfflineGuest(false);
        }
      } else {
        const authUser: AuthUser = {
          id: "local-" + Date.now(),
          name: name.trim(),
          email: email.toLowerCase(),
        };
        await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser));
        await AsyncStorage.removeItem(GUEST_KEY);
        setUser(authUser);
        setToken("local-token");
        setIsGuest(false);
        setIsOfflineGuest(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    await AsyncStorage.multiRemove([GUEST_KEY, LOCAL_USER_KEY]);
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

  const tryRestoreSession = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const rawUser = session.user;
          setUser({
            id: rawUser.id,
            email: rawUser.email || "",
            name:
              rawUser.user_metadata?.name ||
              rawUser.user_metadata?.full_name ||
              rawUser.email?.split("@")[0] ||
              "Naija Explorer",
          });
          setToken(session.access_token);
          setIsGuest(false);
          setIsOfflineGuest(false);
        }
      } catch {
        // keep current state
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isGuest,
        isOfflineGuest,
        isConfigured: isSupabaseConfigured,
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

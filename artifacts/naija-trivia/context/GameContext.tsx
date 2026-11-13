import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Category } from "@/data/questions";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export interface LeaderboardEntry {
  id: string;
  category: Category;
  score: number;
  totalQuestions: number;
  streak: number;
  date: string;
  timeMs: number;
  /** True when recorded offline and pending sync to Supabase */
  pendingSync?: boolean;
  offlineMode?: boolean;
}

export interface DailyRecord {
  date: string;
  score: number;
  total: number;
  completed: boolean;
}

export interface DailyState {
  streak: number;
  longestStreak: number;
  history: DailyRecord[];
}

interface GameContextValue {
  leaderboard: LeaderboardEntry[];
  addEntry: (
    entry: Omit<LeaderboardEntry, "id">,
    options?: { offline?: boolean }
  ) => Promise<void>;
  clearLeaderboard: () => Promise<void>;
  getBestForCategory: (category: Category) => LeaderboardEntry | null;
  daily: DailyState;
  completeDailyChallenge: (
    date: string,
    score: number,
    total: number
  ) => Promise<void>;
  hasDailyBeenPlayed: (date: string) => boolean;
  pendingSyncCount: number;
  flushSyncQueue: () => Promise<void>;
  fetchCloudLeaderboard: (category?: Category | "all") => Promise<any[]>;
}

const GameContext = createContext<GameContextValue | null>(null);

const LEADERBOARD_KEY = "naija_trivia_leaderboard";
const DAILY_KEY = "naija_trivia_daily";

const DEFAULT_DAILY: DailyState = { streak: 0, longestStreak: 0, history: [] };

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [daily, setDaily] = useState<DailyState>(DEFAULT_DAILY);
  const leaderboardRef = useRef<LeaderboardEntry[]>([]);

  useEffect(() => {
    leaderboardRef.current = leaderboard;
  }, [leaderboard]);

  useEffect(() => {
    AsyncStorage.multiGet([LEADERBOARD_KEY, DAILY_KEY]).then((pairs) => {
      const [lbPair, dailyPair] = pairs;
      if (lbPair[1]) {
        try {
          const parsed = JSON.parse(lbPair[1]) as LeaderboardEntry[];
          setLeaderboard(parsed);
        } catch { /* ignore */ }
      }
      if (dailyPair[1]) {
        try { setDaily(JSON.parse(dailyPair[1])); } catch { /* ignore */ }
      }
    });
  }, []);

  const pendingSyncCount = leaderboard.filter((e) => e.pendingSync).length;

  const addEntry = useCallback(
    async (
      entry: Omit<LeaderboardEntry, "id">,
      options?: { offline?: boolean }
    ) => {
      const isOffline = options?.offline ?? false;
      let pendingSync = isOffline;

      // If online and Supabase is configured, record directly to Supabase
      if (!isOffline && isSupabaseConfigured) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          const { error } = await supabase.from("quiz_scores").insert({
            user_id: user?.id ?? null,
            category: entry.category,
            score: entry.score,
            total_questions: entry.totalQuestions,
            streak: entry.streak,
            time_ms: entry.timeMs,
          });

          if (!error) {
            pendingSync = false;
          } else {
            pendingSync = true;
          }
        } catch {
          pendingSync = true;
        }
      }

      const newEntry: LeaderboardEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        pendingSync,
        offlineMode: entry.offlineMode ?? isOffline,
      };

      const updated = [newEntry, ...leaderboardRef.current].slice(0, 50);
      setLeaderboard(updated);
      leaderboardRef.current = updated;
      await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    },
    []
  );

  const clearLeaderboard = useCallback(async () => {
    setLeaderboard([]);
    leaderboardRef.current = [];
    await AsyncStorage.removeItem(LEADERBOARD_KEY);
  }, []);

  const getBestForCategory = useCallback(
    (category: Category): LeaderboardEntry | null => {
      const filtered = leaderboard.filter((e) => e.category === category);
      if (filtered.length === 0) return null;
      return filtered.reduce((best, cur) =>
        cur.score > best.score ? cur : best
      );
    },
    [leaderboard]
  );

  const hasDailyBeenPlayed = useCallback(
    (date: string) => daily.history.some((r) => r.date === date && r.completed),
    [daily]
  );

  const completeDailyChallenge = useCallback(
    async (date: string, score: number, total: number) => {
      const newRecord: DailyRecord = { date, score, total, completed: true };
      const existingHistory = daily.history.filter((r) => r.date !== date);
      const updatedHistory = [newRecord, ...existingHistory].slice(0, 365);

      let streak = 0;
      const today = new Date(date);
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split("T")[0];
        const found = updatedHistory.find((r) => r.date === ds && r.completed);
        if (found) { streak++; } else { break; }
      }
      const longestStreak = Math.max(streak, daily.longestStreak);
      const updated: DailyState = { streak, longestStreak, history: updatedHistory };
      setDaily(updated);
      await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(updated));

      // Sync to Supabase daily_challenges table if online
      if (isSupabaseConfigured) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.from("daily_challenges").insert({
            user_id: user?.id ?? null,
            date,
            score,
            total,
            completed: true,
          });
        } catch {
          // handled gracefully
        }
      }
    },
    [daily]
  );

  /**
   * Batch flushes pending offline entries to Supabase.
   */
  const flushSyncQueue = useCallback(async () => {
    const pending = leaderboardRef.current.filter((e) => e.pendingSync);
    if (pending.length === 0) return;

    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from("quiz_scores").insert(
          pending.map((p) => ({
            user_id: user?.id ?? null,
            category: p.category,
            score: p.score,
            total_questions: p.totalQuestions,
            streak: p.streak,
            time_ms: p.timeMs,
          }))
        );

        if (error) {
          return;
        }
      } catch {
        return;
      }
    }

    const cleared = leaderboardRef.current.map((e) =>
      e.pendingSync ? { ...e, pendingSync: false } : e
    );
    setLeaderboard(cleared);
    leaderboardRef.current = cleared;
    await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(cleared));
  }, []);

  /**
   * Fetches the global Supabase leaderboard if configured.
   */
  const fetchCloudLeaderboard = useCallback(async (cat?: Category | "all") => {
    if (!isSupabaseConfigured) return [];
    try {
      let query = supabase
        .from("quiz_scores")
        .select("id, category, score, total_questions, streak, time_ms, created_at, profiles(username, full_name)")
        .order("score", { ascending: false })
        .limit(50);

      if (cat && cat !== "all") {
        query = query.eq("category", cat);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        leaderboard,
        addEntry,
        clearLeaderboard,
        getBestForCategory,
        daily,
        completeDailyChallenge,
        hasDailyBeenPlayed,
        pendingSyncCount,
        flushSyncQueue,
        fetchCloudLeaderboard,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

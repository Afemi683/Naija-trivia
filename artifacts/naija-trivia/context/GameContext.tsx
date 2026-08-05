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

export interface LeaderboardEntry {
  id: string;
  category: Category;
  score: number;
  totalQuestions: number;
  streak: number;
  date: string;
  timeMs: number;
  /** True when this entry was recorded while offline and hasn't been
   *  confirmed by the server yet.  Cleared on the next sync. */
  pendingSync?: boolean;
  /** Whether questions came from the offline question bank. */
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
  /** Number of entries waiting to be synced to the server. */
  pendingSyncCount: number;
  /** Call this when the network comes back online. */
  flushSyncQueue: () => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

const LEADERBOARD_KEY = "naija_trivia_leaderboard";
const DAILY_KEY = "naija_trivia_daily";

const DEFAULT_DAILY: DailyState = { streak: 0, longestStreak: 0, history: [] };

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [daily, setDaily] = useState<DailyState>(DEFAULT_DAILY);
  // Keep a ref in sync so flushSyncQueue always sees the latest state
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
      const newEntry: LeaderboardEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        pendingSync: options?.offline ?? false,
        offlineMode: entry.offlineMode ?? options?.offline ?? false,
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
    },
    [daily]
  );

  /**
   * Called when network comes back online.
   * Right now it just marks all pending entries as synced locally.
   * Swap in a real API call here when the server exposes a /api/sync endpoint.
   */
  const flushSyncQueue = useCallback(async () => {
    const pending = leaderboardRef.current.filter((e) => e.pendingSync);
    if (pending.length === 0) return;

    // TODO: POST pending to /api/sync when the endpoint exists.
    // For now, optimistically mark them as synced.
    const cleared = leaderboardRef.current.map((e) =>
      e.pendingSync ? { ...e, pendingSync: false } : e
    );
    setLeaderboard(cleared);
    leaderboardRef.current = cleared;
    await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(cleared));
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

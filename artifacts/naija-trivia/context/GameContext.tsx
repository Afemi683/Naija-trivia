import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  addEntry: (entry: Omit<LeaderboardEntry, "id">) => Promise<void>;
  clearLeaderboard: () => Promise<void>;
  getBestForCategory: (category: Category) => LeaderboardEntry | null;
  daily: DailyState;
  completeDailyChallenge: (date: string, score: number, total: number) => Promise<void>;
  hasDailyBeenPlayed: (date: string) => boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

const LEADERBOARD_KEY = "naija_trivia_leaderboard";
const DAILY_KEY = "naija_trivia_daily";

const DEFAULT_DAILY: DailyState = { streak: 0, longestStreak: 0, history: [] };

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [daily, setDaily] = useState<DailyState>(DEFAULT_DAILY);

  useEffect(() => {
    AsyncStorage.multiGet([LEADERBOARD_KEY, DAILY_KEY]).then((pairs) => {
      const [lbPair, dailyPair] = pairs;
      if (lbPair[1]) {
        try { setLeaderboard(JSON.parse(lbPair[1])); } catch { /* ignore */ }
      }
      if (dailyPair[1]) {
        try { setDaily(JSON.parse(dailyPair[1])); } catch { /* ignore */ }
      }
    });
  }, []);

  const addEntry = useCallback(
    async (entry: Omit<LeaderboardEntry, "id">) => {
      const newEntry: LeaderboardEntry = {
        ...entry,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      const updated = [newEntry, ...leaderboard].slice(0, 50);
      setLeaderboard(updated);
      await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
    },
    [leaderboard]
  );

  const clearLeaderboard = useCallback(async () => {
    setLeaderboard([]);
    await AsyncStorage.removeItem(LEADERBOARD_KEY);
  }, []);

  const getBestForCategory = useCallback(
    (category: Category): LeaderboardEntry | null => {
      const filtered = leaderboard.filter((e) => e.category === category);
      if (filtered.length === 0) return null;
      return filtered.reduce((best, cur) => (cur.score > best.score ? cur : best));
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

      // Calculate streak
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

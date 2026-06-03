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

interface GameContextValue {
  leaderboard: LeaderboardEntry[];
  addEntry: (entry: Omit<LeaderboardEntry, "id">) => Promise<void>;
  clearLeaderboard: () => Promise<void>;
  getBestForCategory: (category: Category) => LeaderboardEntry | null;
}

const GameContext = createContext<GameContextValue | null>(null);

const STORAGE_KEY = "naija_trivia_leaderboard";

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setLeaderboard(JSON.parse(raw));
        } catch {
          setLeaderboard([]);
        }
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
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [leaderboard]
  );

  const clearLeaderboard = useCallback(async () => {
    setLeaderboard([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
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

  return (
    <GameContext.Provider
      value={{ leaderboard, addEntry, clearLeaderboard, getBestForCategory }}
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

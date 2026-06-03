import { Question, questions } from "./questions";

export const DAILY_QUESTION_COUNT = 5;

/**
 * Deterministically pick questions for a given date string (YYYY-MM-DD).
 * Same date always yields the same set of questions.
 */
export function getDailyQuestions(dateStr: string): Question[] {
  // Simple deterministic shuffle using date as seed
  const seed = dateStr
    .replace(/-/g, "")
    .split("")
    .reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 1), 0);

  const seededRandom = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  const indexed = questions.map((q, i) => ({ q, sort: seededRandom(i) }));
  indexed.sort((a, b) => a.sort - b.sort);

  // Ensure category spread: try to get at least 1 from each category
  const history = indexed.map((x) => x.q);
  const byCategory: Record<string, Question[]> = {};
  for (const q of history) {
    byCategory[q.category] = byCategory[q.category] ?? [];
    byCategory[q.category].push(q);
  }

  const result: Question[] = [];
  const cats = ["history", "geography", "current-affairs"] as const;
  for (const cat of cats) {
    const pool = byCategory[cat] ?? [];
    if (pool.length > 0) result.push(pool[0]);
    if (result.length >= DAILY_QUESTION_COUNT) break;
  }

  // Fill remaining slots with next from shuffled pool (not already picked)
  for (const q of history) {
    if (result.length >= DAILY_QUESTION_COUNT) break;
    if (!result.includes(q)) result.push(q);
  }

  return result.slice(0, DAILY_QUESTION_COUNT);
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/** Returns an array of the last N days as YYYY-MM-DD strings, newest first */
export function getLastNDates(n: number): string[] {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });
}

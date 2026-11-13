import type { Question } from "./question-types";
import { questions } from "./questions";

export const DAILY_QUESTION_COUNT = 20;

/**
 * Deterministically pick questions for a given date string (YYYY-MM-DD).
 * Same date always yields the same set of questions — 20 mixed across all categories.
 */
export function getDailyQuestions(dateStr: string): Question[] {
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
  const shuffled = indexed.map((x) => x.q);

  // Ensure balanced category spread: ~7 history, ~7 geography, ~6 current-affairs
  const byCategory: Record<string, Question[]> = {};
  for (const q of shuffled) {
    byCategory[q.category] = byCategory[q.category] ?? [];
    byCategory[q.category].push(q);
  }

  const result: Question[] = [];
  const targets: [string, number][] = [
    ["history", 7],
    ["geography", 7],
    ["current-affairs", 6],
  ];

  for (const [cat, count] of targets) {
    const pool = byCategory[cat] ?? [];
    result.push(...pool.slice(0, count));
  }

  // Fill any remaining slots
  for (const q of shuffled) {
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

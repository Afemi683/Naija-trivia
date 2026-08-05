/**
 * Offline question bank — a small, fixed set of curated questions per category
 * bundled with the app. Always available with no network connection.
 * 10 questions per category = 30 total.
 */
import type { Question } from "./question-types";

// We pick deterministic slices from the full question files.
// Importing specific question arrays keeps the bundle tight.
import { historyQuestions } from "./history-questions";
import { geographyQuestions } from "./geography-questions";
import { currentAffairsQuestions } from "./current-affairs-questions";

// Fixed indices chosen to cover a range of difficulty levels.
const OFFLINE_COUNT = 10;

function pickOffline(pool: Question[]): Question[] {
  // Spread evenly across the pool rather than always taking the first 10.
  const step = Math.floor(pool.length / OFFLINE_COUNT);
  return Array.from({ length: OFFLINE_COUNT }, (_, i) => pool[i * step]);
}

export const offlineHistoryQuestions: Question[] = pickOffline(historyQuestions);
export const offlineGeographyQuestions: Question[] = pickOffline(geographyQuestions);
export const offlineCurrentAffairsQuestions: Question[] = pickOffline(currentAffairsQuestions);

export const offlineQuestions: Question[] = [
  ...offlineHistoryQuestions,
  ...offlineGeographyQuestions,
  ...offlineCurrentAffairsQuestions,
];

export function getOfflineQuestions(category: string): Question[] {
  switch (category) {
    case "history":         return offlineHistoryQuestions;
    case "geography":       return offlineGeographyQuestions;
    case "current-affairs": return offlineCurrentAffairsQuestions;
    default:                return offlineHistoryQuestions;
  }
}

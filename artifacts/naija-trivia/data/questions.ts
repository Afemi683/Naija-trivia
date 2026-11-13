export type { Category, Difficulty, Question } from "./question-types";
export { CATEGORIES } from "./question-types";
import type { Category, Question } from "./question-types";
import { historyQuestions } from "./history-questions";
import { geographyQuestions } from "./geography-questions";
import { currentAffairsQuestions } from "./current-affairs-questions";

export const questions: Question[] = [
  ...historyQuestions,
  ...geographyQuestions,
  ...currentAffairsQuestions,
];

export function getQuestionsByCategory(category: Category): Question[] {
  return questions.filter((q) => q.category === category);
}

export function getRandomQuestions(category: Category, count: number = 10): Question[] {
  const pool = getQuestionsByCategory(category);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export type Category = "history" | "geography" | "current-affairs";
export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: Category;
  difficulty: Difficulty;
  explanation?: string;
}

export const CATEGORIES: Record<Category, { label: string; icon: string; description: string; color: string }> = {
  history: {
    label: "History",
    icon: "book",
    description: "From ancient kingdoms to independence",
    color: "#8B5CF6",
  },
  geography: {
    label: "Geography",
    icon: "map",
    description: "States, rivers, and landmarks",
    color: "#0EA5E9",
  },
  "current-affairs": {
    label: "Current Affairs",
    icon: "trending-up",
    description: "Modern Nigeria and the world",
    color: "#E9A012",
  },
};

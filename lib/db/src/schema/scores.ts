import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const quizScoresTable = pgTable("quiz_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  category: text("category").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  streak: integer("streak").notNull().default(0),
  timeMs: integer("time_ms").notNull().default(0),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuizScoreSchema = createInsertSchema(quizScoresTable).omit({
  id: true,
  date: true,
});

export type InsertQuizScore = z.infer<typeof insertQuizScoreSchema>;
export type QuizScore = typeof quizScoresTable.$inferSelect;

export const dailyChallengesTable = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  date: text("date").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  completed: boolean("completed").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallengesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type DailyChallenge = typeof dailyChallengesTable.$inferSelect;

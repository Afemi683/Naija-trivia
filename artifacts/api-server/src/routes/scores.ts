import { Router } from "express";
import { db, quizScoresTable, dailyChallengesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import jwt from "jsonwebtoken";

const router = Router();

function getOptionalUserId(authHeader?: string): number | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return null;
    const payload = jwt.verify(token, secret) as { userId: number };
    return payload.userId ?? null;
  } catch {
    return null;
  }
}

// POST /api/scores - Record a completed quiz score to Neon database
router.post("/", async (req, res) => {
  const schema = z.object({
    category: z.string(),
    score: z.number().int().min(0),
    totalQuestions: z.number().int().min(1),
    streak: z.number().int().min(0).default(0),
    timeMs: z.number().int().min(0).default(0),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid score payload", details: parsed.error.issues });
    return;
  }

  const userId = getOptionalUserId(req.headers.authorization);

  try {
    const [entry] = await db
      .insert(quizScoresTable)
      .values({
        userId,
        category: parsed.data.category,
        score: parsed.data.score,
        totalQuestions: parsed.data.totalQuestions,
        streak: parsed.data.streak,
        timeMs: parsed.data.timeMs,
      })
      .returning();

    res.status(201).json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: "Failed to record score" });
  }
});

// GET /api/scores/leaderboard - Fetch top scores from Neon database
router.get("/leaderboard", async (req, res) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    let query = db.select().from(quizScoresTable);

    const scores = category && category !== "all"
      ? await db.select().from(quizScoresTable).where(eq(quizScoresTable.category, category)).orderBy(desc(quizScoresTable.score)).limit(50)
      : await db.select().from(quizScoresTable).orderBy(desc(quizScoresTable.score)).limit(50);

    res.json({ leaderboard: scores });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// POST /api/scores/sync - Sync multiple pending scores in batch
router.post("/sync", async (req, res) => {
  const schema = z.object({
    scores: z.array(
      z.object({
        category: z.string(),
        score: z.number().int(),
        totalQuestions: z.number().int(),
        streak: z.number().int().default(0),
        timeMs: z.number().int().default(0),
      })
    ),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid sync payload" });
    return;
  }

  const userId = getOptionalUserId(req.headers.authorization);

  try {
    if (parsed.data.scores.length > 0) {
      await db.insert(quizScoresTable).values(
        parsed.data.scores.map((s) => ({
          userId,
          category: s.category,
          score: s.score,
          totalQuestions: s.totalQuestions,
          streak: s.streak,
          timeMs: s.timeMs,
        }))
      );
    }
    res.json({ success: true, count: parsed.data.scores.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to sync scores" });
  }
});

export default router;

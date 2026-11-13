import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function getJwtSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET env var is not set");
  return secret;
}

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const { name, email, password } = parsed.data;

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({ name: name.trim(), email: email.toLowerCase(), passwordHash })
    .returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email });

  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    getJwtSecret(),
    { expiresIn: "90d" }
  );

  logger.info({ userId: user.id }, "New user registered");
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    getJwtSecret(),
    { expiresIn: "90d" }
  );

  logger.info({ userId: user.id }, "User logged in");
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, getJwtSecret()) as {
      userId: number;
      email: string;
      name: string;
    };
    const [user] = await db
      .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json({ user });
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;

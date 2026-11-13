import pg from "pg";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

console.log("Connecting to Neon PostgreSQL to initialize database schema...");

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const schemaSql = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  streak INTEGER NOT NULL DEFAULT 0,
  time_ms INTEGER NOT NULL DEFAULT 0,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_challenges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_category ON quiz_scores(category);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_score ON quiz_scores(score DESC);
`;

try {
  await pool.query(schemaSql);
  console.log("✅ Database schema initialized successfully on Neon PostgreSQL!");

  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `);
  console.log("Tables in Neon database:", tables.rows.map(r => r.table_name));

  await pool.end();
  process.exit(0);
} catch (err) {
  console.error("❌ Schema initialization failed:", err);
  await pool.end();
  process.exit(1);
}

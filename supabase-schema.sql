-- ============================================================
-- GymTracker — Supabase Schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor)
-- ============================================================

-- 1. Workout Logs (treinos registados manualmente)
CREATE TABLE IF NOT EXISTS workout_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  date        TEXT        NOT NULL,            -- YYYY-MM-DD
  workout_type TEXT       NOT NULL,            -- amrap | emom | tabata | chipper | wod
  score       TEXT        NOT NULL DEFAULT '',
  notes       TEXT        NOT NULL DEFAULT '',
  description TEXT,                            -- WOD Livre: texto livre
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Olympic Lifting / Strength PRs
CREATE TABLE IF NOT EXISTS lift_entries (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lift       TEXT        NOT NULL,             -- key from LIFTS constant
  weight     NUMERIC     NOT NULL,             -- kg
  date       TEXT        NOT NULL,             -- YYYY-MM-DD
  notes      TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Benchmark WOD Records
CREATE TABLE IF NOT EXISTS benchmark_entries (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  wod        TEXT        NOT NULL,             -- key from BENCHMARK_WODS constant
  score      TEXT        NOT NULL,             -- time or reps
  date       TEXT        NOT NULL,             -- YYYY-MM-DD
  notes      TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Telegram Alerts (lembrete configurável por hora)
CREATE TABLE IF NOT EXISTS alerts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  message    TEXT        NOT NULL,
  send_time  TEXT        NOT NULL,             -- HH:MM (24h, e.g. "06:30")
  enabled    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Daily Completions (✅/❌ via Telegram inline buttons)
CREATE TABLE IF NOT EXISTS day_completions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  date       TEXT        NOT NULL UNIQUE,      -- YYYY-MM-DD, one record per day
  completed  BOOLEAN     NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Disable RLS (single-user personal app) ────────────────────────────────
ALTER TABLE workout_logs      DISABLE ROW LEVEL SECURITY;
ALTER TABLE lift_entries      DISABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts            DISABLE ROW LEVEL SECURITY;
ALTER TABLE day_completions   DISABLE ROW LEVEL SECURITY;

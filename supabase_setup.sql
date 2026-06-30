-- ============================================================
-- FreshStart Subscription System — Supabase SQL
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL UNIQUE,
  email       text,
  plan        text NOT NULL DEFAULT 'free',
  status      text NOT NULL DEFAULT 'active',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions (user_id);

-- 2. Daily usage table
CREATE TABLE IF NOT EXISTS daily_usage (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      text NOT NULL,
  date         date NOT NULL DEFAULT CURRENT_DATE,
  ats_checks   int NOT NULL DEFAULT 0,
  tailor_uses  int NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS daily_usage_user_date_idx ON daily_usage (user_id, date);

-- 3. Auto-update updated_at on subscriptions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Row Level Security
-- Service role bypasses RLS automatically. These policies allow
-- the anon key to read/write nothing (security via service-role only).
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage   ENABLE ROW LEVEL SECURITY;

-- Drop policies if they already exist (idempotent re-run)
DROP POLICY IF EXISTS "service_role_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "service_role_daily_usage"   ON daily_usage;

-- ============================================================
-- Atomic increment functions (avoids race conditions)
-- ============================================================

CREATE OR REPLACE FUNCTION increment_ats_checks(p_user_id text, p_date date)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_usage (user_id, date, ats_checks, tailor_uses)
    VALUES (p_user_id, p_date, 1, 0)
  ON CONFLICT (user_id, date)
  DO UPDATE SET ats_checks = daily_usage.ats_checks + 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_tailor_uses(p_user_id text, p_date date)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_usage (user_id, date, ats_checks, tailor_uses)
    VALUES (p_user_id, p_date, 0, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET tailor_uses = daily_usage.tailor_uses + 1;
END;
$$ LANGUAGE plpgsql;

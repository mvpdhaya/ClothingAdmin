-- ============================================================
-- Auto-Remove "NEW" Badge After 30 Days
-- ============================================================
-- 
-- Step 1: Create a PostgreSQL function that removes "NEW" from
--         the badges array for any product older than 30 days.
--
-- Step 2: Schedule it using pg_cron to run every day at midnight.
--
-- HOW TO RUN:
--   Go to your Supabase Dashboard > SQL Editor and paste + run this file.
-- ============================================================


-- ── STEP 1: Create the cleanup function ──────────────────────

CREATE OR REPLACE FUNCTION remove_expired_new_badges()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET badges = array_remove(badges, 'NEW')
  WHERE
    'NEW' = ANY(badges)
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$;


-- ── STEP 2: Enable pg_cron extension (if not already enabled) ─

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;


-- ── STEP 3: Schedule the function to run daily at midnight ────
--
-- This removes the "NEW" badge from any products that are
-- more than 30 days old. Job runs at 00:00 UTC every day.

SELECT cron.schedule(
  'remove-new-badges-daily',   -- unique job name
  '0 0 * * *',                 -- cron expression: every day at midnight UTC
  $$SELECT remove_expired_new_badges();$$
);


-- ── VERIFY THE JOB WAS CREATED ────────────────────────────────
-- Run this query to check the scheduled job exists:
-- SELECT * FROM cron.job WHERE jobname = 'remove-new-badges-daily';


-- ── TO MANUALLY TRIGGER (for testing) ────────────────────────
-- SELECT remove_expired_new_badges();

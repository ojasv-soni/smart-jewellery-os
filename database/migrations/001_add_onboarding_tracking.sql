-- Migration: Add onboarding_completed tracking to users table
-- This allows us to track which users have completed onboarding

ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for querying users who need onboarding
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding_completed);

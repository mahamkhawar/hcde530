/*
  # Add sessions column for multi-session support

  The table already exists without a session column. This adds the new
  multi-session array column directly.

  1. Changes
    - Add `sessions` column (jsonb array, default '[]')
*/

ALTER TABLE projects ADD COLUMN IF NOT EXISTS sessions jsonb NOT NULL DEFAULT '[]';

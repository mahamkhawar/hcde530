/*
  # Create projects table

  Stores all UX research project data including screens, golden paths, and session results.
  Data is shared across all browsers/devices, enabling moderator and participant links to work.

  1. New Tables
    - `projects`
      - `id` (text, primary key) — generated in client
      - `name` (text) — project display name
      - `created_at` (bigint) — Unix timestamp in ms
      - `screens` (jsonb) — array of Screen objects (id, label, imageDataUrl)
      - `golden_path` (jsonb) — array of GoldenPathStep objects
      - `session` (jsonb, nullable) — live session data (startTime, endTime, clickLog)

  2. Security
    - RLS enabled
    - Anon users can read/write all projects (public research tool, no personal data)
*/

CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  created_at bigint NOT NULL,
  screens jsonb NOT NULL DEFAULT '[]',
  golden_path jsonb NOT NULL DEFAULT '[]',
  session jsonb
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read projects"
  ON projects FOR SELECT
  TO anon
  USING (length(id) > 0);

CREATE POLICY "anon can insert projects"
  ON projects FOR INSERT
  TO anon
  WITH CHECK (length(id) > 0);

CREATE POLICY "anon can update projects"
  ON projects FOR UPDATE
  TO anon
  USING (length(id) > 0)
  WITH CHECK (length(id) > 0);

CREATE POLICY "anon can delete projects"
  ON projects FOR DELETE
  TO anon
  USING (length(id) > 0);

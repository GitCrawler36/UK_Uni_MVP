-- =============================================================
-- 002_add_official_course_url.sql
-- Add optional official course URL to programmes table
-- =============================================================

alter table programmes
  add column if not exists official_course_url text;

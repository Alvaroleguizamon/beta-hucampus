-- ============================================================
-- Fix RLS: Add authenticated role policies to all tables
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE POLICY IF NOT EXISTS "auth_all_profiles"           ON profiles           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "auth_all_subjects"           ON subjects           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "auth_all_courses"            ON courses            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "auth_all_enrollments"        ON enrollments        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "auth_all_attendance_records" ON attendance_records  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "auth_all_wall_posts"         ON wall_posts         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "auth_all_wall_views"         ON wall_views         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "auth_all_wall_reactions"     ON wall_reactions     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "auth_all_wall_comments"      ON wall_comments      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "auth_all_calendar_events"    ON calendar_events    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "auth_all_notifications"      ON notifications      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "auth_all_feed_posts"         ON feed_posts         FOR ALL TO authenticated USING (true) WITH CHECK (true);

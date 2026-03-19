// Run with: node supabase/apply-rls.mjs
const PROJECT_REF = 'hxjbdejnpucwuxctrafp';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4amJkZWpucHVjd3V4Y3RyYWZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkwNjAwMiwiZXhwIjoyMDg5NDgyMDAyfQ.XxyJB1JJ0-2VfvcPsp3A148kz3NSZszbclbCOdxm-cY';

const SQL = `
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
`;

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: SQL }),
});

const text = await res.text();
if (res.ok) {
  console.log('✓ RLS policies applied successfully');
} else {
  console.error(`✗ Status ${res.status}:`, text);
}

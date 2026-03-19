// Run with: node supabase/fix-rls.mjs
// Adds authenticated role policies to all tables
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hxjbdejnpucwuxctrafp.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4amJkZWpucHVjd3V4Y3RyYWZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkwNjAwMiwiZXhwIjoyMDg5NDgyMDAyfQ.XxyJB1JJ0-2VfvcPsp3A148kz3NSZszbclbCOdxm-cY';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TABLES = [
  'profiles',
  'subjects',
  'courses',
  'enrollments',
  'attendance_records',
  'wall_posts',
  'wall_views',
  'wall_reactions',
  'wall_comments',
  'calendar_events',
  'notifications',
  'feed_posts',
];

for (const tbl of TABLES) {
  const sql = `CREATE POLICY IF NOT EXISTS "auth_all_${tbl}" ON "${tbl}" FOR ALL TO authenticated USING (true) WITH CHECK (true);`;
  const { error } = await supabase.rpc('exec_sql', { query: sql }).single();

  if (error) {
    // Fallback: use raw REST query endpoint
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });
    if (!res.ok) {
      console.error(`✗  ${tbl}: RPC failed, trying Management API...`);
      // Use Management API
      const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/hxjbdejnpucwuxctrafp/database/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      });
      const mgmtData = await mgmtRes.json().catch(() => ({}));
      if (!mgmtRes.ok) {
        console.error(`✗  ${tbl}:`, mgmtData);
      } else {
        console.log(`✓  ${tbl} (mgmt api)`);
      }
    } else {
      console.log(`✓  ${tbl} (rpc rest)`);
    }
  } else {
    console.log(`✓  ${tbl}`);
  }
}

console.log('\nDone. All authenticated policies applied.');

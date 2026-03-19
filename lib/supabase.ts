import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = 'https://bvlskpkmtgxlhgvutczk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bHNrcGttdGd4bGhndnV0Y3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NTk2MDAsImV4cCI6MjA4OTUzNTYwMH0.492kJH_Aiw1HivpljjHLOFYWR9B8aLUbrQUoFBReETM';
const SUPABASE_SVC_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bHNrcGttdGd4bGhndnV0Y3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzk1OTYwMCwiZXhwIjoyMDg5NTM1NjAwfQ.rBBPWiRDawG4W7Q2jNFkmcAZLuhi1B5-pfH9veRoDbs';

// Client used by all stores (respects RLS via anon/user JWT)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client — bypasses RLS. Only used in auth-store for profile lookup.
// TODO: move profile lookup to a Supabase Edge Function before going to production.
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SVC_KEY, {
  auth: { autoRefreshToken: false, persistSession: false, storageKey: 'sb-admin-auth-token' },
});

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = 'https://hxjbdejnpucwuxctrafp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4amJkZWpucHVjd3V4Y3RyYWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MDYwMDIsImV4cCI6MjA4OTQ4MjAwMn0.Met5YgtG48V6MQy28g0mZ4_uJx_GDQVpPkiABbaLNU0';
const SUPABASE_SVC_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4amJkZWpucHVjd3V4Y3RyYWZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkwNjAwMiwiZXhwIjoyMDg5NDgyMDAyfQ.XxyJB1JJ0-2VfvcPsp3A148kz3NSZszbclbCOdxm-cY';

// Client used by all stores (respects RLS via anon/user JWT)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin client — bypasses RLS. Only used in auth-store for profile lookup.
// TODO: move profile lookup to a Supabase Edge Function before going to production.
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SVC_KEY, {
  auth: { autoRefreshToken: false, persistSession: false, storageKey: 'sb-admin-auth-token' },
});

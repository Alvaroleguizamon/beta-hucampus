import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hxjbdejnpucwuxctrafp.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4amJkZWpucHVjd3V4Y3RyYWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MDYwMDIsImV4cCI6MjA4OTQ4MjAwMn0.Met5YgtG48V6MQy28g0mZ4_uJx_GDQVpPkiABbaLNU0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Run with: node supabase/create-admin-user.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hxjbdejnpucwuxctrafp.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4amJkZWpucHVjd3V4Y3RyYWZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkwNjAwMiwiZXhwIjoyMDg5NDgyMDAyfQ.XxyJB1JJ0-2VfvcPsp3A148kz3NSZszbclbCOdxm-cY';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 1. Create auth user
const { data, error } = await supabase.auth.admin.createUser({
  email: 'admin@school.edu',
  password: 'Humand2026!',
  email_confirm: true,
});

if (error) {
  if (error.message?.includes('already been registered')) {
    console.log('⚠  Ya existe: admin@school.edu');
  } else {
    console.error('✗  Error auth:', error.message);
    process.exit(1);
  }
} else {
  console.log('✓  Auth user creado:', data.user.id);
}

// 2. Upsert profile with admin role
const { error: profileError } = await supabase
  .from('profiles')
  .upsert({ id: 'admin1', name: 'Administrador', email: 'admin@school.edu', role: 'admin' });

if (profileError) {
  console.error('✗  Error profile:', profileError.message);
} else {
  console.log('✓  Perfil admin creado/actualizado');
  console.log('\n  admin@school.edu / Humand2026!');
}

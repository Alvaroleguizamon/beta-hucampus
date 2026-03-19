// Run with: node supabase/create-auth-users.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hxjbdejnpucwuxctrafp.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4amJkZWpucHVjd3V4Y3RyYWZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkwNjAwMiwiZXhwIjoyMDg5NDgyMDAyfQ.XxyJB1JJ0-2VfvcPsp3A148kz3NSZszbclbCOdxm-cY';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_USERS = [
  { email: 'lucia@school.edu',    password: 'Humand2026!', label: 'Lucía Martínez (alumno)'   },
  { email: 'garcia@school.edu',   password: 'Humand2026!', label: 'Prof. García (docente)'     },
  { email: 'martinez@school.edu', password: 'Humand2026!', label: 'Prof. Martínez (docente)'   },
  { email: 'laura@mail.com',      password: 'Humand2026!', label: 'Laura González (padre)'     },
];

for (const user of TEST_USERS) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
  });

  if (error) {
    if (error.message?.includes('already been registered')) {
      console.log(`⚠  Ya existe: ${user.label}`);
    } else {
      console.error(`✗  Error en ${user.label}:`, error.message);
    }
  } else {
    console.log(`✓  Creado: ${user.label} (${data.user.id})`);
  }
}

console.log('\nListo. Usuarios disponibles:');
TEST_USERS.forEach(u => console.log(`  ${u.email} / ${u.password}`));

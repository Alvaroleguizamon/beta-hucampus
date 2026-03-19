-- ============================================================
-- Humand School — Auth Migration
-- Run in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- Step 1: Add auth_id column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- Step 2: Create test auth users and map to profiles
DO $$
DECLARE
  user_lucia    UUID := gen_random_uuid();
  user_garcia   UUID := gen_random_uuid();
  user_martinez UUID := gen_random_uuid();
  user_laura    UUID := gen_random_uuid();
BEGIN

  -- ── Lucía Martínez (alumno) ──────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, phone_change, phone_change_token
  ) VALUES (
    user_lucia, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'lucia@school.edu',
    crypt('Humand2026!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    NOW(), NOW(), '', '', '', '', '', ''
  );
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (
    'lucia@school.edu', user_lucia, user_lucia,
    json_build_object('sub', user_lucia::text, 'email', 'lucia@school.edu')::jsonb,
    'email', NOW(), NOW(), NOW()
  );

  -- ── Prof. García (docente) ───────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, phone_change, phone_change_token
  ) VALUES (
    user_garcia, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'garcia@school.edu',
    crypt('Humand2026!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    NOW(), NOW(), '', '', '', '', '', ''
  );
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (
    'garcia@school.edu', user_garcia, user_garcia,
    json_build_object('sub', user_garcia::text, 'email', 'garcia@school.edu')::jsonb,
    'email', NOW(), NOW(), NOW()
  );

  -- ── Prof. Martínez (docente) ─────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, phone_change, phone_change_token
  ) VALUES (
    user_martinez, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'martinez@school.edu',
    crypt('Humand2026!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    NOW(), NOW(), '', '', '', '', '', ''
  );
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (
    'martinez@school.edu', user_martinez, user_martinez,
    json_build_object('sub', user_martinez::text, 'email', 'martinez@school.edu')::jsonb,
    'email', NOW(), NOW(), NOW()
  );

  -- ── Laura González (padre) ───────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new,
    email_change, phone_change, phone_change_token
  ) VALUES (
    user_laura, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'laura@mail.com',
    crypt('Humand2026!', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    NOW(), NOW(), '', '', '', '', '', ''
  );
  INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (
    'laura@mail.com', user_laura, user_laura,
    json_build_object('sub', user_laura::text, 'email', 'laura@mail.com')::jsonb,
    'email', NOW(), NOW(), NOW()
  );

  -- ── Map auth users → profiles ────────────────────────────
  UPDATE profiles SET auth_id = user_lucia    WHERE id = 'u1';
  UPDATE profiles SET auth_id = user_garcia   WHERE id = 'doc1';
  UPDATE profiles SET auth_id = user_martinez WHERE id = 'doc2';
  UPDATE profiles SET auth_id = user_laura    WHERE id = 'p1';

END $$;

-- ============================================================
-- TEST USERS SUMMARY
-- ============================================================
-- alumno  → lucia@school.edu    / Humand2026!  (Lucía Martínez)
-- docente → garcia@school.edu   / Humand2026!  (Prof. García)
-- docente → martinez@school.edu / Humand2026!  (Prof. Martínez)
-- padre   → laura@mail.com      / Humand2026!  (Laura González)
-- ============================================================

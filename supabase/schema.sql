-- ============================================================
-- Humand School — Full Database Schema
-- Run this in the Supabase SQL Editor (project: hxjbdejnpucwuxctrafp)
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('alumno', 'docente', 'padre');
create type attendance_status as enum ('presente', 'ausente', 'tardanza');
create type event_type as enum ('examen', 'reunion', 'acto', 'feriado');
create type feed_category as enum ('comunicado', 'novedad', 'evento', 'urgente');
create type reaction_type as enum ('like', 'love', 'aplauso', 'sorpresa');
create type group_type as enum ('curso', 'materia', 'extracurricular', 'privado');
create type group_member_role as enum ('admin', 'miembro');
create type trip_type as enum ('excursion', 'campamento', 'egresados', 'salida');
create type trip_status as enum ('proximo', 'confirmado', 'finalizado');
create type authorization_status as enum ('pendiente', 'autorizado', 'no_requerido');
create type notification_type as enum ('tarea', 'comunicado', 'grupo', 'autorizacion', 'mensaje');
create type task_priority as enum ('alta', 'media', 'baja');
create type delivery_status as enum ('pendiente', 'entregado');

-- ============================================================
-- PROFILES (users)
-- ============================================================

create table profiles (
  id          text primary key,          -- matches mock IDs: u1, st1, doc1, etc.
  name        text not null,
  email       text,
  role        user_role not null,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- ============================================================
-- SUBJECTS
-- ============================================================

create table subjects (
  id         text primary key,
  name       text not null,
  teacher    text not null,
  color      text not null default '#5B77D3',
  created_at timestamptz default now()
);

-- ============================================================
-- COURSES
-- ============================================================

create table courses (
  id         text primary key,
  name       text not null,
  grade      text not null,
  subject_id text references subjects(id),
  created_at timestamptz default now()
);

-- Course enrollments (many-to-many students ↔ courses)
create table course_enrollments (
  course_id  text references courses(id) on delete cascade,
  student_id text references profiles(id) on delete cascade,
  primary key (course_id, student_id)
);

-- Parent ↔ child mapping
create table parent_children (
  parent_id  text references profiles(id) on delete cascade,
  child_id   text references profiles(id) on delete cascade,
  primary key (parent_id, child_id)
);

-- ============================================================
-- GRADES
-- ============================================================

create table grades (
  id           text primary key default gen_random_uuid()::text,
  subject_id   text references subjects(id),
  student_id   text references profiles(id),
  value        numeric(4,2) not null check (value >= 1 and value <= 10),
  description  text,
  period       text not null default '1er Trimestre',
  grade_date   date not null,
  created_at   timestamptz default now()
);

-- ============================================================
-- ATTENDANCE
-- ============================================================

create table attendance (
  id             text primary key default gen_random_uuid()::text,
  student_id     text references profiles(id),
  course_id      text references courses(id),
  attend_date    date not null,
  status         attendance_status not null,
  check_in_time  text,   -- HH:MM
  created_at     timestamptz default now(),
  unique (student_id, attend_date, course_id)
);

-- ============================================================
-- CALENDAR EVENTS
-- ============================================================

create table calendar_events (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  event_date  date not null,
  event_type  event_type not null,
  description text,
  subject_id  text references subjects(id),
  created_at  timestamptz default now()
);

-- ============================================================
-- COMMUNICATIONS (cuaderno digital / comunicados)
-- ============================================================

create table communications (
  id                    text primary key default gen_random_uuid()::text,
  title                 text not null,
  body                  text not null,
  author                text not null,
  course_id             text references courses(id),
  requires_confirmation boolean not null default false,
  created_at            timestamptz default now()
);

-- Per-user read/confirmed state
create table communication_reads (
  communication_id text references communications(id) on delete cascade,
  user_id          text references profiles(id) on delete cascade,
  read_at          timestamptz default now(),
  confirmed        boolean not null default false,
  primary key (communication_id, user_id)
);

-- ============================================================
-- WALL POSTS (muro general)
-- ============================================================

create table wall_posts (
  id          text primary key default gen_random_uuid()::text,
  author_id   text references profiles(id),
  author_name text not null,
  author_role user_role,
  text        text not null,
  image_url   text,
  post_date   date not null default current_date,
  group_id    text,   -- FK added after groups table
  group_name  text,
  created_at  timestamptz default now()
);

create table wall_reactions (
  post_id       text references wall_posts(id) on delete cascade,
  user_id       text references profiles(id) on delete cascade,
  reaction      reaction_type not null,
  primary key (post_id, user_id)
);

create table wall_comments (
  id          text primary key default gen_random_uuid()::text,
  post_id     text references wall_posts(id) on delete cascade,
  author_id   text references profiles(id),
  author_name text not null,
  text        text not null,
  comment_date date not null default current_date,
  created_at  timestamptz default now()
);

create table wall_views (
  post_id  text references wall_posts(id) on delete cascade,
  user_id  text references profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

-- ============================================================
-- GROUPS
-- ============================================================

create table groups (
  id              text primary key default gen_random_uuid()::text,
  name            text not null,
  description     text,
  group_type      group_type not null,
  created_by      text references profiles(id),
  created_by_name text not null,
  cover_color     text not null default '#5B77D3',
  is_automatic    boolean not null default false,
  created_at      timestamptz default now()
);

create table group_members (
  group_id    text references groups(id) on delete cascade,
  user_id     text references profiles(id) on delete cascade,
  user_name   text not null,
  member_role group_member_role not null default 'miembro',
  joined_at   date not null default current_date,
  primary key (group_id, user_id)
);

-- Group posts reuse wall_posts; add FK now that groups exists
alter table wall_posts
  add constraint wall_posts_group_id_fkey
  foreign key (group_id) references groups(id) on delete set null;

-- ============================================================
-- TASKS
-- ============================================================

create table tasks (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  course_id   text references courses(id),
  due_date    date not null,
  priority    task_priority not null default 'media',
  description text,
  is_draft    boolean not null default false,
  created_at  timestamptz default now()
);

create table task_attachments (
  id        text primary key default gen_random_uuid()::text,
  task_id   text references tasks(id) on delete cascade,
  type      text not null check (type in ('archivo', 'link')),
  name      text not null,
  url       text
);

create table task_deliveries (
  task_id          text references tasks(id) on delete cascade,
  student_id       text references profiles(id) on delete cascade,
  status           delivery_status not null default 'pendiente',
  submission_date  date,
  submission_content text,
  primary key (task_id, student_id)
);

-- ============================================================
-- TRIPS (viajes y salidas)
-- ============================================================

create table trips (
  id                   text primary key default gen_random_uuid()::text,
  title                text not null,
  trip_type            trip_type not null,
  trip_date            date not null,
  location             text not null,
  status               trip_status not null default 'proximo',
  horario_salida       text,
  horario_regreso      text,
  punto_encuentro      text,
  transporte           text,
  description          text,
  que_llevar           text[],
  authorization_required boolean not null default true,
  contact_emergency    text,
  created_at           timestamptz default now()
);

create table trip_attendees (
  trip_id        text references trips(id) on delete cascade,
  student_id     text references profiles(id) on delete cascade,
  authorized     boolean not null default false,
  authorized_by  text,
  auth_status    authorization_status not null default 'pendiente',
  primary key (trip_id, student_id)
);

-- ============================================================
-- CONVERSATIONS & MESSAGES (chat padres/alumnos)
-- ============================================================

create table conversations (
  id                   text primary key default gen_random_uuid()::text,
  participant_a        text references profiles(id),   -- who started it
  participant_b        text references profiles(id),   -- the other party
  last_message         text,
  last_message_date    date,
  created_at           timestamptz default now()
);

create table messages (
  id           text primary key default gen_random_uuid()::text,
  conversation_id text references conversations(id) on delete cascade,
  sender_id    text references profiles(id),
  sender_name  text not null,
  text         text not null,
  msg_date     date not null default current_date,
  msg_time     text not null,              -- HH:MM
  created_at   timestamptz default now()
);

-- Per-user unread count (simple approach: track last-read message per conversation per user)
create table conversation_reads (
  conversation_id text references conversations(id) on delete cascade,
  user_id         text references profiles(id) on delete cascade,
  last_read_at    timestamptz default now(),
  primary key (conversation_id, user_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table notifications (
  id             text primary key default gen_random_uuid()::text,
  notif_type     notification_type not null,
  title          text not null,
  body           text not null,
  notif_date     date not null default current_date,
  target_user_id text references profiles(id),
  target_role    user_role,
  deep_link      text,
  created_at     timestamptz default now()
);

create table notification_reads (
  notification_id text references notifications(id) on delete cascade,
  user_id         text references profiles(id) on delete cascade,
  read_at         timestamptz default now(),
  primary key (notification_id, user_id)
);

-- ============================================================
-- BIRTHDAYS
-- ============================================================

create table birthdays (
  id         text primary key default gen_random_uuid()::text,
  name       text not null,
  birth_date text not null,   -- MM-DD
  avatar_url text,
  grade      text not null
);

-- ============================================================
-- FEED POSTS (institutional wall / noticias)
-- ============================================================

create table feed_posts (
  id              text primary key default gen_random_uuid()::text,
  title           text not null,
  body            text not null,
  author          text not null,
  post_date       date not null,
  category        feed_category not null,
  image_url       text,
  target_audience text check (target_audience in ('todos','alumnos','docentes','padres')),
  pinned          boolean not null default false,
  created_at      timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (open for now — auth deferred)
-- Allow anon reads/writes for MVP stage
-- ============================================================

alter table profiles            enable row level security;
alter table subjects             enable row level security;
alter table courses              enable row level security;
alter table course_enrollments   enable row level security;
alter table parent_children      enable row level security;
alter table grades               enable row level security;
alter table attendance           enable row level security;
alter table calendar_events      enable row level security;
alter table communications       enable row level security;
alter table communication_reads  enable row level security;
alter table wall_posts           enable row level security;
alter table wall_reactions       enable row level security;
alter table wall_comments        enable row level security;
alter table wall_views           enable row level security;
alter table groups               enable row level security;
alter table group_members        enable row level security;
alter table tasks                enable row level security;
alter table task_attachments     enable row level security;
alter table task_deliveries      enable row level security;
alter table trips                enable row level security;
alter table trip_attendees       enable row level security;
alter table conversations        enable row level security;
alter table messages             enable row level security;
alter table conversation_reads   enable row level security;
alter table notifications        enable row level security;
alter table notification_reads   enable row level security;
alter table birthdays            enable row level security;
alter table feed_posts           enable row level security;

-- Temporary open policies (replace with auth-based policies later)
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'profiles','subjects','courses','course_enrollments','parent_children',
    'grades','attendance','calendar_events','communications','communication_reads',
    'wall_posts','wall_reactions','wall_comments','wall_views',
    'groups','group_members',
    'tasks','task_attachments','task_deliveries',
    'trips','trip_attendees',
    'conversations','messages','conversation_reads',
    'notifications','notification_reads',
    'birthdays','feed_posts'
  ] loop
    execute format('create policy "anon_all_%s" on %I for all to anon using (true) with check (true)', tbl, tbl);
  end loop;
end $$;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Profiles
insert into profiles (id, name, email, role) values
  ('u1',   'Lucía Martínez',   'lucia@school.edu',   'alumno'),
  ('st1',  'Juan Pérez',       'juan@school.edu',    'alumno'),
  ('st2',  'María González',   'maria@school.edu',   'alumno'),
  ('st3',  'Lucas Rodríguez',  'lucas@school.edu',   'alumno'),
  ('st4',  'Sofía Martínez',   'sofia@school.edu',   'alumno'),
  ('st5',  'Mateo López',      'mateo@school.edu',   'alumno'),
  ('st6',  'Valentina Díaz',   'vale@school.edu',    'alumno'),
  ('st7',  'Tomás Fernández',  'tomas@school.edu',   'alumno'),
  ('st8',  'Camila Ruiz',      'camila@school.edu',  'alumno'),
  ('st9',  'Agustina Torres',  'agus@school.edu',    'alumno'),
  ('st10', 'Nicolás Herrera',  'nico@school.edu',    'alumno'),
  ('st11', 'Florencia Castro', 'flor@school.edu',    'alumno'),
  ('st12', 'Ignacio Romero',   'igna@school.edu',    'alumno'),
  ('st13', 'Julieta Sánchez',  'juli@school.edu',    'alumno'),
  ('st14', 'Facundo Morales',  'facu@school.edu',    'alumno'),
  ('st15', 'Milagros Vega',    'mili@school.edu',    'alumno'),
  ('st16', 'Ezequiel Blanco',  'eze@school.edu',     'alumno'),
  ('st17', 'Rocío Mendoza',    'rocio@school.edu',   'alumno'),
  ('doc1', 'Prof. García',     'garcia@school.edu',  'docente'),
  ('doc2', 'Prof. Martínez',   'martinez@school.edu','docente'),
  ('dir1', 'Dirección',        'dir@school.edu',     'docente'),
  ('coord1','Coordinación',    'coord@school.edu',   'docente'),
  ('p1',   'Laura González',   'laura@mail.com',     'padre'),
  ('p2',   'Roberto Rodríguez','roberto@mail.com',   'padre'),
  ('p3',   'Ana Martínez',     'ana@mail.com',       'padre'),
  ('p4',   'Carlos López',     'carlos@mail.com',    'padre'),
  ('p5',   'Silvia Díaz',      'silvia@mail.com',    'padre');

-- Subjects
insert into subjects (id, name, teacher, color) values
  ('s1', 'Matemática', 'Prof. García',    '#5B77D3'),
  ('s2', 'Lengua',     'Prof. Martínez',  '#0693E3'),
  ('s3', 'Historia',   'Prof. López',     '#FF9800'),
  ('s4', 'Biología',   'Prof. Fernández', '#4CAF50'),
  ('s5', 'Inglés',     'Prof. Rodríguez', '#9C27B0');

-- Courses
insert into courses (id, name, grade, subject_id) values
  ('c1', '3ro A', '3ro A', 's1'),
  ('c2', '4to B', '4to B', 's1'),
  ('c3', '1ro A', '1ro A', 's2'),
  ('c4', '2do B', '2do B', 's3'),
  ('c5', '5to C', '5to C', 's4');

-- Course enrollments
insert into course_enrollments (course_id, student_id) values
  ('c1','st1'),('c1','st2'),('c1','st3'),('c1','st4'),('c1','st5'),('c1','u1'),
  ('c2','st6'),('c2','st7'),('c2','st8'),
  ('c3','st9'),('c3','st10'),('c3','st11'),
  ('c4','st12'),('c4','st13'),('c4','st14'),
  ('c5','st15'),('c5','st16'),('c5','st17');

-- Parent-child mappings
insert into parent_children (parent_id, child_id) values
  ('p1','st2'),  -- Laura → María González
  ('p2','st3'),  -- Roberto → Lucas Rodríguez
  ('p3','st4'),  -- Ana → Sofía Martínez
  ('p4','st5'),  -- Carlos → Mateo López
  ('p5','st6');  -- Silvia → Valentina Díaz

-- Grades
insert into grades (id, subject_id, student_id, value, description, period, grade_date) values
  ('g1',  's1', 'st1', 8,  'Parcial 1',             '1er Trimestre', '2026-03-10'),
  ('g2',  's2', 'st1', 7,  'TP Análisis literario',  '1er Trimestre', '2026-03-08'),
  ('g3',  's3', 'st1', 9,  'Exposición oral',         '1er Trimestre', '2026-03-05'),
  ('g4',  's4', 'st1', 6,  'Parcial 1',             '1er Trimestre', '2026-03-03'),
  ('g5',  's5', 'st1', 10, 'Reading comprehension',  '1er Trimestre', '2026-03-01'),
  ('g6',  's1', 'st2', 9,  'Parcial 1',             '1er Trimestre', '2026-03-10'),
  ('g7',  's2', 'st2', 8,  'TP Análisis literario',  '1er Trimestre', '2026-03-08'),
  ('g8',  's1', 'u1',  9,  'Parcial 1',             '1er Trimestre', '2026-03-10'),
  ('g9',  's2', 'u1',  8,  'TP Análisis literario',  '1er Trimestre', '2026-03-08'),
  ('g10', 's3', 'u1',  10, 'Exposición oral',         '1er Trimestre', '2026-03-06'),
  ('g11', 's4', 'u1',  7,  'Parcial 1',             '1er Trimestre', '2026-03-04'),
  ('g12', 's5', 'u1',  9,  'Reading comprehension',  '1er Trimestre', '2026-03-02');

-- Attendance
insert into attendance (id, student_id, course_id, attend_date, status, check_in_time) values
  ('a1',  'st1', 'c1', '2026-03-18', 'presente', '07:58'),
  ('a2',  'st1', 'c1', '2026-03-17', 'presente', '08:05'),
  ('a3',  'st1', 'c1', '2026-03-14', 'presente', '07:55'),
  ('a4',  'st1', 'c1', '2026-03-13', 'tardanza', '08:34'),
  ('a5',  'st1', 'c1', '2026-03-12', 'ausente',  null),
  ('a6',  'st1', 'c1', '2026-03-11', 'presente', '08:01'),
  ('a7',  'st1', 'c1', '2026-03-10', 'presente', '08:03'),
  ('a8',  'st2', 'c1', '2026-03-18', 'tardanza', '08:21'),
  ('a9',  'st2', 'c1', '2026-03-17', 'presente', '08:02'),
  ('a10', 'st2', 'c1', '2026-03-14', 'ausente',  null),
  ('a11', 'st2', 'c1', '2026-03-13', 'presente', '07:59'),
  ('a12', 'st3', 'c1', '2026-03-18', 'ausente',  null),
  ('a13', 'st3', 'c1', '2026-03-17', 'presente', '08:10'),
  ('a14', 'st3', 'c1', '2026-03-14', 'tardanza', '08:28'),
  ('a15', 'st4', 'c1', '2026-03-18', 'presente', '07:52'),
  ('a16', 'st4', 'c1', '2026-03-17', 'presente', '07:54'),
  ('a17', 'st4', 'c1', '2026-03-14', 'presente', '08:00'),
  ('a18', 'st5', 'c1', '2026-03-18', 'tardanza', '08:19'),
  ('a19', 'st5', 'c1', '2026-03-17', 'ausente',  null),
  ('a20', 'st5', 'c1', '2026-03-14', 'presente', '08:07'),
  ('a21', 'st6', 'c2', '2026-03-18', 'presente', '08:04'),
  ('a22', 'st6', 'c2', '2026-03-17', 'presente', '07:57'),
  ('a23', 'st7', 'c2', '2026-03-18', 'ausente',  null),
  ('a24', 'st7', 'c2', '2026-03-17', 'tardanza', '08:41'),
  ('a25', 'st8', 'c2', '2026-03-18', 'presente', '08:11'),
  ('a26', 'st8', 'c2', '2026-03-17', 'presente', '08:06');

-- Calendar events
insert into calendar_events (id, title, event_date, event_type, description, subject_id) values
  ('e1', 'Parcial Matemática',  '2026-03-20', 'examen',  'Unidades 1 a 3',                    's1'),
  ('e2', 'Reunión de padres',   '2026-03-22', 'reunion', 'Salón de actos, 18:00 hs',           null),
  ('e3', 'Acto 25 de Mayo',     '2026-03-25', 'acto',    'Patio central, 10:00 hs',            null),
  ('e4', 'Feriado Nacional',    '2026-03-24', 'feriado', null,                                  null),
  ('e5', 'Entrega TP Lengua',   '2026-03-28', 'examen',  'Trabajo práctico grupal',             's2'),
  ('e6', 'Parcial Historia',    '2026-04-02', 'examen',  'Revolución de Mayo',                  's3');

-- Communications
insert into communications (id, title, body, author, course_id, requires_confirmation) values
  ('com1', 'Autorización salida educativa',
   'Se solicita autorización para la salida educativa al Museo de Ciencias Naturales el día 25/03. Por favor confirmar lectura y enviar autorización firmada.',
   'Prof. García', 'c1', true),
  ('com2', 'Material para clase de Biología',
   'Para la próxima clase de Biología traer: microscopio portátil (quien tenga), hojas para herbario y lupa.',
   'Prof. Fernández', 'c1', false),
  ('com3', 'Cambio de horario - Viernes',
   'Se informa que el viernes 20/03 el horario de salida será a las 12:00 hs por jornada institucional.',
   'Dirección', null, true);

-- Wall posts
insert into wall_posts (id, author_id, author_name, author_role, text, image_url, post_date) values
  ('w1', 'dir1',   'Dirección',     'docente', '¡Bienvenidos al ciclo lectivo 2026! Nos alegra recibirlos a todos en este nuevo año escolar. Les deseamos un año lleno de aprendizaje, compañerismo y crecimiento. ¡Arrancamos con todo!', 'https://picsum.photos/seed/bienvenida2026/800/400', '2026-03-10'),
  ('w2', 'doc1',   'Prof. García',  'docente', 'Ya están disponibles los materiales para el primer parcial de Matemática. Los encontrán en la sección "Material de estudio". El parcial será el jueves 20/03, unidades 1 a 3. Cualquier consulta, me escriben.', null, '2026-03-14'),
  ('w3', 'coord1', 'Coordinación',  'docente', 'Esta semana arranca el torneo deportivo intercolegial. Participan los equipos de fútbol, básquet y vóley. Los partidos se juegan los miércoles y viernes en el horario de Educación Física. ¡Vamos con todo!', 'https://picsum.photos/seed/torneo2026/800/400', '2026-03-13'),
  ('w4', 'doc2',   'Prof. Martínez','docente', 'Recordamos que el viernes 21/03 es la entrega del trabajo práctico de Lengua. Debe presentarse en formato digital por el campus y en papel. Cualquier consulta no dejen de escribirme antes del jueves.', null, '2026-03-12'),
  ('w5', 'dir1',   'Dirección',     'docente', 'Felicitamos a los ganadores del concurso de redacción institucional: 1° lugar Sofía Martínez (3ro A), 2° lugar Tomás Fernández (4to B) y 3° lugar Camila Ruiz (4to B). ¡Excelente trabajo a todos los participantes!', 'https://picsum.photos/seed/concurso2026/800/400', '2026-03-11');

-- Wall reactions
insert into wall_reactions (post_id, user_id, reaction) values
  ('w1','st1','love'),('w1','st2','aplauso'),('w1','st3','like'),('w1','st4','love'),('w1','st5','aplauso'),
  ('w2','st1','like'),('w2','st2','like'),('w2','st3','sorpresa'),
  ('w3','st1','aplauso'),('w3','st2','love'),('w3','st4','aplauso'),('w3','st5','like'),
  ('w4','st3','like'),('w4','st4','sorpresa'),
  ('w5','st1','aplauso'),('w5','st2','love'),('w5','st3','aplauso'),('w5','st5','love');

-- Wall views
insert into wall_views (post_id, user_id) values
  ('w1','st1'),('w1','st2'),('w1','st3'),('w1','st4'),('w1','st5'),('w1','st6'),('w1','st7'),('w1','st8'),
  ('w2','st1'),('w2','st2'),('w2','st3'),('w2','st4'),('w2','st5'),
  ('w3','st1'),('w3','st2'),('w3','st3'),('w3','st4'),('w3','st5'),('w3','st6'),
  ('w4','st1'),('w4','st2'),('w4','st3'),
  ('w5','st1'),('w5','st2'),('w5','st3'),('w5','st4');

-- Wall comments
insert into wall_comments (id, post_id, author_id, author_name, text, comment_date) values
  ('wc1', 'w2', 'doc2', 'Prof. Martínez', 'Igual les recomiendo repasar los ejercicios de práctica del cuadernillo.', '2026-03-14'),
  ('wc2', 'w5', 'doc1', 'Prof. García',   '¡Muy merecido! Se lo dedicaron muchísimo.', '2026-03-11');

-- Groups
insert into groups (id, name, description, group_type, created_by, created_by_name, cover_color, is_automatic) values
  ('grp-3a',       '3° A - 2026',              'Grupo oficial del curso 3° A. Solo docentes y admins pueden publicar.', 'curso',          'dir1',  'Dirección',    '#7C6BC4', true),
  ('grp-mat',      'Matemática - Prof. García', 'Espacio de la materia para consultas, materiales y avisos.',          'materia',        'doc1',  'Prof. García', '#5B77D3', false),
  ('grp-robotica', 'Club de Robótica',          'Grupo del taller extracurricular de robótica. Martes y jueves 16:00–18:00 hs.', 'extracurricular','doc1',  'Prof. García', '#00897B', false),
  ('grp-futbol',   'Equipo de Fútbol',          'Equipo de fútbol del colegio. Entrenamientos los viernes.',          'extracurricular','doc2',  'Prof. Martínez','#43A047', false);

-- Group members
insert into group_members (group_id, user_id, user_name, member_role, joined_at) values
  ('grp-3a','u1',  'Lucía Martínez',  'miembro','2026-03-01'),
  ('grp-3a','st2', 'María González',  'miembro','2026-03-01'),
  ('grp-3a','st3', 'Lucas Rodríguez', 'miembro','2026-03-01'),
  ('grp-3a','st4', 'Sofía Martínez',  'miembro','2026-03-01'),
  ('grp-3a','st5', 'Mateo López',     'miembro','2026-03-01'),
  ('grp-3a','doc1','Prof. García',    'admin',  '2026-03-01'),
  ('grp-3a','doc2','Prof. Martínez',  'admin',  '2026-03-01'),
  ('grp-mat','u1', 'Lucía Martínez',  'miembro','2026-03-05'),
  ('grp-mat','st2','María González',  'miembro','2026-03-05'),
  ('grp-mat','st3','Lucas Rodríguez', 'miembro','2026-03-05'),
  ('grp-mat','st4','Sofía Martínez',  'miembro','2026-03-05'),
  ('grp-mat','st5','Mateo López',     'miembro','2026-03-05'),
  ('grp-mat','doc1','Prof. García',   'admin',  '2026-03-05'),
  ('grp-robotica','u1',  'Lucía Martínez',  'miembro','2026-03-06'),
  ('grp-robotica','st3', 'Lucas Rodríguez', 'miembro','2026-03-06'),
  ('grp-robotica','st5', 'Mateo López',     'miembro','2026-03-06'),
  ('grp-robotica','doc1','Prof. García',    'admin',  '2026-03-06'),
  ('grp-futbol','st2', 'María González',  'miembro','2026-03-08'),
  ('grp-futbol','st4', 'Sofía Martínez',  'miembro','2026-03-08'),
  ('grp-futbol','doc2','Prof. Martínez',  'admin',  '2026-03-08');

-- Group posts (wall_posts with group_id)
insert into wall_posts (id, author_id, author_name, author_role, text, image_url, post_date, group_id, group_name) values
  ('gp1','doc1','Prof. García',  'docente','Recordatorio para todo el curso: el **lunes 23/03** traer el trabajo práctico de Matemática impreso. Quien no lo entregue en tiempo y forma tendrá nota desaprobada. ¡Sin excepciones!', null, '2026-03-17', 'grp-3a', '3° A - 2026'),
  ('gp2','doc1','Prof. García',  'docente','Subí la guía de ejercicios para el parcial del jueves. La encuentran en la sección "Material". Repasen especialmente los ejercicios 12 al 18, que son los de mayor peso en el examen.', null, '2026-03-16', 'grp-mat', 'Matemática - Prof. García'),
  ('gp3','doc1','Prof. García',  'docente','¡Muy buena sesión hoy! Ya terminamos el armado del chasis. El jueves arrancamos con la programación del sensor ultrasónico. Traigan sus notebooks cargadas.', 'https://picsum.photos/seed/robotica2026/800/400', '2026-03-15', 'grp-robotica', 'Club de Robótica');

-- Group post reactions
insert into wall_reactions (post_id, user_id, reaction) values
  ('gp1','u1','like'),('gp1','st2','aplauso'),('gp1','st3','sorpresa'),
  ('gp2','u1','aplauso'),('gp2','st2','like'),
  ('gp3','u1','love'),('gp3','st3','aplauso');

-- Group post views
insert into wall_views (post_id, user_id) values
  ('gp1','u1'),('gp1','st2'),('gp1','st3'),
  ('gp2','u1'),('gp2','st2'),
  ('gp3','u1'),('gp3','st3');

-- Group post comments
insert into wall_comments (id, post_id, author_id, author_name, text, comment_date) values
  ('gc1','gp2','doc1','Prof. García','Recuerden que pueden consultarme hasta el miércoles a las 18 hs.','2026-03-16');

-- Tasks (published)
insert into tasks (id, title, course_id, due_date, priority, description, is_draft) values
  ('dt1', 'Resolver ejercicios pág. 45-48',       'c1', '2026-03-20', 'alta',  'Resolver todos los ejercicios de las páginas 45 a 48. Mostrar procedimiento completo.', false),
  ('dt2', 'Estudiar para parcial - Unidades 1-3', 'c1', '2026-03-25', 'media', 'Estudiar unidades 1 a 3 para el parcial.', false),
  ('dt3', 'Trabajo práctico - Ecuaciones cuadráticas', 'c2', '2026-03-22', 'alta', 'Resolver guía de ecuaciones cuadráticas.', false),
  ('dt4', 'Ejercicios de repaso',                 'c2', '2026-03-28', 'baja',  'Completar ejercicios de repaso del cuadernillo.', false),
  ('draft1','Ejercicios de funciones',             'c1', '2026-04-01', 'media', 'Resolver ejercicios 1 a 15 de la guía de funciones lineales.', true);

-- Task attachments
insert into task_attachments (id, task_id, type, name, url) values
  ('att1', 'dt1', 'archivo', 'Guía_ejercicios_U3.pdf', null),
  ('att2', 'dt1', 'link',    'Video explicativo - Ecuaciones', 'https://example.com/video');

-- Task deliveries
insert into task_deliveries (task_id, student_id, status, submission_date, submission_content) values
  ('dt1','st1','entregado','2026-03-18','Ejercicios resueltos.'),
  ('dt1','st2','entregado','2026-03-19','Adjunto PDF con resolución.'),
  ('dt1','st3','pendiente',null,null),
  ('dt1','st4','pendiente',null,null),
  ('dt1','st5','entregado','2026-03-17','Resuelto completo.'),
  ('dt1','u1', 'pendiente',null,null),
  ('dt2','st1','pendiente',null,null),
  ('dt2','st2','pendiente',null,null),
  ('dt2','st3','pendiente',null,null),
  ('dt2','st4','pendiente',null,null),
  ('dt2','st5','pendiente',null,null),
  ('dt2','u1', 'pendiente',null,null),
  ('dt3','st6','entregado','2026-03-20','Guía resuelta.'),
  ('dt3','st7','pendiente',null,null),
  ('dt3','st8','entregado','2026-03-21','Adjunto archivo.'),
  ('dt4','st6','pendiente',null,null),
  ('dt4','st7','pendiente',null,null),
  ('dt4','st8','pendiente',null,null);

-- Trips
insert into trips (id, title, trip_type, trip_date, location, status, horario_salida, horario_regreso, punto_encuentro, transporte, description, que_llevar, authorization_required, contact_emergency) values
  ('trip1','Museo de Ciencias Naturales','salida','2026-03-25','Parque Centenario, CABA','proximo',
   '08:30 hs','13:00 hs','Puerta principal del colegio','Micro escolar',
   'Visita guiada al Museo Argentino de Ciencias Naturales. Se recorrerán las salas de paleontología y biodiversidad.',
   array['Cuaderno y lapicera','Vianda y agua','Guardapolvo','DNI'],
   true,'Prof. García - 11-5555-0001'),
  ('trip2','Campamento en Sierra de la Ventana','campamento','2026-04-15','Sierra de la Ventana, Buenos Aires','confirmado',
   '06:00 hs (Miércoles 15/04)','18:00 hs (Viernes 17/04)','Estacionamiento del colegio','Micro de larga distancia',
   'Campamento de 3 días y 2 noches. Actividades al aire libre, trekking, fogón y juegos grupales.',
   array['Bolsa de dormir','Ropa abrigada','Linterna','Protector solar','Repelente','Muda de ropa (3 días)','Zapatillas de trekking','Toalla','Elementos de higiene personal','Botiquín personal','Vianda para el viaje'],
   true,'Prof. López - 11-5555-0002'),
  ('trip3','Viaje de Egresados - Bariloche','egresados','2026-09-10','San Carlos de Bariloche','proximo',
   '22:00 hs (Jueves 10/09)','08:00 hs (Lunes 21/09)','Aeropuerto de Ezeiza - Terminal A','Avión + Micro en destino',
   'Viaje de egresados de 10 días. Incluye excursiones al Cerro Catedral, Circuito Chico, Isla Victoria, Bosque de Arrayanes y actividades recreativas.',
   array['Valija grande','Ropa de abrigo','Traje de baño','Documentación (DNI)','Medicamentos personales','Cargador de celular','Dinero para gastos personales'],
   true,'Coordinador viaje - 11-5555-0003'),
  ('trip4','Visita a la Usina del Arte','excursion','2026-03-10','La Boca, CABA','finalizado',
   '09:00 hs','12:30 hs','Puerta principal del colegio','Micro escolar',
   'Visita a la muestra de arte contemporáneo y taller de expresión artística.',
   array['Cuaderno de arte','Lapicera'],
   false,'Prof. Fernández - 11-5555-0004');

-- Trip attendees
insert into trip_attendees (trip_id, student_id, authorized, authorized_by, auth_status) values
  ('trip1','st1',false,null,'pendiente'),
  ('trip1','st2',true,'Laura González (Madre)','autorizado'),
  ('trip1','st3',true,'Roberto Rodríguez (Padre)','autorizado'),
  ('trip1','st4',false,null,'pendiente'),
  ('trip1','st5',true,'Carlos López (Padre)','autorizado'),
  ('trip2','st1',true,'Carlos Pérez (Padre)','autorizado'),
  ('trip2','st2',true,'Laura González (Madre)','autorizado'),
  ('trip2','st3',false,null,'pendiente'),
  ('trip2','st4',true,'Ana Martínez (Madre)','autorizado'),
  ('trip2','st5',false,null,'pendiente'),
  ('trip3','st1',false,null,'pendiente'),
  ('trip3','st2',false,null,'pendiente'),
  ('trip3','st3',true,'Roberto Rodríguez (Padre)','autorizado'),
  ('trip3','st4',false,null,'pendiente'),
  ('trip3','st5',false,null,'pendiente'),
  ('trip4','st1',true,'Carlos Pérez (Padre)','no_requerido'),
  ('trip4','st2',true,'Laura González (Madre)','no_requerido'),
  ('trip4','st3',true,'Roberto Rodríguez (Padre)','no_requerido'),
  ('trip4','st4',true,'Ana Martínez (Madre)','no_requerido'),
  ('trip4','st5',true,'Carlos López (Padre)','no_requerido');

-- Conversations & messages
insert into conversations (id, participant_a, participant_b, last_message, last_message_date) values
  ('chat1','u1','p1','¿Sabés a qué hora es la reunión?','2026-03-17'),
  ('chat2','u1','p2','Dale, coordinamos el cumple','2026-03-16');

insert into messages (id, conversation_id, sender_id, sender_name, text, msg_date, msg_time) values
  ('m1','chat1','p1','Laura González',    'Hola! ¿Cómo estás?',          '2026-03-17','09:30'),
  ('m2','chat1','u1','Lucía Martínez',    'Bien! ¿Vos?',                 '2026-03-17','09:32'),
  ('m3','chat1','p1','Laura González',    '¿Sabés a qué hora es la reunión?','2026-03-17','09:35'),
  ('m4','chat2','u1','Lucía Martínez',    'Hola Roberto, quería coordinar para el cumple de los chicos','2026-03-16','14:00'),
  ('m5','chat2','p2','Roberto Rodríguez', 'Dale, coordinamos el cumple', '2026-03-16','14:15');

-- Notifications (seed)
insert into notifications (id, notif_type, title, body, notif_date, target_role, deep_link) values
  ('n1','tarea',       'Nueva tarea publicada',  'Ejercicios de fracciones — entrega 20/03',             '2026-03-10','alumno','/(tabs)/grades'),
  ('n2','comunicado',  'Reunión de padres',       'El jueves 20/03 a las 18 hs en el salón principal.',   '2026-03-12',null,   '/(tabs)/communications'),
  ('n3','grupo',       'Invitación a grupo',      'Fuiste invitado al grupo Robótica 2026.',              '2026-03-14','alumno','/(tabs)/grupos'),
  ('n4','autorizacion','Autorización pendiente',  'Excursión al Planetario requiere tu autorización.',    '2026-03-15','padre', '/(tabs)/grades'),
  ('n5','comunicado',  'Acto del 24 de Marzo',    'Recordatorio: acto institucional el lunes 24/03.',    '2026-03-16',null,   '/(tabs)/wall');

-- Mark n5 as read by all (it's already read in mock)
-- We'll handle this via notification_reads when needed

-- Birthdays
insert into birthdays (id, name, birth_date, grade) values
  ('b1','María González',  '03-18','3ro A'),
  ('b2','Lucas Rodríguez', '03-18','3ro A'),
  ('b3','Sofía Martínez',  '03-20','3ro A'),
  ('b4','Mateo López',     '03-22','3ro A'),
  ('b5','Valentina Díaz',  '03-25','4to B'),
  ('b6','Prof. García',    '03-19','Docente');

-- Feed posts
insert into feed_posts (id, title, body, author, post_date, category) values
  ('f1','Acto del 25 de Mayo',
   'Se invita a toda la comunidad educativa al acto conmemorativo del 25 de Mayo. Se realizará en el patio central a las 10:00 hs.',
   'Dirección','2026-03-15','evento'),
  ('f2','Suspensión de clases - Jornada docente',
   'Se informa que el día viernes 20/03 no habrá clases por jornada de capacitación docente.',
   'Dirección','2026-03-14','urgente'),
  ('f3','Inscripción a talleres extracurriculares',
   'Están abiertas las inscripciones para los talleres de teatro, robótica y deportes. Consultar en secretaría.',
   'Coordinación','2026-03-13','novedad'),
  ('f4','Reunión de padres - 2do trimestre',
   'Se convoca a reunión de padres para el día 22/03 a las 18:00 hs. en el salón de actos.',
   'Dirección','2026-03-12','comunicado');

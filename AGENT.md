# AGENT.md — Hu Campus

## Descripción del Proyecto

**Hu Campus** es una aplicación móvil/web de gestión escolar multi-rol construida con React Native + Expo. Permite a alumnos, docentes, padres y administradores acceder a funcionalidades académicas, sociales y comunicacionales desde una sola plataforma.

La app tiene backend real en **Supabase** (PostgreSQL + Auth + RLS). El módulo de administración (cursos, materias, horarios, alumnos) es completamente funcional contra la base de datos.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Expo 55 + React Native 0.83 |
| Lenguaje | TypeScript 5.9 (strict mode) |
| Routing | Expo Router 55 (file-based) |
| UI | React Native Paper 5 (Material Design 3) |
| Íconos | MaterialCommunityIcons (@expo/vector-icons) |
| Estado global | Zustand 5 |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Animaciones | React Native Reanimated 4 |
| Gestos | React Native Gesture Handler 2 |
| Calendario | react-native-calendars |
| Fuentes | @expo-google-fonts/inter |

---

## Estructura del Proyecto

```
humand-school/
├── app/
│   ├── _layout.tsx             # Layout raíz + tema
│   ├── index.tsx               # Redirección según auth
│   ├── (auth)/
│   │   ├── login.tsx           # Login real con Supabase Auth
│   │   └── select-role.tsx     # Selección de rol post-login
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tabs por rol + badges reactivos
│   │   ├── wall.tsx            # Feed social (muro + grupos + noticias)
│   │   ├── home.tsx            # Perfil
│   │   ├── calendar.tsx        # Calendario + eventos
│   │   ├── grades.tsx          # Menú de apps con badges de tareas pendientes
│   │   ├── admin.tsx           # Panel admin: lista de cursos (solo admin)
│   │   ├── communications.tsx  # Chat entre alumnos (solo alumno)
│   │   ├── courses.tsx         # Cursos (docente)
│   │   ├── attendance.tsx      # Asistencia
│   │   ├── community.tsx       # Contactos/chat padres (solo padre)
│   │   └── grupos/
│   │       ├── index.tsx       # Lista de grupos del usuario
│   │       ├── [id].tsx        # Detalle de grupo (muro, miembros, invitar)
│   │       └── nuevo.tsx       # Crear grupo
│   ├── admin/
│   │   └── [id].tsx            # Detalle de curso: horario semanal, alumnos, materias
│   └── apps/
│       ├── tareas.tsx          # Tareas (alumno ve/entrega; docente crea/publica)
│       ├── notas.tsx           # Notas por rol (alumno/padre/docente con selector)
│       ├── alumnos.tsx         # Lista de alumnos del curso activo (docente)
│       ├── presentismo.tsx     # Asistencia
│       ├── viajes.tsx          # Viajes y salidas (reactivo a trips-store)
│       ├── autorizaciones.tsx  # Autorizaciones de viajes (reactivo a trips-store)
│       ├── eventos.tsx         # Eventos
│       ├── horarios.tsx        # Horario semanal por día (docente)
│       ├── materias.tsx        # Materias y horarios (alumno)
│       ├── material.tsx        # Material de estudio
│       └── noticias.tsx        # Comunicados / cuaderno digital
├── components/
│   ├── layout/
│   │   ├── DesktopSidebar.tsx  # Sidebar desktop con nav + apps por rol
│   │   └── UserTopBar.tsx      # Top bar con selector de curso (docente), notifs, cumpleaños
│   ├── social/WallPostCard.tsx
│   ├── community/
│   │   ├── ChatBubble.tsx      # Burbuja de chat (recibe currentUserId)
│   │   └── ContactCard.tsx
│   └── ...
├── lib/
│   ├── types.ts                # Interfaces TypeScript + AppNotification
│   ├── supabase.ts             # Cliente Supabase (anon + service role)
│   └── stores/
│       ├── auth-store.ts       # Auth real con Supabase (login/logout/perfil)
│       ├── admin-store.ts      # Cursos, materias, horarios, alumnos (CRUD real)
│       ├── course-store.ts     # Curso activo del docente (selectedCourseId)
│       ├── social-store.ts     # Posts del muro, likes, comentarios
│       ├── groups-store.ts     # Grupos, posts de grupos, miembros
│       ├── tasks-store.ts      # Tareas docente (publishedTasks + drafts)
│       ├── grades-store.ts     # Notas por alumno y materia
│       ├── trips-store.ts      # Viajes y autorizaciones
│       ├── community-store.ts  # Conversaciones y mensajes de padres
│       ├── notifications-store.ts # Notificaciones in-app con unreadCount por rol
│       ├── calendar-store.ts   # Eventos del calendario
│       └── noticias-store.ts   # Comunicados institucionales
├── constants/
│   ├── colors.ts
│   └── layout.ts
└── assets/
```

---

## Roles de Usuario y Tabs

| Rol | Tabs (móvil) | Sidebar desktop |
|-----|-------------|-----------------|
| **Alumno** | Inicio, Agenda, Apps, Grupos, Perfil | Inicio, Agenda, Apps, Grupos, Perfil |
| **Docente** | Inicio, Cursos, Apps, Agenda, Perfil | Inicio, Cursos, Apps, Agenda, Perfil |
| **Padre** | Inicio, Agenda, Apps, Comunidad, Perfil | Inicio, Agenda, Apps, Comunidad, Perfil |
| **Admin** | Inicio, Administración, Agenda, Perfil | Inicio, Administración, Agenda, Perfil |

### Apps por rol

**Alumno:** Tareas, Material de estudio, Notas, Materias y Horarios, Presentismo, Eventos, Viajes y Salidas, Autorizaciones

**Docente:** Tareas, Horarios, Cargar notas, Presentismo, Material, Comunicados, Eventos, Viajes y Salidas, Alumnos

**Padre:** Tareas, Notas, Presentismo, Cuaderno digital, Eventos, Viajes y Salidas, Autorizaciones

**Admin:** Cursos, Materias, Presentismo, Alumnos, Comunicados, Eventos

---

## Backend — Supabase

**URL:** `https://hxjbdejnpucwuxctrafp.supabase.co`

### Tablas principales

| Tabla | Descripción |
|-------|------------|
| `profiles` | Usuarios con `id (text)`, `name`, `email`, `role` ('alumno'/'docente'/'padre'/'admin') |
| `courses` | Cursos con `id`, `name`, `grade` |
| `course_enrollments` | Relación alumno-curso (`course_id`, `student_id`) |
| `subjects` | Materias con `id`, `name`, `color`, `teacher` (NOT NULL, FK a profiles) |
| `course_schedules` | Horarios: `course_id`, `subject_id`, `teacher_id`, `assistant_id` (nullable, FK), `day_of_week` (1=Lun…7=Dom), `start_time`, `end_time`, `room` |

### Datos seeded en DB

- **6 cursos:** c1 (1ro A), c2 (2do A), c3 (3ro A), c4 (4to A), c5 (4to B), course_1773927400013 (5to A)
- **10 materias:** s1 Matemática, s2 Lengua, s3 Historia, s4 Biología, s5 Inglés, s6 Física, s7 Química, s8 Educación Física, s9 Arte, s10 Geografía
- **Docentes:** doc1–doc6 (Prof. García, Prof. López, Prof. Ramírez, Prof. Herrera, Prof. Acosta, Prof. Vidal)
- **Alumnos:** st1–st21 distribuidos en cursos; st18–st21 en 5to A
- **120 horarios:** 20 por curso (Lun–Vie, 4 bloques/día de 07:00 a 10:10)

---

## Estado Global (Zustand Stores)

| Store | Responsabilidad |
|-------|----------------|
| `auth-store` | Auth real con Supabase. `login(email, password)` → JWT. `user` contiene id, name, role |
| `admin-store` | CRUD completo contra Supabase: cursos, materias, horarios, inscripciones. `initialize()` carga todo |
| `course-store` | Curso activo del docente (`selectedCourseId`) — leído por topbar y pantallas |
| `social-store` | Posts del muro, reacciones, comentarios, vistas |
| `groups-store` | Grupos, posts de grupos, invitar/remover miembros |
| `tasks-store` | `publishedTasks[]` + `drafts[]`. `publishTask` emite notificación |
| `grades-store` | Notas. `addGrade` emite notificación al alumno target |
| `trips-store` | Viajes, attendees, autorizaciones |
| `community-store` | Conversaciones y mensajes de padres |
| `notifications-store` | `AppNotification[]` con `targetUserId?` y `targetRole?` |
| `calendar-store` | Eventos del calendario académico |
| `noticias-store` | Comunicados institucionales |

### Admin Store — Constantes

```typescript
// lib/stores/admin-store.ts
export const SUBJECT_COLORS = ['#5B77D3', '#E67E22', '#27AE60', '#9C27B0', '#E74C3C', ...]
export const TIME_SLOTS = ['07:00', '07:50', '08:40', '09:30', '10:20', '11:10', '12:00', ...]
export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
```

### Patrón cross-store (emisión de notificaciones)
Los stores llaman a `useNotificationsStore.getState().addNotification(...)` directamente (import de módulo), sin hooks.

---

## Modelos de Datos Clave (`lib/types.ts`)

```typescript
type Role = 'alumno' | 'docente' | 'padre' | 'admin'

interface User { id, name, email, role, avatar? }

interface CourseSchedule {
  id, courseId, subjectId, subjectName, subjectColor
  teacherId, teacherName
  assistantId?, assistantName?       // docente ayudante (opcional)
  dayOfWeek: number                  // 1=Lun … 7=Dom
  startTime: string                  // "HH:MM"
  endTime: string                    // "HH:MM"
  room?                              // aula (opcional)
}

interface AdminCourse {
  id, name, grade
  students: { id, name }[]
  schedules: CourseSchedule[]
}

interface AdminSubject { id, name, color }

interface AppNotification {
  id, type: 'tarea'|'comunicado'|'grupo'|'autorizacion'|'mensaje'
  title, body, date, read: boolean
  targetUserId?, targetRole?, deepLink?
}
```

---

## Pantalla de Administración (`app/admin/[id].tsx`)

Pantalla de detalle de curso con tres secciones: Horario, Alumnos, Materias.

### Componentes internos clave

- **`ScheduleGrid`**: Grilla semanal. Muestra Lun–Vie siempre; Sáb/Dom solo si hay bloques. Ancho dinámico con `onLayout`. Columnas calculadas como `Math.floor((containerWidth - TIME_W) / visibleDays.length)`.
- **`TimePicker`**: Dropdown con chevron y lista scrollable. Resalta el ítem seleccionado.
- **`PersonPicker`**: Dropdown searchable con avatar iniciales. Soporta opción "Ninguno" para campos opcionales. Excluye docente ya seleccionado del picker de ayudante.
- **`InlineSubjectModal`**: Crea materia sin salir del formulario de horario.
- **`ScheduleFormModal`**: Formulario completo para crear/editar un bloque de horario.

### Gotchas críticos

```typescript
// ✅ Usar || null (no ?? null) para campos FK opcionales — evita FK violation con ""
assistant_id: assistantId || null

// ✅ !!value para condicionales en View — evita text node crash con ""
{optional && !!value && <Chip .../>}
{!!block.room && <Text>...</Text>}

// ✅ useMemo SIEMPRE antes del early return — evita "Rendered more hooks"
const schedulesByDay = useMemo(() => course?.schedules ?? [], [course]);
if (!course) return <NotFound />;

// ✅ canGoBack() antes de back() — evita GO_BACK error en acceso directo por URL
router.canGoBack() ? router.back() : router.replace('/(tabs)/admin')
```

---

## Diseño y Estilos

**Colores principales** (`constants/colors.ts`):
- Primary: `#5B77D3` | Accent: `#0693E3` | Background: `#F7F7F7`
- Success: `#4CAF50` | Error: `#F44336` | Warning: `#FF9800`
- Border: `#E0E0E0` | TextPrimary: `#1A1A1A` | TextSecondary: `#717171`

**Patrones UI:**
- `StyleSheet.create()` co-ubicado en cada archivo
- `FlatList` con `ListHeaderComponent` para listas con secciones
- `Pressable` para elementos interactivos (no `TouchableOpacity`)
- Selectors de Zustand: **nunca usar `.filter()` directamente en el selector** — causa re-renders infinitos.

```typescript
// ✅ Correcto
const all = useStore((s) => s.items);
const filtered = useMemo(() => all.filter(...), [all]);

// ❌ Incorrecto — infinite loop
const filtered = useStore((s) => s.items.filter(...));
```

---

## Desktop vs Mobile

- `useBreakpoint()` devuelve `{ isDesktop }` — threshold en `constants/layout.ts`
- Desktop: muestra `DesktopSidebar` + oculta tab bar (`display: 'none'`)
- `DesktopSidebar` tiene la misma lógica de tabs y apps por rol que `_layout.tsx` — **mantener sincronizados al agregar/quitar items**

---

## Cómo Correr el Proyecto

```bash
npm install
npx expo start --clear   # --clear limpia caché de Metro
# Web: http://localhost:8081
```

---

## Convenciones

- Componentes: PascalCase | Variables/funciones: camelCase
- Rutas dinámicas: `[id].tsx` | Grupos de rutas: `(tabs)`, `(auth)`
- Idioma UI: español argentino
- TypeScript strict — evitar `as any` salvo en nombres de íconos
- IDs en DB: strings cortos (`c1`, `s1`, `doc1`, `st1`) — **no UUIDs**

---

## Lo Que No Está Implementado

- Stores sociales/notas/tareas/viajes conectados a Supabase (aún usan mock data)
- Notificaciones push
- Subida de archivos/imágenes reales
- Modo oscuro
- Sincronización offline

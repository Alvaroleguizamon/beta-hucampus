# AGENT.md — Humand School

## Descripción del Proyecto

**Humand School** es una aplicación móvil/web de gestión escolar multi-rol construida con React Native + Expo. Permite a alumnos, docentes y padres acceder a funcionalidades académicas, sociales y comunicacionales desde una sola plataforma.

La app está en modo MVP/demo: usa datos mock y no tiene backend real. El login acepta cualquier credencial.

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
│   │   ├── login.tsx
│   │   └── select-role.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tabs por rol + badges reactivos
│   │   ├── wall.tsx            # Feed social (muro + grupos + noticias)
│   │   ├── home.tsx            # Perfil
│   │   ├── calendar.tsx        # Calendario + eventos
│   │   ├── grades.tsx          # Menú de apps con badges de tareas pendientes
│   │   ├── communications.tsx  # Chat entre alumnos (solo alumno)
│   │   ├── courses.tsx         # Cursos (docente)
│   │   ├── attendance.tsx      # Asistencia
│   │   ├── community.tsx       # Contactos/chat padres (solo padre)
│   │   └── grupos/
│   │       ├── index.tsx       # Lista de grupos del usuario
│   │       ├── [id].tsx        # Detalle de grupo (muro, miembros, invitar)
│   │       └── nuevo.tsx       # Crear grupo
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
│   ├── mock-data.ts            # Datos de desarrollo
│   └── stores/
│       ├── auth-store.ts       # Usuario, rol, login/logout
│       ├── course-store.ts     # Curso activo del docente (selectedCourseId)
│       ├── social-store.ts     # Posts del muro, likes, comentarios
│       ├── groups-store.ts     # Grupos, posts de grupos, miembros
│       ├── tasks-store.ts      # Tareas docente (publishedTasks + drafts)
│       ├── grades-store.ts     # Notas por alumno y materia
│       ├── trips-store.ts      # Viajes y autorizaciones (compartido entre pantallas)
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

### Apps por rol

**Alumno:** Tareas, Material de estudio, Notas, Materias y Horarios, Presentismo, Eventos, Viajes y Salidas, Autorizaciones

**Docente:** Tareas, Horarios, Cargar notas, Presentismo, Material, Comunicados, Eventos, Viajes y Salidas, Alumnos

**Padre:** Tareas, Notas, Presentismo, Cuaderno digital, Eventos, Viajes y Salidas, Autorizaciones

---

## Estado Global (Zustand Stores)

| Store | Responsabilidad |
|-------|----------------|
| `auth-store` | Usuario logueado (`u1`), rol, nombre, login/logout |
| `course-store` | Curso activo del docente (`selectedCourseId`) — leído por topbar y pantallas |
| `social-store` | Posts del muro, reacciones, comentarios, vistas |
| `groups-store` | Grupos, posts de grupos, invitar/remover miembros. Genera grupos automáticos por curso |
| `tasks-store` | `publishedTasks[]` (tareas de docentes) + `drafts[]`. `publishTask` emite notificación |
| `grades-store` | Notas. `addGrade` emite notificación al alumno target |
| `trips-store` | Viajes, attendees, autorizaciones. Fuente de verdad compartida entre viajes.tsx y autorizaciones.tsx |
| `community-store` | Conversaciones y mensajes de padres. `sendMessage(convId, text, senderId, senderName)` |
| `notifications-store` | `AppNotification[]` con `targetUserId?` y `targetRole?`. `getUnreadCount(userId, role)` |
| `calendar-store` | Eventos del calendario académico |
| `noticias-store` | Comunicados institucionales |

### Patrón cross-store (emisión de notificaciones)
Los stores llaman a `useNotificationsStore.getState().addNotification(...)` directamente (import de módulo), sin hooks:
```typescript
// Ejemplo en tasks-store.ts
import { useNotificationsStore } from './notifications-store';
publishTask: (task) => {
  set(...);
  useNotificationsStore.getState().addNotification({ type: 'tarea', targetRole: 'alumno', ... });
}
```

---

## Usuarios Mock

| ID | Nombre | Rol por defecto |
|----|--------|----------------|
| `u1` | Lucía Martínez | alumno (curso c1 — 3ro A) |
| — | Prof. Carlos Romero | docente (al seleccionar rol) |
| — | Martín González | padre (al seleccionar rol) |

**Curso c1 (3ro A):** st1 Juan Pérez, st2 María González, st3 Lucas Rodríguez, st4 Sofía Martínez, st5 Mateo López, **u1** Lucía Martínez

El usuario `u1` tiene grades seeded con `studentId: 'u1'` en `mockGrades` (g8–g12).

El padre (`u1` con rol padre) ve las notas de `st1` (Juan Pérez) — mapeo hardcodeado en `notas.tsx`.

---

## Badges y Notificaciones

- **Tab Apps** → `notifications-store.getUnreadCount(userId, role)` (notas, tareas, grupos, autorizaciones)
- **Tab Chats/Comunidad** → suma de `unreadCount` de todas las conversaciones en `community-store`
- **Ícono Tareas en Apps** → count de tareas pendientes del alumno en `tasks-store`
- `markAsRead(convId)` en `community-store` limpia el badge al abrir un chat

---

## Modelos de Datos Clave (`lib/types.ts`)

```typescript
type Role = 'alumno' | 'docente' | 'padre'

interface User { id, name, email, role, avatar? }

interface Group {
  id, name, type: 'curso'|'materia'|'extracurricular'|'privado'
  members: GroupMember[], coverColor, isAutomatic?
}

interface AppNotification {
  id, type: 'tarea'|'comunicado'|'grupo'|'autorizacion'|'mensaje'
  title, body, date, read: boolean
  targetUserId?, targetRole?, deepLink?
}

interface ChatMessage { id, senderId, senderName, text, date, time }
interface ChatConversation { id, participantId, participantName, lastMessage, unreadCount }
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
- Selectors de Zustand: **nunca usar `.filter()` directamente en el selector** — causa re-renders infinitos. Seleccionar el array completo y filtrar en `useMemo`.

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
```

---

## Convenciones

- Componentes: PascalCase | Variables/funciones: camelCase
- Rutas dinámicas: `[id].tsx` | Grupos de rutas: `(tabs)`, `(auth)`
- Idioma UI: español argentino
- TypeScript strict — evitar `as any` salvo en nombres de íconos
- No hay persistencia entre sesiones (Zustand sin AsyncStorage)
- Los datos están en `lib/mock-data.ts`

---

## Lo Que No Está Implementado

- Backend/API real
- Autenticación real
- Notificaciones push
- Subida de archivos/imágenes reales
- Modo oscuro
- Sincronización offline

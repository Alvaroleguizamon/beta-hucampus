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
| Íconos | MaterialCommunityIcons (react-native-vector-icons) |
| Estado global | Zustand 5 |
| Animaciones | React Native Reanimated 4 |
| Gestos | React Native Gesture Handler 2 |
| Calendario | react-native-calendars |
| Fuentes | @expo-google-fonts/inter |

---

## Estructura del Proyecto

```
humand-school/
├── app/                        # Pantallas (Expo Router)
│   ├── _layout.tsx             # Layout raíz + tema
│   ├── index.tsx               # Redirección según auth
│   ├── (auth)/                 # Flujo de autenticación
│   │   ├── login.tsx
│   │   └── select-role.tsx
│   ├── (tabs)/                 # Navegación por tabs (varía según rol)
│   │   ├── _layout.tsx         # Configuración de tabs por rol
│   │   ├── wall.tsx            # Feed social
│   │   ├── home.tsx            # Perfil
│   │   ├── calendar.tsx        # Calendario + eventos
│   │   ├── grades.tsx          # Menú de apps
│   │   ├── communications.tsx  # Mensajes
│   │   ├── courses.tsx         # Cursos (docente)
│   │   ├── attendance.tsx      # Asistencia
│   │   ├── community.tsx       # Contactos/chat padres
│   │   └── post-detail/[id].tsx
│   └── apps/                   # Pantallas detalladas
│       ├── notas.tsx
│       ├── presentismo.tsx
│       ├── viajes.tsx
│       ├── tareas.tsx
│       ├── autorizaciones.tsx
│       ├── eventos.tsx
│       ├── horarios.tsx
│       ├── materias.tsx
│       ├── material.tsx
│       ├── agenda-personal.tsx
│       └── noticias.tsx
├── components/                 # Componentes reutilizables
│   ├── ui/Card.tsx
│   ├── social/WallPostCard.tsx
│   ├── feed/FeedCard.tsx
│   ├── attendance/AttendanceRow.tsx
│   ├── calendar/EventCard.tsx
│   ├── grades/GradeCard.tsx
│   ├── communications/MessageCard.tsx
│   └── community/{ChatBubble,ContactCard}.tsx
├── lib/
│   ├── types.ts                # Interfaces TypeScript globales
│   ├── mock-data.ts            # Datos de desarrollo
│   └── stores/                 # Zustand stores
│       ├── auth-store.ts
│       ├── social-store.ts
│       ├── grades-store.ts
│       ├── calendar-store.ts
│       └── community-store.ts
├── constants/
│   ├── colors.ts               # Paleta de colores
│   └── layout.ts               # Medidas y espaciados
└── assets/                     # Imágenes, íconos, splash
```

---

## Roles de Usuario

La app tiene 3 roles con navegación y funcionalidades distintas:

| Rol | Tabs disponibles |
|-----|-----------------|
| **Alumno** | Wall, Calendario, Apps (notas/asistencia/materias/tareas/viajes/etc.), Comunicaciones, Perfil |
| **Docente** | Wall, Cursos, Calendario, Apps (notas/asistencia/materias/horarios/etc.), Perfil |
| **Padre** | Wall, Calendario, Apps (notas/asistencia/viajes/autorizaciones), Comunidad, Perfil |

---

## Estado Global (Zustand Stores)

| Store | Responsabilidad |
|-------|----------------|
| `auth-store` | Usuario logueado, rol seleccionado, logout |
| `social-store` | Posts del wall, compañeros, likes, comentarios |
| `grades-store` | Notas por materia y alumno |
| `calendar-store` | Eventos del calendario académico |
| `community-store` | Chats y contactos de padres |

Patrón usado:
```typescript
const useStore = create((set, get) => ({
  state: initialValue,
  action: (param) => set({ state: newValue })
}))
```

---

## Modelos de Datos Clave (`lib/types.ts`)

```typescript
// Roles
type Role = 'alumno' | 'docente' | 'padre'

// Usuario
interface User { id, name, email, role, avatar }

// Académico
interface Grade { subject, student, value (0-10), date, period }
interface AttendanceRecord { student, date, status: 'presente'|'ausente'|'tardanza', course }
interface CalendarEvent { title, date, type: 'examen'|'reunion'|'acto'|'feriado' }

// Social
interface WallPost { author, text, image?, date, likes[], comments[] }

// Viajes
interface Trip { title, type, date, location, status, attendees[] }
```

---

## Diseño y Estilos

**Colores principales** (`constants/colors.ts`):
- Primary: `#5B77D3` (azul)
- Accent: `#0693E3` (celeste)
- Background: `#F7F7F7`
- Surface: `#FFFFFF`
- Text Primary: `#1A1A1A`
- Text Secondary: `#717171`
- Success: `#4CAF50` / Error: `#F44336` / Warning: `#FF9800`

**Layout** (`constants/layout.ts`):
- Padding default: 16px | small: 8px | large: 24px
- Border radius: 12px | large: 16px

**Patrones UI:**
- `StyleSheet.create()` co-ubicado en cada archivo
- `FlatList` para listas con headers
- `Pressable` para elementos interactivos
- Modales para contenido secundario (cumpleaños, notificaciones)
- Tabs para cambio de contenido dentro de pantallas

---

## Cómo Correr el Proyecto

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Plataformas específicas
npm run ios       # Simulador iOS
npm run android   # Emulador Android
npm run web       # Navegador web
```

> No requiere configuración de backend. Todo usa datos mock de `lib/mock-data.ts`.

---

## Convenciones del Código

- **Componentes:** PascalCase (`WallPostCard.tsx`)
- **Variables/funciones:** camelCase
- **Archivos de layout/config:** snake_case con underscore (`_layout.tsx`)
- **Rutas dinámicas:** `[paramName].tsx` (ej: `[id].tsx`)
- **Grupos de rutas:** entre paréntesis `(auth)`, `(tabs)`
- **Idioma del código:** español para nombres de dominio (notas, presentismo, viajes)
- **Tipado:** TypeScript strict — sin `any` implícito

---

## Lo Que Aún No Está Implementado (MVP)

- Backend/API real (actualmente todo es mock)
- Autenticación real
- Notificaciones push en tiempo real
- Subida de archivos/imágenes
- Soporte para video/multimedia
- Modo oscuro
- Sincronización offline
- Funcionalidad de grupos completa

---

## Notas Importantes para Desarrollo

1. **El login acepta cualquier credencial** — es modo demo.
2. **No hay persistencia** entre sesiones (Zustand sin persistencia configurada).
3. **Los datos están en** `lib/mock-data.ts` — modificar ahí para cambiar el contenido visible.
4. **El idioma de la UI es español argentino** — mantener consistencia al agregar textos.
5. **Expo Router** maneja toda la navegación — no usar React Navigation directamente.
6. **React Native Paper** es la librería de componentes base — usarla antes de crear componentes custom.

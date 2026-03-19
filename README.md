# Hu School

Plataforma educativa mobile-first desarrollada con React Native y Expo. Conecta alumnos, docentes y padres en un ecosistema escolar completo.

## Tech Stack

- **React Native** 0.83 + **Expo SDK 55**
- **TypeScript** 5.9
- **Expo Router** — navegación basada en archivos
- **React Native Paper** — componentes UI (Material Design)
- **Zustand** — estado global
- **react-native-calendars** — widgets de calendario
- **Inter** (Google Fonts) — tipografía

## Requisitos previos

- **Node.js** >= 18
- **npm** o **yarn**
- **Expo CLI** (se instala con el proyecto)

## Instalacion y ejecucion

```bash
# 1. Clonar el repositorio
git clone https://github.com/chechuhumand/humand-school.git
cd humand-school

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npx expo start

# 4. Abrir en el navegador (web)
# Presionar 'w' en la terminal, o ir a http://localhost:8081

# 5. Abrir en dispositivo movil
# Escanear el QR con Expo Go (Android) o la camara (iOS)
```

### Comandos utiles

| Comando | Descripcion |
|---------|-------------|
| `npx expo start` | Inicia el servidor de desarrollo |
| `npx expo start --web` | Inicia directamente en web |
| `npx expo start --ios` | Inicia en simulador iOS |
| `npx expo start --android` | Inicia en emulador Android |
| `npx expo start --clear` | Inicia limpiando la cache |

## Roles y permisos

La app soporta tres roles con funcionalidades diferenciadas:

### Alumno

- Ver notas, materias y horarios
- Consultar y entregar tareas
- Ver asistencia (presentismo) con calendario
- Acceder a eventos, viajes y salidas
- Participar en grupos
- Chat con companeros
- Ver muro y noticias

### Docente

- **Selector de curso activo** en el header (cambia el contexto de toda la app)
- Crear y publicar tareas con fecha de entrega, prioridad y adjuntos
- Cargar notas por alumno y materia
- Tomar asistencia por curso
- Gestionar grupos (automaticos por curso + manuales)
- Publicar en el muro
- Crear noticias y comunicados
- Ver dashboard de alumnos con promedios

### Padre / Tutor

- Ver tareas, notas y asistencia del hijo/a
- Consultar eventos y viajes
- Firmar autorizaciones (salidas, actividades, medicas)
- Chat con otros padres en la comunidad
- Ver noticias y comunicados

## Funcionalidades principales

### Muro / Inicio

- Feed de publicaciones con reacciones (like, love, aplauso, sorpresa)
- Sistema de comentarios
- Noticias fijadas (pinned)
- Buscador integrado en el header
- Sub-tabs: Muro y Noticias
- Composer para docentes con formato rich text e imagenes

### Tareas

- **Alumno/Padre:** lista de tareas con estado de entrega
- **Docente:** creacion y publicacion de tareas con:
  - Fecha de vencimiento (calendario dual)
  - Niveles de prioridad (alta, media, baja)
  - Adjuntos (archivos y links)
  - Seleccion de alumnos destinatarios
  - Sistema de borradores

### Notas

- Vista por materia con promedios por periodo
- Codigo de color segun rendimiento (verde >= 7, amarillo 4-6, rojo < 4)
- Docente: carga de notas por alumno

### Calendario / Agenda

- Calendario interactivo con marcadores multi-punto
- Tipos de evento: examen, reunion, acto, feriado
- Integracion con viajes y salidas
- Vista de proximos eventos de la semana

### Asistencia / Presentismo

- **Docente:** tomar asistencia por curso (Presente / Ausente / Tarde)
- **Alumno/Padre:** calendario visual con estadisticas (total presente, ausente, tarde)

### Viajes y Salidas

- Tipos: excursion, campamento, egresados, salida
- Vista semanal con navegacion
- Detalle: ubicacion, punto de encuentro, horarios, transporte, que llevar
- Estado de autorizacion

### Autorizaciones

- Tipos: salida, retiro, actividad, medica
- Estados: pendiente, autorizado, rechazado, vencido
- Firma digital por parte de padres

### Grupos

- Tipos: curso (automatico), materia, extracurricular, privado
- Feed interno por grupo con publicaciones y reacciones
- Gestion de miembros (invitar/remover)

### Comunicaciones

- **Alumno:** chat con companeros y grupos de clase
- **Padre:** comunidad con otros padres, contactos y chats

### Noticias

- Categorias: comunicado, novedad, evento, urgente
- Noticias fijadas
- Creacion por docentes

### Material de Estudio

- Biblioteca de recursos por materia

### Alumnos (solo docente)

- Dashboard por curso con lista de alumnos
- Detalle individual con desglose de notas por materia

## Header / TopBar

- **Mobile:** logo Hu School (clickeable para ir al inicio) + iconos compactos
- **Docente:** selector de curso activo que cambia el contexto global
- Buscador expandible con animacion slide
- Panel lateral (side panel) para notificaciones y cumpleanos con animacion suave
- Avatar con dropdown (configuracion, cerrar sesion, info de usuario en mobile)

## Estructura del proyecto

```
humand-school/
├── app/
│   ├── (auth)/          # Login y seleccion de rol
│   ├── (tabs)/          # Navegacion principal por tabs
│   │   └── grupos/      # Sub-rutas de grupos
│   ├── apps/            # Pantallas de cada app/funcionalidad
│   └── post-detail/     # Detalle de publicacion
├── components/
│   ├── layout/          # DesktopSidebar, UserTopBar
│   ├── social/          # WallPostCard
│   ├── community/       # ContactCard, ChatBubble
│   ├── communications/  # MessageCard
│   ├── calendar/        # EventCard
│   ├── grades/          # GradeCard
│   ├── attendance/      # AttendanceRow
│   ├── feed/            # FeedCard
│   └── ui/              # Card generico
├── lib/
│   ├── stores/          # Zustand stores (auth, social, groups, tasks, etc.)
│   ├── mock-data.ts     # Datos de ejemplo
│   └── types.ts         # Tipos TypeScript
├── constants/
│   ├── colors.ts        # Paleta de colores
│   └── layout.ts        # Constantes de layout
└── hooks/
    └── useBreakpoint.ts # Hook responsive (desktop vs mobile)
```

## Responsive Design

- **Mobile:** navegacion por tabs inferiores, layouts de una columna
- **Desktop:** sidebar lateral + layouts de dos columnas (contenido + aside)
- Hook `useBreakpoint()` para adaptar la UI segun el tamano de pantalla

## Datos de prueba

La app utiliza datos mock para demostrar todas las funcionalidades. El login acepta cualquier email y contrasena para facilitar las pruebas.

## Despliegue

El proyecto esta configurado para deploy en **Vercel** (web) y puede compilarse para iOS/Android con Expo.

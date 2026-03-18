export type Role = 'alumno' | 'docente' | 'padre';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface FeedPost {
  id: string;
  title: string;
  body: string;
  author: string;
  date: string;
  category: 'comunicado' | 'novedad' | 'evento' | 'urgente';
  image?: string;
  targetAudience?: 'todos' | 'alumnos' | 'docentes' | 'padres';
  pinned?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  teacher: string;
  color: string;
}

export interface Grade {
  id: string;
  subjectId: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  value: number;
  date: string;
  description: string;
  period: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'presente' | 'ausente' | 'tardanza';
  courseId: string;
  checkInTime?: string; // HH:MM — hora exacta del fichaje en kiosk; ausente si undefined
}

export interface Course {
  id: string;
  name: string;
  grade: string;
  students: { id: string; name: string }[];
  subjectId: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'examen' | 'reunion' | 'acto' | 'feriado';
  description?: string;
  subjectId?: string;
}

export interface Communication {
  id: string;
  title: string;
  body: string;
  author: string;
  date: string;
  courseId?: string;
  read: boolean;
  requiresConfirmation: boolean;
  confirmed: boolean;
}

export type ReactionType = 'like' | 'love' | 'aplauso' | 'sorpresa';

export interface GroupMember {
  userId: string;
  userName: string;
  role: 'admin' | 'miembro';
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  type: 'curso' | 'materia' | 'extracurricular' | 'privado';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  members: GroupMember[];
  coverColor: string;
  isAutomatic?: boolean;
}

export interface WallPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole?: Role;
  authorAvatar?: string;
  text: string;
  image?: string;
  date: string;
  likes: string[];
  reactions?: Record<string, ReactionType>; // userId → reactionType
  viewedBy?: string[]; // userIds que vieron el post
  comments: WallComment[];
  groupId?: string;
  groupName?: string;
}

export interface WallComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  date: string;
}

export interface Classmate {
  id: string;
  name: string;
  avatar?: string;
  grade: string;
  isAdded: boolean;
}

export interface ParentContact {
  id: string;
  name: string;
  childName: string;
  avatar?: string;
  grade: string;
  isContact: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  date: string;
  time: string;
}

export interface Trip {
  id: string;
  title: string;
  type: 'excursion' | 'campamento' | 'egresados' | 'salida';
  date: string;
  location: string;
  status: 'proximo' | 'confirmado' | 'finalizado';
  details: {
    horarioSalida: string;
    horarioRegreso: string;
    puntoEncuentro: string;
    transporte: string;
    descripcion: string;
    queLlevar: string[];
    autorizacionRequerida: boolean;
    autorizacionEstado: 'pendiente' | 'autorizado' | 'no_requerido';
    contactoEmergencia: string;
  };
}

export interface TripAttendee {
  studentId: string;
  studentName: string;
  authorized: boolean;
  authorizedBy: string | null;
}

export interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

export interface AppNotification {
  id: string;
  type: 'tarea' | 'comunicado' | 'grupo' | 'autorizacion' | 'mensaje';
  title: string;
  body: string;
  date: string;
  read: boolean;
  targetUserId?: string; // undefined = todos
  targetRole?: Role;     // undefined = todos los roles
  deepLink?: string;     // ruta para navegar al tocar
}

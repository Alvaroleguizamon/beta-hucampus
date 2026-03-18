import { create } from 'zustand';
import { AppNotification, Role } from '../types';

const seedNotifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'tarea',
    title: 'Nueva tarea publicada',
    body: 'Ejercicios de fracciones — entrega 20/03',
    date: '2026-03-10',
    read: false,
    targetRole: 'alumno',
    deepLink: '/(tabs)/grades',
  },
  {
    id: 'n2',
    type: 'comunicado',
    title: 'Reunión de padres',
    body: 'El jueves 20/03 a las 18 hs en el salón principal.',
    date: '2026-03-12',
    read: false,
    deepLink: '/(tabs)/communications',
  },
  {
    id: 'n3',
    type: 'grupo',
    title: 'Invitación a grupo',
    body: 'Fuiste invitado al grupo Robótica 2026.',
    date: '2026-03-14',
    read: false,
    targetRole: 'alumno',
    deepLink: '/(tabs)/grupos',
  },
  {
    id: 'n4',
    type: 'autorizacion',
    title: 'Autorización pendiente',
    body: 'Excursión al Planetario requiere tu autorización.',
    date: '2026-03-15',
    read: false,
    targetRole: 'padre',
    deepLink: '/(tabs)/grades',
  },
  {
    id: 'n5',
    type: 'comunicado',
    title: 'Acto del 24 de Marzo',
    body: 'Recordatorio: acto institucional el lunes 24/03.',
    date: '2026-03-16',
    read: true,
    deepLink: '/(tabs)/wall',
  },
];

interface NotificationsState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: (userId: string, role: Role) => void;
  getUnreadCount: (userId: string, role: Role) => number;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: seedNotifications,

  addNotification: (notification) => {
    const newNotif: AppNotification = {
      ...notification,
      id: `n${Date.now()}`,
      read: false,
    };
    set((state) => ({ notifications: [newNotif, ...state.notifications] }));
  },

  markRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllRead: (userId, role) => {
    set((state) => ({
      notifications: state.notifications.map((n) => {
        if (n.read) return n;
        const isForUser = !n.targetUserId || n.targetUserId === userId;
        const isForRole = !n.targetRole || n.targetRole === role;
        return isForUser && isForRole ? { ...n, read: true } : n;
      }),
    }));
  },

  getUnreadCount: (userId, role) => {
    return get().notifications.filter((n) => {
      if (n.read) return false;
      const isForUser = !n.targetUserId || n.targetUserId === userId;
      const isForRole = !n.targetRole || n.targetRole === role;
      return isForUser && isForRole;
    }).length;
  },
}));

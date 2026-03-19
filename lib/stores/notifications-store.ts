import { create } from 'zustand';
import { AppNotification, Role } from '../types';
import { supabase } from '../supabase';

interface NotificationsState {
  notifications: AppNotification[];
  loading: boolean;
  initialize: (userId: string, role: Role) => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'read'>) => void;
  markRead: (id: string, userId: string) => void;
  markAllRead: (userId: string, role: Role) => void;
  getUnreadCount: (userId: string, role: Role) => number;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  loading: true,

  initialize: async (userId, role) => {
    const [notifRes, readsRes] = await Promise.all([
      supabase.from('notifications').select('*').order('notif_date', { ascending: false }),
      supabase.from('notification_reads').select('notification_id').eq('user_id', userId),
    ]);
    const readIds = new Set((readsRes.data ?? []).map((r) => r.notification_id));
    set({
      notifications: (notifRes.data ?? []).map((n) => ({
        id: n.id,
        type: n.notif_type as AppNotification['type'],
        title: n.title,
        body: n.body,
        date: n.notif_date,
        read: readIds.has(n.id),
        targetUserId: n.target_user_id ?? undefined,
        targetRole: n.target_role ?? undefined,
        deepLink: n.deep_link ?? undefined,
      })),
      loading: false,
    });
  },

  addNotification: (notification) => {
    const newNotif: AppNotification = {
      ...notification,
      id: `n${Date.now()}`,
      read: false,
    };
    set((state) => ({ notifications: [newNotif, ...state.notifications] }));
    supabase.from('notifications').insert({
      id: newNotif.id,
      notif_type: newNotif.type,
      title: newNotif.title,
      body: newNotif.body,
      notif_date: newNotif.date,
      target_user_id: newNotif.targetUserId ?? null,
      target_role: newNotif.targetRole ?? null,
      deep_link: newNotif.deepLink ?? null,
    });
  },

  markRead: (id, userId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
    supabase.from('notification_reads').upsert({ notification_id: id, user_id: userId });
  },

  markAllRead: (userId, role) => {
    const toMark = get().notifications.filter((n) => {
      if (n.read) return false;
      const isForUser = !n.targetUserId || n.targetUserId === userId;
      const isForRole = !n.targetRole || n.targetRole === role;
      return isForUser && isForRole;
    });
    set((state) => ({
      notifications: state.notifications.map((n) => {
        if (n.read) return n;
        const isForUser = !n.targetUserId || n.targetUserId === userId;
        const isForRole = !n.targetRole || n.targetRole === role;
        return isForUser && isForRole ? { ...n, read: true } : n;
      }),
    }));
    if (toMark.length > 0) {
      supabase.from('notification_reads').upsert(
        toMark.map((n) => ({ notification_id: n.id, user_id: userId }))
      );
    }
  },

  getUnreadCount: (userId, role) =>
    get().notifications.filter((n) => {
      if (n.read) return false;
      const isForUser = !n.targetUserId || n.targetUserId === userId;
      const isForRole = !n.targetRole || n.targetRole === role;
      return isForUser && isForRole;
    }).length,
}));

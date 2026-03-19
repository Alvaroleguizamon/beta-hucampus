import { create } from 'zustand';
import { Role, User } from '../types';
import { supabase } from '../supabase';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

async function fetchProfileByEmail(email: string): Promise<User | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, name, email, role')
    .eq('email', email)
    .single();
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email ?? email,
    role: data.role as Role,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  loading: true,

  restoreSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { set({ loading: false }); return; }

      const profile = await fetchProfileByEmail(session.user.email!);
      if (profile) {
        set({ user: profile, isLoggedIn: true, loading: false });
      } else {
        await supabase.auth.signOut();
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const profile = await fetchProfileByEmail(data.user.email!);
    if (!profile) {
      await supabase.auth.signOut();
      return { error: 'Perfil no encontrado. Verificá tu email.' };
    }

    set({ user: profile, isLoggedIn: true, loading: false });
    return { error: null };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isLoggedIn: false });
  },
}));

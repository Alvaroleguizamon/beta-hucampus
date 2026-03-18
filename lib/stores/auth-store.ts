import { create } from 'zustand';
import { Role, User } from '../types';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => void;
  selectRole: (role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  login: (_email: string, _password: string) => {
    // Mock login — acepta cualquier credencial
    set({
      user: {
        id: 'u1',
        name: 'Usuario Demo',
        email: _email,
        role: 'alumno',
      },
      isLoggedIn: true,
    });
  },
  selectRole: (role: Role) => {
    const nameByRole: Record<Role, string> = {
      alumno: 'Lucía Martínez',
      docente: 'Prof. Carlos Romero',
      padre: 'Martín González',
    };
    set((state) => ({
      user: state.user ? { ...state.user, role, name: nameByRole[role] } : null,
    }));
  },
  logout: () => {
    set({ user: null, isLoggedIn: false });
  },
}));

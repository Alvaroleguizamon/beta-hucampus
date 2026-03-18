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
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    }));
  },
  logout: () => {
    set({ user: null, isLoggedIn: false });
  },
}));

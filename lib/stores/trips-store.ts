import { create } from 'zustand';
import { Trip, TripAttendee } from '../types';
import { mockTrips, mockTripAttendees } from '../mock-data';

export interface Authorization {
  id: string;
  title: string;
  type: 'salida' | 'retiro' | 'actividad' | 'medica';
  date: string;
  status: 'pendiente' | 'autorizado' | 'rechazado' | 'vencido';
  description: string;
  authorizedBy?: string;
  authorizedDate?: string;
}

const initialAuthorizations: Authorization[] = [
  {
    id: 'auth1',
    title: 'Salida al Museo de Ciencias Naturales',
    type: 'salida',
    date: '2026-03-25',
    status: 'pendiente',
    description: 'Se requiere autorización para la salida educativa al Museo de Ciencias Naturales el 25/03.',
  },
  {
    id: 'auth2',
    title: 'Viaje de Egresados - Bariloche',
    type: 'salida',
    date: '2026-09-10',
    status: 'pendiente',
    description: 'Autorización para el viaje de egresados a Bariloche del 10 al 21 de septiembre.',
  },
  {
    id: 'auth3',
    title: 'Campamento Sierra de la Ventana',
    type: 'salida',
    date: '2026-04-15',
    status: 'autorizado',
    description: 'Campamento de 3 días en Sierra de la Ventana.',
    authorizedBy: 'Carlos Pérez (Padre)',
    authorizedDate: '2026-03-12',
  },
  {
    id: 'auth4',
    title: 'Retiro anticipado - Turno médico',
    type: 'retiro',
    date: '2026-03-19',
    status: 'autorizado',
    description: 'Retiro a las 11:00 hs por turno con el dentista.',
    authorizedBy: 'Carlos Pérez (Padre)',
    authorizedDate: '2026-03-17',
  },
  {
    id: 'auth5',
    title: 'Clase de natación extracurricular',
    type: 'actividad',
    date: '2026-03-01',
    status: 'autorizado',
    description: 'Participación en el taller de natación los viernes de 14 a 16 hs.',
    authorizedBy: 'Carlos Pérez (Padre)',
    authorizedDate: '2026-02-28',
  },
  {
    id: 'auth6',
    title: 'Visita a la Usina del Arte',
    type: 'salida',
    date: '2026-03-10',
    status: 'vencido',
    description: 'La autorización venció sin ser completada.',
  },
];

interface TripsState {
  trips: Trip[];
  attendees: Record<string, TripAttendee[]>;
  authorizations: Authorization[];
  authorize: (authId: string, authorizedBy: string) => void;
  reject: (authId: string) => void;
}

export const useTripsStore = create<TripsState>((set) => ({
  trips: [...mockTrips],
  attendees: { ...mockTripAttendees },
  authorizations: initialAuthorizations,

  authorize: (authId, authorizedBy) => {
    const today = new Date().toISOString().split('T')[0];
    set((s) => ({
      authorizations: s.authorizations.map((a) =>
        a.id !== authId
          ? a
          : { ...a, status: 'autorizado' as const, authorizedBy, authorizedDate: today },
      ),
      // Also update the matching trip's autorizacionEstado
      trips: s.trips.map((t) => {
        const matchingAuth = s.authorizations.find((a) => a.id === authId);
        if (!matchingAuth) return t;
        if (!t.title.toLowerCase().includes(matchingAuth.title.toLowerCase().slice(0, 10))) return t;
        return {
          ...t,
          details: { ...t.details, autorizacionEstado: 'autorizado' as const },
        };
      }),
    }));
  },

  reject: (authId) =>
    set((s) => ({
      authorizations: s.authorizations.map((a) =>
        a.id !== authId ? a : { ...a, status: 'rechazado' as const },
      ),
    })),
}));

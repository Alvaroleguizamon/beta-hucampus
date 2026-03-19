import { create } from 'zustand';
import { CalendarEvent } from '../types';
import { supabase } from '../supabase';

interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  selectedDate: string | null;
  initialize: () => Promise<void>;
  setSelectedDate: (date: string | null) => void;
  getEventsByDate: (date: string) => CalendarEvent[];
  getEventsByType: (type: CalendarEvent['type']) => CalendarEvent[];
  deleteEvent: (id: string) => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  loading: true,
  selectedDate: null,

  initialize: async () => {
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date');
    if (!data) { set({ loading: false }); return; }
    set({
      events: data.map((r) => ({
        id: r.id,
        title: r.title,
        date: r.event_date,
        type: r.event_type as CalendarEvent['type'],
        description: r.description ?? undefined,
        subjectId: r.subject_id ?? undefined,
      })),
      loading: false,
    });
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
  getEventsByDate: (date) => get().events.filter((e) => e.date === date),
  getEventsByType: (type) => get().events.filter((e) => e.type === type),
  deleteEvent: (id) => {
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
    supabase.from('calendar_events').delete().eq('id', id)
      .then(({ error }) => { if (error) console.error('[calendar-store] deleteEvent error:', error); });
  },
}));

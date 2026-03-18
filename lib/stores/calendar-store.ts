import { create } from 'zustand';
import { CalendarEvent } from '../types';
import { mockCalendarEvents } from '../mock-data';

interface CalendarState {
  events: CalendarEvent[];
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  getEventsByDate: (date: string) => CalendarEvent[];
  getEventsByType: (type: CalendarEvent['type']) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: mockCalendarEvents,
  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  getEventsByDate: (date) => {
    return get().events.filter((e) => e.date === date);
  },
  getEventsByType: (type) => {
    return get().events.filter((e) => e.type === type);
  },
}));

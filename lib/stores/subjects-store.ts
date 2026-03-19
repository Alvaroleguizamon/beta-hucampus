import { create } from 'zustand';
import { Subject } from '../types';
import { supabase } from '../supabase';

interface SubjectsState {
  subjects: Subject[];
  loading: boolean;
  initialize: () => Promise<void>;
}

export const useSubjectsStore = create<SubjectsState>((set) => ({
  subjects: [],
  loading: true,

  initialize: async () => {
    const { data } = await supabase.from('subjects').select('*');
    if (!data) { set({ loading: false }); return; }
    set({
      subjects: data.map((s) => ({
        id: s.id,
        name: s.name,
        teacher: s.teacher,
        teacherId: s.teacher_id ?? undefined,
        color: s.color,
      })),
      loading: false,
    });
  },
}));

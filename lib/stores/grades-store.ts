import { create } from 'zustand';
import { Grade } from '../types';
import { supabase } from '../supabase';
import { useNotificationsStore } from './notifications-store';

interface GradesState {
  grades: Grade[];
  loading: boolean;
  initialize: () => Promise<void>;
  addGrade: (grade: Omit<Grade, 'id'>) => void;
  updateGrade: (id: string, value: number) => void;
  deleteGrade: (id: string) => void;
  getGradesByStudent: (studentId: string) => Grade[];
  getGradesBySubject: (subjectId: string) => Grade[];
}

export const useGradesStore = create<GradesState>((set, get) => ({
  grades: [],
  loading: true,

  initialize: async () => {
    const [gradesRes, subjectsRes, profilesRes] = await Promise.all([
      supabase.from('grades').select('*'),
      supabase.from('subjects').select('id, name'),
      supabase.from('profiles').select('id, name'),
    ]);
    const subjectMap: Record<string, string> = Object.fromEntries(
      (subjectsRes.data ?? []).map((s) => [s.id, s.name])
    );
    const profileMap: Record<string, string> = Object.fromEntries(
      (profilesRes.data ?? []).map((p) => [p.id, p.name])
    );
    set({
      grades: (gradesRes.data ?? []).map((g) => ({
        id: g.id,
        subjectId: g.subject_id,
        subjectName: subjectMap[g.subject_id] ?? '',
        studentId: g.student_id,
        studentName: profileMap[g.student_id] ?? '',
        value: g.value,
        date: g.grade_date,
        description: g.description ?? '',
        period: g.period,
        category: (g.category ?? 'examen') as 'examen' | 'tp',
      })),
      loading: false,
    });
  },

  addGrade: (grade) => {
    const newGrade: Grade = { ...grade, id: `g${Date.now()}` };
    set((state) => ({ grades: [...state.grades, newGrade] }));
    useNotificationsStore.getState().addNotification({
      type: 'tarea',
      title: 'Nueva nota cargada',
      body: `${grade.subjectName}: ${grade.description} — ${grade.value}`,
      date: new Date().toISOString().split('T')[0],
      targetUserId: grade.studentId,
      deepLink: '/apps/notas',
    });
    supabase.from('grades').insert({
      id: newGrade.id,
      subject_id: newGrade.subjectId,
      student_id: newGrade.studentId,
      value: newGrade.value,
      description: newGrade.description,
      period: newGrade.period,
      grade_date: newGrade.date,
      category: newGrade.category,
    });
  },

  updateGrade: (id, value) => {
    set((state) => ({
      grades: state.grades.map((g) => g.id === id ? { ...g, value } : g),
    }));
    supabase.from('grades').update({ value }).eq('id', id)
      .then(({ error }) => { if (error) console.error('[grades-store] updateGrade error:', error); });
  },

  deleteGrade: (id) => {
    set((state) => ({ grades: state.grades.filter((g) => g.id !== id) }));
    supabase.from('grades').delete().eq('id', id)
      .then(({ error }) => { if (error) console.error('[grades-store] deleteGrade error:', error); });
  },

  getGradesByStudent: (studentId) => get().grades.filter((g) => g.studentId === studentId),
  getGradesBySubject: (subjectId) => get().grades.filter((g) => g.subjectId === subjectId),
}));

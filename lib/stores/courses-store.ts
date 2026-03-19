import { create } from 'zustand';
import { Course } from '../types';
import { supabase } from '../supabase';

interface CoursesState {
  courses: Course[];
  loading: boolean;
  initialize: () => Promise<void>;
}

export const useCoursesStore = create<CoursesState>((set) => ({
  courses: [],
  loading: true,

  initialize: async () => {
    const [coursesRes, enrollmentsRes, profilesRes] = await Promise.all([
      supabase.from('courses').select('*'),
      supabase.from('course_enrollments').select('course_id, student_id'),
      supabase.from('profiles').select('id, name'),
    ]);
    const profileMap: Record<string, string> = Object.fromEntries(
      (profilesRes.data ?? []).map((p) => [p.id, p.name])
    );
    const enrollments = enrollmentsRes.data ?? [];
    const courses: Course[] = (coursesRes.data ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      grade: c.grade,
      subjectId: c.subject_id ?? '',
      students: enrollments
        .filter((e) => e.course_id === c.id)
        .map((e) => ({ id: e.student_id, name: profileMap[e.student_id] ?? e.student_id })),
    }));
    set({ courses, loading: false });
  },
}));

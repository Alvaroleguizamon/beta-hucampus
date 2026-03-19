import { create } from 'zustand';
import { supabase } from '../supabase';
import { AdminCourse, AdminSubject, CourseSchedule } from '../types';

export const SUBJECT_COLORS = [
  '#5B77D3', '#E67E22', '#27AE60', '#9C27B0', '#E74C3C',
  '#00897B', '#F39C12', '#2980B9', '#7C6BC4', '#16A085',
];

export const TIME_SLOTS = [
  '07:00', '07:50', '08:40', '09:30', '10:20', '11:10',
  '12:00', '12:50', '13:40', '14:30', '15:20', '16:10', '17:00',
];

export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface AdminState {
  courses: AdminCourse[];
  subjects: AdminSubject[];
  teachers: { id: string; name: string }[];
  students: { id: string; name: string }[];
  loading: boolean;

  initialize: () => Promise<void>;

  // Courses
  createCourse: (name: string, grade: string) => Promise<{ error: string | null }>;
  updateCourse: (id: string, name: string, grade: string) => Promise<{ error: string | null }>;
  deleteCourse: (id: string) => Promise<{ error: string | null }>;

  // Subjects
  createSubject: (name: string, color: string) => Promise<{ error: string | null }>;
  updateSubject: (id: string, name: string, color: string) => Promise<{ error: string | null }>;
  deleteSubject: (id: string) => Promise<{ error: string | null }>;

  // Schedules
  createSchedule: (
    courseId: string, subjectId: string, teacherId: string,
    dayOfWeek: number, startTime: string, endTime: string, room?: string
  ) => Promise<{ error: string | null }>;
  updateSchedule: (
    id: string, subjectId: string, teacherId: string,
    dayOfWeek: number, startTime: string, endTime: string, room?: string
  ) => Promise<{ error: string | null }>;
  deleteSchedule: (id: string, courseId: string) => Promise<{ error: string | null }>;

  // Enrollments
  enrollStudent: (courseId: string, studentId: string) => Promise<{ error: string | null }>;
  unenrollStudent: (courseId: string, studentId: string) => Promise<{ error: string | null }>;
}

async function fetchAll() {
  const [coursesRes, enrollmentsRes, profilesRes, subjectsRes, schedulesRes] = await Promise.all([
    supabase.from('courses').select('*').order('grade'),
    supabase.from('course_enrollments').select('course_id, student_id'),
    supabase.from('profiles').select('id, name, role'),
    supabase.from('subjects').select('*').order('name'),
    supabase.from('course_schedules').select('*'),
  ]);

  const profiles = profilesRes.data ?? [];
  const profileMap: Record<string, string> = Object.fromEntries(profiles.map((p) => [p.id, p.name]));
  const subjectMap: Record<string, AdminSubject> = Object.fromEntries(
    (subjectsRes.data ?? []).map((s) => [s.id, { id: s.id, name: s.name, color: s.color }])
  );

  const schedules = (schedulesRes.data ?? []).map((s): CourseSchedule => ({
    id: s.id,
    courseId: s.course_id,
    subjectId: s.subject_id,
    subjectName: subjectMap[s.subject_id]?.name ?? s.subject_id,
    subjectColor: subjectMap[s.subject_id]?.color ?? '#5B77D3',
    teacherId: s.teacher_id,
    teacherName: profileMap[s.teacher_id] ?? s.teacher_id,
    dayOfWeek: s.day_of_week,
    startTime: s.start_time,
    endTime: s.end_time,
    room: s.room ?? undefined,
  }));

  const enrollments = enrollmentsRes.data ?? [];

  const courses: AdminCourse[] = (coursesRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
    students: enrollments
      .filter((e) => e.course_id === c.id)
      .map((e) => ({ id: e.student_id, name: profileMap[e.student_id] ?? e.student_id })),
    schedules: schedules.filter((s) => s.courseId === c.id),
  }));

  const subjects: AdminSubject[] = (subjectsRes.data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
  }));

  const teachers = profiles.filter((p) => p.role === 'docente').map((p) => ({ id: p.id, name: p.name }));
  const students = profiles.filter((p) => p.role === 'alumno').map((p) => ({ id: p.id, name: p.name }));

  return { courses, subjects, teachers, students };
}

export const useAdminStore = create<AdminState>((set, get) => ({
  courses: [],
  subjects: [],
  teachers: [],
  students: [],
  loading: true,

  initialize: async () => {
    set({ loading: true });
    const data = await fetchAll();
    set({ ...data, loading: false });
  },

  // ── Courses ──────────────────────────────────────────────

  createCourse: async (name, grade) => {
    const id = `course_${Date.now()}`;
    const { error } = await supabase.from('courses').insert({ id, name, grade });
    if (error) return { error: error.message };
    const newCourse: AdminCourse = { id, name, grade, students: [], schedules: [] };
    set((s) => ({ courses: [...s.courses, newCourse].sort((a, b) => a.grade.localeCompare(b.grade)) }));
    return { error: null };
  },

  updateCourse: async (id, name, grade) => {
    const { error } = await supabase.from('courses').update({ name, grade }).eq('id', id);
    if (error) return { error: error.message };
    set((s) => ({
      courses: s.courses.map((c) => c.id === id ? { ...c, name, grade } : c),
    }));
    return { error: null };
  },

  deleteCourse: async (id) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) return { error: error.message };
    set((s) => ({ courses: s.courses.filter((c) => c.id !== id) }));
    return { error: null };
  },

  // ── Subjects ─────────────────────────────────────────────

  createSubject: async (name, color) => {
    const id = `subj_${Date.now()}`;
    const { error } = await supabase.from('subjects').insert({ id, name, color });
    if (error) return { error: error.message };
    set((s) => ({ subjects: [...s.subjects, { id, name, color }] }));
    return { error: null };
  },

  updateSubject: async (id, name, color) => {
    const { error } = await supabase.from('subjects').update({ name, color }).eq('id', id);
    if (error) return { error: error.message };
    // Update subjects list and reflect name/color changes in all schedules
    set((s) => ({
      subjects: s.subjects.map((sub) => sub.id === id ? { ...sub, name, color } : sub),
      courses: s.courses.map((c) => ({
        ...c,
        schedules: c.schedules.map((sch) =>
          sch.subjectId === id ? { ...sch, subjectName: name, subjectColor: color } : sch
        ),
      })),
    }));
    return { error: null };
  },

  deleteSubject: async (id) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) return { error: error.message };
    set((s) => ({ subjects: s.subjects.filter((sub) => sub.id !== id) }));
    return { error: null };
  },

  // ── Schedules ────────────────────────────────────────────

  createSchedule: async (courseId, subjectId, teacherId, dayOfWeek, startTime, endTime, room) => {
    const { data, error } = await supabase
      .from('course_schedules')
      .insert({ course_id: courseId, subject_id: subjectId, teacher_id: teacherId, day_of_week: dayOfWeek, start_time: startTime, end_time: endTime, room: room ?? null })
      .select()
      .single();
    if (error) return { error: error.message };

    const { subjects, teachers } = get();
    const subj = subjects.find((s) => s.id === subjectId);
    const teacher = teachers.find((t) => t.id === teacherId);
    const newSchedule: CourseSchedule = {
      id: data.id,
      courseId,
      subjectId,
      subjectName: subj?.name ?? subjectId,
      subjectColor: subj?.color ?? '#5B77D3',
      teacherId,
      teacherName: teacher?.name ?? teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room,
    };
    set((s) => ({
      courses: s.courses.map((c) =>
        c.id === courseId ? { ...c, schedules: [...c.schedules, newSchedule] } : c
      ),
    }));
    return { error: null };
  },

  updateSchedule: async (id, subjectId, teacherId, dayOfWeek, startTime, endTime, room) => {
    const { error } = await supabase
      .from('course_schedules')
      .update({ subject_id: subjectId, teacher_id: teacherId, day_of_week: dayOfWeek, start_time: startTime, end_time: endTime, room: room ?? null })
      .eq('id', id);
    if (error) return { error: error.message };

    const { subjects, teachers } = get();
    const subj = subjects.find((s) => s.id === subjectId);
    const teacher = teachers.find((t) => t.id === teacherId);
    set((s) => ({
      courses: s.courses.map((c) => ({
        ...c,
        schedules: c.schedules.map((sch) =>
          sch.id === id
            ? { ...sch, subjectId, subjectName: subj?.name ?? subjectId, subjectColor: subj?.color ?? '#5B77D3', teacherId, teacherName: teacher?.name ?? teacherId, dayOfWeek, startTime, endTime, room }
            : sch
        ),
      })),
    }));
    return { error: null };
  },

  deleteSchedule: async (id, courseId) => {
    const { error } = await supabase.from('course_schedules').delete().eq('id', id);
    if (error) return { error: error.message };
    set((s) => ({
      courses: s.courses.map((c) =>
        c.id === courseId ? { ...c, schedules: c.schedules.filter((sch) => sch.id !== id) } : c
      ),
    }));
    return { error: null };
  },

  // ── Enrollments ──────────────────────────────────────────

  enrollStudent: async (courseId, studentId) => {
    const { error } = await supabase.from('course_enrollments').insert({ course_id: courseId, student_id: studentId });
    if (error) return { error: error.message };
    const { students } = get();
    const student = students.find((s) => s.id === studentId);
    if (!student) return { error: null };
    set((s) => ({
      courses: s.courses.map((c) =>
        c.id === courseId ? { ...c, students: [...c.students, { id: studentId, name: student.name }] } : c
      ),
    }));
    return { error: null };
  },

  unenrollStudent: async (courseId, studentId) => {
    const { error } = await supabase
      .from('course_enrollments')
      .delete()
      .eq('course_id', courseId)
      .eq('student_id', studentId);
    if (error) return { error: error.message };
    set((s) => ({
      courses: s.courses.map((c) =>
        c.id === courseId ? { ...c, students: c.students.filter((st) => st.id !== studentId) } : c
      ),
    }));
    return { error: null };
  },
}));

import { create } from 'zustand';
import { AttendanceRecord } from '../types';
import { supabase } from '../supabase';

interface AttendanceState {
  records: AttendanceRecord[];
  loading: boolean;
  initialize: () => Promise<void>;
  addRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  records: [],
  loading: true,

  initialize: async () => {
    const [attendanceRes, profilesRes] = await Promise.all([
      supabase.from('attendance').select('*').order('attend_date', { ascending: false }),
      supabase.from('profiles').select('id, name'),
    ]);
    const profileMap: Record<string, string> = Object.fromEntries(
      (profilesRes.data ?? []).map((p) => [p.id, p.name])
    );
    set({
      records: (attendanceRes.data ?? []).map((a) => ({
        id: a.id,
        studentId: a.student_id,
        studentName: profileMap[a.student_id] ?? a.student_id,
        date: a.attend_date,
        status: a.status as AttendanceRecord['status'],
        courseId: a.course_id,
        checkInTime: a.check_in_time ?? undefined,
      })),
      loading: false,
    });
  },

  addRecord: (record) => {
    const newRecord: AttendanceRecord = { ...record, id: `a${Date.now()}` };
    set((state) => ({ records: [newRecord, ...state.records] }));
    supabase.from('attendance').insert({
      id: newRecord.id,
      student_id: newRecord.studentId,
      course_id: newRecord.courseId,
      attend_date: newRecord.date,
      status: newRecord.status,
      check_in_time: newRecord.checkInTime ?? null,
    });
  },
}));

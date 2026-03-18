import { create } from 'zustand';
import { Grade } from '../types';
import { mockGrades } from '../mock-data';

interface GradesState {
  grades: Grade[];
  addGrade: (grade: Omit<Grade, 'id'>) => void;
  getGradesByStudent: (studentId: string) => Grade[];
  getGradesBySubject: (subjectId: string) => Grade[];
}

export const useGradesStore = create<GradesState>((set, get) => ({
  grades: mockGrades,
  addGrade: (grade) => {
    const newGrade: Grade = { ...grade, id: `g${Date.now()}` };
    set((state) => ({ grades: [...state.grades, newGrade] }));
  },
  getGradesByStudent: (studentId) => {
    return get().grades.filter((g) => g.studentId === studentId);
  },
  getGradesBySubject: (subjectId) => {
    return get().grades.filter((g) => g.subjectId === subjectId);
  },
}));

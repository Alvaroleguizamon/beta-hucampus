import { create } from 'zustand';
import { mockCourses } from '../mock-data';

interface CourseState {
  selectedCourseId: string;
  setSelectedCourse: (id: string) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  selectedCourseId: mockCourses[0].id,
  setSelectedCourse: (id) => set({ selectedCourseId: id }),
}));

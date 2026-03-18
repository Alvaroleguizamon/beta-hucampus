import { create } from 'zustand';

export interface StudentDelivery {
  studentId: string;
  studentName: string;
  status: 'pendiente' | 'entregado';
  submissionDate?: string;
  submissionContent?: string;
}

export interface TaskAttachment {
  id: string;
  type: 'archivo' | 'link';
  name: string;
  url?: string;
}

export interface DocenteTask {
  id: string;
  title: string;
  courseId: string;
  dueDate: string;
  priority: 'alta' | 'media' | 'baja';
  description?: string;
  attachments?: TaskAttachment[];
  deliveries: StudentDelivery[];
}

export interface DraftTask {
  id: string;
  title: string;
  courseId: string;
  assignTo: 'curso' | 'alumnos';
  selectedStudentIds: string[];
  dueDate: string;
  priority: 'alta' | 'media' | 'baja';
  description: string;
  attachments: TaskAttachment[];
}

const initialPublishedTasks: DocenteTask[] = [
  {
    id: 'dt1',
    title: 'Resolver ejercicios pág. 45-48',
    courseId: 'c1',
    dueDate: '2026-03-20',
    priority: 'alta',
    description: 'Resolver todos los ejercicios de las páginas 45 a 48. Mostrar procedimiento completo.',
    attachments: [
      { id: 'att1', type: 'archivo', name: 'Guía_ejercicios_U3.pdf' },
      { id: 'att2', type: 'link', name: 'Video explicativo - Ecuaciones', url: 'https://example.com/video' },
    ],
    deliveries: [
      { studentId: 'st1', studentName: 'Juan Pérez', status: 'entregado', submissionDate: '2026-03-18', submissionContent: 'Ejercicios resueltos.' },
      { studentId: 'st2', studentName: 'María González', status: 'entregado', submissionDate: '2026-03-19', submissionContent: 'Adjunto PDF con resolución.' },
      { studentId: 'st3', studentName: 'Lucas Rodríguez', status: 'pendiente' },
      { studentId: 'st4', studentName: 'Sofía Martínez', status: 'pendiente' },
      { studentId: 'st5', studentName: 'Mateo López', status: 'entregado', submissionDate: '2026-03-17', submissionContent: 'Resuelto completo.' },
      { studentId: 'u1', studentName: 'Lucía Martínez', status: 'pendiente' },
    ],
  },
  {
    id: 'dt2',
    title: 'Estudiar para parcial - Unidades 1-3',
    courseId: 'c1',
    dueDate: '2026-03-25',
    priority: 'media',
    description: 'Estudiar unidades 1 a 3 para el parcial.',
    deliveries: [
      { studentId: 'st1', studentName: 'Juan Pérez', status: 'pendiente' },
      { studentId: 'st2', studentName: 'María González', status: 'pendiente' },
      { studentId: 'st3', studentName: 'Lucas Rodríguez', status: 'pendiente' },
      { studentId: 'st4', studentName: 'Sofía Martínez', status: 'pendiente' },
      { studentId: 'st5', studentName: 'Mateo López', status: 'pendiente' },
      { studentId: 'u1', studentName: 'Lucía Martínez', status: 'pendiente' },
    ],
  },
  {
    id: 'dt3',
    title: 'Trabajo práctico - Ecuaciones cuadráticas',
    courseId: 'c2',
    dueDate: '2026-03-22',
    priority: 'alta',
    description: 'Resolver guía de ecuaciones cuadráticas.',
    deliveries: [
      { studentId: 'st6', studentName: 'Valentina Díaz', status: 'entregado', submissionDate: '2026-03-20', submissionContent: 'Guía resuelta.' },
      { studentId: 'st7', studentName: 'Tomás Fernández', status: 'pendiente' },
      { studentId: 'st8', studentName: 'Camila Ruiz', status: 'entregado', submissionDate: '2026-03-21', submissionContent: 'Adjunto archivo.' },
    ],
  },
  {
    id: 'dt4',
    title: 'Ejercicios de repaso',
    courseId: 'c2',
    dueDate: '2026-03-28',
    priority: 'baja',
    description: 'Completar ejercicios de repaso del cuadernillo.',
    deliveries: [
      { studentId: 'st6', studentName: 'Valentina Díaz', status: 'pendiente' },
      { studentId: 'st7', studentName: 'Tomás Fernández', status: 'pendiente' },
      { studentId: 'st8', studentName: 'Camila Ruiz', status: 'pendiente' },
    ],
  },
];

const initialDrafts: DraftTask[] = [
  {
    id: 'draft1',
    title: 'Ejercicios de funciones',
    courseId: 'c1',
    assignTo: 'curso',
    selectedStudentIds: [],
    dueDate: '2026-04-01',
    priority: 'media',
    description: 'Resolver ejercicios 1 a 15 de la guía de funciones lineales.',
    attachments: [],
  },
];

interface TasksState {
  publishedTasks: DocenteTask[];
  drafts: DraftTask[];
  publishTask: (task: DocenteTask) => void;
  saveDraft: (draft: Omit<DraftTask, 'id'>, editingId?: string) => void;
  removeDraft: (id: string) => void;
  submitDelivery: (taskId: string, studentId: string, content: string) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  publishedTasks: initialPublishedTasks,
  drafts: initialDrafts,

  publishTask: (task) =>
    set((s) => ({ publishedTasks: [task, ...s.publishedTasks] })),

  saveDraft: (draftData, editingId) =>
    set((s) => {
      if (editingId) {
        return {
          drafts: s.drafts.map((d) =>
            d.id === editingId ? { ...d, ...draftData } : d,
          ),
        };
      }
      return {
        drafts: [{ id: `draft${Date.now()}`, ...draftData }, ...s.drafts],
      };
    }),

  removeDraft: (id) =>
    set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),

  submitDelivery: (taskId, studentId, content) =>
    set((s) => ({
      publishedTasks: s.publishedTasks.map((task) =>
        task.id !== taskId
          ? task
          : {
              ...task,
              deliveries: task.deliveries.map((d) =>
                d.studentId !== studentId
                  ? d
                  : {
                      ...d,
                      status: 'entregado' as const,
                      submissionDate: new Date().toISOString().split('T')[0],
                      submissionContent: content,
                    },
              ),
            },
      ),
    })),
}));

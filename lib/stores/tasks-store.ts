import { create } from 'zustand';
import { supabase } from '../supabase';
import { useNotificationsStore } from './notifications-store';

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

interface TasksState {
  publishedTasks: DocenteTask[];
  drafts: DraftTask[];
  loading: boolean;
  initialize: () => Promise<void>;
  publishTask: (task: DocenteTask) => void;
  saveDraft: (draft: Omit<DraftTask, 'id'>, editingId?: string) => void;
  removeDraft: (id: string) => void;
  submitDelivery: (taskId: string, studentId: string, content: string) => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  publishedTasks: [],
  drafts: [],
  loading: true,

  initialize: async () => {
    const [tasksRes, deliveriesRes, attachmentsRes, profilesRes] = await Promise.all([
      supabase.from('tasks').select('*'),
      supabase.from('task_deliveries').select('*'),
      supabase.from('task_attachments').select('*'),
      supabase.from('profiles').select('id, name'),
    ]);
    const profileMap: Record<string, string> = Object.fromEntries(
      (profilesRes.data ?? []).map((p) => [p.id, p.name])
    );
    const allDeliveries = deliveriesRes.data ?? [];
    const allAttachments = attachmentsRes.data ?? [];
    const allTasks = tasksRes.data ?? [];

    const published: DocenteTask[] = allTasks
      .filter((t) => !t.is_draft)
      .map((t) => ({
        id: t.id,
        title: t.title,
        courseId: t.course_id,
        dueDate: t.due_date,
        priority: t.priority as DocenteTask['priority'],
        description: t.description ?? undefined,
        attachments: allAttachments
          .filter((a) => a.task_id === t.id)
          .map((a) => ({
            id: a.id,
            type: a.type as TaskAttachment['type'],
            name: a.name,
            url: a.url ?? undefined,
          })),
        deliveries: allDeliveries
          .filter((d) => d.task_id === t.id)
          .map((d) => ({
            studentId: d.student_id,
            studentName: profileMap[d.student_id] ?? d.student_id,
            status: d.status as StudentDelivery['status'],
            submissionDate: d.submission_date ?? undefined,
            submissionContent: d.submission_content ?? undefined,
          })),
      }));

    const drafts: DraftTask[] = allTasks
      .filter((t) => t.is_draft)
      .map((t) => ({
        id: t.id,
        title: t.title,
        courseId: t.course_id,
        assignTo: 'curso' as const,
        selectedStudentIds: [],
        dueDate: t.due_date,
        priority: t.priority as DraftTask['priority'],
        description: t.description ?? '',
        attachments: allAttachments
          .filter((a) => a.task_id === t.id)
          .map((a) => ({
            id: a.id,
            type: a.type as TaskAttachment['type'],
            name: a.name,
            url: a.url ?? undefined,
          })),
      }));

    set({ publishedTasks: published, drafts, loading: false });
  },

  publishTask: (task) => {
    set((s) => ({ publishedTasks: [task, ...s.publishedTasks] }));
    useNotificationsStore.getState().addNotification({
      type: 'tarea',
      title: 'Nueva tarea publicada',
      body: `${task.title} — entrega ${task.dueDate}`,
      date: new Date().toISOString().split('T')[0],
      targetRole: 'alumno',
      deepLink: '/(tabs)/grades',
    });
    supabase.from('tasks').insert({
      id: task.id,
      title: task.title,
      course_id: task.courseId,
      due_date: task.dueDate,
      priority: task.priority,
      description: task.description ?? null,
      is_draft: false,
    });
  },

  saveDraft: (draftData, editingId) =>
    set((s) => {
      if (editingId) {
        return {
          drafts: s.drafts.map((d) =>
            d.id === editingId ? { ...d, ...draftData } : d
          ),
        };
      }
      const newDraft = { id: `draft${Date.now()}`, ...draftData };
      supabase.from('tasks').insert({
        id: newDraft.id,
        title: newDraft.title,
        course_id: newDraft.courseId,
        due_date: newDraft.dueDate,
        priority: newDraft.priority,
        description: newDraft.description,
        is_draft: true,
      });
      return { drafts: [newDraft, ...s.drafts] };
    }),

  removeDraft: (id) => {
    set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) }));
    supabase.from('tasks').delete().eq('id', id);
  },

  submitDelivery: (taskId, studentId, content) => {
    const today = new Date().toISOString().split('T')[0];
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
                      submissionDate: today,
                      submissionContent: content,
                    }
              ),
            }
      ),
    }));
    supabase
      .from('task_deliveries')
      .update({
        status: 'entregado',
        submission_date: today,
        submission_content: content,
      })
      .eq('task_id', taskId)
      .eq('student_id', studentId);
  },
}));

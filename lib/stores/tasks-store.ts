import { create } from 'zustand';
import { supabase, supabaseAdmin } from '../supabase';
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

export interface PersonalTask {
  id: string;
  ownerId: string;
  title: string;
  subject: string;
  subjectColor: string;
  teacher: string;
  dueDate: string;
  status: 'pendiente' | 'entregado';
  priority: 'alta' | 'media' | 'baja';
  grupal: boolean;
  integrantes: string[];
  description?: string;
  submissionType?: 'texto' | 'archivo';
  submissionContent?: string;
  submissionDate?: string;
}

// Upload a file to the task-attachments Storage bucket.
export async function uploadTaskFile(uri: string, fileName: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const safeName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const path = `files/${safeName}`;

  let { error } = await supabaseAdmin.storage
    .from('task-attachments')
    .upload(path, blob, { contentType: blob.type || 'application/octet-stream', upsert: false });

  if (error) {
    // Bucket might not exist yet — try to create it, then retry
    if (error.message?.toLowerCase().includes('bucket') || (error as any).statusCode === 404) {
      await supabaseAdmin.storage.createBucket('task-attachments', { public: true });
      const retry = await supabaseAdmin.storage
        .from('task-attachments')
        .upload(path, blob, { contentType: blob.type || 'application/octet-stream', upsert: false });
      if (retry.error) throw retry.error;
    } else {
      throw error;
    }
  }

  const { data } = supabaseAdmin.storage.from('task-attachments').getPublicUrl(path);
  return data.publicUrl;
}

interface TasksState {
  publishedTasks: DocenteTask[];
  drafts: DraftTask[];
  personalTasks: PersonalTask[];
  loading: boolean;
  initialize: () => Promise<void>;
  loadPersonalTasks: (userId: string) => Promise<void>;
  addPersonalTask: (task: Omit<PersonalTask, 'id' | 'ownerId'>, userId: string) => Promise<PersonalTask>;
  submitPersonalDelivery: (taskId: string, content: string, type: 'texto' | 'archivo') => void;
  deletePersonalTask: (taskId: string) => void;
  publishTask: (task: DocenteTask) => void;
  saveDraft: (draft: Omit<DraftTask, 'id'>, editingId?: string) => void;
  removeDraft: (id: string) => void;
  submitDelivery: (taskId: string, studentId: string, content: string) => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  publishedTasks: [],
  drafts: [],
  personalTasks: [],
  loading: true,

  initialize: async () => {
    const [tasksRes, deliveriesRes, attachmentsRes, profilesRes] = await Promise.all([
      supabase.from('tasks').select('*'),
      supabase.from('task_deliveries').select('*'),
      supabase.from('task_attachments').select('*'),
      supabase.from('profiles').select('id, name'),
    ]);
    if (tasksRes.error) console.error('[tasks-store] initialize error:', tasksRes.error);
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

  loadPersonalTasks: async (userId) => {
    // Skip if userId is not a valid UUID (e.g. test/mock users like 'doc1', 'u1')
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!userId || !uuidRegex.test(userId)) return;
    const { data, error } = await supabase
      .from('personal_tasks')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    if (error) { console.error('[tasks-store] loadPersonalTasks error:', error); return; }
    set({
      personalTasks: (data ?? []).map((r) => ({
        id: r.id,
        ownerId: r.owner_id,
        title: r.title,
        subject: r.subject,
        subjectColor: r.subject_color,
        teacher: r.teacher ?? '',
        dueDate: r.due_date,
        status: r.status as PersonalTask['status'],
        priority: r.priority as PersonalTask['priority'],
        grupal: r.grupal ?? false,
        integrantes: r.integrantes ?? [],
        description: r.description ?? undefined,
        submissionType: r.submission_type ?? undefined,
        submissionContent: r.submission_content ?? undefined,
        submissionDate: r.submission_date ?? undefined,
      })),
    });
  },

  addPersonalTask: async (taskData, userId) => {
    const newTask: PersonalTask = { id: `pt${Date.now()}`, ownerId: userId, ...taskData };
    set((s) => ({ personalTasks: [newTask, ...s.personalTasks] }));
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) return newTask;
    const { error } = await supabase.from('personal_tasks').insert({
      id: newTask.id,
      owner_id: userId,
      title: newTask.title,
      subject: newTask.subject,
      subject_color: newTask.subjectColor,
      teacher: newTask.teacher,
      due_date: newTask.dueDate,
      status: newTask.status,
      priority: newTask.priority,
      grupal: newTask.grupal,
      integrantes: newTask.integrantes,
      description: newTask.description ?? null,
    });
    if (error) console.error('[tasks-store] addPersonalTask error:', error);
    return newTask;
  },

  submitPersonalDelivery: (taskId, content, type) => {
    const today = new Date().toISOString().split('T')[0];
    set((s) => ({
      personalTasks: s.personalTasks.map((t) =>
        t.id !== taskId ? t : {
          ...t,
          status: 'entregado' as const,
          submissionType: type,
          submissionContent: content,
          submissionDate: today,
        }
      ),
    }));
    supabase.from('personal_tasks')
      .update({ status: 'entregado', submission_type: type, submission_content: content, submission_date: today })
      .eq('id', taskId)
      .then(({ error }) => { if (error) console.error('[tasks-store] submitPersonalDelivery error:', error); });
  },

  deletePersonalTask: (taskId) => {
    set((s) => ({ personalTasks: s.personalTasks.filter((t) => t.id !== taskId) }));
    supabase.from('personal_tasks').delete().eq('id', taskId)
      .then(({ error }) => { if (error) console.error('[tasks-store] deletePersonalTask error:', error); });
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

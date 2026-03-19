import { create } from 'zustand';
import { supabase } from '../supabase';
import { supabaseAdmin } from '../supabase';

export interface SubjectMaterial {
  id: string;
  subjectId: string;
  name: string;
  type: 'pdf' | 'doc' | 'link' | 'youtube_embed' | 'file';
  url?: string;
  youtubeUrl?: string;
  description?: string;
  uploadedBy?: string;
  createdAt: string;
}

export async function uploadMaterialFile(uri: string, fileName: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const safeName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const path = `material/${safeName}`;

  let { error } = await supabaseAdmin.storage
    .from('task-attachments')
    .upload(path, blob, { contentType: blob.type || 'application/octet-stream', upsert: false });

  if (error) {
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

interface MaterialState {
  materials: SubjectMaterial[];
  loading: boolean;
  initialize: () => Promise<void>;
  addMaterial: (material: Omit<SubjectMaterial, 'id' | 'createdAt'>) => Promise<void>;
  deleteMaterial: (id: string) => void;
  getMaterialsBySubject: (subjectId: string) => SubjectMaterial[];
}

export const useMaterialStore = create<MaterialState>((set, get) => ({
  materials: [],
  loading: true,

  initialize: async () => {
    const { data, error } = await supabase
      .from('subject_materials')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('[material-store] initialize error:', error); set({ loading: false }); return; }
    set({
      materials: (data ?? []).map((r) => ({
        id: r.id,
        subjectId: r.subject_id,
        name: r.name,
        type: r.type as SubjectMaterial['type'],
        url: r.url ?? undefined,
        youtubeUrl: r.youtube_url ?? undefined,
        description: r.description ?? undefined,
        uploadedBy: r.uploaded_by ?? undefined,
        createdAt: r.created_at,
      })),
      loading: false,
    });
  },

  addMaterial: async (material) => {
    const newItem: SubjectMaterial = {
      ...material,
      id: `mat_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ materials: [newItem, ...s.materials] }));
    const { error } = await supabase.from('subject_materials').insert({
      id: newItem.id,
      subject_id: newItem.subjectId,
      name: newItem.name,
      type: newItem.type,
      url: newItem.url ?? null,
      youtube_url: newItem.youtubeUrl ?? null,
      description: newItem.description ?? null,
      uploaded_by: newItem.uploadedBy ?? null,
    });
    if (error) console.error('[material-store] addMaterial error:', error);
  },

  deleteMaterial: (id) => {
    set((s) => ({ materials: s.materials.filter((m) => m.id !== id) }));
    supabase.from('subject_materials').delete().eq('id', id)
      .then(({ error }) => { if (error) console.error('[material-store] deleteMaterial error:', error); });
  },

  getMaterialsBySubject: (subjectId) =>
    get().materials.filter((m) => m.subjectId === subjectId),
}));

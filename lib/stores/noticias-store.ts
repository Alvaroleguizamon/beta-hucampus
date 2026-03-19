import { create } from 'zustand';
import { FeedPost } from '../types';
import { supabase } from '../supabase';

interface NoticiasStore {
  posts: FeedPost[];
  loading: boolean;
  initialize: () => Promise<void>;
  addPost: (post: Omit<FeedPost, 'id'>) => void;
  updatePost: (id: string, updates: Partial<FeedPost>) => void;
  deletePost: (id: string) => void;
  getPost: (id: string) => FeedPost | undefined;
}

export const useNoticiasStore = create<NoticiasStore>((set, get) => ({
  posts: [],
  loading: true,

  initialize: async () => {
    const { data } = await supabase
      .from('feed_posts')
      .select('*')
      .order('post_date', { ascending: false });
    if (!data) { set({ loading: false }); return; }
    set({
      posts: data.map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        author: r.author,
        date: r.post_date,
        category: r.category as FeedPost['category'],
        image: r.image_url ?? undefined,
        targetAudience: r.target_audience ?? undefined,
        pinned: r.pinned ?? false,
      })),
      loading: false,
    });
  },

  addPost: async (post) => {
    const newPost: FeedPost = { ...post, id: `f${Date.now()}` };
    set((state) => ({ posts: [newPost, ...state.posts] }));
    supabase.from('feed_posts').insert({
      id: newPost.id,
      title: newPost.title,
      body: newPost.body,
      author: newPost.author,
      post_date: newPost.date,
      category: newPost.category,
      image_url: newPost.image ?? null,
      target_audience: newPost.targetAudience ?? null,
      pinned: newPost.pinned ?? false,
    });
  },

  updatePost: (id, updates) => {
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
    const dbUpdates: Record<string, any> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.body !== undefined) dbUpdates.body = updates.body;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.image !== undefined) dbUpdates.image_url = updates.image ?? null;
    if (updates.targetAudience !== undefined) dbUpdates.target_audience = updates.targetAudience;
    if (updates.pinned !== undefined) dbUpdates.pinned = updates.pinned;
    if (Object.keys(dbUpdates).length > 0) {
      supabase.from('feed_posts').update(dbUpdates).eq('id', id)
        .then(({ error }) => { if (error) console.error('[noticias-store] updatePost error:', error); });
    }
  },

  deletePost: (id) => {
    set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }));
    supabase.from('feed_posts').delete().eq('id', id);
  },

  getPost: (id) => get().posts.find((p) => p.id === id),
}));

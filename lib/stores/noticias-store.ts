import { create } from 'zustand';
import { FeedPost } from '../types';
import { mockFeedPosts } from '../mock-data';

interface NoticiasStore {
  posts: FeedPost[];
  addPost: (post: Omit<FeedPost, 'id'>) => void;
  updatePost: (id: string, updates: Partial<FeedPost>) => void;
  deletePost: (id: string) => void;
  getPost: (id: string) => FeedPost | undefined;
}

export const useNoticiasStore = create<NoticiasStore>((set, get) => ({
  posts: mockFeedPosts,

  addPost: (post) => {
    const newPost: FeedPost = {
      ...post,
      id: `f${Date.now()}`,
    };
    set((state) => ({ posts: [newPost, ...state.posts] }));
  },

  updatePost: (id, updates) => {
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  deletePost: (id) => {
    set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }));
  },

  getPost: (id) => {
    return get().posts.find((p) => p.id === id);
  },
}));

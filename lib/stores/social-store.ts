import { create } from 'zustand';
import { WallPost, Classmate } from '../types';
import { mockWallPosts, mockClassmates } from '../mock-data';

interface SocialState {
  posts: WallPost[];
  classmates: Classmate[];
  addPost: (text: string, image?: string) => void;
  toggleLike: (postId: string, userId: string) => void;
  addComment: (postId: string, userId: string, userName: string, text: string) => void;
  toggleClassmate: (classmateId: string) => void;
}

export const useSocialStore = create<SocialState>((set) => ({
  posts: mockWallPosts,
  classmates: mockClassmates,
  addPost: (text, image) => {
    const newPost: WallPost = {
      id: `w${Date.now()}`,
      authorId: 'st1',
      authorName: 'Juan Pérez',
      text,
      image,
      date: new Date().toISOString().split('T')[0],
      likes: [],
      comments: [],
    };
    set((state) => ({ posts: [newPost, ...state.posts] }));
  },
  toggleLike: (postId, userId) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes: p.likes.includes(userId)
                ? p.likes.filter((id) => id !== userId)
                : [...p.likes, userId],
            }
          : p
      ),
    }));
  },
  addComment: (postId, userId, userName, text) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                { id: `wc${Date.now()}`, authorId: userId, authorName: userName, text, date: new Date().toISOString().split('T')[0] },
              ],
            }
          : p
      ),
    }));
  },
  toggleClassmate: (classmateId) => {
    set((state) => ({
      classmates: state.classmates.map((c) =>
        c.id === classmateId ? { ...c, isAdded: !c.isAdded } : c
      ),
    }));
  },
}));

import { create } from 'zustand';
import { WallPost, Classmate, ReactionType, Role } from '../types';
import { mockWallPosts, mockClassmates } from '../mock-data';

interface SocialState {
  posts: WallPost[];
  classmates: Classmate[];
  addPost: (text: string, authorId: string, authorName: string, authorRole: Role, image?: string) => void;
  setReaction: (postId: string, userId: string, reaction: ReactionType | null) => void;
  markViewed: (postId: string, userId: string) => void;
  addComment: (postId: string, userId: string, userName: string, text: string) => void;
  toggleClassmate: (classmateId: string) => void;
}

export const useSocialStore = create<SocialState>((set) => ({
  posts: mockWallPosts,
  classmates: mockClassmates,

  addPost: (text, authorId, authorName, authorRole, image) => {
    const newPost: WallPost = {
      id: `w${Date.now()}`,
      authorId,
      authorName,
      authorRole,
      text,
      image,
      date: new Date().toISOString().split('T')[0],
      likes: [],
      reactions: {},
      comments: [],
    };
    set((state) => ({ posts: [newPost, ...state.posts] }));
  },

  markViewed: (postId, userId) => {
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        if ((p.viewedBy ?? []).includes(userId)) return p;
        return { ...p, viewedBy: [...(p.viewedBy ?? []), userId] };
      }),
    }));
  },

  setReaction: (postId, userId, reaction) => {
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        const reactions = { ...(p.reactions ?? {}) };
        if (reaction === null) {
          delete reactions[userId];
        } else {
          reactions[userId] = reaction;
        }
        return { ...p, reactions };
      }),
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

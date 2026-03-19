import { create } from 'zustand';
import { WallPost, Classmate, ReactionType, Role } from '../types';
import { supabase } from '../supabase';

interface SocialState {
  posts: WallPost[];
  classmates: Classmate[];
  loading: boolean;
  initialize: () => Promise<void>;
  addPost: (text: string, authorId: string, authorName: string, authorRole: Role, image?: string) => void;
  editPost: (postId: string, text: string, image?: string | null) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  setReaction: (postId: string, userId: string, reaction: ReactionType | null) => void;
  markViewed: (postId: string, userId: string) => void;
  addComment: (postId: string, userId: string, userName: string, text: string) => void;
  toggleClassmate: (classmateId: string) => void;
}

async function fetchWallPosts(groupId: null | string = null): Promise<WallPost[]> {
  const query = supabase.from('wall_posts').select('*').order('post_date', { ascending: false });
  const postsRes = groupId === null
    ? await query.is('group_id', null)
    : await query.eq('group_id', groupId);

  const posts = postsRes.data ?? [];
  if (posts.length === 0) return [];

  const postIds = posts.map((p) => p.id);
  const [reactionsRes, commentsRes, viewsRes] = await Promise.all([
    supabase.from('wall_reactions').select('*').in('post_id', postIds),
    supabase.from('wall_comments').select('*').in('post_id', postIds).order('created_at'),
    supabase.from('wall_views').select('*').in('post_id', postIds),
  ]);

  const reactions = reactionsRes.data ?? [];
  const comments = commentsRes.data ?? [];
  const views = viewsRes.data ?? [];

  return posts.map((p) => ({
    id: p.id,
    authorId: p.author_id,
    authorName: p.author_name,
    authorRole: p.author_role as Role | undefined,
    text: p.text,
    image: p.image_url ?? undefined,
    date: p.post_date,
    groupId: p.group_id ?? undefined,
    groupName: p.group_name ?? undefined,
    likes: [],
    reactions: Object.fromEntries(
      reactions.filter((r) => r.post_id === p.id).map((r) => [r.user_id, r.reaction as ReactionType])
    ),
    comments: comments
      .filter((c) => c.post_id === p.id)
      .map((c) => ({
        id: c.id,
        authorId: c.author_id,
        authorName: c.author_name,
        text: c.text,
        date: c.comment_date,
      })),
    viewedBy: views.filter((v) => v.post_id === p.id).map((v) => v.user_id),
  }));
}

export { fetchWallPosts };

export const useSocialStore = create<SocialState>((set) => ({
  posts: [],
  classmates: [],
  loading: true,

  initialize: async () => {
    const [posts, profilesRes] = await Promise.all([
      fetchWallPosts(null),
      supabase.from('profiles').select('id, name').eq('role', 'alumno'),
    ]);
    // Build classmates from alumno profiles (excluding current user u1 handled in component)
    const classmates: Classmate[] = (profilesRes.data ?? [])
      .filter((p) => p.id !== 'u1')
      .map((p) => ({
        id: p.id,
        name: p.name,
        grade: '3ro A',
        isAdded: false,
      }));
    set({ posts, classmates, loading: false });
  },

  addPost: async (text, authorId, authorName, authorRole, image) => {
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
    const { error } = await supabase.from('wall_posts').insert({
      id: newPost.id,
      author_id: authorId,
      author_name: authorName,
      author_role: authorRole,
      text,
      image_url: image ?? null,
      post_date: newPost.date,
    });
    if (error) {
      console.error('[social-store] addPost error:', error);
      set((state) => ({ posts: state.posts.filter((p) => p.id !== newPost.id) }));
    }
  },

  editPost: async (postId, text, image) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? { ...p, text, image: image === null ? undefined : image ?? p.image }
          : p
      ),
    }));
    const update: Record<string, any> = { text };
    if (image !== undefined) update.image_url = image ?? null;
    const { error } = await supabase.from('wall_posts').update(update).eq('id', postId);
    if (error) console.error('[social-store] editPost error:', error);
  },

  deletePost: async (postId) => {
    set((state) => ({ posts: state.posts.filter((p) => p.id !== postId) }));
    const { error } = await supabase.from('wall_posts').delete().eq('id', postId);
    if (error) console.error('[social-store] deletePost error:', error);
  },

  markViewed: (postId, userId) => {
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        if ((p.viewedBy ?? []).includes(userId)) return p;
        return { ...p, viewedBy: [...(p.viewedBy ?? []), userId] };
      }),
    }));
    supabase.from('wall_views').upsert({ post_id: postId, user_id: userId })
      .then(({ error }) => {
        // Ignore FK violations — happens when markViewed fires before addPost insert completes
        if (error && error.code !== '23503') console.error('[social-store] markViewed error:', error);
      });
  },

  setReaction: (postId, userId, reaction) => {
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        const reactions = { ...(p.reactions ?? {}) };
        if (reaction === null) delete reactions[userId];
        else reactions[userId] = reaction;
        return { ...p, reactions };
      }),
    }));
    if (reaction === null) {
      supabase.from('wall_reactions').delete().eq('post_id', postId).eq('user_id', userId)
        .then(({ error }) => { if (error) console.error('[social-store] setReaction delete error:', error); });
    } else {
      supabase.from('wall_reactions').upsert({ post_id: postId, user_id: userId, reaction })
        .then(({ error }) => { if (error) console.error('[social-store] setReaction upsert error:', error); });
    }
  },

  addComment: (postId, userId, userName, text) => {
    const id = `wc${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                { id, authorId: userId, authorName: userName, text, date },
              ],
            }
          : p
      ),
    }));
    supabase.from('wall_comments').insert({
      id,
      post_id: postId,
      author_id: userId,
      author_name: userName,
      text,
      comment_date: date,
    }).then(({ error }) => { if (error) console.error('[social-store] addComment error:', error); });
  },

  toggleClassmate: (classmateId) => {
    set((state) => ({
      classmates: state.classmates.map((c) =>
        c.id === classmateId ? { ...c, isAdded: !c.isAdded } : c
      ),
    }));
  },
}));

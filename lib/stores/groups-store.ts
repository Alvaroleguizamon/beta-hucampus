import { create } from 'zustand';
import { Group, GroupMember, WallPost, ReactionType, Role } from '../types';
import { supabase } from '../supabase';
import { useNotificationsStore } from './notifications-store';

interface GroupsState {
  groups: Group[];
  groupPosts: Record<string, WallPost[]>;
  loading: boolean;

  initialize: () => Promise<void>;

  getUserGroups: (userId: string) => Group[];
  getGroupFeedForUser: (userId: string) => WallPost[];
  isGroupAdmin: (groupId: string, userId: string) => boolean;

  createGroup: (
    name: string,
    type: Group['type'],
    description: string,
    creatorId: string,
    creatorName: string,
    coverColor: string,
  ) => string;

  addGroupPost: (
    groupId: string,
    groupName: string,
    text: string,
    authorId: string,
    authorName: string,
    authorRole: Role,
    image?: string,
  ) => void;

  setGroupPostReaction: (groupId: string, postId: string, userId: string, reaction: ReactionType | null) => void;
  markGroupPostViewed: (groupId: string, postId: string, userId: string) => void;
  addGroupPostComment: (groupId: string, postId: string, userId: string, userName: string, text: string) => void;

  inviteMember: (groupId: string, member: GroupMember) => void;
  removeMember: (groupId: string, userId: string) => void;
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  groupPosts: {},
  loading: true,

  initialize: async () => {
    const [groupsRes, membersRes] = await Promise.all([
      supabase.from('groups').select('*').order('created_at', { ascending: false }),
      supabase.from('group_members').select('*'),
    ]);
    const groups = groupsRes.data ?? [];
    const members = membersRes.data ?? [];

    const builtGroups: Group[] = groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description ?? undefined,
      type: g.group_type as Group['type'],
      createdBy: g.created_by,
      createdByName: g.created_by_name,
      createdAt: g.created_at?.split('T')[0] ?? '',
      coverColor: g.cover_color,
      isAutomatic: g.is_automatic,
      members: members
        .filter((m) => m.group_id === g.id)
        .map((m) => ({
          userId: m.user_id,
          userName: m.user_name,
          role: m.member_role as GroupMember['role'],
          joinedAt: m.joined_at,
        })),
    }));

    // Fetch group posts for all groups
    const groupIds = groups.map((g) => g.id);
    let groupPosts: Record<string, WallPost[]> = {};
    if (groupIds.length > 0) {
      const postsRes = await supabase
        .from('wall_posts')
        .select('*')
        .in('group_id', groupIds)
        .order('post_date', { ascending: false });
      const posts = postsRes.data ?? [];
      if (posts.length > 0) {
        const postIds = posts.map((p) => p.id);
        const [reactionsRes, commentsRes, viewsRes] = await Promise.all([
          supabase.from('wall_reactions').select('*').in('post_id', postIds),
          supabase.from('wall_comments').select('*').in('post_id', postIds).order('created_at'),
          supabase.from('wall_views').select('*').in('post_id', postIds),
        ]);
        const reactions = reactionsRes.data ?? [];
        const comments = commentsRes.data ?? [];
        const views = viewsRes.data ?? [];

        for (const p of posts) {
          const wallPost: WallPost = {
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
          };
          if (!groupPosts[p.group_id!]) groupPosts[p.group_id!] = [];
          groupPosts[p.group_id!].push(wallPost);
        }
      }
    }

    set({ groups: builtGroups, groupPosts, loading: false });
  },

  getUserGroups: (userId) =>
    get().groups.filter((g) => g.members.some((m) => m.userId === userId)),

  getGroupFeedForUser: (userId) => {
    const state = get();
    const userGroupIds = state.groups
      .filter((g) => g.members.some((m) => m.userId === userId))
      .map((g) => g.id);
    return userGroupIds.flatMap((id) => state.groupPosts[id] ?? []);
  },

  isGroupAdmin: (groupId, userId) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group) return false;
    return group.members.find((m) => m.userId === userId)?.role === 'admin';
  },

  createGroup: (name, type, description, creatorId, creatorName, coverColor) => {
    const id = `grp-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newGroup: Group = {
      id,
      name,
      description,
      type,
      createdBy: creatorId,
      createdByName: creatorName,
      createdAt: today,
      coverColor,
      isAutomatic: false,
      members: [{ userId: creatorId, userName: creatorName, role: 'admin', joinedAt: today }],
    };
    set((state) => ({ groups: [newGroup, ...state.groups] }));
    supabase.from('groups').insert({
      id,
      name,
      description,
      group_type: type,
      created_by: creatorId,
      created_by_name: creatorName,
      cover_color: coverColor,
      is_automatic: false,
    }).then(() =>
      supabase.from('group_members').insert({
        group_id: id,
        user_id: creatorId,
        user_name: creatorName,
        member_role: 'admin',
        joined_at: today,
      })
    );
    return id;
  },

  addGroupPost: (groupId, groupName, text, authorId, authorName, authorRole, image) => {
    const id = `gp${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    const post: WallPost = {
      id,
      groupId,
      groupName,
      authorId,
      authorName,
      authorRole,
      text,
      image,
      date,
      likes: [],
      reactions: {},
      viewedBy: [],
      comments: [],
    };
    set((state) => ({
      groupPosts: {
        ...state.groupPosts,
        [groupId]: [post, ...(state.groupPosts[groupId] ?? [])],
      },
    }));
    supabase.from('wall_posts').insert({
      id,
      group_id: groupId,
      group_name: groupName,
      author_id: authorId,
      author_name: authorName,
      author_role: authorRole,
      text,
      image_url: image ?? null,
      post_date: date,
    });
  },

  setGroupPostReaction: (groupId, postId, userId, reaction) => {
    set((state) => ({
      groupPosts: {
        ...state.groupPosts,
        [groupId]: (state.groupPosts[groupId] ?? []).map((p) => {
          if (p.id !== postId) return p;
          const reactions = { ...(p.reactions ?? {}) };
          if (reaction === null) delete reactions[userId];
          else reactions[userId] = reaction;
          return { ...p, reactions };
        }),
      },
    }));
    if (reaction === null) {
      supabase.from('wall_reactions').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
      supabase.from('wall_reactions').upsert({ post_id: postId, user_id: userId, reaction });
    }
  },

  markGroupPostViewed: (groupId, postId, userId) => {
    set((state) => ({
      groupPosts: {
        ...state.groupPosts,
        [groupId]: (state.groupPosts[groupId] ?? []).map((p) => {
          if (p.id !== postId) return p;
          if ((p.viewedBy ?? []).includes(userId)) return p;
          return { ...p, viewedBy: [...(p.viewedBy ?? []), userId] };
        }),
      },
    }));
    supabase.from('wall_views').upsert({ post_id: postId, user_id: userId });
  },

  addGroupPostComment: (groupId, postId, userId, userName, text) => {
    const id = `gc${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    set((state) => ({
      groupPosts: {
        ...state.groupPosts,
        [groupId]: (state.groupPosts[groupId] ?? []).map((p) =>
          p.id !== postId
            ? p
            : {
                ...p,
                comments: [
                  ...p.comments,
                  { id, authorId: userId, authorName: userName, text, date },
                ],
              }
        ),
      },
    }));
    supabase.from('wall_comments').insert({
      id,
      post_id: postId,
      author_id: userId,
      author_name: userName,
      text,
      comment_date: date,
    });
  },

  inviteMember: (groupId, member) => {
    const group = get().groups.find((g) => g.id === groupId);
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id !== groupId
          ? g
          : { ...g, members: [...g.members.filter((m) => m.userId !== member.userId), member] }
      ),
    }));
    if (group) {
      useNotificationsStore.getState().addNotification({
        type: 'grupo',
        title: 'Invitación a grupo',
        body: `Fuiste invitado al grupo ${group.name}.`,
        date: new Date().toISOString().split('T')[0],
        targetUserId: member.userId,
        deepLink: `/(tabs)/grupos/${groupId}`,
      });
    }
    supabase.from('group_members').upsert({
      group_id: groupId,
      user_id: member.userId,
      user_name: member.userName,
      member_role: member.role,
      joined_at: member.joinedAt,
    });
  },

  removeMember: (groupId, userId) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id !== groupId ? g : { ...g, members: g.members.filter((m) => m.userId !== userId) }
      ),
    }));
    supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId);
  },
}));

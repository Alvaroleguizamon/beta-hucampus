import { create } from 'zustand';
import { Group, GroupMember, WallPost, ReactionType, Role } from '../types';
import { mockGroups, mockGroupPosts, mockCourses } from '../mock-data';
import { useNotificationsStore } from './notifications-store';

// Color por tipo de curso para grupos automáticos
const COURSE_COLORS = ['#7C6BC4', '#5B77D3', '#0693E3', '#00897B', '#43A047'];

function buildCourseGroups(): Group[] {
  const existing = new Set(mockGroups.map((g) => g.id));
  const auto: Group[] = [];
  mockCourses.forEach((course, idx) => {
    const gid = `grp-curso-${course.id}`;
    if (existing.has(gid)) return;
    // No crear grp-3a si ya existe (mockGroups ya lo tiene)
    if (mockGroups.some((g) => g.type === 'curso' && g.name.includes(course.grade))) return;
    auto.push({
      id: gid,
      name: `${course.grade} - 2026`,
      description: `Grupo oficial del curso ${course.grade}.`,
      type: 'curso',
      isAutomatic: true,
      createdBy: 'admin',
      createdByName: 'Dirección',
      createdAt: '2026-03-01',
      coverColor: COURSE_COLORS[idx % COURSE_COLORS.length],
      members: [
        ...course.students.map((s) => ({
          userId: s.id,
          userName: s.name,
          role: 'miembro' as const,
          joinedAt: '2026-03-01',
        })),
      ],
    });
  });
  return auto;
}

const buildInitialPosts = (): Record<string, WallPost[]> => {
  const map: Record<string, WallPost[]> = {};
  for (const post of mockGroupPosts) {
    if (!map[post.groupId!]) map[post.groupId!] = [];
    map[post.groupId!].push(post);
  }
  return map;
};

interface GroupsState {
  groups: Group[];
  groupPosts: Record<string, WallPost[]>;

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
  groups: [...mockGroups, ...buildCourseGroups()],
  groupPosts: buildInitialPosts(),

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
    const member = group.members.find((m) => m.userId === userId);
    return member?.role === 'admin';
  },

  createGroup: (name, type, description, creatorId, creatorName, coverColor) => {
    const id = `grp-${Date.now()}`;
    const newGroup: Group = {
      id,
      name,
      description,
      type,
      createdBy: creatorId,
      createdByName: creatorName,
      createdAt: new Date().toISOString().split('T')[0],
      coverColor,
      isAutomatic: false,
      members: [{ userId: creatorId, userName: creatorName, role: 'admin', joinedAt: new Date().toISOString().split('T')[0] }],
    };
    set((state) => ({ groups: [newGroup, ...state.groups] }));
    return id;
  },

  addGroupPost: (groupId, groupName, text, authorId, authorName, authorRole, image) => {
    const post: WallPost = {
      id: `gp${Date.now()}`,
      groupId,
      groupName,
      authorId,
      authorName,
      authorRole,
      text,
      image,
      date: new Date().toISOString().split('T')[0],
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
  },

  addGroupPostComment: (groupId, postId, userId, userName, text) => {
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
                  { id: `gc${Date.now()}`, authorId: userId, authorName: userName, text, date: new Date().toISOString().split('T')[0] },
                ],
              },
        ),
      },
    }));
  },

  inviteMember: (groupId, member) => {
    const group = get().groups.find((g) => g.id === groupId);
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id !== groupId
          ? g
          : { ...g, members: [...g.members.filter((m) => m.userId !== member.userId), member] },
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
  },

  removeMember: (groupId, userId) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id !== groupId ? g : { ...g, members: g.members.filter((m) => m.userId !== userId) },
      ),
    }));
  },
}));

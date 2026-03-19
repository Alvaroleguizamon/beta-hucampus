import { create } from 'zustand';
import { ParentContact, ChatConversation, ChatMessage } from '../types';
import { supabase } from '../supabase';

interface CommunityState {
  contacts: ParentContact[];
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>;
  loading: boolean;
  initialize: (currentUserId: string) => Promise<void>;
  toggleContact: (contactId: string) => void;
  sendMessage: (conversationId: string, text: string, senderId: string, senderName: string) => void;
  markAsRead: (conversationId: string) => void;
  startConversation: (participantId: string, participantName: string, currentUserId: string, currentUserName: string) => string;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  contacts: [],
  conversations: [],
  messages: {},
  loading: true,

  initialize: async (currentUserId) => {
    const [convsRes, profilesRes] = await Promise.all([
      supabase
        .from('conversations')
        .select('*')
        .or(`participant_a.eq.${currentUserId},participant_b.eq.${currentUserId}`)
        .order('last_message_date', { ascending: false }),
      supabase.from('profiles').select('id, name, role'),
    ]);

    const profileMap: Record<string, { name: string; role: string }> = Object.fromEntries(
      (profilesRes.data ?? []).map((p) => [p.id, { name: p.name, role: p.role }])
    );

    const convRows = convsRes.data ?? [];
    const convIds = convRows.map((c) => c.id);

    // Fetch messages and unread counts
    const [messagesRes, readsRes] = await Promise.all([
      convIds.length > 0
        ? supabase.from('messages').select('*').in('conversation_id', convIds).order('created_at')
        : Promise.resolve({ data: [] }),
      convIds.length > 0
        ? supabase
            .from('conversation_reads')
            .select('conversation_id, last_read_at')
            .eq('user_id', currentUserId)
        : Promise.resolve({ data: [] }),
    ]);

    const allMessages = messagesRes.data ?? [];
    const readMap: Record<string, string> = Object.fromEntries(
      (readsRes.data ?? []).map((r) => [r.conversation_id, r.last_read_at])
    );

    const conversations: ChatConversation[] = convRows.map((c) => {
      const otherId = c.participant_a === currentUserId ? c.participant_b : c.participant_a;
      const otherProfile = profileMap[otherId];
      const convMessages = allMessages.filter((m) => m.conversation_id === c.id);
      const lastReadAt = readMap[c.id];
      const unreadCount = lastReadAt
        ? convMessages.filter(
            (m) => m.sender_id !== currentUserId && m.created_at > lastReadAt
          ).length
        : convMessages.filter((m) => m.sender_id !== currentUserId).length;

      return {
        id: c.id,
        participantId: otherId,
        participantName: otherProfile?.name ?? otherId,
        lastMessage: c.last_message ?? '',
        lastMessageDate: c.last_message_date ?? '',
        unreadCount,
      };
    });

    const messages: Record<string, ChatMessage[]> = {};
    for (const m of allMessages) {
      if (!messages[m.conversation_id]) messages[m.conversation_id] = [];
      messages[m.conversation_id].push({
        id: m.id,
        senderId: m.sender_id,
        senderName: m.sender_name,
        text: m.text,
        date: m.msg_date,
        time: m.msg_time,
      });
    }

    // Build contacts from profiles (padre role contacts)
    const parentProfiles = (profilesRes.data ?? []).filter(
      (p) => p.role === 'padre' && p.id !== currentUserId
    );
    const contacts: ParentContact[] = parentProfiles.map((p) => ({
      id: p.id,
      name: p.name,
      childName: '',
      grade: '',
      isContact: conversations.some((c) => c.participantId === p.id),
    }));

    set({ conversations, messages, contacts, loading: false });
  },

  toggleContact: (contactId) => {
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === contactId ? { ...c, isContact: !c.isContact } : c
      ),
    }));
  },

  sendMessage: (conversationId, text, senderId, senderName) => {
    const id = `m${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().slice(0, 5);
    const newMsg: ChatMessage = { id, senderId, senderName, text, date, time };
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] ?? []), newMsg],
      },
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, lastMessage: text, lastMessageDate: date } : c
      ),
    }));
    supabase.from('messages').insert({
      id,
      conversation_id: conversationId,
      sender_id: senderId,
      sender_name: senderName,
      text,
      msg_date: date,
      msg_time: time,
    }).then(() =>
      supabase
        .from('conversations')
        .update({ last_message: text, last_message_date: date })
        .eq('id', conversationId)
    );
  },

  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },

  startConversation: (participantId, participantName, currentUserId, currentUserName) => {
    const existing = get().conversations.find((c) => c.participantId === participantId);
    if (existing) return existing.id;
    const id = `chat${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    const newConv: ChatConversation = {
      id,
      participantId,
      participantName,
      lastMessage: '',
      lastMessageDate: date,
      unreadCount: 0,
    };
    set((state) => ({
      conversations: [newConv, ...state.conversations],
      messages: { ...state.messages, [id]: [] },
    }));
    supabase.from('conversations').insert({
      id,
      participant_a: currentUserId,
      participant_b: participantId,
      last_message_date: date,
    });
    return id;
  },
}));

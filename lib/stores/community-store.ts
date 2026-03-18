import { create } from 'zustand';
import { ParentContact, ChatConversation, ChatMessage } from '../types';
import { mockParentContacts, mockChatConversations, mockChatMessages } from '../mock-data';

interface CommunityState {
  contacts: ParentContact[];
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>;
  toggleContact: (contactId: string) => void;
  sendMessage: (conversationId: string, text: string, senderId: string, senderName: string) => void;
  markAsRead: (conversationId: string) => void;
  startConversation: (participantId: string, participantName: string) => string;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  contacts: mockParentContacts,
  conversations: mockChatConversations,
  messages: mockChatMessages,
  toggleContact: (contactId) => {
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === contactId ? { ...c, isContact: !c.isContact } : c
      ),
    }));
  },
  sendMessage: (conversationId, text, senderId, senderName) => {
    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      senderId,
      senderName,
      text,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
    };
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] ?? []), newMsg],
      },
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, lastMessage: text, lastMessageDate: newMsg.date } : c
      ),
    }));
  },
  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },
  startConversation: (participantId, participantName) => {
    const existing = get().conversations.find((c) => c.participantId === participantId);
    if (existing) return existing.id;
    const newConv: ChatConversation = {
      id: `chat${Date.now()}`,
      participantId,
      participantName,
      lastMessage: '',
      lastMessageDate: new Date().toISOString().split('T')[0],
      unreadCount: 0,
    };
    set((state) => ({
      conversations: [newConv, ...state.conversations],
      messages: { ...state.messages, [newConv.id]: [] },
    }));
    return newConv.id;
  },
}));

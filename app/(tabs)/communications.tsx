import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/stores/auth-store';
import { ChatBubble } from '../../components/community/ChatBubble';
import { Colors } from '../../constants/colors';
import { ChatMessage } from '../../lib/types';

// Mock classmates as chat contacts for alumno
const mockClassmateChats = [
  {
    id: 'chat_st2',
    name: 'María González',
    lastMessage: '¿Tenés los apuntes de Historia?',
    lastTime: '09:35',
    unread: 1,
  },
  {
    id: 'chat_st3',
    name: 'Lucas Rodríguez',
    lastMessage: 'Dale, nos vemos mañana',
    lastTime: 'Ayer',
    unread: 0,
  },
  {
    id: 'chat_st4',
    name: 'Sofía Martínez',
    lastMessage: '¡Gracias por el resumen! 🙌',
    lastTime: 'Ayer',
    unread: 0,
  },
  {
    id: 'chat_st5',
    name: 'Mateo López',
    lastMessage: 'Revancha mañana 💪',
    lastTime: 'Lun',
    unread: 0,
  },
  {
    id: 'chat_group',
    name: '3ro A',
    lastMessage: 'Sofía: Alguien sabe qué hay que llevar mañana?',
    lastTime: '10:20',
    unread: 3,
    isGroup: true,
  },
];

const mockMessages: Record<string, ChatMessage[]> = {
  chat_st2: [
    { id: 'm1', senderId: 'st2', senderName: 'María González', text: 'Hola Juan!', date: '2026-03-18', time: '09:30' },
    { id: 'm2', senderId: 'me', senderName: 'Yo', text: 'Hola María! Cómo va?', date: '2026-03-18', time: '09:31' },
    { id: 'm3', senderId: 'st2', senderName: 'María González', text: '¿Tenés los apuntes de Historia?', date: '2026-03-18', time: '09:35' },
  ],
  chat_st3: [
    { id: 'm4', senderId: 'me', senderName: 'Yo', text: 'Nos juntamos a estudiar?', date: '2026-03-17', time: '15:00' },
    { id: 'm5', senderId: 'st3', senderName: 'Lucas Rodríguez', text: 'Dale, nos vemos mañana', date: '2026-03-17', time: '15:10' },
  ],
  chat_group: [
    { id: 'm6', senderId: 'st4', senderName: 'Sofía Martínez', text: 'Chicos, mañana hay examen de Matemática no?', date: '2026-03-18', time: '10:15' },
    { id: 'm7', senderId: 'st5', senderName: 'Mateo López', text: 'Sí, unidades 1 a 3', date: '2026-03-18', time: '10:18' },
    { id: 'm8', senderId: 'st4', senderName: 'Sofía Martínez', text: 'Alguien sabe qué hay que llevar mañana?', date: '2026-03-18', time: '10:20' },
  ],
};

export default function CommunicationsScreen() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? 'u1';
  const userName = user?.name ?? 'Yo';
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatName, setChatName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const handleSend = () => {
    if (!messageText.trim() || !activeChat) return;
    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: userId,
      senderName: userName,
      text: messageText,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
    };
    setMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] ?? []), newMsg],
    }));
    setMessageText('');
  };

  // Chat detail view
  if (activeChat) {
    const chatMessages = messages[activeChat] ?? [];
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View style={styles.chatHeader}>
          <IconButton icon="arrow-left" onPress={() => setActiveChat(null)} iconColor={Colors.textPrimary} />
          <View style={styles.chatHeaderAvatar}>
            <Text style={styles.chatHeaderAvatarText}>{chatName[0]}</Text>
          </View>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{chatName}</Text>
            <Text style={styles.chatHeaderStatus}>en línea</Text>
          </View>
        </View>

        <FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} currentUserId={userId} />}
          contentContainerStyle={styles.chatMessages}
        />

        <View style={styles.chatInputBar}>
          <TextInput
            placeholder="Mensaje..."
            value={messageText}
            onChangeText={setMessageText}
            mode="outlined"
            dense
            style={styles.chatInput}
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
            right={
              <TextInput.Icon
                icon="send"
                color={Colors.primary}
                onPress={handleSend}
              />
            }
          />
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Chat list
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
      </View>

      <FlatList
        data={mockClassmateChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.chatRow}
            onPress={() => { setActiveChat(item.id); setChatName(item.name); }}
          >
            <View style={[styles.avatar, (item as any).isGroup && styles.groupAvatar]}>
              {(item as any).isGroup ? (
                <MaterialCommunityIcons name="account-group" size={22} color="#FFFFFF" />
              ) : (
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              )}
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatTopRow}>
                <Text style={styles.chatName}>{item.name}</Text>
                <Text style={styles.chatTime}>{item.lastTime}</Text>
              </View>
              <View style={styles.chatBottomRow}>
                <Text style={styles.chatLastMsg} numberOfLines={1}>{item.lastMessage}</Text>
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Chat list
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  groupAvatar: {
    backgroundColor: Colors.primary,
  },
  avatarText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 20,
  },
  chatInfo: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  chatTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chatBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatLastMsg: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 11,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Chat detail
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chatHeaderAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  chatHeaderAvatarText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: Colors.success,
  },
  chatMessages: {
    padding: 8,
    paddingBottom: 16,
  },
  chatInputBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  chatInput: {
    backgroundColor: '#FFFFFF',
    height: 42,
  },
});

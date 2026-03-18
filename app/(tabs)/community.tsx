import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, IconButton, SegmentedButtons } from 'react-native-paper';
import { useCommunityStore } from '../../lib/stores/community-store';
import { ContactCard } from '../../components/community/ContactCard';
import { ChatBubble } from '../../components/community/ChatBubble';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { ParentContact } from '../../lib/types';

export default function CommunityScreen() {
  const { contacts, conversations, messages, toggleContact, sendMessage, startConversation } = useCommunityStore();
  const [tab, setTab] = useState('contactos');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatName, setChatName] = useState('');
  const [messageText, setMessageText] = useState('');

  const handleChat = (contact: ParentContact) => {
    const convId = startConversation(contact);
    setActiveChat(convId);
    setChatName(contact.name);
    setTab('chats');
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
          <View style={styles.chatAvatar}>
            <Text style={styles.chatAvatarText}>{chatName[0]}</Text>
          </View>
          <Text variant="titleMedium" style={styles.chatName}>{chatName}</Text>
        </View>

        <FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.chatMessages}
          inverted={false}
        />

        <View style={styles.chatInputBar}>
          <TextInput
            placeholder="Escribí un mensaje..."
            value={messageText}
            onChangeText={setMessageText}
            mode="outlined"
            dense
            style={styles.chatInput}
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
          />
          <IconButton
            icon="send"
            iconColor="#FFFFFF"
            containerColor={Colors.primary}
            size={20}
            onPress={() => {
              if (messageText.trim()) {
                sendMessage(activeChat, messageText);
                setMessageText('');
              }
            }}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[
          { value: 'contactos', label: 'Contactos' },
          { value: 'chats', label: 'Chats' },
        ]}
        style={styles.tabs}
      />

      {tab === 'contactos' ? (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ContactCard contact={item} onToggle={toggleContact} onChat={handleChat} />
          )}
          ListHeaderComponent={
            <Text variant="bodyMedium" style={styles.subtitle}>
              Padres del colegio · Agregá contactos para chatear
            </Text>
          }
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.conversationRow}
              onPress={() => { setActiveChat(item.id); setChatName(item.participantName); }}
            >
              <View style={styles.convAvatar}>
                <Text style={styles.convAvatarText}>{item.participantName[0]}</Text>
              </View>
              <View style={styles.convInfo}>
                <Text variant="titleSmall" style={styles.convName}>{item.participantName}</Text>
                <Text variant="bodySmall" style={styles.convLastMsg} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>
              <View style={styles.convMeta}>
                <Text variant="bodySmall" style={styles.convDate}>{item.lastMessageDate}</Text>
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text variant="bodyMedium" style={styles.empty}>
              No tenés chats aún. Agregá contactos para empezar.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabs: {
    marginHorizontal: Layout.padding,
    marginTop: 12,
    marginBottom: 8,
  },
  list: {
    padding: Layout.padding,
  },
  subtitle: {
    color: Colors.textSecondary,
    paddingHorizontal: Layout.padding,
    paddingVertical: 12,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
  },
  convAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  convAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  convInfo: {
    flex: 1,
  },
  convName: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  convLastMsg: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  convMeta: {
    alignItems: 'flex-end',
  },
  convDate: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  empty: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  chatAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chatName: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  chatMessages: {
    padding: 8,
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: 40,
    marginRight: 4,
  },
});

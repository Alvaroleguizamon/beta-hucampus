import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../../constants/colors';
import { ChatMessage } from '../../lib/types';

interface Props {
  message: ChatMessage;
  currentUserId: string;
}

export function ChatBubble({ message, currentUserId }: Props) {
  const isMe = message.senderId === currentUserId;

  return (
    <View style={[styles.container, isMe ? styles.containerMe : styles.containerOther]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        <Text variant="bodyMedium" style={[styles.text, isMe && styles.textMe]}>
          {message.text}
        </Text>
        <Text variant="bodySmall" style={[styles.time, isMe && styles.timeMe]}>
          {message.time}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    paddingHorizontal: 12,
  },
  containerMe: {
    alignItems: 'flex-end',
  },
  containerOther: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#E8E8E8',
    borderBottomLeftRadius: 4,
  },
  text: {
    color: Colors.textPrimary,
  },
  textMe: {
    color: '#FFFFFF',
  },
  time: {
    color: Colors.textSecondary,
    marginTop: 4,
    fontSize: 10,
  },
  timeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
});

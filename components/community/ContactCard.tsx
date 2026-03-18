import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Colors } from '../../constants/colors';
import { ParentContact } from '../../lib/types';

interface Props {
  contact: ParentContact;
  onToggle: (id: string) => void;
  onChat: (contact: ParentContact) => void;
}

export function ContactCard({ contact, onToggle, onChat }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{contact.name[0]}</Text>
      </View>
      <View style={styles.info}>
        <Text variant="titleSmall" style={styles.name}>{contact.name}</Text>
        <Text variant="bodySmall" style={styles.child}>
          Padre/Madre de {contact.childName} · {contact.grade}
        </Text>
      </View>
      <View style={styles.actions}>
        {contact.isContact && (
          <Button
            mode="text"
            compact
            icon="chat"
            textColor={Colors.primary}
            onPress={() => onChat(contact)}
          >
            Chat
          </Button>
        )}
        <Button
          mode={contact.isContact ? 'outlined' : 'contained'}
          compact
          onPress={() => onToggle(contact.id)}
          buttonColor={contact.isContact ? undefined : Colors.primary}
          textColor={contact.isContact ? Colors.primary : '#FFFFFF'}
        >
          {contact.isContact ? 'Agregado' : 'Agregar'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  child: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

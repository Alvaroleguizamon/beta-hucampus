import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Card } from '../ui/Card';
import { Colors } from '../../constants/colors';
import { Communication } from '../../lib/types';

interface Props {
  communication: Communication;
  onConfirm?: (id: string) => void;
}

export function MessageCard({ communication, onConfirm }: Props) {
  return (
    <Card>
      <View style={styles.header}>
        <Text variant="titleSmall" style={styles.title}>
          {communication.title}
        </Text>
        {!communication.read && <View style={styles.unreadDot} />}
      </View>
      <Text variant="bodyMedium" style={styles.body}>
        {communication.body}
      </Text>
      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.author}>
          {communication.author} · {communication.date}
        </Text>
        {communication.requiresConfirmation && !communication.confirmed && onConfirm && (
          <Button
            mode="contained"
            compact
            onPress={() => onConfirm(communication.id)}
            buttonColor={Colors.primary}
            textColor="#FFFFFF"
          >
            Confirmar lectura
          </Button>
        )}
        {communication.confirmed && (
          <Text variant="bodySmall" style={styles.confirmed}>
            Confirmado
          </Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
    marginLeft: 8,
  },
  body: {
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    color: Colors.textSecondary,
  },
  confirmed: {
    color: Colors.success,
    fontWeight: '600',
  },
});

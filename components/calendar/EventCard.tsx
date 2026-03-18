import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '../ui/Card';
import { Colors } from '../../constants/colors';
import { CalendarEvent } from '../../lib/types';

const typeConfig = {
  examen: { color: Colors.error, label: 'Examen' },
  reunion: { color: Colors.primary, label: 'Reunión' },
  acto: { color: '#9C27B0', label: 'Acto' },
  feriado: { color: Colors.success, label: 'Feriado' },
};

interface Props {
  event: CalendarEvent;
}

export function EventCard({ event }: Props) {
  const config = typeConfig[event.type];

  return (
    <Card>
      <View style={styles.row}>
        <View style={[styles.indicator, { backgroundColor: config.color }]} />
        <View style={styles.info}>
          <View style={styles.header}>
            <Text variant="titleSmall" style={styles.title}>
              {event.title}
            </Text>
            <Text variant="bodySmall" style={styles.type}>
              {config.label}
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.date}>
            {event.date}
          </Text>
          {event.description && (
            <Text variant="bodySmall" style={styles.description}>
              {event.description}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  indicator: {
    width: 4,
    height: '100%',
    minHeight: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  type: {
    color: Colors.textSecondary,
  },
  date: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  description: {
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

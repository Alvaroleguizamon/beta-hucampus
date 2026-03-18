import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../../constants/colors';
import { AttendanceRecord } from '../../lib/types';

const statusConfig = {
  presente: { color: Colors.present, label: 'Presente', icon: '✓' },
  ausente: { color: Colors.absent, label: 'Ausente', icon: '✗' },
  tardanza: { color: Colors.late, label: 'Tardanza', icon: '⏰' },
};

interface Props {
  record: AttendanceRecord;
}

export function AttendanceRow({ record }: Props) {
  const config = statusConfig[record.status];

  return (
    <View style={styles.row}>
      <Text variant="bodyMedium" style={styles.date}>
        {record.date}
      </Text>
      <View style={[styles.badge, { backgroundColor: config.color }]}>
        <Text style={styles.badgeText}>{config.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  date: {
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

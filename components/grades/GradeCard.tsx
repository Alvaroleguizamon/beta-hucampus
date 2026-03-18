import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '../ui/Card';
import { Colors } from '../../constants/colors';
import { Grade } from '../../lib/types';

interface Props {
  grade: Grade;
}

function getGradeColor(value: number) {
  if (value >= 7) return Colors.success;
  if (value >= 4) return Colors.warning;
  return Colors.error;
}

export function GradeCard({ grade }: Props) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text variant="titleSmall" style={styles.subject}>
            {grade.subjectName}
          </Text>
          <Text variant="bodySmall" style={styles.description}>
            {grade.description}
          </Text>
          <Text variant="bodySmall" style={styles.date}>
            {grade.date} · {grade.period}
          </Text>
        </View>
        <View style={[styles.gradeCircle, { backgroundColor: getGradeColor(grade.value) }]}>
          <Text variant="headlineSmall" style={styles.gradeValue}>
            {grade.value}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  subject: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  description: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  date: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  gradeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  gradeValue: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

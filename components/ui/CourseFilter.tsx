import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../../constants/colors';
import { Course } from '../../lib/types';

interface CourseFilterProps {
  courses: Course[];
  selectedCourseId: string;
  onSelect: (id: string) => void;
}

export default function CourseFilter({ courses, selectedCourseId, onSelect }: CourseFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {courses.map((c) => {
          const active = selectedCourseId === c.id;
          return (
            <Pressable
              key={c.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSelect(active ? '' : c.id)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.grade}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});

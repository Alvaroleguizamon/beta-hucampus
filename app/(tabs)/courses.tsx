import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { useCoursesStore } from '../../lib/stores/courses-store';
import { useSubjectsStore } from '../../lib/stores/subjects-store';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

export default function CoursesScreen() {
  const courses = useCoursesStore((s) => s.courses);
  const subjects = useSubjectsStore((s) => s.subjects);
  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const subject = subjects.find((s) => s.id === item.subjectId);
          return (
            <Card>
              <View style={styles.row}>
                <View style={[styles.icon, { backgroundColor: subject?.color ?? Colors.primary }]}>
                  <MaterialCommunityIcons name="google-classroom" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.info}>
                  <Text variant="titleMedium" style={styles.name}>
                    {item.name} - {item.grade}
                  </Text>
                  <Text variant="bodySmall" style={styles.students}>
                    {item.students.length} alumnos
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textSecondary} />
              </View>
            </Card>
          );
        }}
        ListHeaderComponent={
          <Text variant="titleMedium" style={styles.title}>
            Mis Cursos
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: Layout.padding,
  },
  title: {
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  students: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

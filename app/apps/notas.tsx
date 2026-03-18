import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useGradesStore } from '../../lib/stores/grades-store';
import { mockSubjects } from '../../lib/mock-data';
import { Colors } from '../../constants/colors';

function getGradeColor(value: number) {
  if (value >= 7) return Colors.success;
  if (value >= 4) return Colors.warning;
  return Colors.error;
}

export default function NotasScreen() {
  const grades = useGradesStore((s) => s.grades);
  const studentGrades = grades.filter((g) => g.studentId === 'st1');

  const bySubject = mockSubjects.map((subject) => {
    const subGrades = studentGrades.filter((g) => g.subjectId === subject.id);
    const avg = subGrades.length
      ? subGrades.reduce((s, g) => s + g.value, 0) / subGrades.length
      : null;
    return { subject, grades: subGrades, average: avg };
  });

  const generalAvg = studentGrades.length
    ? (studentGrades.reduce((s, g) => s + g.value, 0) / studentGrades.length).toFixed(1)
    : '-';

  return (
    <View style={styles.container}>
      {/* General average */}
      <View style={styles.avgCard}>
        <Text style={styles.avgLabel}>Promedio general</Text>
        <Text style={styles.avgValue}>{generalAvg}</Text>
        <Text style={styles.avgPeriod}>1er Trimestre</Text>
      </View>

      <FlatList
        data={bySubject}
        keyExtractor={(item) => item.subject.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <View style={[styles.subjectDot, { backgroundColor: item.subject.color }]} />
              <Text style={styles.subjectName}>{item.subject.name}</Text>
              {item.average !== null && (
                <View style={[styles.avgBadge, { backgroundColor: getGradeColor(item.average) }]}>
                  <Text style={styles.avgBadgeText}>{item.average.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.teacherName}>{item.subject.teacher}</Text>

            {item.grades.length > 0 ? (
              item.grades.map((grade) => (
                <View key={grade.id} style={styles.gradeRow}>
                  <View style={styles.gradeInfo}>
                    <Text style={styles.gradeDesc}>{grade.description}</Text>
                    <Text style={styles.gradeDate}>{grade.date}</Text>
                  </View>
                  <View style={[styles.gradeValue, { backgroundColor: getGradeColor(grade.value) }]}>
                    <Text style={styles.gradeValueText}>{grade.value}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noGrades}>Sin notas aún</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  avgCard: {
    backgroundColor: Colors.primary,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  avgLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  avgValue: { color: '#FFFFFF', fontSize: 42, fontWeight: '700', marginVertical: 4 },
  avgPeriod: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  subjectHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  subjectDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  subjectName: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  avgBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  avgBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  teacherName: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12, marginLeft: 20 },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  gradeInfo: { flex: 1 },
  gradeDesc: { fontSize: 14, color: Colors.textPrimary },
  gradeDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  gradeValue: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  gradeValueText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  noGrades: { color: Colors.textSecondary, fontSize: 13, fontStyle: 'italic', marginTop: 8 },
});

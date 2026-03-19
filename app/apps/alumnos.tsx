import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCourseStore } from '../../lib/stores/course-store';
import { useGradesStore } from '../../lib/stores/grades-store';
import { useCoursesStore } from '../../lib/stores/courses-store';
import { Colors } from '../../constants/colors';
import CourseFilter from '../../components/ui/CourseFilter';
import StudentSearch from '../../components/ui/StudentSearch';

function getGradeColor(value: number) {
  if (value >= 7) return Colors.success;
  if (value >= 4) return Colors.warning;
  return Colors.error;
}

function StudentDetail({ studentId, studentName, onBack }: { studentId: string; studentName: string; onBack: () => void }) {
  const allGrades = useGradesStore((s) => s.grades);
  const grades = useMemo(() => allGrades.filter((g) => g.studentId === studentId), [allGrades, studentId]);

  const bySubject = useMemo(() => {
    const map: Record<string, typeof grades> = {};
    grades.forEach((g) => {
      if (!map[g.subjectName]) map[g.subjectName] = [];
      map[g.subjectName].push(g);
    });
    return Object.entries(map).map(([subject, gs]) => ({
      subject,
      grades: gs,
      avg: gs.reduce((s, g) => s + g.value, 0) / gs.length,
    }));
  }, [grades]);

  const generalAvg = grades.length
    ? (grades.reduce((s, g) => s + g.value, 0) / grades.length).toFixed(1)
    : null;

  return (
    <ScrollView style={styles.container}>
      <Pressable style={styles.backRow} onPress={onBack}>
        <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Volver a alumnos</Text>
      </Pressable>

      <View style={styles.studentBanner}>
        <View style={styles.studentBannerAvatar}>
          <Text style={styles.studentBannerAvatarText}>{studentName[0]}</Text>
        </View>
        <View>
          <Text style={styles.studentBannerName}>{studentName}</Text>
          {generalAvg && (
            <Text style={styles.studentBannerAvg}>Promedio: {generalAvg}</Text>
          )}
        </View>
      </View>

      {bySubject.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="school-outline" size={40} color={Colors.border} />
          <Text style={styles.emptyText}>Sin notas cargadas</Text>
        </View>
      ) : (
        <View style={styles.gradesList}>
          {bySubject.map(({ subject, grades: gs, avg }) => (
            <View key={subject} style={styles.subjectCard}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectName}>{subject}</Text>
                <View style={[styles.avgBadge, { backgroundColor: getGradeColor(avg) }]}>
                  <Text style={styles.avgBadgeText}>{avg.toFixed(1)}</Text>
                </View>
              </View>
              {gs.map((g) => (
                <View key={g.id} style={styles.gradeRow}>
                  <View style={styles.gradeInfo}>
                    <Text style={styles.gradeDesc}>{g.description}</Text>
                    <Text style={styles.gradeDate}>{g.date} · {g.period}</Text>
                  </View>
                  <View style={[styles.gradeValue, { backgroundColor: getGradeColor(g.value) }]}>
                    <Text style={styles.gradeValueText}>{g.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

export default function AlumnosScreen() {
  const grades = useGradesStore((s) => s.grades);
  const courses = useCoursesStore((s) => s.courses);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [studentFilterIds, setStudentFilterIds] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);

  const course = selectedCourseId ? courses.find((c) => c.id === selectedCourseId) : courses[0];

  const allStudentsWithStats = useMemo(() => {
    if (!course) return [];
    return course.students.map((s) => {
      const sg = grades.filter((g) => g.studentId === s.id);
      const avg = sg.length ? sg.reduce((acc, g) => acc + g.value, 0) / sg.length : null;
      return { ...s, gradeCount: sg.length, avg };
    });
  }, [course, grades]);

  const studentsWithStats = useMemo(() => {
    if (studentFilterIds.length === 0) return allStudentsWithStats;
    return allStudentsWithStats.filter((s) => studentFilterIds.includes(s.id));
  }, [allStudentsWithStats, studentFilterIds]);

  const toggleStudent = (id: string) => {
    setStudentFilterIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  if (!course) return null;

  if (selectedStudent) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{selectedStudent.name}</Text>
          <Text style={styles.headerSub}>{course.name}</Text>
        </View>
        <StudentDetail
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          onBack={() => setSelectedStudent(null)}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CourseFilter courses={courses} selectedCourseId={selectedCourseId || courses[0]?.id || ''} onSelect={(id) => { setSelectedCourseId(id); setStudentFilterIds([]); }} />
      <StudentSearch students={course?.students ?? []} selectedIds={studentFilterIds} onToggle={toggleStudent} onClear={() => setStudentFilterIds([])} />
      <FlatList
        data={studentsWithStats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.studentRow} onPress={() => setSelectedStudent({ id: item.id, name: item.name })}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.studentMeta}>
                {item.gradeCount > 0 ? `${item.gradeCount} nota${item.gradeCount !== 1 ? 's' : ''}` : 'Sin notas'}
              </Text>
            </View>
            {item.avg !== null ? (
              <View style={[styles.avgBadge, { backgroundColor: getGradeColor(item.avg) }]}>
                <Text style={styles.avgBadgeText}>{item.avg.toFixed(1)}</Text>
              </View>
            ) : (
              <Text style={styles.noAvg}>—</Text>
            )}
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-group-outline" size={40} color={Colors.border} />
            <Text style={styles.emptyText}>No hay alumnos en este curso</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  list: { padding: 12 },

  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: Colors.primary, fontWeight: '700', fontSize: 18 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  studentMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  avgBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  avgBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  noAvg: { fontSize: 16, color: Colors.textSecondary, marginRight: 4 },

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  studentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.primary + '10',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 12,
    padding: 14,
  },
  studentBannerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentBannerAvatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 20 },
  studentBannerName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  studentBannerAvg: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  gradesList: { paddingHorizontal: 16, paddingTop: 8 },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  subjectHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  subjectName: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  gradeInfo: { flex: 1 },
  gradeDesc: { fontSize: 14, color: Colors.textPrimary },
  gradeDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  gradeValue: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  gradeValueText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
});

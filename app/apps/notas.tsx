import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/stores/auth-store';
import { useGradesStore } from '../../lib/stores/grades-store';
import { useCoursesStore } from '../../lib/stores/courses-store';
import { useSubjectsStore } from '../../lib/stores/subjects-store';
import { Colors } from '../../constants/colors';

// Padre → child mapping para este demo
const PADRE_CHILD: Record<string, { id: string; name: string }> = {
  u1: { id: 'st1', name: 'Juan Pérez' },
};

function getGradeColor(value: number) {
  if (value >= 7) return Colors.success;
  if (value >= 4) return Colors.warning;
  return Colors.error;
}

function GradesList({ studentId }: { studentId: string }) {
  const grades = useGradesStore((s) => s.grades);
  const subjects = useSubjectsStore((s) => s.subjects);
  const studentGrades = grades.filter((g) => g.studentId === studentId);

  const bySubject = subjects.map((subject) => {
    const subGrades = studentGrades.filter((g) => g.subjectId === subject.id);
    const avg = subGrades.length
      ? subGrades.reduce((s, g) => s + g.value, 0) / subGrades.length
      : null;
    return { subject, grades: subGrades, average: avg };
  });

  const generalAvg = studentGrades.length
    ? (studentGrades.reduce((s, g) => s + g.value, 0) / studentGrades.length).toFixed(1)
    : null;

  if (studentGrades.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="school-outline" size={48} color={Colors.border} />
        <Text style={styles.emptyTitle}>Sin notas aún</Text>
        <Text style={styles.emptyBody}>Las notas aparecerán aquí cuando sean cargadas.</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.avgCard}>
        <Text style={styles.avgLabel}>Promedio general</Text>
        <Text style={styles.avgValue}>{generalAvg ?? '-'}</Text>
        <Text style={styles.avgPeriod}>1er Trimestre</Text>
      </View>

      <FlatList
        data={bySubject.filter((s) => s.grades.length > 0)}
        keyExtractor={(item) => item.subject.id}
        contentContainerStyle={styles.list}
        scrollEnabled={false}
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

            {item.grades.map((grade) => (
              <View key={grade.id} style={styles.gradeRow}>
                <View style={styles.gradeInfo}>
                  <Text style={styles.gradeDesc}>{grade.description}</Text>
                  <Text style={styles.gradeDate}>{grade.date} · {grade.period}</Text>
                </View>
                <View style={[styles.gradeValue, { backgroundColor: getGradeColor(grade.value) }]}>
                  <Text style={styles.gradeValueText}>{grade.value}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      />
    </>
  );
}

// ─── Vista alumno ────────────────────────────────────────────────────────────
function AlumnoView({ userId }: { userId: string }) {
  return (
    <ScrollView style={styles.container}>
      <GradesList studentId={userId} />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── Vista padre ─────────────────────────────────────────────────────────────
function PadreView({ userId }: { userId: string }) {
  const child = PADRE_CHILD[userId] ?? { id: 'st1', name: 'Estudiante' };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.childBanner}>
        <MaterialCommunityIcons name="account-child" size={18} color={Colors.primary} />
        <Text style={styles.childBannerText}>Notas de {child.name}</Text>
      </View>
      <GradesList studentId={child.id} />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── Vista docente ────────────────────────────────────────────────────────────
function DocenteView() {
  const grades = useGradesStore((s) => s.grades);
  const courses = useCoursesStore((s) => s.courses);
  const allStudents = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string; course: string }[] = [];
    courses.forEach((c) => {
      c.students.forEach((s) => {
        if (!seen.has(s.id)) {
          seen.add(s.id);
          list.push({ id: s.id, name: s.name, course: c.grade });
        }
      });
    });
    return list;
  }, []);

  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string; course: string } | null>(null);

  if (selectedStudent) {
    return (
      <ScrollView style={styles.container}>
        <Pressable style={styles.backRow} onPress={() => setSelectedStudent(null)}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Volver a alumnos</Text>
        </Pressable>
        <View style={styles.childBanner}>
          <MaterialCommunityIcons name="account" size={18} color={Colors.primary} />
          <Text style={styles.childBannerText}>{selectedStudent.name} · {selectedStudent.course}</Text>
        </View>
        <GradesList studentId={selectedStudent.id} />
        <View style={{ height: 32 }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionLabel}>Seleccioná un alumno</Text>
      {allStudents.map((student) => {
        const count = grades.filter((g) => g.studentId === student.id).length;
        const avg = count
          ? (grades.filter((g) => g.studentId === student.id).reduce((s, g) => s + g.value, 0) / count).toFixed(1)
          : null;
        return (
          <Pressable key={student.id} style={styles.studentRow} onPress={() => setSelectedStudent(student)}>
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>{student.name[0]}</Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentCourse}>{student.course} · {count} nota{count !== 1 ? 's' : ''}</Text>
            </View>
            {avg && (
              <View style={[styles.avgBadge, { backgroundColor: getGradeColor(parseFloat(avg)) }]}>
                <Text style={styles.avgBadgeText}>{avg}</Text>
              </View>
            )}
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
          </Pressable>
        );
      })}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── Screen root ──────────────────────────────────────────────────────────────
export default function NotasScreen() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'alumno';
  const userId = user?.id ?? 'u1';

  return (
    <View style={styles.root}>
      {role === 'alumno' && <AlumnoView userId={userId} />}
      {role === 'padre' && <PadreView userId={userId} />}
      {role === 'docente' && <DocenteView />}
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

  list: { paddingHorizontal: 16 },

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

  childBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '15',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  childBannerText: { fontSize: 14, fontWeight: '600', color: Colors.primary },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  studentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentAvatarText: { color: Colors.primary, fontWeight: '700', fontSize: 18 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  studentCourse: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  emptyBody: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});

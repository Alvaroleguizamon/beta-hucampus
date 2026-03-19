import React, { useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAdminStore, DAYS } from '../../lib/stores/admin-store';
import { useAuthStore } from '../../lib/stores/auth-store';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

export default function CoursesScreen() {
  const user = useAuthStore((s) => s.user);
  const { courses, loading } = useAdminStore();

  // Docente only sees courses where they have at least one schedule block
  const myCourses = useMemo(() => {
    if (!user) return courses;
    if (user.role === 'admin') return courses;
    return courses.filter((c) => c.schedules.some((s) => s.teacherId === user.id));
  }, [courses, user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="loading" size={32} color={Colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={myCourses}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <Text style={styles.title}>Mis Cursos</Text>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <MaterialCommunityIcons name="google-classroom" size={52} color={Colors.border} />
          <Text style={styles.emptyTitle}>Sin cursos asignados</Text>
          <Text style={styles.emptyBody}>Todavía no tenés cursos con bloques horarios asignados.</Text>
        </View>
      }
      renderItem={({ item: course }) => {
        const mySchedules = user?.role === 'admin'
          ? course.schedules
          : course.schedules.filter((s) => s.teacherId === user?.id);

        const uniqueSubjects = [...new Map(mySchedules.map((s) => [s.subjectId, s])).values()];

        // Next class today
        const today = new Date().getDay();
        const todayDow = today === 0 ? 7 : today;
        const todaySchedules = mySchedules
          .filter((s) => s.dayOfWeek === todayDow)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        const nextClass = todaySchedules[0];

        return (
          <Pressable style={styles.card} onPress={() => router.push(`/admin/${course.id}` as any)}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.courseIcon}>
                <MaterialCommunityIcons name="google-classroom" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.courseName}>{course.name}</Text>
                <Text style={styles.courseMeta}>{course.grade} · {course.students.length} alumnos</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.border} />
            </View>

            {/* Subject chips */}
            {uniqueSubjects.length > 0 && (
              <View style={styles.subjectRow}>
                {uniqueSubjects.map((s) => (
                  <View key={s.subjectId} style={[styles.subjectChip, { backgroundColor: s.subjectColor + '20', borderColor: s.subjectColor }]}>
                    <View style={[styles.subjectDot, { backgroundColor: s.subjectColor }]} />
                    <Text style={[styles.subjectChipText, { color: s.subjectColor }]}>{s.subjectName}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Today */}
            {nextClass ? (
              <View style={styles.nextClass}>
                <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.primary} />
                <Text style={styles.nextClassText}>
                  Hoy {nextClass.startTime}–{nextClass.endTime} · {nextClass.subjectName}{nextClass.room ? ` · ${nextClass.room}` : ''}
                </Text>
              </View>
            ) : (
              <View style={[styles.nextClass, { backgroundColor: Colors.border + '30' }]}>
                <MaterialCommunityIcons name="calendar-check-outline" size={14} color={Colors.textSecondary} />
                <Text style={[styles.nextClassText, { color: Colors.textSecondary }]}>Sin clases hoy</Text>
              </View>
            )}

            {/* Weekly mini view */}
            <View style={styles.weekRow}>
              {[1, 2, 3, 4, 5].map((d) => {
                const blocks = mySchedules.filter((s) => s.dayOfWeek === d);
                return (
                  <View key={d} style={styles.weekDay}>
                    <Text style={styles.weekDayLabel}>{DAYS[d - 1].slice(0, 3)}</Text>
                    {blocks.length > 0
                      ? blocks.map((b) => (
                          <View key={b.id} style={[styles.weekBlock, { backgroundColor: b.subjectColor }]}>
                            <Text style={styles.weekBlockText}>{b.startTime}</Text>
                          </View>
                        ))
                      : <View style={styles.weekEmpty} />
                    }
                  </View>
                );
              })}
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: Layout.padding, gap: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },

  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  emptyBody: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  courseIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center', alignItems: 'center',
  },
  courseName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  courseMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  subjectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  subjectChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  subjectDot: { width: 7, height: 7, borderRadius: 4 },
  subjectChipText: { fontSize: 12, fontWeight: '600' },

  nextClass: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${Colors.primary}08`,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10,
  },
  nextClassText: { fontSize: 13, color: Colors.primary, fontWeight: '500', flex: 1 },

  weekRow: { flexDirection: 'row', gap: 6 },
  weekDay: { flex: 1, alignItems: 'center', gap: 4 },
  weekDayLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase' },
  weekBlock: { width: '100%', borderRadius: 4, paddingVertical: 3, alignItems: 'center' },
  weekBlockText: { fontSize: 9, color: '#FFF', fontWeight: '600' },
  weekEmpty: { width: '100%', height: 18, borderRadius: 4, backgroundColor: Colors.border + '40' },
});

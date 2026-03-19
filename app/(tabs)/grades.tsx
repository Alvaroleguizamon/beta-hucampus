import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/stores/auth-store';
import { useTasksStore } from '../../lib/stores/tasks-store';
import { useCoursesStore } from '../../lib/stores/courses-store';
import { Colors } from '../../constants/colors';

type AppItem = {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  route: string;
};

const alumnoApps: AppItem[] = [
  { icon: 'checkbox-marked-outline', label: 'Tareas', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/tareas' },
  { icon: 'book-open-variant', label: 'Material de estudio', color: '#0693E3', bgColor: '#E6F6FD', route: '/apps/material' },
  { icon: 'school', label: 'Notas', color: '#E67E22', bgColor: '#FDF2E6', route: '/apps/notas' },
  { icon: 'bookshelf', label: 'Materias y Horarios', color: '#27AE60', bgColor: '#E8F8EF', route: '/apps/materias' },
  { icon: 'calendar-check', label: 'Presentismo', color: '#4CAF50', bgColor: '#EAF7EB', route: '/apps/presentismo' },
  { icon: 'star-outline', label: 'Eventos', color: '#0693E3', bgColor: '#E6F6FD', route: '/apps/eventos' },
  { icon: 'bus', label: 'Viajes y Salidas', color: '#00897B', bgColor: '#E0F2F1', route: '/apps/viajes' },
  { icon: 'file-sign', label: 'Autorizaciones', color: '#8D6E63', bgColor: '#EFEBE9', route: '/apps/autorizaciones' },
];

const docenteApps: AppItem[] = [
  { icon: 'checkbox-marked-outline', label: 'Tareas', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/tareas' },
  { icon: 'clock-outline', label: 'Horarios', color: '#5B77D3', bgColor: '#EEF1FB', route: '/apps/horarios' },
  { icon: 'school', label: 'Cargar notas', color: '#E67E22', bgColor: '#FDF2E6', route: '/apps/notas' },
  { icon: 'calendar-check', label: 'Presentismo', color: '#4CAF50', bgColor: '#EAF7EB', route: '/apps/presentismo' },
  { icon: 'book-open-variant', label: 'Material', color: '#0693E3', bgColor: '#E6F6FD', route: '/apps/material' },
  { icon: 'message-text-outline', label: 'Comunicados', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/noticias' },
  { icon: 'star-outline', label: 'Eventos', color: '#9C27B0', bgColor: '#F3E5F5', route: '/apps/eventos' },
  { icon: 'bus', label: 'Viajes y Salidas', color: '#00897B', bgColor: '#E0F2F1', route: '/apps/viajes' },
  { icon: 'account-group', label: 'Alumnos', color: '#27AE60', bgColor: '#E8F8EF', route: '/apps/alumnos' },
];

const padreApps: AppItem[] = [
  { icon: 'checkbox-marked-outline', label: 'Tareas', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/tareas' },
  { icon: 'school', label: 'Notas', color: '#E67E22', bgColor: '#FDF2E6', route: '/apps/notas' },
  { icon: 'calendar-check', label: 'Presentismo', color: '#4CAF50', bgColor: '#EAF7EB', route: '/apps/presentismo' },
  { icon: 'notebook-outline', label: 'Cuaderno digital', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/noticias' },
  { icon: 'star-outline', label: 'Eventos', color: '#9C27B0', bgColor: '#F3E5F5', route: '/apps/eventos' },
  { icon: 'bus', label: 'Viajes y Salidas', color: '#00897B', bgColor: '#E0F2F1', route: '/apps/viajes' },
  { icon: 'file-sign', label: 'Autorizaciones', color: '#8D6E63', bgColor: '#EFEBE9', route: '/apps/autorizaciones' },
];

const adminApps: AppItem[] = [
  { icon: 'google-classroom', label: 'Cursos', color: '#5B77D3', bgColor: '#EEF1FB', route: '/(tabs)/admin' },
  { icon: 'calendar-check', label: 'Presentismo', color: '#4CAF50', bgColor: '#EAF7EB', route: '/apps/presentismo' },
  { icon: 'account-group', label: 'Alumnos', color: '#9C27B0', bgColor: '#F3E5F5', route: '/apps/alumnos' },
  { icon: 'message-text-outline', label: 'Comunicados', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/noticias' },
  { icon: 'star-outline', label: 'Eventos', color: '#0693E3', bgColor: '#E6F6FD', route: '/apps/eventos' },
  { icon: 'bus', label: 'Viajes y Salidas', color: '#00897B', bgColor: '#E0F2F1', route: '/apps/viajes' },
];

const appsByRole: Record<import('../../lib/types').Role, AppItem[]> = {
  alumno: alumnoApps,
  docente: docenteApps,
  padre: padreApps,
  admin: adminApps,
};

export default function GradesScreen() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'alumno';
  const userId = user?.id ?? 'u1';
  const apps = appsByRole[role];

  const publishedTasks = useTasksStore((s) => s.publishedTasks);
  const courses = useCoursesStore((s) => s.courses);
  const pendingTasksCount = React.useMemo(() => {
    if (role !== 'alumno') return 0;
    const course = courses.find((c) => c.students.some((s) => s.id === userId));
    const courseId = course?.id ?? 'c1';
    return publishedTasks.filter((t) => {
      if (t.courseId !== courseId) return false;
      const delivery = t.deliveries.find((d) => d.studentId === userId);
      return !delivery || delivery.status === 'pendiente';
    }).length;
  }, [publishedTasks, userId, role, courses]);

  function getBadgeForApp(label: string): number | undefined {
    if (label === 'Tareas' && pendingTasksCount > 0) return pendingTasksCount;
    return undefined;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Apps</Text>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {apps.map((app) => {
          const badge = getBadgeForApp(app.label);
          return (
            <Pressable key={app.label} style={styles.appItem} onPress={() => router.push(app.route as any)}>
              <View style={[styles.iconBox, { backgroundColor: app.bgColor }]}>
                <MaterialCommunityIcons name={app.icon as any} size={32} color={app.color} />
                {badge !== undefined && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.appLabel} numberOfLines={2}>
                {app.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'left',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 0,
  },
  appItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  appLabel: {
    fontSize: 12,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/stores/auth-store';
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
  { icon: 'calendar-account', label: 'Agenda personal', color: '#5B77D3', bgColor: '#EEF1FB', route: '/apps/agenda-personal' },
  { icon: 'book-open-variant', label: 'Material de estudio', color: '#0693E3', bgColor: '#E6F6FD', route: '/apps/material' },
  { icon: 'school', label: 'Notas', color: '#E67E22', bgColor: '#FDF2E6', route: '/apps/notas' },
  { icon: 'bookshelf', label: 'Materias y Horarios', color: '#27AE60', bgColor: '#E8F8EF', route: '/apps/materias' },
  { icon: 'calendar-check', label: 'Presentismo', color: '#4CAF50', bgColor: '#EAF7EB', route: '/apps/presentismo' },
  { icon: 'star-outline', label: 'Eventos', color: '#0693E3', bgColor: '#E6F6FD', route: '/apps/eventos' },
  { icon: 'bus', label: 'Viajes y Salidas', color: '#00897B', bgColor: '#E0F2F1', route: '/apps/viajes' },
  { icon: 'file-sign', label: 'Autorizaciones', color: '#8D6E63', bgColor: '#EFEBE9', route: '/apps/autorizaciones' },
];

const docenteApps: AppItem[] = [
  { icon: 'google-classroom', label: 'Mis cursos', color: '#5B77D3', bgColor: '#EEF1FB', route: '/apps/materias' },
  { icon: 'school', label: 'Cargar notas', color: '#E67E22', bgColor: '#FDF2E6', route: '/apps/notas' },
  { icon: 'calendar-check', label: 'Presentismo', color: '#4CAF50', bgColor: '#EAF7EB', route: '/apps/presentismo' },
  { icon: 'book-open-variant', label: 'Material', color: '#0693E3', bgColor: '#E6F6FD', route: '/apps/material' },
  { icon: 'message-text-outline', label: 'Comunicados', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/noticias' },
  { icon: 'star-outline', label: 'Eventos', color: '#9C27B0', bgColor: '#F3E5F5', route: '/apps/eventos' },
  { icon: 'bus', label: 'Viajes y Salidas', color: '#00897B', bgColor: '#E0F2F1', route: '/apps/viajes' },
  { icon: 'account-group', label: 'Alumnos', color: '#27AE60', bgColor: '#E8F8EF', route: '/apps/materias' },
  { icon: 'clock-outline', label: 'Horarios', color: '#E74C3C', bgColor: '#FDECEB', route: '/apps/horarios' },
];

const padreApps: AppItem[] = [
  { icon: 'school', label: 'Notas', color: '#E67E22', bgColor: '#FDF2E6', route: '/apps/notas' },
  { icon: 'calendar-check', label: 'Presentismo', color: '#4CAF50', bgColor: '#EAF7EB', route: '/apps/presentismo' },
  { icon: 'notebook-outline', label: 'Cuaderno digital', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/noticias' },
  { icon: 'star-outline', label: 'Eventos', color: '#9C27B0', bgColor: '#F3E5F5', route: '/apps/eventos' },
  { icon: 'bus', label: 'Viajes y Salidas', color: '#00897B', bgColor: '#E0F2F1', route: '/apps/viajes' },
  { icon: 'file-sign', label: 'Autorizaciones', color: '#8D6E63', bgColor: '#EFEBE9', route: '/apps/autorizaciones' },
];

const appsByRole = {
  alumno: alumnoApps,
  docente: docenteApps,
  padre: padreApps,
};

export default function GradesScreen() {
  const role = useAuthStore((s) => s.user?.role ?? 'alumno');
  const apps = appsByRole[role];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Apps</Text>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {apps.map((app) => (
          <Pressable key={app.label} style={styles.appItem} onPress={() => router.push(app.route as any)}>
            <View style={[styles.iconBox, { backgroundColor: app.bgColor }]}>
              <MaterialCommunityIcons name={app.icon as any} size={32} color={app.color} />
            </View>
            <Text style={styles.appLabel} numberOfLines={2}>
              {app.label}
            </Text>
          </Pressable>
        ))}
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
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
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
});

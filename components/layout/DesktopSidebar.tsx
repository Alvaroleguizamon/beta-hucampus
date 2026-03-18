import React from 'react';
import { View, Pressable, StyleSheet, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '../../constants/colors';
import { SIDEBAR_WIDTH } from '../../hooks/useBreakpoint';
import { useAuthStore } from '../../lib/stores/auth-store';
import { Role } from '../../lib/types';

type TabConfig = {
  name: string;
  title: string;
  icon: string;
  iconFocused: string;
  route: string;
};

type AppItem = {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  route: string;
};

const tabsByRole: Record<Role, TabConfig[]> = {
  alumno: [
    { name: 'wall', title: 'Inicio', icon: 'home-outline', iconFocused: 'home', route: '/(tabs)/wall' },
    { name: 'calendar', title: 'Agenda', icon: 'calendar-outline', iconFocused: 'calendar', route: '/(tabs)/calendar' },
    { name: 'grades', title: 'Apps', icon: 'view-grid-outline', iconFocused: 'view-grid', route: '/(tabs)/grades' },
    { name: 'communications', title: 'Chats', icon: 'chat-outline', iconFocused: 'chat', route: '/(tabs)/communications' },
    { name: 'home', title: 'Perfil', icon: 'account-outline', iconFocused: 'account', route: '/(tabs)/home' },
  ],
  docente: [
    { name: 'wall', title: 'Inicio', icon: 'home-outline', iconFocused: 'home', route: '/(tabs)/wall' },
    { name: 'courses', title: 'Cursos', icon: 'google-classroom', iconFocused: 'google-classroom', route: '/(tabs)/courses' },
    { name: 'grades', title: 'Apps', icon: 'view-grid-outline', iconFocused: 'view-grid', route: '/(tabs)/grades' },
    { name: 'calendar', title: 'Agenda', icon: 'calendar-outline', iconFocused: 'calendar', route: '/(tabs)/calendar' },
    { name: 'home', title: 'Perfil', icon: 'account-outline', iconFocused: 'account', route: '/(tabs)/home' },
  ],
  padre: [
    { name: 'wall', title: 'Inicio', icon: 'home-outline', iconFocused: 'home', route: '/(tabs)/wall' },
    { name: 'calendar', title: 'Agenda', icon: 'calendar-outline', iconFocused: 'calendar', route: '/(tabs)/calendar' },
    { name: 'grades', title: 'Apps', icon: 'view-grid-outline', iconFocused: 'view-grid', route: '/(tabs)/grades' },
    { name: 'community', title: 'Comunidad', icon: 'account-group-outline', iconFocused: 'account-group', route: '/(tabs)/community' },
    { name: 'home', title: 'Perfil', icon: 'account-outline', iconFocused: 'account', route: '/(tabs)/home' },
  ],
};

const appsByRole: Record<Role, AppItem[]> = {
  alumno: [
    { icon: 'checkbox-marked-outline', label: 'Tareas', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/tareas' },
    { icon: 'calendar-account', label: 'Agenda personal', color: '#5B77D3', bgColor: '#EEF1FB', route: '/apps/agenda-personal' },
    { icon: 'book-open-variant', label: 'Material de estudio', color: '#0693E3', bgColor: '#E6F6FD', route: '/apps/material' },
    { icon: 'school', label: 'Notas', color: '#E67E22', bgColor: '#FDF2E6', route: '/apps/notas' },
    { icon: 'bookshelf', label: 'Materias y Horarios', color: '#27AE60', bgColor: '#E8F8EF', route: '/apps/materias' },
    { icon: 'calendar-check', label: 'Presentismo', color: '#4CAF50', bgColor: '#EAF7EB', route: '/apps/presentismo' },
    { icon: 'star-outline', label: 'Eventos', color: '#0693E3', bgColor: '#E6F6FD', route: '/apps/eventos' },
    { icon: 'bus', label: 'Viajes y Salidas', color: '#00897B', bgColor: '#E0F2F1', route: '/apps/viajes' },
    { icon: 'file-sign', label: 'Autorizaciones', color: '#8D6E63', bgColor: '#EFEBE9', route: '/apps/autorizaciones' },
  ],
  docente: [
    { icon: 'google-classroom', label: 'Mis cursos', color: '#5B77D3', bgColor: '#EEF1FB', route: '/apps/materias' },
    { icon: 'school', label: 'Cargar notas', color: '#E67E22', bgColor: '#FDF2E6', route: '/apps/notas' },
    { icon: 'calendar-check', label: 'Presentismo', color: '#4CAF50', bgColor: '#EAF7EB', route: '/apps/presentismo' },
    { icon: 'book-open-variant', label: 'Material', color: '#0693E3', bgColor: '#E6F6FD', route: '/apps/material' },
    { icon: 'message-text-outline', label: 'Comunicados', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/noticias' },
    { icon: 'star-outline', label: 'Eventos', color: '#9C27B0', bgColor: '#F3E5F5', route: '/apps/eventos' },
    { icon: 'bus', label: 'Viajes y Salidas', color: '#00897B', bgColor: '#E0F2F1', route: '/apps/viajes' },
    { icon: 'account-group', label: 'Alumnos', color: '#27AE60', bgColor: '#E8F8EF', route: '/apps/materias' },
    { icon: 'clock-outline', label: 'Horarios', color: '#E74C3C', bgColor: '#FDECEB', route: '/apps/horarios' },
  ],
  padre: [
    { icon: 'school', label: 'Notas', color: '#E67E22', bgColor: '#FDF2E6', route: '/apps/notas' },
    { icon: 'calendar-check', label: 'Presentismo', color: '#4CAF50', bgColor: '#EAF7EB', route: '/apps/presentismo' },
    { icon: 'notebook-outline', label: 'Cuaderno digital', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/noticias' },
    { icon: 'star-outline', label: 'Eventos', color: '#9C27B0', bgColor: '#F3E5F5', route: '/apps/eventos' },
    { icon: 'bus', label: 'Viajes y Salidas', color: '#00897B', bgColor: '#E0F2F1', route: '/apps/viajes' },
    { icon: 'file-sign', label: 'Autorizaciones', color: '#8D6E63', bgColor: '#EFEBE9', route: '/apps/autorizaciones' },
  ],
};

export default function DesktopSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role ?? 'alumno');
  const tabs = tabsByRole[role].filter((t) => t.name !== 'grades');
  const apps = appsByRole[role];

  return (
    <View style={styles.sidebar}>
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <MaterialCommunityIcons name="school" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.logoText}>Humand School</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          {tabs.map((tab) => {
            const isActive = pathname.includes(tab.name);
            return (
              <Pressable
                key={tab.name}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => router.push(tab.route as any)}
              >
                <MaterialCommunityIcons
                  name={((isActive ? tab.iconFocused : tab.icon) ?? 'help-circle') as any}
                  size={22}
                  color={isActive ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {tab.title}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Apps</Text>

        <View style={styles.nav}>
          {apps.map((app) => {
            const isActive = pathname.includes(app.route.replace('/apps/', ''));
            return (
              <Pressable
                key={app.label}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => router.push(app.route as any)}
              >
                <View style={[styles.appIconBox, { backgroundColor: app.bgColor }]}>
                  <MaterialCommunityIcons name={app.icon as any} size={16} color={app.color} />
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]} numberOfLines={1}>
                  {app.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingTop: 32,
    paddingHorizontal: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 24,
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  nav: {
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: `${Colors.primary}18`,
  },
  navLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  navLabelActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  appIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

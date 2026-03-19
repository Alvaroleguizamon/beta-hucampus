import React from 'react';
import { View, Pressable, StyleSheet, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '../../constants/colors';
import { SIDEBAR_WIDTH } from '../../hooks/useBreakpoint';
import { useAuthStore } from '../../lib/stores/auth-store';
import { useCoursesStore } from '../../lib/stores/courses-store';
import { Role } from '../../lib/types';
import HuCampusLogo from '../ui/HuCampusLogo';

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
    { name: 'grupos', title: 'Grupos', icon: 'account-group-outline', iconFocused: 'account-group', route: '/(tabs)/grupos' },
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
    { name: 'grupos', title: 'Grupos', icon: 'account-group-outline', iconFocused: 'account-group', route: '/(tabs)/grupos' },
    { name: 'home', title: 'Perfil', icon: 'account-outline', iconFocused: 'account', route: '/(tabs)/home' },
  ],
  admin: [
    { name: 'admin', title: 'Administración', icon: 'shield-crown-outline', iconFocused: 'shield-crown', route: '/(tabs)/admin' },
    { name: 'wall', title: 'Muro', icon: 'home-outline', iconFocused: 'home', route: '/(tabs)/wall' },
    { name: 'calendar', title: 'Agenda', icon: 'calendar-outline', iconFocused: 'calendar', route: '/(tabs)/calendar' },
    { name: 'home', title: 'Perfil', icon: 'account-outline', iconFocused: 'account', route: '/(tabs)/home' },
  ],
};

const appsByRole: Record<Role, AppItem[]> = {
  alumno: [
    { icon: 'checkbox-marked-outline', label: 'Tareas', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/tareas' },
    { icon: 'book-open-variant', label: 'Material de estudio', color: '#0693E3', bgColor: '#E6F6FD', route: '/apps/material' },
    { icon: 'school', label: 'Notas', color: '#E67E22', bgColor: '#FDF2E6', route: '/apps/notas' },
    { icon: 'bookshelf', label: 'Materias y Horarios', color: '#27AE60', bgColor: '#E8F8EF', route: '/apps/materias' },
    { icon: 'calendar-check', label: 'Presentismo', color: '#4CAF50', bgColor: '#EAF7EB', route: '/apps/presentismo' },
    { icon: 'message-text-outline', label: 'Comunicados', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/noticias' },
    { icon: 'bus', label: 'Viajes y Salidas', color: '#00897B', bgColor: '#E0F2F1', route: '/apps/viajes' },
  ],
  docente: [
    { icon: 'checkbox-marked-outline', label: 'Tareas', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/tareas' },
    { icon: 'school', label: 'Cargar notas', color: '#E67E22', bgColor: '#FDF2E6', route: '/apps/notas' },
    { icon: 'calendar-check', label: 'Presentismo', color: '#4CAF50', bgColor: '#EAF7EB', route: '/apps/presentismo' },
    { icon: 'book-open-variant', label: 'Material', color: '#0693E3', bgColor: '#E6F6FD', route: '/apps/material' },
    { icon: 'message-text-outline', label: 'Comunicados', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/noticias' },
    { icon: 'bus', label: 'Viajes y Salidas', color: '#00897B', bgColor: '#E0F2F1', route: '/apps/viajes' },
    { icon: 'account-group', label: 'Alumnos', color: '#27AE60', bgColor: '#E8F8EF', route: '/apps/alumnos' },
  ],
  padre: [
    { icon: 'checkbox-marked-outline', label: 'Tareas', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/tareas' },
    { icon: 'school', label: 'Notas', color: '#E67E22', bgColor: '#FDF2E6', route: '/apps/notas' },
    { icon: 'calendar-check', label: 'Presentismo', color: '#4CAF50', bgColor: '#EAF7EB', route: '/apps/presentismo' },
    { icon: 'notebook-outline', label: 'Cuaderno digital', color: '#7C6BC4', bgColor: '#F3F0FF', route: '/apps/noticias' },
    { icon: 'star-outline', label: 'Eventos', color: '#9C27B0', bgColor: '#F3E5F5', route: '/apps/eventos' },
    { icon: 'bus', label: 'Viajes y Salidas', color: '#00897B', bgColor: '#E0F2F1', route: '/apps/viajes' },
    { icon: 'file-sign', label: 'Autorizaciones', color: '#8D6E63', bgColor: '#EFEBE9', route: '/apps/autorizaciones' },
    { icon: 'account-box-outline', label: 'Contactos', color: '#0693E3', bgColor: '#E6F6FD', route: '/apps/contactos' },
  ],
  admin: [
    { icon: 'calendar-check', label: 'Presentismo', color: '#4CAF50', bgColor: '#EAF7EB', route: '/apps/presentismo' },
    { icon: 'account-group', label: 'Alumnos', color: '#9C27B0', bgColor: '#F3E5F5', route: '/apps/alumnos' },
    { icon: 'message-text-outline', label: 'Comunicados', color: '#E67E22', bgColor: '#FDF2E6', route: '/apps/noticias' },
    { icon: 'star-outline', label: 'Eventos', color: '#0693E3', bgColor: '#E6F6FD', route: '/apps/eventos' },
  ],
};

const rolLabel: Record<Role, string> = {
  alumno: 'Alumno',
  docente: 'Docente',
  padre: 'Padre / Tutor',
  admin: 'Administrador',
};

export default function DesktopSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'alumno';
  const courses = useCoursesStore((s) => s.courses);
  const studentCourse = role === 'alumno' && user
    ? courses.find((c) => c.students.some((s) => s.id === user.id))
    : null;
  const tabs = tabsByRole[role].filter((t) => t.name !== 'grades');
  const apps = appsByRole[role];

  return (
    <View style={styles.sidebar}>
      <View style={styles.logoContainer}>
        <HuCampusLogo width={140} />
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

      {studentCourse && (
        <View style={styles.courseFooter}>
          <MaterialCommunityIcons name="google-classroom" size={16} color={Colors.primary} />
          <Text style={styles.courseFooterText}>{studentCourse.grade}</Text>
        </View>
      )}
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
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    marginBottom: 24,
    gap: 8,
  },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 24,
    paddingRight: 12,
    paddingTop: 14,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  courseFooterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
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
  coursePickerWrapper: {
    marginBottom: 6,
  },
  coursePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: `${Colors.primary}10`,
    borderWidth: 1,
    borderColor: `${Colors.primary}25`,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  coursePickerIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coursePickerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  dropdownOptionActive: {
    backgroundColor: `${Colors.primary}10`,
  },
  dropdownOptionText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: 'Inter_500Medium',
  },
  dropdownOptionTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginHorizontal: -12,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  userRole: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
});

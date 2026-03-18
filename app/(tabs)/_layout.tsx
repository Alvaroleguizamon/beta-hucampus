import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/stores/auth-store';
import { useNotificationsStore } from '../../lib/stores/notifications-store';
import { useCommunityStore } from '../../lib/stores/community-store';
import { Colors } from '../../constants/colors';
import { Role } from '../../lib/types';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import DesktopSidebar from '../../components/layout/DesktopSidebar';
import UserTopBar from '../../components/layout/UserTopBar';

type TabConfig = {
  name: string;
  title: string;
  icon: string;
  iconFocused: string;
};

const tabsByRole: Record<Role, TabConfig[]> = {
  alumno: [
    { name: 'wall', title: 'Inicio', icon: 'home-outline', iconFocused: 'home' },
    { name: 'calendar', title: 'Agenda', icon: 'calendar-outline', iconFocused: 'calendar' },
    { name: 'grades', title: 'Apps', icon: 'view-grid-outline', iconFocused: 'view-grid' },
    { name: 'grupos', title: 'Grupos', icon: 'account-group-outline', iconFocused: 'account-group' },
    { name: 'home', title: 'Perfil', icon: 'account-outline', iconFocused: 'account' },
  ],
  docente: [
    { name: 'wall', title: 'Inicio', icon: 'home-outline', iconFocused: 'home' },
    { name: 'courses', title: 'Cursos', icon: 'google-classroom', iconFocused: 'google-classroom' },
    { name: 'grades', title: 'Apps', icon: 'view-grid-outline', iconFocused: 'view-grid' },
    { name: 'calendar', title: 'Agenda', icon: 'calendar-outline', iconFocused: 'calendar' },
    { name: 'home', title: 'Perfil', icon: 'account-outline', iconFocused: 'account' },
  ],
  padre: [
    { name: 'wall', title: 'Inicio', icon: 'home-outline', iconFocused: 'home' },
    { name: 'calendar', title: 'Agenda', icon: 'calendar-outline', iconFocused: 'calendar' },
    { name: 'grades', title: 'Apps', icon: 'view-grid-outline', iconFocused: 'view-grid' },
    { name: 'community', title: 'Comunidad', icon: 'account-group-outline', iconFocused: 'account-group' },
    { name: 'home', title: 'Perfil', icon: 'account-outline', iconFocused: 'account' },
  ],
};

const allTabs = ['wall', 'calendar', 'grades', 'communications', 'home', 'courses', 'attendance', 'community', 'grupos'];

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'alumno';
  const userId = user?.id ?? 'u1';
  const visibleTabs = tabsByRole[role];
  const visibleNames = visibleTabs.map((t) => t.name);
  const { isDesktop } = useBreakpoint();

  const notifUnread = useNotificationsStore((s) => s.getUnreadCount(userId, role));
  const conversations = useCommunityStore((s) => s.conversations);
  const chatUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  function getBadge(tabName: string): number | undefined {
    // Apps tab → notificaciones de escuela (tareas, comunicados, grupos, autorizaciones)
    if (tabName === 'grades') return notifUnread > 0 ? notifUnread : undefined;
    // Chats tab (alumno) o Comunidad (padre) → mensajes sin leer
    if (tabName === 'communications' || tabName === 'community') return chatUnread > 0 ? chatUnread : undefined;
    return undefined;
  }

  return (
    <View style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column' }}>
      {isDesktop && <DesktopSidebar />}
      <View style={{ flex: 1 }}>
        <UserTopBar />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.textSecondary,
            tabBarStyle: isDesktop
              ? { display: 'none' }
              : {
                  backgroundColor: '#FFFFFF',
                  borderTopWidth: 1,
                  borderTopColor: Colors.border,
                  height: 64,
                  paddingBottom: 8,
                  paddingTop: 6,
                },
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '500',
              marginTop: 2,
            },
            headerShown: false,
          }}
        >
          {allTabs.map((tabName) => {
            const config = visibleTabs.find((t) => t.name === tabName);
            const isVisible = visibleNames.includes(tabName);

            const badge = getBadge(tabName);
            return (
              <Tabs.Screen
                key={tabName}
                name={tabName}
                options={{
                  title: config?.title ?? tabName,
                  href: isVisible ? undefined : null,
                  tabBarBadge: badge,
                  tabBarBadgeStyle: { backgroundColor: Colors.primary, fontSize: 10 },
                  tabBarIcon: ({ color, size, focused }) => (
                    <MaterialCommunityIcons
                      name={((focused ? config?.iconFocused : config?.icon) ?? 'help-circle') as any}
                      size={24}
                      color={color}
                    />
                  ),
                }}
              />
            );
          })}
        </Tabs>
      </View>
    </View>
  );
}

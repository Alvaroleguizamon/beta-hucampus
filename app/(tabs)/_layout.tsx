import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/stores/auth-store';
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
    { name: 'communications', title: 'Chats', icon: 'chat-outline', iconFocused: 'chat' },
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

const allTabs = ['wall', 'calendar', 'grades', 'communications', 'home', 'courses', 'attendance', 'community'];

export default function TabsLayout() {
  const role = useAuthStore((s) => s.user?.role ?? 'alumno');
  const visibleTabs = tabsByRole[role];
  const visibleNames = visibleTabs.map((t) => t.name);
  const { isDesktop } = useBreakpoint();

  return (
    <View style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column' }}>
      {isDesktop && <DesktopSidebar />}
      <View style={{ flex: 1 }}>
        {!isDesktop && <UserTopBar />}
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

            return (
              <Tabs.Screen
                key={tabName}
                name={tabName}
                options={{
                  title: config?.title ?? tabName,
                  href: isVisible ? undefined : null,
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

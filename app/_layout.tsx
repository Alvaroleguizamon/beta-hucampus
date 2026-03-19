import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';
import { useCalendarStore } from '../lib/stores/calendar-store';
import { useNoticiasStore } from '../lib/stores/noticias-store';
import { useGradesStore } from '../lib/stores/grades-store';
import { useNotificationsStore } from '../lib/stores/notifications-store';
import { useTasksStore } from '../lib/stores/tasks-store';
import { useSocialStore } from '../lib/stores/social-store';
import { useGroupsStore } from '../lib/stores/groups-store';
import { useTripsStore } from '../lib/stores/trips-store';
import { useCommunityStore } from '../lib/stores/community-store';
import { useAuthStore } from '../lib/stores/auth-store';
import { useCoursesStore } from '../lib/stores/courses-store';
import { useSubjectsStore } from '../lib/stores/subjects-store';
import { useAttendanceStore } from '../lib/stores/attendance-store';
import { useAdminStore } from '../lib/stores/admin-store';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    secondary: Colors.accent,
    background: Colors.background,
    surface: Colors.surface,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Restore session on app start
    useAuthStore.getState().restoreSession();
    // Initialize all stores from Supabase
    useCalendarStore.getState().initialize();
    useNoticiasStore.getState().initialize();
    useGradesStore.getState().initialize();
    useTasksStore.getState().initialize();
    useSocialStore.getState().initialize();
    useGroupsStore.getState().initialize();
    useTripsStore.getState().initialize();
    useCoursesStore.getState().initialize();
    useSubjectsStore.getState().initialize();
    useAttendanceStore.getState().initialize();
    useAdminStore.getState().initialize();
  }, []);

  // Initialize user-scoped stores when logged in
  useEffect(() => {
    if (!user) return;
    useNotificationsStore.getState().initialize(user.id, user.role);
    useCommunityStore.getState().initialize(user.id);
  }, [user?.id, user?.role]);

  if (!fontsLoaded) return null;

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="post-detail/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="apps" />
        <Stack.Screen name="admin" />
      </Stack>
    </PaperProvider>
  );
}

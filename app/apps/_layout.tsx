import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Stack, router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import DesktopSidebar from '../../components/layout/DesktopSidebar';
import UserTopBar from '../../components/layout/UserTopBar';

const screenTitles: Record<string, string> = {
  tareas: 'Tareas',
  material: 'Material de estudio',
  notas: 'Notas',
  materias: 'Materias y Horarios',
  presentismo: 'Presentismo',
  eventos: 'Eventos',
  viajes: 'Viajes y Salidas',
  autorizaciones: 'Autorizaciones',
  horarios: 'Horarios',
  noticias: 'Comunicados',
  'nueva-noticia': 'Nueva noticia',
  alumnos: 'Alumnos',
  'agenda-personal': 'Agenda personal',
};

export default function AppsLayout() {
  const { isDesktop } = useBreakpoint();
  const pathname = usePathname();
  const screenName = pathname.split('/').pop() ?? '';
  const title = screenTitles[screenName] ?? screenName;

  return (
    <SafeAreaView style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column', backgroundColor: '#FFFFFF' }} edges={['top']}>
      {isDesktop && <DesktopSidebar />}
      <View style={{ flex: 1 }}>
        <UserTopBar />
        {isDesktop ? (
          <View style={styles.headerDesktop}>
            <Text style={styles.titleDesktop}>{title}</Text>
          </View>
        ) : (
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              style={styles.backBtn}
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color={Colors.primary} />
            </Pressable>
            <Text style={styles.title}>{title}</Text>
          </View>
        )}
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D0D0D0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
    marginRight: 36,
  },
  headerDesktop: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D0D0D0',
  },
  titleDesktop: {
    color: Colors.textPrimary,
    fontWeight: '800',
    fontSize: 24,
  },
});

import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import DesktopSidebar from '../../components/layout/DesktopSidebar';
import UserTopBar from '../../components/layout/UserTopBar';

export default function AdminLayout() {
  const { isDesktop } = useBreakpoint();

  return (
    <SafeAreaView style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column', backgroundColor: '#FFFFFF' }} edges={['top']}>
      {isDesktop && <DesktopSidebar />}
      <View style={{ flex: 1 }}>
        <UserTopBar />
        {!isDesktop && (
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={Colors.primary} />
            </Pressable>
            <Text style={styles.title}>Cursos</Text>
          </View>
        )}
        <Stack screenOptions={{ headerShown: false }} />
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
});

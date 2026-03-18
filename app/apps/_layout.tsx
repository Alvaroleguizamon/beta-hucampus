import { View } from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import DesktopSidebar from '../../components/layout/DesktopSidebar';

export default function AppsLayout() {
  const { isDesktop } = useBreakpoint();

  return (
    <View style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column' }}>
      {isDesktop && <DesktopSidebar />}
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTitleStyle: {
              color: Colors.textPrimary,
              fontWeight: '600',
              fontSize: 18,
            },
            headerTintColor: Colors.primary,
            headerShadowVisible: false,
            headerBackTitle: 'Apps',
          }}
        />
      </View>
    </View>
  );
}

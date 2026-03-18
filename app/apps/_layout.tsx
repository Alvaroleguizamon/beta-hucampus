import { Stack } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function AppsLayout() {
  return (
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
  );
}

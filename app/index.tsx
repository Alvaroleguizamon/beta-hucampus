import { Redirect } from 'expo-router';
import { useAuthStore } from '../lib/stores/auth-store';

export default function Index() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const role = useAuthStore((s) => s.user?.role);

  if (isLoggedIn) {
    const destination = '/(tabs)/wall';
    return <Redirect href={destination as any} />;
  }

  return <Redirect href="/(auth)/login" />;
}

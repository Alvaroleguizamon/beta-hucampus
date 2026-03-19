import { Redirect } from 'expo-router';
import { useAuthStore } from '../lib/stores/auth-store';

export default function Index() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const loading = useAuthStore((s) => s.loading);

  if (loading) return null;
  if (isLoggedIn) return <Redirect href="/(tabs)/wall" />;
  return <Redirect href="/(auth)/login" />;
}

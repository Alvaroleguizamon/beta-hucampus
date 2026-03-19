import React, { useState, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../lib/stores/auth-store';
import SplashView from '../components/ui/SplashView';

const SPLASH_DURATION = 3000;

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), SPLASH_DURATION);
    return () => clearTimeout(timeout);
  }, []);

  if (showSplash || loading) return <SplashView />;
  if (isLoggedIn) return <Redirect href="/(tabs)/wall" />;
  return <Redirect href="/(auth)/login" />;
}

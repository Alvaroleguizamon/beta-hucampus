import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../lib/stores/auth-store';
import { Colors } from '../constants/colors';

const SPLASH_DURATION = 3000;

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const loading = useAuthStore((s) => s.loading);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(textAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    const timeout = setTimeout(() => setShowSplash(false), SPLASH_DURATION);
    return () => clearTimeout(timeout);
  }, []);

  if (showSplash || loading) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Image
            source={require('../assets/images/splash-hugo.gif')}
            style={styles.gif}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.View style={[styles.textContainer, {
          opacity: textAnim,
          transform: [{
            translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
          }],
        }]}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoLetter}>H</Text>
            </View>
            <Text style={styles.appName}>Hu Campus</Text>
          </View>
          <Text style={styles.tagline}>Tu colegio en una app</Text>
        </Animated.View>
      </View>
    );
  }

  if (isLoggedIn) return <Redirect href="/(tabs)/wall" />;
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  gif: {
    width: 220,
    height: 220,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});

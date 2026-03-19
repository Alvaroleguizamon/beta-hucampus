import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/stores/auth-store';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);

  const handleLogin = () => {
    login(email || 'demo@humand.com', password || '1234');
    router.replace('/(auth)/select-role');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text variant="headlineLarge" style={styles.logoText}>
              H
            </Text>
          </View>
          <Text variant="headlineMedium" style={styles.title}>
            Hu School
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Tu colegio en una app
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="demo@humand.com"
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
            style={styles.input}
          />
          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            placeholder="cualquier contraseña"
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleLogin}
            buttonColor={Colors.primary}
            textColor="#FFFFFF"
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Iniciar sesión
          </Button>
        </View>

        <Text variant="bodySmall" style={styles.hint}>
          Demo: cualquier email y contraseña funciona
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Layout.paddingLarge,
    ...(Platform.OS === 'web' ? { maxWidth: 400 } : {}),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  title: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.textSecondary,
    marginTop: 4,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 8,
    borderRadius: Layout.borderRadius,
  },
  buttonContent: {
    height: 48,
  },
  hint: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 24,
  },
});

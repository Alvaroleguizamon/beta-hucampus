import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/stores/auth-store';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

const TEST_USERS = [
  { email: 'lucia@school.edu',    label: 'Alumno',   role: 'Lucía Martínez' },
  { email: 'garcia@school.edu',   label: 'Docente',  role: 'Prof. García' },
  { email: 'martinez@school.edu', label: 'Docente',  role: 'Prof. Martínez' },
  { email: 'laura@mail.com',      label: 'Padre',    role: 'Laura González' },
];
const TEST_PASSWORD = 'Humand2026!';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Completá email y contraseña.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.replace('/(tabs)/wall');
  };

  const fillTestUser = (testEmail: string) => {
    setEmail(testEmail);
    setPassword(TEST_PASSWORD);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text variant="headlineLarge" style={styles.logoText}>H</Text>
          </View>
          <Text variant="headlineMedium" style={styles.title}>Hu Campus</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>Tu colegio en una app</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={(v) => { setEmail(v); setError(''); }}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
            style={styles.input}
          />
          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={(v) => { setPassword(v); setError(''); }}
            mode="outlined"
            secureTextEntry
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
            style={styles.input}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            buttonColor={Colors.primary}
            textColor="#FFFFFF"
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Iniciar sesión
          </Button>
        </View>

        <View style={styles.testSection}>
          <Text style={styles.testTitle}>Usuarios de prueba</Text>
          <View style={styles.testGrid}>
            {TEST_USERS.map((u) => (
              <Pressable
                key={u.email}
                style={styles.testChip}
                onPress={() => fillTestUser(u.email)}
              >
                <Text style={styles.testChipLabel}>{u.label}</Text>
                <Text style={styles.testChipName}>{u.role}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.testPassword}>Contraseña: {TEST_PASSWORD}</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: Layout.paddingLarge },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  logoText: { color: '#FFFFFF', fontWeight: '700' },
  title: { color: Colors.textPrimary, fontWeight: '700' },
  subtitle: { color: Colors.textSecondary, marginTop: 4 },
  form: { gap: 12 },
  input: { backgroundColor: '#FFFFFF' },
  error: { color: Colors.error, fontSize: 13, textAlign: 'center' },
  button: { marginTop: 4, borderRadius: Layout.borderRadius },
  buttonContent: { height: 48 },
  testSection: {
    marginTop: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testTitle: {
    fontSize: 12, fontWeight: '600', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  testGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  testChip: {
    backgroundColor: Colors.primary + '12',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
  },
  testChipLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase' },
  testChipName: { fontSize: 12, color: Colors.textPrimary, marginTop: 1 },
  testPassword: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
});

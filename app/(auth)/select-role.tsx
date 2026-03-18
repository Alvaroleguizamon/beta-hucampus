import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/stores/auth-store';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { Role } from '../../lib/types';

const roles: { key: Role; label: string; emoji: string; description: string }[] = [
  { key: 'alumno', label: 'Alumno', emoji: '🎒', description: 'Ver notas, asistencia y materias' },
  { key: 'docente', label: 'Docente', emoji: '📚', description: 'Gestionar cursos y calificaciones' },
  { key: 'padre', label: 'Padre / Madre', emoji: '👨‍👩‍👧', description: 'Seguimiento de tu hijo/a' },
];

export default function SelectRoleScreen() {
  const selectRole = useAuthStore((s) => s.selectRole);

  const handleSelect = (role: Role) => {
    selectRole(role);
    const destination = role === 'alumno' ? '/(tabs)/wall' : '/(tabs)/home';
    router.replace(destination as any);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        ¿Cómo ingresás?
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Elegí tu perfil para continuar
      </Text>

      <View style={styles.roles}>
        {roles.map((role) => (
          <Pressable
            key={role.key}
            style={styles.roleCard}
            onPress={() => handleSelect(role.key)}
          >
            <Text style={styles.emoji}>{role.emoji}</Text>
            <Text variant="titleLarge" style={styles.roleLabel}>
              {role.label}
            </Text>
            <Text variant="bodyMedium" style={styles.roleDescription}>
              {role.description}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    paddingHorizontal: Layout.paddingLarge,
  },
  title: {
    color: Colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 32,
  },
  roles: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Layout.borderRadiusLarge,
    padding: Layout.paddingLarge,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  roleLabel: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  roleDescription: {
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});

import React from 'react';
import { StyleSheet, View, Pressable, Image, ImageSourcePropType, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { Role } from '../../lib/types';

const roleImages: Partial<Record<Role, ImageSourcePropType>> = {
  alumno: require('../../assets/images/huguito-alumno.webp'),
  docente: require('../../assets/images/huguito-docente.webp'),
  padre: require('../../assets/images/huguito-padre.webp'),
};

const roles: { key: Role; label: string; description: string }[] = [
  { key: 'alumno', label: 'Alumno', description: 'Ver notas, asistencia y materias' },
  { key: 'docente', label: 'Docente', description: 'Gestionar cursos y calificaciones' },
  { key: 'padre', label: 'Padre / Madre', description: 'Seguimiento de tu hijo/a' },
];

export default function SelectRoleScreen() {
  const handleSelect = (_role: Role) => {
    router.replace('/(tabs)/wall' as any);
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
            <Image source={roleImages[role.key]} style={styles.roleImage} resizeMode="contain" />
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
    alignItems: 'center',
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
    marginBottom: 24,
  },
  roles: {
    gap: 12,
    width: '100%',
    ...(Platform.OS !== 'web' ? { paddingHorizontal: 24 } : {}),
    ...(Platform.OS === 'web' ? { flexDirection: 'row' as const, justifyContent: 'center' as const, flexWrap: 'wrap' as const, gap: 24 } : {}),
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Layout.borderRadiusLarge,
    paddingHorizontal: Layout.paddingLarge,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    ...(Platform.OS === 'web' ? { width: 280, height: 280, justifyContent: 'center' as const } : {}),
  },
  roleImage: {
    width: 130,
    height: 130,
    marginBottom: 0,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? { width: 180, height: 180 } : {}),
  },
  roleLabel: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  roleDescription: {
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});

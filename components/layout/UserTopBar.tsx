import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../../lib/stores/auth-store';
import { Colors } from '../../constants/colors';
import { Role } from '../../lib/types';

const rolLabel: Record<Role, string> = {
  alumno: 'Alumno',
  docente: 'Docente',
  padre: 'Padre / Tutor',
};

export default function UserTopBar() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'alumno';

  return (
    <View style={styles.bar}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(user?.name ?? 'U').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View>
        <Text style={styles.name}>{user?.name ?? '—'}</Text>
        <Text style={styles.role}>{rolLabel[role]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  role: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
});

import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/stores/auth-store';
import { Colors } from '../../constants/colors';

type ProfileTab = 'info' | 'muro' | 'grupos';

const mockProfileData = {
  alumno: {
    name: 'Juan Pérez',
    subtitle: '3ro A · Turno Mañana',
    birthday: '15 de Agosto',
    info: [
      { label: 'Curso', value: '3ro A' },
      { label: 'Turno', value: 'Mañana' },
      { label: 'Email', value: 'juan.perez@humandschool.com' },
      { label: 'Tutor', value: 'Carlos Pérez' },
    ],
  },
  docente: {
    name: 'Prof. García',
    subtitle: 'Matemática',
    birthday: '22 de Marzo',
    info: [
      { label: 'Materia', value: 'Matemática' },
      { label: 'Turno', value: 'Mañana y Tarde' },
      { label: 'Email', value: 'garcia@humandschool.com' },
      { label: 'Departamento', value: 'Ciencias Exactas' },
    ],
  },
  padre: {
    name: 'Carlos Pérez',
    subtitle: 'Padre de Juan Pérez',
    birthday: '10 de Noviembre',
    info: [
      { label: 'Hijo/a', value: 'Juan Pérez' },
      { label: 'Email', value: 'carlos.perez@email.com' },
      { label: 'Teléfono', value: '+54 11 5555-1234' },
    ],
  },
};

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const role = user?.role ?? 'alumno';
  const profile = mockProfileData[role];
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'info', label: 'Información' },
    { key: 'muro', label: 'Muro' },
    { key: 'grupos', label: 'Grupos' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Cover / Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerGradient}>
            <Text style={styles.bannerLogo}>humand <Text style={styles.bannerLogoLight}>school</Text></Text>
          </View>
          <Pressable style={styles.bannerCameraBtn}>
            <MaterialCommunityIcons name="camera-outline" size={18} color={Colors.textPrimary} />
          </Pressable>
        </View>

        {/* Profile photo overlapping banner */}
        <View style={styles.profilePhotoContainer}>
          <View style={styles.profilePhoto}>
            <Text style={styles.profilePhotoText}>
              {profile.name[0]}
            </Text>
          </View>
          <Pressable style={styles.photoCameraBtn}>
            <MaterialCommunityIcons name="camera" size={14} color={Colors.textPrimary} />
          </Pressable>
        </View>

        {/* Name & info */}
        <View style={styles.nameSection}>
          <Text style={styles.profileName}>{profile.name}</Text>
          {role === 'alumno' && (
            <View style={styles.subtitleRow}>
              <MaterialCommunityIcons name="school-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.subtitleText}>{profile.subtitle}</Text>
            </View>
          )}
          <View style={styles.subtitleRow}>
            <MaterialCommunityIcons name="cake-variant-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.subtitleText}>{profile.birthday}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          {role === 'alumno' && (
            <Pressable style={styles.actionBtn}>
              <MaterialCommunityIcons name="account-group-outline" size={18} color={Colors.primary} />
              <Text style={styles.actionBtnText}>Compañeros</Text>
            </Pressable>
          )}
          <Pressable style={styles.actionBtn}>
            <MaterialCommunityIcons name="pencil-outline" size={18} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Editar perfil</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            {tabs.map((tab) => (
              <Pressable
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Tab content */}
        {activeTab === 'info' && (
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Text style={styles.infoCardTitle}>Datos</Text>
                <MaterialCommunityIcons name="chevron-up" size={24} color={Colors.textPrimary} />
              </View>
              {profile.info.map((item, index) => (
                <View key={item.label} style={[styles.infoRow, index < profile.info.length - 1 && styles.infoRowBorder]}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'muro' && (
          <View style={styles.emptyTab}>
            <MaterialCommunityIcons name="post-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Tus publicaciones aparecen acá</Text>
          </View>
        )}

        {activeTab === 'grupos' && (
          <View style={styles.emptyTab}>
            <MaterialCommunityIcons name="account-group-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Tus grupos aparecen acá</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  topBarRight: {
    flexDirection: 'row',
  },

  // Banner
  banner: {
    height: 140,
    backgroundColor: Colors.primary + '20',
    position: 'relative',
  },
  bannerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerLogo: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    opacity: 0.6,
  },
  bannerLogoLight: {
    fontWeight: '400',
  },
  bannerCameraBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Profile photo
  profilePhotoContainer: {
    marginTop: -50,
    marginLeft: 20,
    marginBottom: 12,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '30',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePhotoText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
  },
  photoCameraBtn: {
    position: 'absolute',
    bottom: 2,
    left: 70,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Name section
  nameSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    gap: 6,
  },
  actionBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  // Tabs
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  tabs: {
    paddingHorizontal: 4,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },

  // Info section
  infoSection: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  infoRow: {
    paddingVertical: 14,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Empty tabs
  emptyTab: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
});

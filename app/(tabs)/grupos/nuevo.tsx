import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useGroupsStore } from '../../../lib/stores/groups-store';
import { useAuthStore } from '../../../lib/stores/auth-store';
import { Group } from '../../../lib/types';
import { Colors } from '../../../constants/colors';

const GROUP_TYPES: { key: Group['type']; label: string; icon: string; description: string }[] = [
  { key: 'materia', label: 'Materia', icon: 'book-open-outline', description: 'Para una asignatura específica' },
  { key: 'extracurricular', label: 'Extracurricular', icon: 'soccer', description: 'Talleres, clubes, deportes' },
  { key: 'privado', label: 'Privado', icon: 'lock-outline', description: 'Grupo cerrado por invitación' },
];

const COVER_COLORS = [
  '#7C6BC4', '#5B77D3', '#0693E3', '#00897B',
  '#43A047', '#FF9800', '#E53935', '#8D6E63',
];

export default function NuevoGrupoScreen() {
  const { createGroup } = useGroupsStore();
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Group['type']>('materia');
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);

  const canSubmit = name.trim().length >= 3;

  const handleCreate = () => {
    if (!canSubmit) return;
    const id = createGroup(name.trim(), type, description.trim(), user?.id ?? 'u1', user?.name ?? '', coverColor);
    router.replace(`/grupos/${id}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Nuevo grupo</Text>
        <Pressable
          style={[styles.createBtn, !canSubmit && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={!canSubmit}
        >
          <Text style={styles.createBtnText}>Crear</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Preview */}
        <View style={styles.previewCard}>
          <View style={[styles.previewIcon, { backgroundColor: coverColor }]}>
            <Text style={styles.previewIconText}>{name[0] ?? '?'}</Text>
          </View>
          <View>
            <Text style={styles.previewName}>{name || 'Nombre del grupo'}</Text>
            <Text style={styles.previewMeta}>
              {GROUP_TYPES.find((t) => t.key === type)?.label} · 1 miembro
            </Text>
          </View>
        </View>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Nombre del grupo *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ej: Matemática 3° A, Club de Teatro..."
            mode="outlined"
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
            style={styles.input}
            maxLength={60}
          />
          <Text style={styles.charCount}>{name.length}/60</Text>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Descripción (opcional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describí el propósito del grupo..."
            mode="outlined"
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
            style={styles.input}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Type */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Tipo de grupo</Text>
          <View style={styles.typeGrid}>
            {GROUP_TYPES.map((t) => (
              <Pressable
                key={t.key}
                style={[styles.typeCard, type === t.key && { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' }]}
                onPress={() => setType(t.key)}
              >
                <MaterialCommunityIcons
                  name={t.icon as any}
                  size={24}
                  color={type === t.key ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[styles.typeLabel, type === t.key && { color: Colors.primary, fontWeight: '700' }]}>
                  {t.label}
                </Text>
                <Text style={styles.typeDesc}>{t.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Cover color */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Color del grupo</Text>
          <View style={styles.colorRow}>
            {COVER_COLORS.map((c) => (
              <Pressable
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, coverColor === c && styles.colorDotActive]}
                onPress={() => setCoverColor(c)}
              >
                {coverColor === c && (
                  <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>
            Los grupos son cerrados. Para unirse, los miembros deben ser invitados por un administrador.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  backBtn: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  createBtnDisabled: { opacity: 0.45 },
  createBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  content: {
    padding: 16,
    gap: 20,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewIconText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 24,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  previewMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  field: { gap: 6 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    fontSize: 15,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textSecondary,
    alignSelf: 'flex-end',
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  typeDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  colorRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },

  infoBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.border + '50',
    borderRadius: 10,
    padding: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

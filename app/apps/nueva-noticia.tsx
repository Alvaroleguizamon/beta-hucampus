import React, { useState, useLayoutEffect } from 'react';
import {
  StyleSheet, View, ScrollView, Pressable, Switch, Image, ActivityIndicator, Alert,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useNavigation, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { useNoticiasStore } from '../../lib/stores/noticias-store';
import { uploadPostImage } from '../../lib/stores/social-store';
import { FeedPost } from '../../lib/types';

type Category = FeedPost['category'];
type Audience = NonNullable<FeedPost['targetAudience']>;

const categoryOptions: { value: Category; label: string; color: string; icon: string }[] = [
  { value: 'comunicado', label: 'Comunicado', color: Colors.primary, icon: 'bullhorn' },
  { value: 'novedad', label: 'Novedad', color: Colors.accent, icon: 'star-outline' },
  { value: 'evento', label: 'Evento', color: '#9C27B0', icon: 'calendar-star' },
  { value: 'urgente', label: 'Urgente', color: Colors.error, icon: 'alert-circle' },
];

const audienceOptions: { value: Audience; label: string; icon: string }[] = [
  { value: 'todos', label: 'Todos', icon: 'account-multiple' },
  { value: 'alumnos', label: 'Alumnos', icon: 'school' },
  { value: 'docentes', label: 'Docentes', icon: 'teach' },
  { value: 'padres', label: 'Padres', icon: 'account-child' },
];

export default function NuevaNoticiaScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { addPost, updatePost, getPost } = useNoticiasStore();

  const editing = !!id;
  const existing = editing ? getPost(id!) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [category, setCategory] = useState<Category>(existing?.category ?? 'comunicado');
  const [audience, setAudience] = useState<Audience>(existing?.targetAudience ?? 'todos');
  const [imageUrl, setImageUrl] = useState(existing?.image ?? '');
  const [imageUploading, setImageUploading] = useState(false);
  const [pinned, setPinned] = useState(existing?.pinned ?? false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? 'Editar comunicado' : 'Nuevo comunicado' });
  }, [navigation, editing]);

  const handleImageUpload = async () => {
    if (imageUploading) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para subir imágenes.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    setImageUploading(true);
    try {
      const url = await uploadPostImage(result.assets[0].uri);
      setImageUrl(url);
    } catch (e: any) {
      Alert.alert('Error al subir imagen', e.message ?? 'Intentá de nuevo.');
    } finally {
      setImageUploading(false);
    }
  };

  const isValid = title.trim().length > 0 && body.trim().length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    if (editing && id) {
      updatePost(id, {
        title: title.trim(),
        body: body.trim(),
        category,
        image: imageUrl.trim() || undefined,
        targetAudience: audience,
        pinned,
      });
    } else {
      addPost({
        title: title.trim(),
        body: body.trim(),
        category,
        author: 'Dirección',
        date: new Date().toISOString().split('T')[0],
        image: imageUrl.trim() || undefined,
        targetAudience: audience,
        pinned,
      });
    }
    setSaving(false);
    router.back();
  };

  const selectedCategory = categoryOptions.find((c) => c.value === category)!;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      {/* Categoría */}
      <Text style={styles.label}>Categoría</Text>
      <View style={styles.optionRow}>
        {categoryOptions.map((opt) => {
          const active = category === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.optionChip, active && { backgroundColor: opt.color, borderColor: opt.color }]}
              onPress={() => setCategory(opt.value)}
            >
              <MaterialCommunityIcons name={opt.icon as any} size={14} color={active ? '#FFFFFF' : Colors.textSecondary} />
              <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Título */}
      <Text style={styles.label}>Título <Text style={styles.required}>*</Text></Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Ej: Reunión de padres - 2do trimestre"
        mode="outlined"
        outlineColor={Colors.border}
        activeOutlineColor={Colors.primary}
        style={styles.input}
        maxLength={120}
      />
      <Text style={styles.charCount}>{title.length}/120</Text>

      {/* Cuerpo */}
      <Text style={styles.label}>Contenido <Text style={styles.required}>*</Text></Text>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Escribí el contenido completo del comunicado..."
        mode="outlined"
        outlineColor={Colors.border}
        activeOutlineColor={Colors.primary}
        multiline
        numberOfLines={6}
        style={[styles.input, styles.bodyInput]}
      />

      {/* Imagen */}
      <Text style={styles.label}>Imagen</Text>
      {imageUrl ? (
        <View style={styles.uploadedContainer}>
          <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
          <Pressable style={styles.removeImageBtn} onPress={() => setImageUrl('')}>
            <MaterialCommunityIcons name="close-circle" size={22} color={Colors.error} />
            <Text style={styles.removeImageText}>Quitar imagen</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[styles.uploadBtn, imageUploading && styles.uploadBtnLoading]}
          onPress={handleImageUpload}
          disabled={imageUploading}
        >
          {imageUploading ? (
            <>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.uploadBtnText}>Subiendo imagen...</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="image-plus" size={24} color={Colors.primary} />
              <Text style={styles.uploadBtnText}>Subir imagen</Text>
              <Text style={styles.uploadBtnHint}>JPG, PNG, WEBP · Máx. 5 MB</Text>
            </>
          )}
        </Pressable>
      )}

      {/* Audiencia */}
      <Text style={styles.label}>Dirigido a</Text>
      <View style={styles.optionRow}>
        {audienceOptions.map((opt) => {
          const active = audience === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.optionChip, active && styles.optionChipActiveBlue]}
              onPress={() => setAudience(opt.value)}
            >
              <MaterialCommunityIcons name={opt.icon as any} size={14} color={active ? '#FFFFFF' : Colors.textSecondary} />
              <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Fijar */}
      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <MaterialCommunityIcons name="pin" size={20} color={Colors.primary} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.switchLabel}>Fijar en el muro</Text>
            <Text style={styles.switchHint}>Aparecerá destacada al inicio del feed</Text>
          </View>
        </View>
        <Switch
          value={pinned}
          onValueChange={setPinned}
          trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
          thumbColor={pinned ? Colors.primary : '#FFFFFF'}
        />
      </View>

      {/* Vista previa */}
      <Pressable style={styles.previewToggle} onPress={() => setShowPreview(!showPreview)}>
        <MaterialCommunityIcons name={showPreview ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.primary} />
        <Text style={styles.previewToggleText}>{showPreview ? 'Ocultar vista previa' : 'Ver vista previa'}</Text>
      </Pressable>

      {showPreview && (
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={[styles.previewChip, { backgroundColor: selectedCategory.color }]}>
              <Text style={styles.previewChipText}>{selectedCategory.label}</Text>
            </View>
            <Text style={styles.previewDate}>{new Date().toISOString().split('T')[0]}</Text>
          </View>
          {pinned && (
            <View style={styles.pinnedBadge}>
              <MaterialCommunityIcons name="pin" size={12} color={Colors.primary} />
              <Text style={styles.pinnedText}>Fijada</Text>
            </View>
          )}
          <Text style={styles.previewTitle}>{title || 'Título del comunicado'}</Text>
          {imageUrl.trim().length > 0 && (
            <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />
          )}
          <Text style={styles.previewBody} numberOfLines={4}>{body || 'El contenido del comunicado aparecerá aquí...'}</Text>
          <View style={styles.previewFooter}>
            <Text style={styles.previewAuthor}>Dirección</Text>
            <Text style={styles.previewAudience}>Para: {audienceOptions.find((a) => a.value === audience)?.label}</Text>
          </View>
        </View>
      )}

      {/* Acciones */}
      <View style={styles.actions}>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[styles.publishBtn, (!isValid || saving) && styles.publishBtnDisabled]}
          onPress={handleSave}
          disabled={!isValid || saving}
        >
          {saving
            ? <ActivityIndicator size={16} color="#FFF" />
            : <MaterialCommunityIcons name={editing ? 'content-save' : 'send'} size={16} color="#FFFFFF" />}
          <Text style={styles.publishText}>{editing ? 'Guardar cambios' : 'Publicar'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 48 },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  required: { color: Colors.error },

  input: { backgroundColor: '#FFFFFF' },
  bodyInput: { minHeight: 140 },
  charCount: { fontSize: 11, color: Colors.textSecondary, textAlign: 'right', marginTop: 4 },

  uploadBtn: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    gap: 6,
  },
  uploadBtnLoading: { opacity: 0.7 },
  uploadBtnText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  uploadBtnHint: { fontSize: 12, color: Colors.textSecondary },
  uploadedContainer: { gap: 8 },
  imagePreview: { width: '100%', height: 180, borderRadius: 10, backgroundColor: Colors.border },
  removeImageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end' },
  removeImageText: { fontSize: 13, color: Colors.error, fontWeight: '500' },

  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  optionChipActiveBlue: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionChipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  optionChipTextActive: { color: '#FFFFFF', fontWeight: '600' },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  switchHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  previewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  previewToggleText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  previewChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  previewChipText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  previewDate: { fontSize: 12, color: Colors.textSecondary },
  pinnedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  pinnedText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  previewTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8, lineHeight: 24 },
  previewImage: { width: '100%', height: 160, borderRadius: 8, marginBottom: 10, backgroundColor: Colors.border },
  previewBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  previewFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  previewAuthor: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
  previewAudience: { fontSize: 12, color: Colors.primary, fontWeight: '500' },

  actions: { flexDirection: 'row', gap: 12, marginTop: 32 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
  publishBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  publishBtnDisabled: { opacity: 0.4 },
  publishText: { fontSize: 15, color: '#FFFFFF', fontWeight: '700' },
});

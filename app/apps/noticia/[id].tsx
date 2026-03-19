import React, { useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, Pressable, Alert, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { useNoticiasStore } from '../../../lib/stores/noticias-store';
import { useAuthStore } from '../../../lib/stores/auth-store';

const categoryConfig: Record<string, { color: string; label: string; icon: string }> = {
  comunicado: { color: Colors.primary, label: 'Comunicado', icon: 'bullhorn' },
  novedad: { color: Colors.accent, label: 'Novedad', icon: 'star-outline' },
  evento: { color: '#9C27B0', label: 'Evento', icon: 'calendar-star' },
  urgente: { color: Colors.error, label: 'Urgente', icon: 'alert-circle' },
};
const fallbackCfg = { color: Colors.primary, label: 'Comunicado', icon: 'bullhorn' };

const audienceLabel = {
  todos: 'Toda la comunidad',
  alumnos: 'Alumnos',
  docentes: 'Docentes',
  padres: 'Padres / Tutores',
};

export default function NoticiaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const getPost = useNoticiasStore((s) => s.getPost);
  const deletePost = useNoticiasStore((s) => s.deletePost);
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role === 'admin' || role === 'docente';
  const post = getPost(id);

  const handleDelete = () => {
    const doDelete = () => { deletePost(id); router.back(); };
    if (Platform.OS === 'web') {
      if (window.confirm('¿Eliminar esta noticia? Esta acción no se puede deshacer.')) doDelete();
    } else {
      Alert.alert('Eliminar noticia', '¿Eliminar esta noticia? Esta acción no se puede deshacer.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Noticia',
      headerBackTitle: 'Noticias',
      headerRight: () => canEdit ? (
        <View style={{ flexDirection: 'row', gap: 4, marginRight: 8 }}>
          <Pressable
            style={styles.headerBtn}
            onPress={() => router.push(`/apps/nueva-noticia?id=${id}` as any)}
          >
            <MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.primary} />
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={handleDelete}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.error} />
          </Pressable>
        </View>
      ) : null,
    });
  }, [navigation, canEdit, id]);

  if (!post) {
    return (
      <View style={styles.notFound}>
        <MaterialCommunityIcons name="newspaper-variant-outline" size={64} color={Colors.border} />
        <Text style={styles.notFoundText}>Noticia no encontrada</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const cfg = categoryConfig[post.category] ?? fallbackCfg;
  const audience = post.targetAudience ?? 'todos';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Acciones admin */}
      {canEdit && (
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.actionBtn}
            onPress={() => router.push(`/apps/nueva-noticia?id=${id}` as any)}
          >
            <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Editar</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, styles.actionBtnDanger]} onPress={handleDelete}>
            <MaterialCommunityIcons name="trash-can-outline" size={16} color={Colors.error} />
            <Text style={[styles.actionBtnText, { color: Colors.error }]}>Eliminar</Text>
          </Pressable>
        </View>
      )}

      {/* Categoría + fecha */}
      <View style={styles.metaRow}>
        <View style={[styles.categoryBadge, { backgroundColor: cfg.color + '18' }]}>
          <MaterialCommunityIcons name={cfg.icon as any} size={14} color={cfg.color} />
          <Text style={[styles.categoryText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        {post.pinned && (
          <View style={styles.pinnedBadge}>
            <MaterialCommunityIcons name="pin" size={13} color={Colors.primary} />
            <Text style={styles.pinnedText}>Fijada</Text>
          </View>
        )}
        <Text style={styles.date}>{post.date}</Text>
      </View>

      {/* Título */}
      <Text style={styles.title}>{post.title}</Text>

      {/* Autor + audiencia */}
      <View style={styles.authorRow}>
        <View style={styles.authorAvatar}>
          <Text style={styles.authorAvatarText}>{post.author.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.authorName}>{post.author}</Text>
          <View style={styles.audienceRow}>
            <MaterialCommunityIcons name="account-multiple-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.audienceText}>{audienceLabel[audience]}</Text>
          </View>
        </View>
      </View>

      {/* Imagen */}
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />
      )}

      {/* Cuerpo */}
      <Text style={styles.body}>{post.body}</Text>

      {/* Separador + info */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <MaterialCommunityIcons name="calendar-outline" size={15} color={Colors.textSecondary} />
          <Text style={styles.footerText}>Publicado el {post.date}</Text>
        </View>
        <View style={styles.footerItem}>
          <MaterialCommunityIcons name={cfg.icon as any} size={15} color={cfg.color} />
          <Text style={[styles.footerText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingBottom: 48 },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryText: { fontSize: 12, fontWeight: '700' },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pinnedText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  date: { fontSize: 13, color: Colors.textSecondary, marginLeft: 'auto' },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 34,
    marginBottom: 20,
  },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorAvatarText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  authorName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  audienceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  audienceText: { fontSize: 12, color: Colors.textSecondary },

  image: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 20,
    backgroundColor: Colors.border,
  },

  body: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 26,
  },

  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 13, color: Colors.textSecondary },

  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionBtnDanger: { borderColor: Colors.error },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  headerBtn: { padding: 6, borderRadius: 8 },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: Colors.textSecondary },
  backBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  backBtnText: { color: '#FFFFFF', fontWeight: '600' },
});

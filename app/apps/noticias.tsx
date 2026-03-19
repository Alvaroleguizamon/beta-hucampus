import React, { useLayoutEffect } from 'react';
import { StyleSheet, View, FlatList, Pressable, Alert, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useNoticiasStore } from '../../lib/stores/noticias-store';
import { useAuthStore } from '../../lib/stores/auth-store';

const categoryConfig = {
  comunicado: { color: Colors.primary, label: 'Comunicado' },
  novedad: { color: Colors.accent, label: 'Novedad' },
  evento: { color: '#9C27B0', label: 'Evento' },
  urgente: { color: Colors.error, label: 'Urgente' },
};

export default function NoticiasScreen() {
  const navigation = useNavigation();
  const posts = useNoticiasStore((s) => s.posts);
  const deletePost = useNoticiasStore((s) => s.deletePost);
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role === 'admin' || role === 'docente';

  const handleDelete = (id: string, title: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Eliminar "${title}"?`)) deletePost(id);
    } else {
      Alert.alert('Eliminar noticia', `¿Eliminar "${title}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deletePost(id) },
      ]);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Noticias',
      headerRight: () => (
        <Pressable
          onPress={() => router.push('/apps/nueva-noticia')}
          style={{ marginRight: 8, padding: 6 }}
        >
          <MaterialCommunityIcons name="plus" size={26} color={Colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const cfg = categoryConfig[item.category];
          return (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/apps/noticia/${item.id}` as any)}
            >
              {item.pinned && (
                <View style={styles.pinnedRow}>
                  <MaterialCommunityIcons name="pin" size={13} color={Colors.primary} />
                  <Text style={styles.pinnedText}>Fijada</Text>
                </View>
              )}
              <View style={styles.cardHeader}>
                <View style={[styles.chip, { backgroundColor: cfg.color }]}>
                  <Text style={styles.chipText}>{cfg.label}</Text>
                </View>
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
              <View style={styles.footer}>
                <Text style={styles.author}>{item.author}</Text>
                <View style={styles.footerRight}>
                  {canEdit && (
                    <>
                      <Pressable
                        style={styles.actionBtn}
                        onPress={(e) => { e.stopPropagation?.(); router.push(`/apps/nueva-noticia?id=${item.id}` as any); }}
                      >
                        <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.primary} />
                      </Pressable>
                      <Pressable
                        style={styles.actionBtn}
                        onPress={(e) => { e.stopPropagation?.(); handleDelete(item.id, item.title); }}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={16} color={Colors.error} />
                      </Pressable>
                    </>
                  )}
                  <View style={styles.readMoreRow}>
                    <Text style={styles.readMore}>Ver noticia</Text>
                    <MaterialCommunityIcons name="arrow-right" size={14} color={Colors.primary} />
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="newspaper-variant-outline" size={56} color={Colors.border} />
            <Text style={styles.emptyText}>No hay noticias por el momento</Text>
          </View>
        }
      />

      {/* FAB nueva noticia */}
      <Pressable style={styles.fab} onPress={() => router.push('/apps/nueva-noticia')}>
        <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16, paddingBottom: 100 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  pinnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  pinnedText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  chipText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  date: { fontSize: 12, color: Colors.textSecondary },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  body: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  author: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn: { padding: 4, borderRadius: 6 },
  readMoreRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  readMore: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textSecondary },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});

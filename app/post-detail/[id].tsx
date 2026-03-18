import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Chip, IconButton } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { mockFeedPosts } from '../../lib/mock-data';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';

const categoryConfig = {
  comunicado: { color: Colors.primary, label: 'Comunicado' },
  novedad: { color: Colors.accent, label: 'Novedad' },
  evento: { color: '#9C27B0', label: 'Evento' },
  urgente: { color: Colors.error, label: 'Urgente' },
};

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = mockFeedPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <View style={styles.container}>
        <Text>Post no encontrado</Text>
      </View>
    );
  }

  const config = categoryConfig[post.category];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} iconColor={Colors.textPrimary} />
        <Text variant="titleMedium" style={styles.headerTitle}>Detalle</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Chip
          compact
          textStyle={styles.chipText}
          style={[styles.chip, { backgroundColor: config.color }]}
        >
          {config.label}
        </Chip>

        <Text variant="headlineSmall" style={styles.title}>
          {post.title}
        </Text>

        <View style={styles.meta}>
          <Text variant="bodyMedium" style={styles.author}>{post.author}</Text>
          <Text variant="bodyMedium" style={styles.date}>{post.date}</Text>
        </View>

        <View style={styles.divider} />

        <Text variant="bodyLarge" style={styles.body}>
          {post.body}
        </Text>
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
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: 4,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  content: {
    padding: Layout.paddingLarge,
  },
  chip: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  title: {
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  author: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  date: {
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 20,
  },
  body: {
    color: Colors.textPrimary,
    lineHeight: 26,
  },
});

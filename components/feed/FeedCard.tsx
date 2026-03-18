import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { Card } from '../ui/Card';
import { Colors } from '../../constants/colors';
import { FeedPost } from '../../lib/types';

const categoryConfig = {
  comunicado: { color: Colors.primary, label: 'Comunicado' },
  novedad: { color: Colors.accent, label: 'Novedad' },
  evento: { color: '#9C27B0', label: 'Evento' },
  urgente: { color: Colors.error, label: 'Urgente' },
};

interface Props {
  post: FeedPost;
}

export function FeedCard({ post }: Props) {
  const config = categoryConfig[post.category];

  return (
    <Card onPress={() => router.push(`/post-detail/${post.id}`)}>
      <View style={styles.header}>
        <Chip
          compact
          textStyle={styles.chipText}
          style={[styles.chip, { backgroundColor: config.color }]}
        >
          {config.label}
        </Chip>
        <Text variant="bodySmall" style={styles.date}>
          {post.date}
        </Text>
      </View>
      <Text variant="titleMedium" style={styles.title}>
        {post.title}
      </Text>
      <Text variant="bodyMedium" style={styles.body} numberOfLines={2}>
        {post.body}
      </Text>
      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.author}>
          {post.author}
        </Text>
        <Text variant="bodySmall" style={styles.readMore}>
          Ver más →
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chip: {
    height: 28,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  date: {
    color: Colors.textSecondary,
  },
  title: {
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  body: {
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  readMore: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

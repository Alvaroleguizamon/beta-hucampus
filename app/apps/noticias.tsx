import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { mockFeedPosts } from '../../lib/mock-data';
import { Colors } from '../../constants/colors';
import { FeedPost } from '../../lib/types';

const categoryConfig = {
  comunicado: { color: Colors.primary, label: 'Comunicado' },
  novedad: { color: Colors.accent, label: 'Novedad' },
  evento: { color: '#9C27B0', label: 'Evento' },
  urgente: { color: Colors.error, label: 'Urgente' },
};

export default function NoticiasScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <FlatList
        data={mockFeedPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const cfg = categoryConfig[item.category];
          const isExpanded = expandedId === item.id;
          return (
            <Pressable
              style={styles.card}
              onPress={() => setExpandedId(isExpanded ? null : item.id)}
            >
              <View style={styles.cardHeader}>
                <Chip
                  compact
                  textStyle={styles.chipText}
                  style={[styles.chip, { backgroundColor: cfg.color }]}
                >
                  {cfg.label}
                </Chip>
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body} numberOfLines={isExpanded ? undefined : 2}>
                {item.body}
              </Text>
              <View style={styles.footer}>
                <Text style={styles.author}>{item.author}</Text>
                <Text style={styles.readMore}>{isExpanded ? 'Ver menos' : 'Ver más'}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  chip: { height: 26 },
  chipText: { color: '#FFFFFF', fontSize: 11 },
  date: { fontSize: 12, color: Colors.textSecondary },
  title: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  body: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  author: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
  readMore: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
});

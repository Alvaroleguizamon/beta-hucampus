import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView, Modal } from 'react-native';
import { Text, TextInput, IconButton, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSocialStore } from '../../lib/stores/social-store';
import { mockFeedPosts, mockBirthdays } from '../../lib/mock-data';
import { WallPostCard } from '../../components/social/WallPostCard';
import { Colors } from '../../constants/colors';

const categoryConfig: Record<string, { color: string; label: string }> = {
  comunicado: { color: Colors.primary, label: 'Comunicado' },
  novedad: { color: Colors.accent, label: 'Novedad' },
  evento: { color: '#9C27B0', label: 'Evento' },
  urgente: { color: Colors.error, label: 'Urgente' },
};

type SubTab = 'muro' | 'grupos' | 'noticias';

export default function WallScreen() {
  const { posts, addPost, toggleLike, addComment } = useSocialStore();
  const [activeTab, setActiveTab] = useState<SubTab>('muro');
  const [newPostText, setNewPostText] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(null);
  const [showBirthdays, setShowBirthdays] = useState(false);

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'muro', label: 'Muro' },
    { key: 'grupos', label: 'Grupos' },
    { key: 'noticias', label: 'Noticias' },
  ];

  // Birthdays logic
  const todayMD = useMemo(() => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const todayBirthdays = mockBirthdays.filter((b) => b.date === todayMD);

  const upcomingBirthdays = useMemo(() => {
    return mockBirthdays
      .filter((b) => b.date > todayMD)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [todayMD]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>humand <Text style={styles.logoSchool}>school</Text></Text>
        <View style={styles.headerIcons}>
          <IconButton icon="magnify" size={24} iconColor={Colors.primary} />
          <View>
            <IconButton icon="cake-variant" size={24} iconColor={Colors.primary} onPress={() => setShowBirthdays(true)} />
            {todayBirthdays.length > 0 && (
              <View style={styles.birthdayBadge}>
                <Text style={styles.birthdayBadgeText}>{todayBirthdays.length}</Text>
              </View>
            )}
          </View>
          <IconButton icon="bell-outline" size={24} iconColor={Colors.primary} />
        </View>
      </View>

      {/* Sub-tab pills */}
      <View style={styles.pillsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.pill, activeTab === tab.key && styles.pillActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.pillText, activeTab === tab.key && styles.pillTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {activeTab === 'muro' && (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WallPostCard
              post={item}
              currentUserId="st1"
              onLike={(id) => toggleLike(id, 'st1')}
              onComment={(id, text) => addComment(id, 'st1', 'Juan Pérez', text)}
            />
          )}
          ListHeaderComponent={
            <>
              {!showComposer ? (
                <Pressable style={styles.createBar} onPress={() => setShowComposer(true)}>
                  <View style={styles.createAvatar}>
                    <Text style={styles.createAvatarText}>J</Text>
                  </View>
                  <View style={styles.createButton}>
                    <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.primary} />
                    <Text style={styles.createText}>Crear publicación</Text>
                  </View>
                </Pressable>
              ) : (
                <View style={styles.composer}>
                  <TextInput
                    placeholder="¿Qué estás pensando?"
                    value={newPostText}
                    onChangeText={setNewPostText}
                    mode="flat"
                    multiline
                    numberOfLines={4}
                    style={styles.composerInput}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    autoFocus
                  />
                  <View style={styles.composerActions}>
                    <Pressable onPress={() => { setShowComposer(false); setNewPostText(''); }}>
                      <Text style={styles.cancelText}>Cancelar</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.publishBtn, !newPostText.trim() && styles.publishBtnDisabled]}
                      onPress={() => {
                        if (newPostText.trim()) {
                          addPost(newPostText);
                          setNewPostText('');
                          setShowComposer(false);
                        }
                      }}
                    >
                      <Text style={styles.publishText}>Publicar</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </>
          }
        />
      )}

      {activeTab === 'grupos' && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-group-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>Grupos</Text>
          <Text style={styles.emptySubtitle}>Próximamente podrás unirte a grupos de tu curso</Text>
        </View>
      )}

      {activeTab === 'noticias' && (
        <FlatList
          data={mockFeedPosts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.newsList}
          renderItem={({ item }) => {
            const cfg = categoryConfig[item.category];
            const isExpanded = expandedNewsId === item.id;
            return (
              <Pressable
                style={styles.newsCard}
                onPress={() => setExpandedNewsId(isExpanded ? null : item.id)}
              >
                <View style={styles.newsHeader}>
                  <Chip
                    compact
                    textStyle={styles.newsChipText}
                    style={[styles.newsChip, { backgroundColor: cfg.color }]}
                  >
                    {cfg.label}
                  </Chip>
                  <Text style={styles.newsDate}>{item.date}</Text>
                </View>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsBody} numberOfLines={isExpanded ? undefined : 2}>
                  {item.body}
                </Text>
                <View style={styles.newsFooter}>
                  <Text style={styles.newsAuthor}>{item.author}</Text>
                  <Text style={styles.newsReadMore}>{isExpanded ? 'Ver menos' : 'Ver más'}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      {/* Birthday Modal */}
      <Modal visible={showBirthdays} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cumpleaños</Text>
              <IconButton icon="close" size={20} iconColor={Colors.textSecondary} onPress={() => setShowBirthdays(false)} />
            </View>

            {todayBirthdays.length > 0 && (
              <View style={styles.bdSection}>
                <Text style={styles.bdSectionTitle}>Hoy</Text>
                {todayBirthdays.map((b) => (
                  <View key={b.id} style={styles.bdRow}>
                    <View style={styles.bdAvatar}>
                      <MaterialCommunityIcons name="cake-variant" size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.bdInfo}>
                      <Text style={styles.bdName}>{b.name}</Text>
                      <Text style={styles.bdGrade}>{b.grade}</Text>
                    </View>
                    <Text style={styles.bdEmoji}>🎂</Text>
                  </View>
                ))}
              </View>
            )}

            {upcomingBirthdays.length > 0 && (
              <View style={styles.bdSection}>
                <Text style={styles.bdSectionTitle}>Próximos</Text>
                {upcomingBirthdays.map((b) => (
                  <View key={b.id} style={styles.bdRow}>
                    <View style={[styles.bdAvatar, { backgroundColor: Colors.border }]}>
                      <Text style={styles.bdAvatarText}>{b.name[0]}</Text>
                    </View>
                    <View style={styles.bdInfo}>
                      <Text style={styles.bdName}>{b.name}</Text>
                      <Text style={styles.bdGrade}>{b.grade} · {b.date}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {todayBirthdays.length === 0 && upcomingBirthdays.length === 0 && (
              <Text style={styles.bdEmpty}>No hay cumpleaños próximos</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 4,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  logoSchool: {
    fontWeight: '400',
    color: Colors.primary,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  birthdayBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  birthdayBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },

  // Pills
  pillsContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pills: {
    paddingHorizontal: 16,
    gap: 10,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
  },
  pillActive: {
    backgroundColor: Colors.primary + '15',
  },
  pillText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Create post bar
  createBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  createAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  createAvatarText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 16,
  },
  createButton: {
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
  createText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  // Composer
  composer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  composerInput: {
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    minHeight: 80,
  },
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  publishBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishBtnDisabled: {
    opacity: 0.5,
  },
  publishText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },

  // Noticias
  newsList: { padding: 16 },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  newsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  newsChip: { height: 26 },
  newsChipText: { color: '#FFFFFF', fontSize: 11 },
  newsDate: { fontSize: 12, color: Colors.textSecondary },
  newsTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  newsBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  newsFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  newsAuthor: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
  newsReadMore: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  // Empty states
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },

  // Birthday modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  bdSection: { marginBottom: 20 },
  bdSectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10 },
  bdRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  bdAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  bdAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  bdInfo: { flex: 1 },
  bdName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  bdGrade: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  bdEmoji: { fontSize: 20 },
  bdEmpty: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingVertical: 30 },
});

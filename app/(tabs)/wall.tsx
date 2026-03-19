import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView, Image, ActivityIndicator, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Text, TextInput, IconButton, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSocialStore } from '../../lib/stores/social-store';
import { useGroupsStore } from '../../lib/stores/groups-store';
import { WallPostCard } from '../../components/social/WallPostCard';
import { Colors } from '../../constants/colors';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useNoticiasStore } from '../../lib/stores/noticias-store';
import { useAuthStore } from '../../lib/stores/auth-store';

const categoryConfig: Record<string, { color: string; label: string }> = {
  comunicado: { color: Colors.primary, label: 'Comunicado' },
  novedad: { color: Colors.accent, label: 'Novedad' },
  evento: { color: '#9C27B0', label: 'Evento' },
  urgente: { color: Colors.error, label: 'Urgente' },
};

type SubTab = 'muro' | 'grupos' | 'noticias';

export default function WallScreen() {
  const { posts, addPost, setReaction, markViewed, addComment } = useSocialStore();
  const { getUserGroups, getGroupFeedForUser, setGroupPostReaction, markGroupPostViewed, addGroupPostComment } = useGroupsStore();
  const { isDesktop } = useBreakpoint();
  const noticias = useNoticiasStore((s) => s.posts);
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'alumno';
  const canPublish = role === 'docente';
  const canComment = role === 'docente';
  const userId = user?.id ?? 'u1';

  const allGroups = useGroupsStore((s) => s.groups);
  const allGroupPosts = useGroupsStore((s) => s.groupPosts);
  const myGroups = useMemo(() => getUserGroups(userId), [getUserGroups, userId, allGroups]);
  const groupFeedPosts = useMemo(() => getGroupFeedForUser(userId), [getGroupFeedForUser, userId, allGroupPosts]);

  const mergedFeed = useMemo(() => {
    return [...posts, ...groupFeedPosts].sort((a, b) => b.date.localeCompare(a.date));
  }, [posts, groupFeedPosts]);
  const [activeTab, setActiveTab] = useState<SubTab>('muro');
  const [newPostText, setNewPostText] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [composerImage, setComposerImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const composerInputRef = useRef<any>(null);
  const [composerSelection, setComposerSelection] = useState({ start: 0, end: 0 });
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<any>(null);

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'muro', label: 'Muro' },
    { key: 'noticias', label: 'Noticias' },
  ];

  const pinnedNoticias = noticias.filter((n) => n.pinned);

  const sq = searchQuery.toLowerCase().trim();
  const filteredFeed = useMemo(() => {
    if (!sq) return mergedFeed;
    return mergedFeed.filter((p) =>
      p.text?.toLowerCase().includes(sq) || p.authorName?.toLowerCase().includes(sq)
    );
  }, [mergedFeed, sq]);
  const filteredGroups = useMemo(() => {
    if (!sq) return myGroups;
    return myGroups.filter((g) => g.name.toLowerCase().includes(sq));
  }, [myGroups, sq]);
  const filteredNoticias = useMemo(() => {
    if (!sq) return noticias;
    return noticias.filter((n) =>
      n.title?.toLowerCase().includes(sq) || n.body?.toLowerCase().includes(sq)
    );
  }, [noticias, sq]);

  const insertFormat = (prefix: string, suffix: string) => {
    const { start, end } = composerSelection;
    const selected = newPostText.slice(start, end);
    const before = newPostText.slice(0, start);
    const after = newPostText.slice(end);
    const newText = before + prefix + selected + suffix + after;
    setNewPostText(newText);
  };

  const handleSimulatedImageUpload = () => {
    if (isUploadingImage || composerImage) return;
    setIsUploadingImage(true);
    const seed = Math.floor(Math.random() * 900) + 100;
    setTimeout(() => {
      setComposerImage(`https://picsum.photos/seed/${seed}/800/400`);
      setIsUploadingImage(false);
    }, 1400);
  };

  const cancelComposer = () => {
    setShowComposer(false);
    setNewPostText('');
    setComposerImage(null);
  };

  const handlePublish = () => {
    if (!newPostText.trim() && !composerImage) return;
    addPost(newPostText, user?.id ?? 'doc', user?.name ?? 'Docente', role, composerImage ?? undefined);
    cancelComposer();
  };

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  // Keep a ref to the latest handler so FlatList receives a stable function reference
  const viewHandlerRef = useRef<(info: { viewableItems: any[] }) => void>(() => {});
  viewHandlerRef.current = useCallback(({ viewableItems }: any) => {
    viewableItems.forEach(({ item }: any) => {
      if (item.groupId) markGroupPostViewed(item.groupId, item.id, userId);
      else markViewed(item.id, userId);
    });
  }, [markViewed, markGroupPostViewed, userId]);
  const onViewableItemsChanged = useRef((info: any) => viewHandlerRef.current(info)).current;

  const feedContent = (
    <FlatList
      data={filteredFeed}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.feedList}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      renderItem={({ item }) => (
        <WallPostCard
          post={item}
          currentUserId={userId}
          canComment={
            item.groupId
              ? allGroups.find((g) => g.id === item.groupId)?.members.some((m) => m.userId === userId) ?? false
              : canComment
          }
          onReaction={(id, reaction) => {
            if (item.groupId) setGroupPostReaction(item.groupId, id, userId, reaction);
            else setReaction(id, userId, reaction);
          }}
          onComment={(id, text) => {
            if (item.groupId) addGroupPostComment(item.groupId, id, userId, user?.name ?? '', text);
            else addComment(id, userId, user?.name ?? '', text);
          }}
        />
      )}
      ListHeaderComponent={
        <>
          {canPublish && (
            !showComposer ? (
              <Pressable style={styles.createBar} onPress={() => setShowComposer(true)}>
                <View style={styles.createAvatar}>
                  <Text style={styles.createAvatarText}>{user?.name?.[0] ?? 'D'}</Text>
                </View>
                <View style={styles.createButton}>
                  <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.primary} />
                  <Text style={styles.createText}>Crear publicación</Text>
                </View>
              </Pressable>
            ) : (
              <View style={styles.composer}>
                {/* Composer header */}
                <View style={styles.composerHeader}>
                  <View style={styles.createAvatar}>
                    <Text style={styles.createAvatarText}>{user?.name?.[0] ?? 'D'}</Text>
                  </View>
                  <Text style={styles.composerAuthorName}>{user?.name ?? 'Docente'}</Text>
                  <IconButton icon="close" size={18} iconColor={Colors.textSecondary} onPress={cancelComposer} />
                </View>

                {/* Text input */}
                <TextInput
                  ref={composerInputRef}
                  placeholder="¿Qué querés compartir con la comunidad?"
                  value={newPostText}
                  onChangeText={setNewPostText}
                  onSelectionChange={(e) => setComposerSelection(e.nativeEvent.selection)}
                  mode="flat"
                  multiline
                  numberOfLines={5}
                  style={styles.composerInput}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  autoFocus
                />

                {/* Image preview */}
                {composerImage && (
                  <View style={styles.composerImageWrapper}>
                    <Image source={{ uri: composerImage }} style={styles.composerImagePreview} resizeMode="cover" />
                    <Pressable style={styles.composerImageRemove} onPress={() => setComposerImage(null)}>
                      <MaterialCommunityIcons name="close-circle" size={22} color="#FFFFFF" />
                    </Pressable>
                  </View>
                )}

                {/* Formatting toolbar */}
                <View style={styles.composerToolbar}>
                  <Pressable style={styles.toolbarBtn} onPress={() => insertFormat('**', '**')}>
                    <Text style={styles.toolbarBtnBold}>B</Text>
                  </Pressable>
                  <Pressable style={styles.toolbarBtn} onPress={() => insertFormat('_', '_')}>
                    <Text style={styles.toolbarBtnItalic}>I</Text>
                  </Pressable>
                  <Pressable style={styles.toolbarBtn} onPress={() => insertFormat('__', '__')}>
                    <Text style={styles.toolbarBtnUnderline}>S</Text>
                  </Pressable>
                  <View style={styles.toolbarDivider} />
                  <Pressable
                    style={[styles.toolbarBtn, (isUploadingImage || !!composerImage) && styles.toolbarBtnDisabled]}
                    onPress={handleSimulatedImageUpload}
                    disabled={isUploadingImage || !!composerImage}
                  >
                    {isUploadingImage ? (
                      <ActivityIndicator size={16} color={Colors.primary} />
                    ) : (
                      <MaterialCommunityIcons name="image-plus" size={20} color={composerImage ? Colors.border : Colors.primary} />
                    )}
                  </Pressable>
                  <View style={{ flex: 1 }} />
                  <Pressable onPress={cancelComposer}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.publishBtn, (!newPostText.trim() && !composerImage) && styles.publishBtnDisabled]}
                    onPress={handlePublish}
                  >
                    <Text style={styles.publishText}>Publicar</Text>
                  </Pressable>
                </View>
              </View>
            )
          )}

          {/* Noticias fijadas — aparecen como posts del muro */}
          {pinnedNoticias.map((noticia) => {
            const cfg = categoryConfig[noticia.category];
            return (
              <Pressable
                key={noticia.id}
                style={[styles.pinnedCard, { borderLeftColor: cfg.color }]}
                onPress={() => router.push(`/apps/noticia/${noticia.id}` as any)}
              >
                <View style={styles.pinnedCardHeader}>
                  <View style={styles.pinnedLabel}>
                    <MaterialCommunityIcons name="pin" size={13} color={cfg.color} />
                    <Text style={[styles.pinnedLabelText, { color: cfg.color }]}>Fijada · {cfg.label}</Text>
                  </View>
                  <Text style={styles.pinnedDate}>{noticia.date}</Text>
                </View>
                <Text style={styles.pinnedTitle}>{noticia.title}</Text>
                <Text style={styles.pinnedBody} numberOfLines={3}>{noticia.body}</Text>
              </Pressable>
            );
          })}
        </>
      }
    />
  );

  const gruposContent = (
    <FlatList
      data={filteredGroups}
      keyExtractor={(g) => g.id}
      contentContainerStyle={styles.groupsList}
      ListHeaderComponent={
        canPublish ? (
          <Pressable style={styles.newGroupBtn} onPress={() => router.push('/grupos/nuevo' as any)}>
            <MaterialCommunityIcons name="plus" size={18} color={Colors.primary} />
            <Text style={styles.newGroupBtnText}>Crear grupo</Text>
          </Pressable>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-group-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>Sin grupos</Text>
          <Text style={styles.emptySubtitle}>Todavía no pertenecés a ningún grupo</Text>
        </View>
      }
      renderItem={({ item: group }) => {
        const typeLabel: Record<string, string> = { curso: 'Curso', materia: 'Materia', extracurricular: 'Extracurricular', privado: 'Privado' };
        const lastPosts = allGroupPosts[group.id] ?? [];
        const lastPost = lastPosts[0];
        return (
          <Pressable style={styles.groupCard} onPress={() => router.push(`/grupos/${group.id}` as any)}>
            <View style={[styles.groupCardIcon, { backgroundColor: group.coverColor }]}>
              <Text style={styles.groupCardIconText}>{group.name[0]}</Text>
            </View>
            <View style={styles.groupCardInfo}>
              <View style={styles.groupCardHeader}>
                <Text style={styles.groupCardName} numberOfLines={1}>{group.name}</Text>
                <View style={[styles.groupTypeBadge, { backgroundColor: group.coverColor + '18' }]}>
                  <Text style={[styles.groupTypeBadgeText, { color: group.coverColor }]}>{typeLabel[group.type]}</Text>
                </View>
              </View>
              <Text style={styles.groupCardMeta}>
                {group.members.length} miembros{lastPost ? ` · ${lastPost.date}` : ''}
              </Text>
              {lastPost && (
                <Text style={styles.groupCardLastPost} numberOfLines={1}>
                  {lastPost.authorName}: {lastPost.text.replace(/\*\*/g, '').replace(/_/g, '')}
                </Text>
              )}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.border} />
          </Pressable>
        );
      }}
    />
  );

  const noticiasContent = (
    <FlatList
      data={filteredNoticias.slice(0, 5)}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.newsList}
      renderItem={({ item }) => {
        const cfg = categoryConfig[item.category];
        return (
          <Pressable
            style={styles.newsCard}
            onPress={() => router.push(`/apps/noticia/${item.id}` as any)}
          >
            <View style={styles.newsHeader}>
              <View style={[styles.newsChip, { backgroundColor: cfg.color }]}>
                <Text style={styles.newsChipText}>{cfg.label}</Text>
              </View>
              <Text style={styles.newsDate}>{item.date}</Text>
            </View>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsBody} numberOfLines={2}>{item.body}</Text>
            <View style={styles.newsFooter}>
              <Text style={styles.newsAuthor}>{item.author}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={styles.newsReadMore}>Ver noticia</Text>
                <MaterialCommunityIcons name="arrow-right" size={13} color={Colors.primary} />
              </View>
            </View>
          </Pressable>
        );
      }}
      ListFooterComponent={
        <Pressable style={styles.seeAllBtn} onPress={() => router.push('/apps/noticias')}>
          <Text style={styles.seeAllText}>Ver todas las noticias</Text>
          <MaterialCommunityIcons name="arrow-right" size={16} color={Colors.primary} />
        </Pressable>
      }
    />
  );

  return (
    <View style={styles.container}>
      {isDesktop ? (
        /* ── Desktop layout: feed + aside ── */
        <View style={styles.desktopLayout}>
          <View style={styles.desktopMain}>
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

            {activeTab === 'muro' && feedContent}
            {activeTab === 'grupos' && gruposContent}
            {activeTab === 'noticias' && noticiasContent}
          </View>

          <ScrollView style={styles.desktopAside} showsVerticalScrollIndicator={false} contentContainerStyle={styles.desktopAsideContent}>
            {/* Grupos */}
            <View style={styles.asideSection}>
              <View style={styles.asideSectionHeader}>
                <Text style={styles.asideSectionTitle}>Grupos</Text>
                {canPublish && (
                  <Pressable onPress={() => router.push('/grupos/nuevo' as any)} style={styles.asideSeeAll}>
                    <MaterialCommunityIcons name="plus" size={14} color={Colors.primary} />
                    <Text style={styles.asideSeeAllText}>Nuevo</Text>
                  </Pressable>
                )}
              </View>
              {myGroups.length === 0 ? (
                <View style={styles.asideEmptyCard}>
                  <MaterialCommunityIcons name="account-group-outline" size={28} color={Colors.border} />
                  <Text style={styles.asideEmptyText}>Sin grupos</Text>
                </View>
              ) : (
                myGroups.slice(0, 4).map((group) => (
                  <Pressable
                    key={group.id}
                    style={styles.asideGroupRow}
                    onPress={() => router.push(`/grupos/${group.id}` as any)}
                  >
                    <View style={[styles.asideGroupDot, { backgroundColor: group.coverColor }]}>
                      <Text style={styles.asideGroupDotText}>{group.name[0]}</Text>
                    </View>
                    <Text style={styles.asideGroupName} numberOfLines={1}>{group.name}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.border} />
                  </Pressable>
                ))
              )}
            </View>

            {/* Noticias */}
            <View style={styles.asideSection}>
              <Pressable style={styles.asideSectionHeader} onPress={() => router.push('/apps/noticias')}>
                <Text style={styles.asideSectionTitle}>Noticias</Text>
                <View style={styles.asideSeeAll}>
                  <Text style={styles.asideSeeAllText}>Ver todas</Text>
                  <MaterialCommunityIcons name="arrow-right" size={13} color={Colors.primary} />
                </View>
              </Pressable>
              {noticias.slice(0, 4).map((item) => {
                const cfg = categoryConfig[item.category];
                return (
                  <Pressable
                    key={item.id}
                    style={styles.asideNewsCard}
                    onPress={() => router.push(`/apps/noticia/${item.id}` as any)}
                  >
                    <View style={styles.asideNewsTop}>
                      <View style={[styles.asideNewsDot, { backgroundColor: cfg.color }]} />
                      <Text style={styles.asideNewsCategory}>{cfg.label}</Text>
                      <Text style={styles.asideNewsDate}>{item.date}</Text>
                    </View>
                    <Text style={styles.asideNewsTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.asideNewsBody} numberOfLines={2}>{item.body}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      ) : (
        /* ── Mobile layout: tabs + content ── */
        <>
          <View style={styles.pillsContainer}>
            <View style={styles.pillsMobile}>
              {tabs.map((tab) => (
                <Pressable
                  key={tab.key}
                  style={[styles.pill, styles.pillMobile, activeTab === tab.key && styles.pillActive]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Text style={[styles.pillText, activeTab === tab.key && styles.pillTextActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {activeTab === 'muro' && feedContent}
          {activeTab === 'grupos' && gruposContent}
          {activeTab === 'noticias' && noticiasContent}
        </>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Pills
  pillsContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    marginTop: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    gap: 6,
  },
  pills: {
    paddingHorizontal: 16,
    gap: 10,
  },
  pillsMobile: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  pillMobile: {
    flex: 1,
    alignItems: 'center',
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  searchBarExpanded: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    backgroundColor: 'transparent',
    height: 34,
  },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  feedList: {
    paddingTop: 12,
  },

  // Pinned noticias
  pinnedCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
  },
  pinnedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pinnedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pinnedLabelText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  pinnedDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  pinnedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  pinnedBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Create post bar
  createBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
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
    marginHorizontal: 12,
    marginBottom: 8,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingTop: 12,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  composerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  composerAuthorName: {
    flex: 1,
    fontWeight: '600',
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  composerInput: {
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    minHeight: 100,
    paddingHorizontal: 16,
  },
  composerImageWrapper: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  composerImagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  composerImageRemove: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
  },
  composerToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
    gap: 2,
  },
  toolbarBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbarBtnDisabled: {
    opacity: 0.4,
  },
  toolbarBtnBold: {
    fontWeight: '700',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  toolbarBtnItalic: {
    fontStyle: 'italic',
    fontWeight: '600',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  toolbarBtnUnderline: {
    textDecorationLine: 'underline',
    fontWeight: '600',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  toolbarDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  publishBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    marginLeft: 4,
  },
  publishBtnDisabled: {
    opacity: 0.45,
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
  newsChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'center',
  },
  newsChipText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  newsDate: { fontSize: 12, color: Colors.textSecondary },
  newsTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  newsBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  newsFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  newsAuthor: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
  newsReadMore: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  // Desktop layout
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopMain: {
    flex: 3,
  },
  desktopAside: {
    flex: 2,
    maxWidth: 380,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
    backgroundColor: Colors.background,
  },
  desktopAsideContent: {
    padding: 16,
    gap: 24,
  },
  asideSection: {
    gap: 10,
  },
  asideSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  asideSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  asideSeeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  asideSeeAllText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  asideEmptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  asideEmptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  asideNewsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  asideNewsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  asideNewsDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  asideNewsCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  asideNewsDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  asideNewsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  asideNewsBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },

  // Groups list (mobile)
  groupsList: {
    padding: 12,
    gap: 0,
  },
  newGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  newGroupBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  groupCardIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupCardIconText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  groupCardInfo: {
    flex: 1,
    gap: 2,
  },
  groupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  groupCardName: {
    fontWeight: '700',
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  groupTypeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  groupTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  groupCardMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  groupCardLastPost: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Aside groups (desktop)
  asideGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  asideGroupDot: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  asideGroupDotText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  asideGroupName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
  },

  // See all button (mobile noticias)
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },

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

});

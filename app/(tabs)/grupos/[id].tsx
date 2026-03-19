import React, { useState, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView, Modal, Image, ActivityIndicator, Alert } from 'react-native';
import { Text, TextInput, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useGroupsStore } from '../../../lib/stores/groups-store';
import { useAuthStore } from '../../../lib/stores/auth-store';
import { useCoursesStore } from '../../../lib/stores/courses-store';
import { WallPostCard } from '../../../components/social/WallPostCard';
import { Colors } from '../../../constants/colors';

const TYPE_LABEL: Record<string, string> = {
  curso: 'Curso',
  materia: 'Materia',
  extracurricular: 'Extracurricular',
  privado: 'Privado',
};

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    groups,
    groupPosts,
    isGroupAdmin,
    addGroupPost,
    setGroupPostReaction,
    markGroupPostViewed,
    addGroupPostComment,
    inviteMember,
    removeMember,
  } = useGroupsStore();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? 'u1';
  const role = user?.role ?? 'alumno';

  const courses = useCoursesStore((s) => s.courses);
  const group = groups.find((g) => g.id === id);
  const posts = groupPosts[id ?? ''] ?? [];
  const isMember = group?.members.some((m) => m.userId === userId) ?? false;
  const isAdmin = isGroupAdmin(id ?? '', userId);
  const canPost = isMember;
  const canInvite = isAdmin || role === 'docente';

  // Build searchable user pool from Supabase courses
  const allUsers = useMemo(() => [
    ...courses.flatMap((c) =>
      c.students.map((s) => ({ id: s.id, name: s.name, role: 'alumno' as const, grade: c.grade }))
    ),
    { id: 'doc1', name: 'Prof. García', role: 'docente' as const, grade: '' },
    { id: 'doc2', name: 'Prof. Martínez', role: 'docente' as const, grade: '' },
    { id: 'u1', name: 'Lucía Martínez', role: 'alumno' as const, grade: '3ro A' },
  ], [courses]);

  const [showComposer, setShowComposer] = useState(false);
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const memberIds = useMemo(() => new Set(group?.members.map((m) => m.userId) ?? []), [group?.members]);

  const inviteResults = useMemo(() => {
    if (!inviteSearch.trim()) return [];
    const q = inviteSearch.toLowerCase();
    return allUsers.filter(
      (u) => !memberIds.has(u.id) && u.name.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [inviteSearch, memberIds]);

  const handleInvite = (targetUser: typeof allUsers[0]) => {
    inviteMember(id ?? '', {
      userId: targetUser.id,
      userName: targetUser.name,
      role: 'miembro',
      joinedAt: new Date().toISOString().split('T')[0],
    });
    setInviteSearch('');
    Alert.alert(
      'Invitación enviada',
      `${targetUser.name} fue agregado al grupo y recibirá una notificación.`,
      [{ text: 'OK' }],
    );
  };

  const handleRemoveMember = (targetUserId: string, targetName: string) => {
    if (targetUserId === userId) return; // no te podés quitar a vos mismo como admin
    Alert.alert(
      'Quitar miembro',
      `¿Querés quitar a ${targetName} del grupo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Quitar', style: 'destructive', onPress: () => removeMember(id ?? '', targetUserId) },
      ],
    );
  };

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    viewableItems.forEach(({ item }: any) => {
      markGroupPostViewed(id ?? '', item.id, userId);
    });
  }, [id, userId, markGroupPostViewed]);

  const insertFormat = (prefix: string, suffix: string) => {
    const { start, end } = selection;
    const selected = postText.slice(start, end);
    const before = postText.slice(0, start);
    const after = postText.slice(end);
    setPostText(before + prefix + selected + suffix + after);
  };

  const handleImageUpload = () => {
    if (isUploading || postImage) return;
    setIsUploading(true);
    const seed = Math.floor(Math.random() * 900) + 100;
    setTimeout(() => {
      setPostImage(`https://picsum.photos/seed/${seed}/800/400`);
      setIsUploading(false);
    }, 1400);
  };

  const handlePublish = () => {
    if (!postText.trim() && !postImage) return;
    addGroupPost(id ?? '', group?.name ?? '', postText, userId, user?.name ?? '', role as any, postImage ?? undefined);
    setPostText('');
    setPostImage(null);
    setShowComposer(false);
  };

  if (!group) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Grupo no encontrado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: group.coverColor + '40' }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.primary} />
        </Pressable>
        <View style={[styles.headerIcon, { backgroundColor: group.coverColor }]}>
          <Text style={styles.headerIconText}>{group.name[0]}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{group.name}</Text>
          <Text style={styles.headerMeta}>{group.members.length} miembros · {TYPE_LABEL[group.type]}</Text>
        </View>
        <IconButton
          icon="account-group-outline"
          size={22}
          iconColor={Colors.primary}
          onPress={() => setShowMembers(true)}
        />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedList}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="post-outline" size={56} color={Colors.border} />
            <Text style={styles.emptyText}>Aún no hay publicaciones en este grupo</Text>
          </View>
        }
        ListHeaderComponent={
          canPost ? (
            !showComposer ? (
              <Pressable style={styles.createBar} onPress={() => setShowComposer(true)}>
                <View style={[styles.createAvatar, { backgroundColor: group.coverColor + '20' }]}>
                  <Text style={[styles.createAvatarText, { color: group.coverColor }]}>{user?.name?.[0] ?? 'D'}</Text>
                </View>
                <View style={styles.createButton}>
                  <MaterialCommunityIcons name="pencil-outline" size={15} color={Colors.primary} />
                  <Text style={styles.createText}>Publicar en el grupo</Text>
                </View>
              </Pressable>
            ) : (
              <View style={styles.composer}>
                <View style={styles.composerHeader}>
                  <View style={[styles.createAvatar, { backgroundColor: group.coverColor + '20' }]}>
                    <Text style={[styles.createAvatarText, { color: group.coverColor }]}>{user?.name?.[0] ?? 'D'}</Text>
                  </View>
                  <Text style={styles.composerAuthorName}>{user?.name}</Text>
                  <IconButton icon="close" size={18} iconColor={Colors.textSecondary} onPress={() => { setShowComposer(false); setPostText(''); setPostImage(null); }} />
                </View>
                <TextInput
                  placeholder="¿Qué querés compartir con el grupo?"
                  value={postText}
                  onChangeText={setPostText}
                  onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                  mode="flat"
                  multiline
                  numberOfLines={4}
                  style={styles.composerInput}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  autoFocus
                />
                {postImage && (
                  <View style={styles.imageWrapper}>
                    <Image source={{ uri: postImage }} style={styles.imagePreview} resizeMode="cover" />
                    <Pressable style={styles.imageRemove} onPress={() => setPostImage(null)}>
                      <MaterialCommunityIcons name="close-circle" size={22} color="#FFFFFF" />
                    </Pressable>
                  </View>
                )}
                <View style={styles.composerToolbar}>
                  <Pressable style={styles.toolbarBtn} onPress={() => insertFormat('**', '**')}>
                    <Text style={styles.toolbarBold}>B</Text>
                  </Pressable>
                  <Pressable style={styles.toolbarBtn} onPress={() => insertFormat('_', '_')}>
                    <Text style={styles.toolbarItalic}>I</Text>
                  </Pressable>
                  <View style={styles.toolbarDivider} />
                  <Pressable style={[styles.toolbarBtn, (isUploading || !!postImage) && { opacity: 0.4 }]} onPress={handleImageUpload} disabled={isUploading || !!postImage}>
                    {isUploading ? <ActivityIndicator size={16} color={Colors.primary} /> : <MaterialCommunityIcons name="image-plus" size={20} color={Colors.primary} />}
                  </Pressable>
                  <View style={{ flex: 1 }} />
                  <Pressable onPress={() => { setShowComposer(false); setPostText(''); setPostImage(null); }}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.publishBtn, (!postText.trim() && !postImage) && styles.publishBtnDisabled]}
                    onPress={handlePublish}
                  >
                    <Text style={styles.publishText}>Publicar</Text>
                  </Pressable>
                </View>
              </View>
            )
          ) : null
        }
        renderItem={({ item }) => (
          <WallPostCard
            post={item}
            currentUserId={userId}
            canComment={canPost}
            onReaction={(postId, reaction) => setGroupPostReaction(id ?? '', postId, userId, reaction)}
            onComment={(postId, text) => addGroupPostComment(id ?? '', postId, userId, user?.name ?? '', text)}
          />
        )}
      />

      {/* Members modal */}
      <Modal visible={showMembers} animationType="slide" transparent>
        <View style={styles.membersOverlay}>
          <View style={styles.membersSheet}>
            <View style={styles.membersHeader}>
              <Text style={styles.membersTitle}>Miembros ({group.members.length})</Text>
              <IconButton icon="close" size={20} iconColor={Colors.textSecondary} onPress={() => { setShowMembers(false); setShowInvitePanel(false); setInviteSearch(''); }} />
            </View>

            <ScrollView contentContainerStyle={styles.membersList} keyboardShouldPersistTaps="handled">
              {group.members.map((member) => (
                <View key={member.userId} style={styles.memberRow}>
                  <View style={[styles.memberAvatar, { backgroundColor: group.coverColor + '20' }]}>
                    <Text style={[styles.memberAvatarText, { color: group.coverColor }]}>{member.userName[0]}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.userName}</Text>
                    <Text style={styles.memberJoined}>Desde {member.joinedAt}</Text>
                  </View>
                  {member.role === 'admin' && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>Admin</Text>
                    </View>
                  )}
                  {canInvite && member.userId !== userId && member.role !== 'admin' && (
                    <Pressable
                      style={styles.removeMemberBtn}
                      onPress={() => handleRemoveMember(member.userId, member.userName)}
                    >
                      <MaterialCommunityIcons name="account-minus-outline" size={18} color={Colors.error} />
                    </Pressable>
                  )}
                </View>
              ))}

              {/* Invite section */}
              {canInvite && (
                <View style={styles.inviteSection}>
                  {!showInvitePanel ? (
                    <Pressable style={styles.inviteToggleBtn} onPress={() => setShowInvitePanel(true)}>
                      <MaterialCommunityIcons name="account-plus-outline" size={18} color={Colors.primary} />
                      <Text style={styles.inviteToggleBtnText}>Invitar miembros</Text>
                    </Pressable>
                  ) : (
                    <View>
                      <Text style={styles.inviteLabel}>Buscar y agregar</Text>
                      <TextInput
                        placeholder="Nombre del alumno o docente..."
                        value={inviteSearch}
                        onChangeText={setInviteSearch}
                        mode="outlined"
                        dense
                        outlineColor={Colors.border}
                        activeOutlineColor={Colors.primary}
                        style={styles.inviteInput}
                        autoFocus
                        left={<TextInput.Icon icon="magnify" />}
                      />
                      {inviteResults.length > 0 && (
                        <View style={styles.inviteResults}>
                          {inviteResults.map((u) => (
                            <Pressable key={u.id} style={styles.inviteResultRow} onPress={() => handleInvite(u)}>
                              <View style={styles.inviteResultAvatar}>
                                <Text style={styles.inviteResultAvatarText}>{u.name[0]}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.inviteResultName}>{u.name}</Text>
                                <Text style={styles.inviteResultMeta}>{u.role === 'docente' ? 'Docente' : u.grade}</Text>
                              </View>
                              <View style={styles.inviteBtn}>
                                <MaterialCommunityIcons name="account-plus" size={14} color="#FFFFFF" />
                                <Text style={styles.inviteBtnText}>Invitar</Text>
                              </View>
                            </Pressable>
                          ))}
                        </View>
                      )}
                      {inviteSearch.trim().length > 0 && inviteResults.length === 0 && (
                        <Text style={styles.inviteNoResults}>No se encontraron usuarios disponibles</Text>
                      )}
                      <Pressable onPress={() => { setShowInvitePanel(false); setInviteSearch(''); }}>
                        <Text style={styles.inviteCancelText}>Cancelar</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
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
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  feedList: {
    paddingTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
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
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  createAvatarText: {
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
  composer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingTop: 12,
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
    minHeight: 90,
    paddingHorizontal: 16,
  },
  imageWrapper: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  imageRemove: {
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
  toolbarBold: { fontWeight: '700', fontSize: 16, color: Colors.textPrimary },
  toolbarItalic: { fontStyle: 'italic', fontWeight: '600', fontSize: 16, color: Colors.textPrimary },
  toolbarDivider: { width: 1, height: 20, backgroundColor: Colors.border, marginHorizontal: 4 },
  cancelText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500', paddingHorizontal: 8 },
  publishBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, marginLeft: 4 },
  publishBtnDisabled: { opacity: 0.45 },
  publishText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  membersOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  membersSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  membersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 8,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  membersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  membersList: {
    padding: 16,
    gap: 4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontWeight: '700',
    fontSize: 16,
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  memberJoined: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  adminBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  removeMemberBtn: {
    padding: 6,
    borderRadius: 8,
  },

  // Invite section
  inviteSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inviteToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.primary + '10',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  inviteToggleBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  inviteLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inviteInput: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  inviteResults: {
    gap: 4,
    marginBottom: 8,
  },
  inviteResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: Colors.background,
    borderRadius: 10,
  },
  inviteResultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteResultAvatarText: {
    fontWeight: '700',
    fontSize: 14,
    color: Colors.primary,
  },
  inviteResultName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  inviteResultMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inviteBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  inviteNoResults: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  inviteCancelText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
});

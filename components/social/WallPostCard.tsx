import React, { useState } from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import { Text, TextInput, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { WallPost, ReactionType } from '../../lib/types';

const REACTIONS: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: 'like', emoji: '👍', label: 'Me gusta', color: Colors.primary },
  { type: 'love', emoji: '❤️', label: 'Me encanta', color: '#E53935' },
  { type: 'aplauso', emoji: '👏', label: 'Aplaudo', color: '#FF9800' },
  { type: 'sorpresa', emoji: '😮', label: 'Sorpresa', color: '#9C27B0' },
];

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  docente: { label: 'Docente', color: Colors.primary },
  admin: { label: 'Dirección', color: '#7C6BC4' },
};

interface Props {
  post: WallPost;
  currentUserId: string;
  canComment: boolean;
  onReaction: (postId: string, reaction: ReactionType | null) => void;
  onComment: (postId: string, text: string) => void;
}

export function WallPostCard({ post, currentUserId, canComment, onReaction, onComment }: Props) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const reactions = post.reactions ?? {};
  const myReaction = reactions[currentUserId] ?? null;
  const isLongText = post.text.length > 180;

  // Agrupa reacciones por tipo y cuenta
  const reactionCounts = REACTIONS.map((r) => ({
    ...r,
    count: Object.values(reactions).filter((v) => v === r.type).length,
  })).filter((r) => r.count > 0);

  const totalReactions = Object.keys(reactions).length;
  const roleInfo = post.authorRole ? ROLE_LABEL[post.authorRole] : null;

  const handleReactionPress = () => {
    if (myReaction) {
      // Si ya reaccioné, quitar la reacción
      onReaction(post.id, null);
    } else {
      setShowReactionPicker(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, roleInfo && { backgroundColor: Colors.primary }]}>
            <Text style={[styles.avatarText, roleInfo && { color: '#FFFFFF' }]}>
              {post.authorName[0]}
            </Text>
          </View>
          <View>
            <View style={styles.authorRow}>
              <Text style={styles.authorName}>{post.authorName}</Text>
              {roleInfo && (
                <View style={[styles.roleBadge, { backgroundColor: roleInfo.color + '18' }]}>
                  <Text style={[styles.roleBadgeText, { color: roleInfo.color }]}>{roleInfo.label}</Text>
                </View>
              )}
            </View>
            <Text style={styles.date}>{post.date}</Text>
          </View>
        </View>
        <IconButton icon="dots-horizontal" size={20} iconColor={Colors.textSecondary} />
      </View>

      {/* Group badge */}
      {post.groupName && (
        <Pressable style={styles.groupBadge}>
          <MaterialCommunityIcons name="account-group-outline" size={12} color={Colors.accent} />
          <Text style={styles.groupBadgeText}>{post.groupName}</Text>
        </Pressable>
      )}

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.bodyText} numberOfLines={expanded ? undefined : 4}>
          {post.text}
        </Text>
        {isLongText && !expanded && (
          <Pressable onPress={() => setExpanded(true)}>
            <Text style={styles.verMas}>Ver más</Text>
          </Pressable>
        )}
      </View>

      {/* Image */}
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />
      )}

      {/* Actions + resumen en una sola línea */}
      <View style={styles.actions}>
        {/* Reaction button con popover */}
        <View style={styles.reactionWrapper}>
          {showReactionPicker && (
            <View style={styles.reactionPopover}>
              {REACTIONS.map((r) => (
                <Pressable
                  key={r.type}
                  style={[styles.popoverItem, myReaction === r.type && styles.popoverItemActive]}
                  onPress={() => {
                    onReaction(post.id, r.type);
                    setShowReactionPicker(false);
                  }}
                >
                  <Text style={styles.popoverEmoji}>{r.emoji}</Text>
                  <Text style={styles.popoverLabel}>{r.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <Pressable
            style={styles.actionBtn}
            onPress={handleReactionPress}
            onLongPress={() => setShowReactionPicker(true)}
          >
            <Text style={[
              styles.actionText,
              myReaction && { color: REACTIONS.find((r) => r.type === myReaction)?.color },
            ]}>
              {myReaction
                ? REACTIONS.find((r) => r.type === myReaction)?.emoji
                : '👍'}
            </Text>
          </Pressable>
        </View>

        {/* Comment button */}
        {(canComment || post.comments.length > 0) && (
          <Pressable style={styles.actionBtn} onPress={() => setShowComments(!showComments)}>
            <Text style={styles.actionText}>
              💬{post.comments.length > 0 ? ` ${post.comments.length}` : ''}
            </Text>
          </Pressable>
        )}

        {/* Spacer + resumen de reacciones + impresiones */}
        <View style={styles.rightMeta}>
          {reactionCounts.length > 0 && (
            <View style={styles.reactionSummary}>
              {reactionCounts.slice(0, 3).map((r) => (
                <Text key={r.type} style={styles.reactionEmojiSmall}>{r.emoji}</Text>
              ))}
              <Text style={styles.reactionCount}>{totalReactions}</Text>
            </View>
          )}
          <View style={styles.impressions}>
            <MaterialCommunityIcons name="eye-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.impressionsText}>{(post.viewedBy ?? []).length}</Text>
          </View>
        </View>
      </View>

      {/* Comments */}
      {showComments && (
        <View style={styles.commentsSection}>
          {post.comments.map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>{comment.authorName[0]}</Text>
              </View>
              <View style={styles.commentBubble}>
                <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            </View>
          ))}
          {canComment && (
            <View style={styles.commentInput}>
              <TextInput
                placeholder="Escribí un comentario..."
                value={commentText}
                onChangeText={setCommentText}
                mode="outlined"
                dense
                style={styles.input}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
              />
              <IconButton
                icon="send"
                iconColor={Colors.primary}
                size={20}
                onPress={() => {
                  if (commentText.trim()) {
                    onComment(post.id, commentText);
                    setCommentText('');
                  }
                }}
              />
            </View>
          )}
        </View>
      )}

      {/* Backdrop para cerrar el popover */}
      {showReactionPicker && (
        <Pressable style={styles.backdrop} onPress={() => setShowReactionPicker(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    marginHorizontal: 12,
    borderRadius: 14,
    overflow: 'visible',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 18,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  authorName: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  date: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  bodyText: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  verMas: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
  },
  image: {
    width: '100%',
    height: 280,
    borderRadius: 0,
  },
  reactionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  reactionEmojiSmall: {
    fontSize: 13,
  },
  reactionCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 4,
  },
  actionBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  rightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 'auto',
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    gap: 8,
  },
  comment: {
    flexDirection: 'row',
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  commentAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentAuthor: {
    fontWeight: '600',
    color: Colors.textPrimary,
    fontSize: 13,
  },
  commentText: {
    color: Colors.textPrimary,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: 36,
  },
  reactionWrapper: {
    position: 'relative',
  },
  reactionPopover: {
    position: 'absolute',
    bottom: 44,
    left: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  popoverItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 2,
  },
  popoverItemActive: {
    backgroundColor: Colors.primary + '15',
  },
  popoverEmoji: {
    fontSize: 24,
  },
  popoverLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9,
  },
  impressions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  impressionsText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 16,
    marginBottom: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent + '12',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  groupBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent,
  },
});

import React, { useState, useRef } from 'react';
import { StyleSheet, View, Image, Pressable, Modal } from 'react-native';
import { Text, TextInput, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { WallPost, ReactionType } from '../../lib/types';

// ─── Inline Markdown Renderer ────────────────────────────────────────────────
// Handles **bold**, __underline__, _italic_ (in that order to avoid conflicts)
type Segment = { text: string; bold?: boolean; italic?: boolean; underline?: boolean };

function parseMarkdown(raw: string): Segment[] {
  // Split on **bold**, __underline__, _italic_
  const parts: Segment[] = [];
  // Regex: match **...**, __...__, or _..._
  const re = /(\*\*(.+?)\*\*|__(.+?)__|_(.+?)_)/gs;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw)) !== null) {
    if (match.index > last) parts.push({ text: raw.slice(last, match.index) });
    if (match[0].startsWith('**'))       parts.push({ text: match[2], bold: true });
    else if (match[0].startsWith('__')) parts.push({ text: match[3], underline: true });
    else                                parts.push({ text: match[4], italic: true });
    last = match.index + match[0].length;
  }
  if (last < raw.length) parts.push({ text: raw.slice(last) });
  return parts;
}

function RichText({ text, style, numberOfLines }: { text: string; style?: any; numberOfLines?: number }) {
  const segments = parseMarkdown(text);
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {segments.map((seg, i) => (
        <Text
          key={i}
          style={[
            seg.bold      && { fontWeight: '700' as const },
            seg.italic    && { fontStyle: 'italic' as const },
            seg.underline && { textDecorationLine: 'underline' as const },
          ]}
        >
          {seg.text}
        </Text>
      ))}
    </Text>
  );
}

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
  canEdit?: boolean;
  onReaction: (postId: string, reaction: ReactionType | null) => void;
  onComment: (postId: string, text: string) => void;
  onEdit?: (post: WallPost) => void;
  onDelete?: (postId: string) => void;
}

export function WallPostCard({ post, currentUserId, canComment, canEdit, onReaction, onComment, onEdit, onDelete }: Props) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Positions for Modal-based dropdowns
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [reactionPos, setReactionPos] = useState({ top: 0, left: 16 });
  const dotsRef = useRef<View>(null);
  const reactionBtnRef = useRef<View>(null);

  const reactions = post.reactions ?? {};
  const myReaction = reactions[currentUserId] ?? null;
  const isLongText = post.text.length > 180;

  const reactionCounts = REACTIONS.map((r) => ({
    ...r,
    count: Object.values(reactions).filter((v) => v === r.type).length,
  })).filter((r) => r.count > 0);

  const totalReactions = Object.keys(reactions).length;
  const roleInfo = post.authorRole ? ROLE_LABEL[post.authorRole] : null;

  const MENU_WIDTH = 150;
  const handleDotsPress = () => {
    dotsRef.current?.measure((_fx: number, _fy: number, w: number, h: number, px: number, py: number) => {
      // Right-align the menu with the button
      setMenuPos({ top: py + h, left: Math.max(8, px + w - MENU_WIDTH) });
      setShowMenu(true);
    });
  };

  const handleReactionPress = () => {
    if (myReaction) {
      onReaction(post.id, null);
    } else {
      reactionBtnRef.current?.measure((_fx: number, _fy: number, _w: number, h: number, px: number, py: number) => {
        setReactionPos({ top: py - 80, left: px });
        setShowReactionPicker(true);
      });
    }
  };

  const handleLongReactionPress = () => {
    reactionBtnRef.current?.measure((_fx: number, _fy: number, _w: number, h: number, px: number, py: number) => {
      setReactionPos({ top: py - 80, left: px });
      setShowReactionPicker(true);
    });
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
        {canEdit && (
          <View ref={dotsRef} collapsable={false}>
            <IconButton
              icon="dots-horizontal"
              size={20}
              iconColor={Colors.textSecondary}
              onPress={handleDotsPress}
            />
          </View>
        )}
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
        <RichText text={post.text} style={styles.bodyText} numberOfLines={expanded ? undefined : 4} />
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

      {/* Actions */}
      <View style={styles.actions}>
        <View ref={reactionBtnRef} collapsable={false}>
          <Pressable
            style={styles.actionBtn}
            onPress={handleReactionPress}
            onLongPress={handleLongReactionPress}
          >
            <Text style={[
              styles.actionText,
              myReaction && { color: REACTIONS.find((r) => r.type === myReaction)?.color },
            ]}>
              {myReaction ? REACTIONS.find((r) => r.type === myReaction)?.emoji : '👍'}
            </Text>
          </Pressable>
        </View>

        {(canComment || post.comments.length > 0) && (
          <Pressable style={styles.actionBtn} onPress={() => setShowComments(!showComments)}>
            <Text style={styles.actionText}>
              💬{post.comments.length > 0 ? ` ${post.comments.length}` : ''}
            </Text>
          </Pressable>
        )}

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

      {/* Menu Modal */}
      <Modal visible={showMenu} transparent animationType="none" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowMenu(false)}>
          <View style={[styles.menuDropdown, { position: 'absolute', top: menuPos.top, left: menuPos.left }]}>
            <Pressable
              style={styles.menuItem}
              onPress={() => { setShowMenu(false); onEdit?.(post); }}
            >
              <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.menuItemText}>Editar</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={styles.menuItem}
              onPress={() => { setShowMenu(false); onDelete?.(post.id); }}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={16} color={Colors.error} />
              <Text style={[styles.menuItemText, { color: Colors.error }]}>Eliminar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Reaction Picker Modal */}
      <Modal visible={showReactionPicker} transparent animationType="none" onRequestClose={() => setShowReactionPicker(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowReactionPicker(false)}>
          <View style={[styles.reactionPopover, { position: 'absolute', top: reactionPos.top, left: reactionPos.left }]}>
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
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
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
  impressions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingRight: 4,
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
  // Modal backdrop (transparent full-screen)
  modalBackdrop: {
    flex: 1,
  },
  // Menu dropdown (rendered inside Modal)
  menuDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 20,
    minWidth: 150,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  // Reaction popover (rendered inside Modal)
  reactionPopover: {
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
    borderWidth: 1,
    borderColor: Colors.border,
  },
  popoverItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
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
});

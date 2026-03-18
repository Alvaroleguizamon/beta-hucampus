import React, { useState } from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import { Text, TextInput, IconButton } from 'react-native-paper';
import { Colors } from '../../constants/colors';
import { WallPost } from '../../lib/types';

interface Props {
  post: WallPost;
  currentUserId: string;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
}

export function WallPostCard({ post, currentUserId, onLike, onComment }: Props) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isLiked = post.likes.includes(currentUserId);
  const isLongText = post.text.length > 150;

  return (
    <View style={styles.container}>
      {/* Header: avatar + name + date + menu */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{post.authorName[0]}</Text>
          </View>
          <View>
            <Text style={styles.authorName}>{post.authorName}</Text>
            <Text style={styles.date}>{post.date}</Text>
          </View>
        </View>
        <IconButton icon="dots-horizontal" size={20} iconColor={Colors.textSecondary} />
      </View>

      {/* Body text */}
      <View style={styles.body}>
        <Text style={styles.bodyText} numberOfLines={expanded ? undefined : 4}>
          {post.text}
        </Text>
        {isLongText && !expanded && (
          <Pressable onPress={() => setExpanded(true)} style={styles.verMasContainer}>
            <Text style={styles.verMas}>Ver más</Text>
          </Pressable>
        )}
      </View>

      {/* Image full width */}
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />
      )}

      {/* Actions: like + comment */}
      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={() => onLike(post.id)}>
          <Text style={[styles.actionText, isLiked && { color: Colors.primary }]}>
            {isLiked ? '❤️' : '🤍'} {post.likes.length > 0 ? post.likes.length : ''}
          </Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => setShowComments(!showComments)}>
          <Text style={styles.actionText}>💬 {post.comments.length > 0 ? post.comments.length : ''}</Text>
        </Pressable>
      </View>

      {/* Comments section */}
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
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
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
  authorName: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  date: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 1,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  bodyText: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  verMasContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  verMas: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  image: {
    width: '100%',
    height: 300,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    paddingVertical: 2,
  },
  actionText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  commentAvatarText: {
    color: Colors.textSecondary,
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
});

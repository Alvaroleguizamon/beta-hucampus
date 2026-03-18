import React, { useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useGroupsStore } from '../../../lib/stores/groups-store';
import { useAuthStore } from '../../../lib/stores/auth-store';
import { Colors } from '../../../constants/colors';
import { Group } from '../../../lib/types';

const TYPE_LABEL: Record<string, { label: string; icon: string }> = {
  curso: { label: 'Curso', icon: 'google-classroom' },
  materia: { label: 'Materia', icon: 'book-open-variant' },
  extracurricular: { label: 'Extracurricular', icon: 'star-outline' },
  privado: { label: 'Privado', icon: 'lock-outline' },
};

function GroupCard({ group, isMember }: { group: Group; isMember: boolean }) {
  const typeInfo = TYPE_LABEL[group.type] ?? { label: group.type, icon: 'account-group' };
  const lastPost = ''; // TODO: last post date

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/(tabs)/grupos/${group.id}` as any)}>
      <View style={[styles.cardIcon, { backgroundColor: group.coverColor }]}>
        <Text style={styles.cardIconText}>{group.name[0]}</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName} numberOfLines={1}>{group.name}</Text>
          {group.isAutomatic && (
            <View style={styles.autoBadge}>
              <MaterialCommunityIcons name="lightning-bolt" size={10} color={group.coverColor} />
              <Text style={[styles.autoBadgeText, { color: group.coverColor }]}>Auto</Text>
            </View>
          )}
        </View>
        <View style={styles.cardMeta}>
          <MaterialCommunityIcons name={typeInfo.icon as any} size={12} color={Colors.textSecondary} />
          <Text style={styles.cardMetaText}>{typeInfo.label}</Text>
          <Text style={styles.cardMetaDot}>·</Text>
          <MaterialCommunityIcons name="account-group-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.cardMetaText}>{group.members.length} miembros</Text>
        </View>
        {group.description ? (
          <Text style={styles.cardDesc} numberOfLines={1}>{group.description}</Text>
        ) : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.textSecondary} />
    </Pressable>
  );
}

export default function GruposIndexScreen() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? 'u1';
  const role = user?.role ?? 'alumno';
  const groups = useGroupsStore((s) => s.groups);

  const { myGroups, otherGroups } = useMemo(() => {
    const my = groups.filter((g) => g.members.some((m) => m.userId === userId));
    const other = groups.filter((g) => !g.members.some((m) => m.userId === userId));
    return { myGroups: my, otherGroups: other };
  }, [groups, userId]);

  const canCreate = role === 'docente' || role === 'alumno';

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        keyExtractor={() => ''}
        renderItem={null}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Grupos</Text>
              {canCreate && (
                <Pressable style={styles.newBtn} onPress={() => router.push('/(tabs)/grupos/nuevo' as any)}>
                  <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                  <Text style={styles.newBtnText}>Nuevo</Text>
                </Pressable>
              )}
            </View>

            {/* Mis grupos */}
            <Text style={styles.sectionTitle}>Mis grupos ({myGroups.length})</Text>
            {myGroups.length === 0 ? (
              <View style={styles.emptySection}>
                <MaterialCommunityIcons name="account-group-outline" size={40} color={Colors.border} />
                <Text style={styles.emptyText}>No pertenecés a ningún grupo aún</Text>
              </View>
            ) : (
              myGroups.map((g) => <GroupCard key={g.id} group={g} isMember />)
            )}

            {/* Grupos disponibles */}
            {otherGroups.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Grupos disponibles</Text>
                {otherGroups.map((g) => <GroupCard key={g.id} group={g} isMember={false} />)}
              </>
            )}

            <View style={{ height: 32 }} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  cardContent: { flex: 1 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  autoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: Colors.border,
  },
  autoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  cardMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardMetaDot: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { mockParentContacts } from '../../lib/mock-data';

export default function ContactosScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockParentContacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.subtitle}>Directorio de padres y tutores del colegio</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.relationship}>
                {item.relationship ?? 'Padre/Madre'} de {item.childName}
              </Text>
              <Text style={styles.grade}>{item.grade}</Text>
              {item.phone && (
                <View style={styles.phoneRow}>
                  <MaterialCommunityIcons name="phone-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.phone}>{item.phone}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 14, lineHeight: 18 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: Colors.primary, fontWeight: '700', fontSize: 18 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  relationship: { fontSize: 13, color: Colors.primary, fontWeight: '500', marginTop: 2 },
  grade: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  phone: { fontSize: 12, color: Colors.textSecondary },
});

import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCalendarStore } from '../../lib/stores/calendar-store';
import { Colors } from '../../constants/colors';
import { CalendarEvent } from '../../lib/types';

const typeConfig: Record<CalendarEvent['type'], { color: string; icon: string; label: string }> = {
  examen: { color: Colors.error, icon: 'file-document-outline', label: 'Examen' },
  reunion: { color: Colors.primary, icon: 'account-group-outline', label: 'Reunión' },
  acto: { color: '#9C27B0', icon: 'star-outline', label: 'Acto' },
  feriado: { color: Colors.success, icon: 'party-popper', label: 'Feriado' },
};

export default function EventosScreen() {
  const events = useCalendarStore((s) => s.events);
  const today = new Date().toISOString().split('T')[0];
  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  const past = events
    .filter((e) => e.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const renderEvent = (event: CalendarEvent) => {
    const cfg = typeConfig[event.type];
    return (
      <View style={styles.eventCard}>
        <View style={[styles.dateBox, { backgroundColor: cfg.color + '15' }]}>
          <Text style={[styles.dateDay, { color: cfg.color }]}>{event.date.split('-')[2]}</Text>
          <Text style={[styles.dateMonth, { color: cfg.color }]}>
            {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][parseInt(event.date.split('-')[1]) - 1]}
          </Text>
        </View>
        <View style={styles.eventInfo}>
          <View style={styles.eventTypeRow}>
            <MaterialCommunityIcons name={cfg.icon as any} size={16} color={cfg.color} />
            <Text style={[styles.eventType, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <Text style={styles.eventTitle}>{event.title}</Text>
          {event.description && (
            <Text style={styles.eventDesc}>{event.description}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={upcoming}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => renderEvent(item)}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Próximos eventos</Text>
        }
        ListFooterComponent={
          past.length > 0 ? (
            <View>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Eventos pasados</Text>
              {past.map((e) => <View key={e.id}>{renderEvent(e)}</View>)}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No hay eventos próximos</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginBottom: 12 },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  dateBox: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dateDay: { fontSize: 22, fontWeight: '700' },
  dateMonth: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  eventInfo: { flex: 1, padding: 14 },
  eventTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  eventType: { fontSize: 12, fontWeight: '600' },
  eventTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  eventDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: Colors.textSecondary, marginTop: 12 },
});

import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { router } from 'expo-router';
import { useCalendarStore } from '../../lib/stores/calendar-store';
import { useTripsStore } from '../../lib/stores/trips-store';
import { Colors } from '../../constants/colors';
import { CalendarEvent } from '../../lib/types';
import { tripTypeConfig } from '../apps/viajes';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

const eventTypeConfig: Record<CalendarEvent['type'], { color: string; icon: string; label: string }> = {
  examen: { color: Colors.error, icon: 'file-document-outline', label: 'Examen' },
  reunion: { color: Colors.primary, icon: 'account-group-outline', label: 'Reunión' },
  acto: { color: '#9C27B0', icon: 'star-outline', label: 'Acto' },
  feriado: { color: Colors.success, icon: 'party-popper', label: 'Feriado' },
};

type AgendaItem = {
  id: string;
  title: string;
  date: string;
  description?: string;
  kind: 'event';
  type: CalendarEvent['type'];
} | {
  id: string;
  title: string;
  date: string;
  description?: string;
  kind: 'trip';
  tripType: 'excursion' | 'campamento' | 'egresados' | 'salida';
  location: string;
};

export default function CalendarScreen() {
  const events = useCalendarStore((s) => s.events);
  const trips = useTripsStore((s) => s.trips);
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Merge events + trips into one list
  const allItems: AgendaItem[] = useMemo(() => {
    const items: AgendaItem[] = events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      description: e.description,
      kind: 'event' as const,
      type: e.type,
    }));
    trips.forEach((t) => {
      items.push({
        id: t.id,
        title: t.title,
        date: t.date,
        description: `${t.location} · ${t.details.horarioSalida}`,
        kind: 'trip' as const,
        tripType: t.type,
        location: t.location,
      });
    });
    return items;
  }, [events, trips]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    allItems.forEach((item) => {
      const color = item.kind === 'event'
        ? eventTypeConfig[item.type].color
        : tripTypeConfig[item.tripType].color;
      const dot = { key: item.id, color };
      const existing = marks[item.date];
      if (existing) {
        existing.dots.push(dot);
      } else {
        marks[item.date] = { dots: [dot] };
      }
    });
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: Colors.primary,
        dots: marks[selectedDate]?.dots ?? [],
      };
    }
    return marks;
  }, [allItems, selectedDate]);

  const itemsForDate = allItems
    .filter((e) => e.date === selectedDate)
    .sort((a, b) => a.title.localeCompare(b.title));

  const endOfWeek = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (7 - d.getDay()));
    return d.toISOString().split('T')[0];
  }, []);

  const upcoming = allItems
    .filter((e) => e.date >= today && e.date <= endOfWeek)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
      </View>

      <FlatList
        data={itemsForDate}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <Calendar
              markingType="multi-dot"
              markedDates={markedDates}
              onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
              theme={{
                backgroundColor: '#FFFFFF',
                calendarBackground: '#FFFFFF',
                selectedDayBackgroundColor: Colors.primary,
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: Colors.primary,
                dayTextColor: Colors.textPrimary,
                textDisabledColor: '#D9D9D9',
                arrowColor: Colors.primary,
                monthTextColor: Colors.textPrimary,
                textMonthFontWeight: '600',
                textDayFontSize: 14,
                textMonthFontSize: 16,
              }}
              style={styles.calendar}
            />

            <View style={styles.dateLabel}>
              <Text style={styles.dateLabelText}>
                {selectedDate === today ? 'Hoy' : selectedDate}
              </Text>
              {itemsForDate.length === 0 && (
                <Text style={styles.noEvents}>No hay eventos este día</Text>
              )}
            </View>
          </View>
        }
        renderItem={({ item }) => {
          if (item.kind === 'trip') {
            const tCfg = tripTypeConfig[item.tripType];
            return (
              <Pressable style={styles.eventRow} onPress={() => router.push('/apps/viajes' as any)}>
                <View style={[styles.eventIndicator, { backgroundColor: tCfg.color }]} />
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <MaterialCommunityIcons name={tCfg.icon as any} size={18} color={tCfg.color} />
                    <Text style={styles.eventType}>{tCfg.label}</Text>
                  </View>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventDesc}>{item.location}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textSecondary} />
              </Pressable>
            );
          }
          const cfg = eventTypeConfig[item.type];
          return (
            <View style={styles.eventRow}>
              <View style={[styles.eventIndicator, { backgroundColor: cfg.color }]} />
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <MaterialCommunityIcons name={cfg.icon as any} size={18} color={cfg.color} />
                  <Text style={styles.eventType}>{cfg.label}</Text>
                </View>
                <Text style={styles.eventTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.eventDesc}>{item.description}</Text>
                )}
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.upcomingSection}>
            <Text style={styles.upcomingTitle}>Esta semana</Text>
            {upcoming.slice(0, 8).map((item) => {
              const isTrip = item.kind === 'trip';
              const color = isTrip
                ? tripTypeConfig[item.tripType].color
                : eventTypeConfig[item.type].color;
              const label = isTrip
                ? tripTypeConfig[item.tripType].label
                : eventTypeConfig[item.type].label;
              return (
                <Pressable
                  key={item.id}
                  style={styles.upcomingRow}
                  onPress={() => {
                    if (isTrip) router.push('/apps/viajes' as any);
                    else setSelectedDate(item.date);
                  }}
                >
                  <View style={[styles.upcomingDot, { backgroundColor: color }]} />
                  <View style={styles.upcomingInfo}>
                    <Text style={styles.upcomingEventTitle}>{item.title}</Text>
                    <Text style={styles.upcomingDate}>{item.date}</Text>
                  </View>
                  <Text style={[styles.upcomingType, { color }]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  list: {
    paddingBottom: 20,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateLabel: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dateLabelText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  noEvents: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventIndicator: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 14,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eventType: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  eventDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  // Upcoming
  upcomingSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  upcomingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingEventTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  upcomingDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  upcomingType: {
    fontSize: 12,
    fontWeight: '600',
  },
});

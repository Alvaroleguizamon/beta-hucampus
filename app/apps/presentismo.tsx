import React, { useMemo } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { mockAttendance } from '../../lib/mock-data';
import { Colors } from '../../constants/colors';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

const statusConfig = {
  presente: { color: Colors.present, label: 'Presente' },
  ausente: { color: Colors.absent, label: 'Ausente' },
  tardanza: { color: Colors.late, label: 'Tardanza' },
};

export default function PresentismoScreen() {
  const records = mockAttendance.filter((a) => a.studentId === 'st1');
  const present = records.filter((a) => a.status === 'presente').length;
  const absent = records.filter((a) => a.status === 'ausente').length;
  const late = records.filter((a) => a.status === 'tardanza').length;
  const percentage = records.length ? Math.round((present / records.length) * 100) : 0;

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    records.forEach((a) => {
      const color = statusConfig[a.status].color;
      marks[a.date] = {
        customStyles: {
          container: { backgroundColor: color, borderRadius: 8 },
          text: { color: '#FFFFFF', fontWeight: '600' },
        },
      };
    });
    return marks;
  }, []);

  return (
    <View style={styles.container}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.mainStat}>
          <Text style={styles.mainStatNumber}>{percentage}%</Text>
          <Text style={styles.mainStatLabel}>Asistencia</Text>
        </View>
        <View style={styles.miniStats}>
          <View style={styles.miniStat}>
            <View style={[styles.miniDot, { backgroundColor: Colors.present }]} />
            <Text style={styles.miniNumber}>{present}</Text>
            <Text style={styles.miniLabel}>Presente</Text>
          </View>
          <View style={styles.miniStat}>
            <View style={[styles.miniDot, { backgroundColor: Colors.absent }]} />
            <Text style={styles.miniNumber}>{absent}</Text>
            <Text style={styles.miniLabel}>Ausente</Text>
          </View>
          <View style={styles.miniStat}>
            <View style={[styles.miniDot, { backgroundColor: Colors.late }]} />
            <Text style={styles.miniNumber}>{late}</Text>
            <Text style={styles.miniLabel}>Tardanza</Text>
          </View>
        </View>
      </View>

      <Calendar
        markingType="custom"
        markedDates={markedDates}
        theme={{
          calendarBackground: '#FFFFFF',
          todayTextColor: Colors.primary,
          dayTextColor: Colors.textPrimary,
          textDisabledColor: '#D9D9D9',
          arrowColor: Colors.primary,
          monthTextColor: Colors.textPrimary,
          textMonthFontWeight: '600',
        }}
        style={styles.calendar}
      />

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: cfg.color }]} />
            <Text style={styles.legendText}>{cfg.label}</Text>
          </View>
        ))}
      </View>

      {/* Recent */}
      <Text style={styles.recentTitle}>Últimos registros</Text>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.recentList}
        renderItem={({ item }) => {
          const cfg = statusConfig[item.status];
          return (
            <View style={styles.recentRow}>
              <Text style={styles.recentDate}>{item.date}</Text>
              <View style={[styles.recentBadge, { backgroundColor: cfg.color }]}>
                <Text style={styles.recentBadgeText}>{cfg.label}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  statsRow: { backgroundColor: '#FFFFFF', padding: 20, flexDirection: 'row', alignItems: 'center' },
  mainStat: { alignItems: 'center', marginRight: 24 },
  mainStatNumber: { fontSize: 36, fontWeight: '700', color: Colors.primary },
  mainStatLabel: { fontSize: 13, color: Colors.textSecondary },
  miniStats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  miniStat: { alignItems: 'center' },
  miniDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  miniNumber: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  miniLabel: { fontSize: 11, color: Colors.textSecondary },
  calendar: { marginHorizontal: 16, marginTop: 16, borderRadius: 12 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: Colors.textSecondary },
  recentTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, paddingHorizontal: 20, paddingTop: 12 },
  recentList: { paddingHorizontal: 16, paddingTop: 8 },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recentDate: { fontSize: 14, color: Colors.textPrimary },
  recentBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  recentBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});

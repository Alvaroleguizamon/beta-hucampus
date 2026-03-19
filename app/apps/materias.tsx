import React, { useState } from 'react';
import { StyleSheet, View, FlatList, ScrollView } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSubjectsStore } from '../../lib/stores/subjects-store';
import { Colors } from '../../constants/colors';

const subjectDetails: Record<string, { schedule: string; room: string }> = {
  s1: { schedule: 'Lun y Mié 08:00 - 09:30', room: 'Aula 3' },
  s2: { schedule: 'Mar y Jue 08:00 - 09:30', room: 'Aula 3' },
  s3: { schedule: 'Lun y Vie 10:00 - 11:30', room: 'Aula 5' },
  s4: { schedule: 'Mié y Vie 08:00 - 09:30', room: 'Laboratorio' },
  s5: { schedule: 'Mar y Jue 10:00 - 11:30', room: 'Aula 7' },
};

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const schedule: Record<string, { time: string; subject: string; color: string; room: string }[]> = {
  Lunes: [
    { time: '08:00', subject: 'Matemática', color: '#5B77D3', room: 'Aula 3' },
    { time: '09:30', subject: 'Matemática', color: '#5B77D3', room: 'Aula 3' },
    { time: '10:00', subject: 'Historia', color: '#FF9800', room: 'Aula 5' },
    { time: '11:30', subject: 'Historia', color: '#FF9800', room: 'Aula 5' },
  ],
  Martes: [
    { time: '08:00', subject: 'Lengua', color: '#0693E3', room: 'Aula 3' },
    { time: '09:30', subject: 'Lengua', color: '#0693E3', room: 'Aula 3' },
    { time: '10:00', subject: 'Inglés', color: '#9C27B0', room: 'Aula 7' },
    { time: '11:30', subject: 'Inglés', color: '#9C27B0', room: 'Aula 7' },
  ],
  Miércoles: [
    { time: '08:00', subject: 'Biología', color: '#4CAF50', room: 'Lab.' },
    { time: '09:30', subject: 'Biología', color: '#4CAF50', room: 'Lab.' },
    { time: '10:00', subject: 'Matemática', color: '#5B77D3', room: 'Aula 3' },
    { time: '11:30', subject: 'Ed. Física', color: '#E74C3C', room: 'Patio' },
  ],
  Jueves: [
    { time: '08:00', subject: 'Lengua', color: '#0693E3', room: 'Aula 3' },
    { time: '09:30', subject: 'Inglés', color: '#9C27B0', room: 'Aula 7' },
    { time: '10:00', subject: 'Inglés', color: '#9C27B0', room: 'Aula 7' },
    { time: '11:30', subject: 'Arte', color: '#FF5722', room: 'Taller' },
  ],
  Viernes: [
    { time: '08:00', subject: 'Biología', color: '#4CAF50', room: 'Lab.' },
    { time: '09:30', subject: 'Historia', color: '#FF9800', room: 'Aula 5' },
    { time: '10:00', subject: 'Ed. Física', color: '#E74C3C', room: 'Patio' },
    { time: '11:30', subject: 'Tutoría', color: '#607D8B', room: 'Aula 3' },
  ],
};

export default function MateriasScreen() {
  const subjects = useSubjectsStore((s) => s.subjects);
  const [tab, setTab] = useState('horarios');
  const today = new Date().getDay();
  const todayIndex = today >= 1 && today <= 5 ? today - 1 : 0;

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[
          { value: 'horarios', label: 'Horarios' },
          { value: 'materias', label: 'Materias' },
        ]}
        style={styles.segmented}
      />

      {tab === 'materias' ? (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const detail = subjectDetails[item.id];
            return (
              <View style={styles.card}>
                <View style={[styles.topBar, { backgroundColor: item.color }]} />
                <View style={styles.content}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={styles.row}>
                    <MaterialCommunityIcons name="account" size={16} color={Colors.textSecondary} />
                    <Text style={styles.detail}>{item.teacher}</Text>
                  </View>
                  <View style={styles.row}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.detail}>{detail?.schedule}</Text>
                  </View>
                  <View style={styles.row}>
                    <MaterialCommunityIcons name="map-marker-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.detail}>{detail?.room}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scheduleList}>
          {days.map((day, index) => {
            const isToday = index === todayIndex;
            const blocks = schedule[day] ?? [];
            return (
              <View key={day} style={[styles.daySection, isToday && styles.daySectionToday]}>
                <View style={styles.dayHeader}>
                  <Text style={[styles.dayName, isToday && styles.dayNameToday]}>{day}</Text>
                  {isToday && <View style={styles.todayBadge}><Text style={styles.todayText}>Hoy</Text></View>}
                </View>
                {blocks.map((block, i) => (
                  <View key={i} style={styles.blockRow}>
                    <Text style={styles.blockTime}>{block.time}</Text>
                    <View style={[styles.blockCard, { borderLeftColor: block.color }]}>
                      <Text style={styles.blockSubject}>{block.subject}</Text>
                      <Text style={styles.blockRoom}>{block.room}</Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  segmented: { marginHorizontal: 16, marginTop: 12, marginBottom: 4 },
  list: { padding: 16 },

  // Materias tab
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  topBar: { height: 6 },
  content: { padding: 16 },
  name: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  detail: { fontSize: 14, color: Colors.textSecondary },

  // Horarios tab
  scheduleList: { paddingBottom: 20 },
  daySection: { paddingHorizontal: 16, paddingTop: 16 },
  daySectionToday: { backgroundColor: Colors.primary + '08' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  dayName: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  dayNameToday: { color: Colors.primary },
  todayBadge: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 },
  todayText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  blockRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  blockTime: { width: 50, fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  blockCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderLeftWidth: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  blockSubject: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  blockRoom: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});

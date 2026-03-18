import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { Text, TextInput, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Colors } from '../../constants/colors';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

interface AgendaItem {
  id: string;
  title: string;
  time: string;
  date: string;
  color: string;
}

const initialItems: AgendaItem[] = [
  { id: 'a1', title: 'Estudiar Matemática - Parcial', time: '09:00 - 11:00', date: '2026-03-18', color: Colors.primary },
  { id: 'a2', title: 'Clase de guitarra', time: '15:00 - 16:00', date: '2026-03-18', color: '#9C27B0' },
  { id: 'a3', title: 'Juntada a estudiar con Lucas', time: '17:00 - 19:00', date: '2026-03-19', color: Colors.accent },
  { id: 'a4', title: 'Parcial de Matemática', time: '08:00 - 10:00', date: '2026-03-20', color: Colors.error },
  { id: 'a5', title: 'Entrenamiento de fútbol', time: '16:00 - 18:00', date: '2026-03-20', color: Colors.success },
];

export default function AgendaPersonalScreen() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [items, setItems] = useState(initialItems);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');

  const dayItems = items.filter((i) => i.date === selectedDate);

  const markedDates: Record<string, any> = {};
  items.forEach((i) => {
    if (!markedDates[i.date]) {
      markedDates[i.date] = { marked: true, dotColor: Colors.primary };
    }
  });
  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: Colors.primary,
  };

  const addItem = () => {
    if (!newTitle.trim()) return;
    setItems((prev) => [...prev, {
      id: `a${Date.now()}`,
      title: newTitle,
      time: newTime || 'Sin horario',
      date: selectedDate,
      color: Colors.accent,
    }]);
    setNewTitle('');
    setNewTime('');
    setShowAdd(false);
  };

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        theme={{
          calendarBackground: '#FFFFFF',
          selectedDayBackgroundColor: Colors.primary,
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: Colors.primary,
          dayTextColor: Colors.textPrimary,
          textDisabledColor: '#D9D9D9',
          arrowColor: Colors.primary,
          monthTextColor: Colors.textPrimary,
          textMonthFontWeight: '600',
        }}
      />

      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>
          {selectedDate === today ? 'Hoy' : selectedDate}
        </Text>
        <IconButton
          icon="plus"
          iconColor={Colors.primary}
          size={22}
          onPress={() => setShowAdd(!showAdd)}
        />
      </View>

      {showAdd && (
        <View style={styles.addForm}>
          <TextInput
            placeholder="¿Qué tenés que hacer?"
            value={newTitle}
            onChangeText={setNewTitle}
            mode="outlined"
            dense
            style={styles.input}
            outlineColor={Colors.border}
            activeOutlineColor={Colors.primary}
          />
          <View style={styles.addRow}>
            <TextInput
              placeholder="Horario (ej: 10:00 - 12:00)"
              value={newTime}
              onChangeText={setNewTime}
              mode="outlined"
              dense
              style={[styles.input, { flex: 1 }]}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.primary}
            />
            <IconButton icon="check" iconColor="#FFFFFF" containerColor={Colors.primary} size={20} onPress={addItem} />
          </View>
        </View>
      )}

      <FlatList
        data={dayItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={[styles.itemBar, { backgroundColor: item.color }]} />
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <View style={styles.itemTimeRow}>
                <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.itemTime}>{item.time}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>Nada agendado para este día</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  dayTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  addForm: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  input: { backgroundColor: '#FFFFFF', height: 40 },
  list: { padding: 16 },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  itemBar: { width: 4 },
  itemContent: { flex: 1, padding: 14 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  itemTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  itemTime: { fontSize: 13, color: Colors.textSecondary },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: Colors.textSecondary, marginTop: 12 },
});

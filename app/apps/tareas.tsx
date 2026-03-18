import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView, Alert, Modal } from 'react-native';
import { Text, TextInput, IconButton, Checkbox, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Colors } from '../../constants/colors';
import { mockSubjects, mockClassmates } from '../../lib/mock-data';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

interface Task {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  done: boolean;
  priority: 'alta' | 'media' | 'baja';
  grupal: boolean;
  integrantes?: string[];
}

const initialTasks: Task[] = [
  { id: 't1', title: 'Resolver ejercicios pág. 45-48', subject: 'Matemática', dueDate: '2026-03-20', done: false, priority: 'alta', grupal: false },
  { id: 't2', title: 'Leer capítulo 5 - Revolución de Mayo', subject: 'Historia', dueDate: '2026-03-21', done: false, priority: 'media', grupal: false },
  { id: 't3', title: 'Trabajo práctico grupal - Análisis literario', subject: 'Lengua', dueDate: '2026-03-25', done: false, priority: 'alta', grupal: true, integrantes: ['Lucía Gómez', 'Martín Ruiz', 'Sofía Díaz'] },
  { id: 't4', title: 'Preparar herbario - 10 especies', subject: 'Biología', dueDate: '2026-03-28', done: false, priority: 'media', grupal: true, integrantes: ['Tomás López'] },
  { id: 't5', title: 'Reading comprehension Unit 3', subject: 'Inglés', dueDate: '2026-03-22', done: true, priority: 'baja', grupal: false },
  { id: 't6', title: 'Estudiar para parcial', subject: 'Matemática', dueDate: '2026-03-20', done: false, priority: 'alta', grupal: false },
];

const priorityConfig = {
  alta: { color: Colors.error, label: 'Alta' },
  media: { color: Colors.warning, label: 'Media' },
  baja: { color: Colors.success, label: 'Baja' },
};

// Only classmates from same grade (3ro A)
const courseClassmates = mockClassmates.filter((c) => c.grade === '3ro A');

export default function TareasScreen() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<'todas' | 'pendientes' | 'completadas'>('pendientes');
  const [showAdd, setShowAdd] = useState(false);

  // Add form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'alta' | 'media' | 'baja'>('media');
  const [newGrupal, setNewGrupal] = useState(false);
  const [selectedClassmates, setSelectedClassmates] = useState<string[]>([]);
  const [classmateSearch, setClassmateSearch] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const filteredClassmates = useMemo(() => {
    if (!classmateSearch.trim()) return [];
    const q = classmateSearch.toLowerCase();
    return courseClassmates.filter(
      (c) => c.name.toLowerCase().includes(q) && !selectedClassmates.includes(c.name)
    );
  }, [classmateSearch, selectedClassmates]);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };

  const resetForm = () => {
    setNewTitle('');
    setNewSubject('');
    setNewDueDate('');
    setNewPriority('media');
    setNewGrupal(false);
    setSelectedClassmates([]);
    setClassmateSearch('');
    setShowCalendar(false);
    setShowAdd(false);
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    const integrantes = newGrupal && selectedClassmates.length > 0 ? selectedClassmates : undefined;

    setTasks((prev) => [{
      id: `t${Date.now()}`,
      title: newTitle,
      subject: newSubject || 'General',
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      done: false,
      priority: newPriority,
      grupal: newGrupal,
      integrantes,
    }, ...prev]);

    if (integrantes && integrantes.length > 0) {
      Alert.alert(
        'Tarea compartida',
        `Se envió una notificación a ${integrantes.join(', ')} para que confirmen agregar esta tarea.`,
        [{ text: 'OK' }],
      );
    }

    resetForm();
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'pendientes') return !t.done;
    if (filter === 'completadas') return t.done;
    return true;
  });

  const pending = tasks.filter((t) => !t.done).length;

  return (
    <View style={styles.container}>
      {/* Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{pending}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{tasks.length - pending}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {(['pendientes', 'completadas', 'todas'] as const).map((f) => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && styles.chipActive]}
            textStyle={[styles.chipText, filter === f && styles.chipTextActive]}
            showSelectedCheck={false}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const pCfg = priorityConfig[item.priority];
          return (
            <Pressable style={styles.taskRow} onPress={() => toggleTask(item.id)}>
              <Checkbox
                status={item.done ? 'checked' : 'unchecked'}
                onPress={() => toggleTask(item.id)}
                color={Colors.primary}
              />
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, item.done && styles.taskDone]}>{item.title}</Text>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskSubject}>{item.subject}</Text>
                  <Text style={styles.taskDate}>Entrega: {item.dueDate}</Text>
                </View>
                {item.grupal && (
                  <View style={styles.grupalRow}>
                    <MaterialCommunityIcons name="account-group" size={14} color={Colors.accent} />
                    <Text style={styles.grupalText}>
                      Grupal{item.integrantes ? ` · ${item.integrantes.join(', ')}` : ''}
                    </Text>
                  </View>
                )}
              </View>
              <View style={[styles.priorityDot, { backgroundColor: pCfg.color }]} />
            </Pressable>
          );
        }}
      />

      {/* Add form */}
      {showAdd ? (
        <View style={styles.addPanel}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.addHeader}>
              <Text style={styles.addTitle}>Nueva tarea</Text>
              <IconButton icon="close" iconColor={Colors.textSecondary} size={20} onPress={resetForm} />
            </View>

            <TextInput
              label="¿Qué tarea tenés?"
              value={newTitle}
              onChangeText={setNewTitle}
              mode="outlined"
              dense
              style={styles.formInput}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.primary}
              autoFocus
            />

            {/* Materia */}
            <Text style={styles.formLabel}>Materia</Text>
            <View style={styles.subjectRow}>
              {mockSubjects.map((s) => (
                <Chip
                  key={s.id}
                  selected={newSubject === s.name}
                  onPress={() => setNewSubject(newSubject === s.name ? '' : s.name)}
                  style={[styles.formChip, newSubject === s.name && { backgroundColor: s.color + '20' }]}
                  textStyle={[styles.formChipText, newSubject === s.name && { color: s.color }]}
                  showSelectedCheck={false}
                >
                  {s.name}
                </Chip>
              ))}
            </View>

            {/* Fecha de entrega - calendar picker */}
            <Text style={styles.formLabel}>Fecha de entrega</Text>
            <Pressable style={styles.datePickerBtn} onPress={() => setShowCalendar(!showCalendar)}>
              <MaterialCommunityIcons name="calendar" size={20} color={Colors.primary} />
              <Text style={[styles.datePickerText, !newDueDate && { color: Colors.textSecondary }]}>
                {newDueDate || 'Seleccionar fecha'}
              </Text>
              <MaterialCommunityIcons name={showCalendar ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textSecondary} />
            </Pressable>
            {showCalendar && (
              <Calendar
                onDayPress={(day: { dateString: string }) => {
                  setNewDueDate(day.dateString);
                  setShowCalendar(false);
                }}
                markedDates={newDueDate ? { [newDueDate]: { selected: true, selectedColor: Colors.primary } } : {}}
                minDate={new Date().toISOString().split('T')[0]}
                theme={{
                  calendarBackground: '#FFFFFF',
                  todayTextColor: Colors.primary,
                  dayTextColor: Colors.textPrimary,
                  textDisabledColor: '#D9D9D9',
                  arrowColor: Colors.primary,
                  monthTextColor: Colors.textPrimary,
                  textMonthFontWeight: '600',
                  textDayFontSize: 13,
                  textMonthFontSize: 14,
                }}
                style={styles.calendarPicker}
              />
            )}

            {/* Prioridad */}
            <Text style={styles.formLabel}>Prioridad</Text>
            <View style={styles.priorityRow}>
              {(['baja', 'media', 'alta'] as const).map((p) => {
                const cfg = priorityConfig[p];
                const selected = newPriority === p;
                return (
                  <Pressable
                    key={p}
                    style={[styles.priorityOption, selected && { backgroundColor: cfg.color + '20', borderColor: cfg.color }]}
                    onPress={() => setNewPriority(p)}
                  >
                    <View style={[styles.priorityDotForm, { backgroundColor: cfg.color }]} />
                    <Text style={[styles.priorityOptionText, selected && { color: cfg.color, fontWeight: '600' }]}>{cfg.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Grupal */}
            <Pressable style={styles.grupalToggle} onPress={() => setNewGrupal(!newGrupal)}>
              <Checkbox status={newGrupal ? 'checked' : 'unchecked'} onPress={() => setNewGrupal(!newGrupal)} color={Colors.primary} />
              <Text style={styles.grupalToggleText}>Es trabajo grupal</Text>
            </Pressable>

            {newGrupal && (
              <View>
                {/* Selected classmates */}
                {selectedClassmates.length > 0 && (
                  <View style={styles.selectedRow}>
                    {selectedClassmates.map((name) => (
                      <Chip
                        key={name}
                        onClose={() => setSelectedClassmates((prev) => prev.filter((n) => n !== name))}
                        style={styles.selectedChip}
                        textStyle={styles.selectedChipText}
                      >
                        {name}
                      </Chip>
                    ))}
                  </View>
                )}

                {/* Search classmates */}
                <TextInput
                  label="Buscar compañero/a"
                  value={classmateSearch}
                  onChangeText={setClassmateSearch}
                  mode="outlined"
                  dense
                  style={styles.formInput}
                  outlineColor={Colors.border}
                  activeOutlineColor={Colors.primary}
                  left={<TextInput.Icon icon="magnify" />}
                />

                {/* Autocomplete dropdown */}
                {filteredClassmates.length > 0 && (
                  <View style={styles.autocomplete}>
                    {filteredClassmates.map((c) => (
                      <Pressable
                        key={c.id}
                        style={styles.autocompleteRow}
                        onPress={() => {
                          setSelectedClassmates((prev) => [...prev, c.name]);
                          setClassmateSearch('');
                        }}
                      >
                        <View style={styles.autocompleteAvatar}>
                          <Text style={styles.autocompleteAvatarText}>{c.name[0]}</Text>
                        </View>
                        <View>
                          <Text style={styles.autocompleteName}>{c.name}</Text>
                          <Text style={styles.autocompleteGrade}>{c.grade}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}

            <Pressable style={[styles.submitBtn, !newTitle.trim() && styles.submitBtnDisabled]} onPress={addTask}>
              <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                {newGrupal && selectedClassmates.length > 0 ? 'Crear y notificar' : 'Agregar tarea'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      ) : (
        <Pressable style={styles.fab} onPress={() => setShowAdd(true)}>
          <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  filters: { flexDirection: 'row', gap: 8, padding: 16 },
  chip: { backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { color: Colors.textSecondary },
  chipTextActive: { color: '#FFFFFF' },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    paddingRight: 16,
    paddingVertical: 4,
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  taskDone: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  taskMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  taskSubject: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  taskDate: { fontSize: 12, color: Colors.textSecondary },
  grupalRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  grupalText: { fontSize: 11, color: Colors.accent, fontWeight: '500' },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },

  // Add form
  addPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  addHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  addTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  formInput: { backgroundColor: '#FFFFFF', marginBottom: 12 },
  formLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  subjectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  formChip: { backgroundColor: Colors.background },
  formChipText: { fontSize: 12, color: Colors.textPrimary },

  // Date picker
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  datePickerText: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  calendarPicker: { borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },

  // Priority
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  priorityDotForm: { width: 8, height: 8, borderRadius: 4 },
  priorityOptionText: { fontSize: 13, color: Colors.textSecondary },

  // Grupal
  grupalToggle: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  grupalToggleText: { fontSize: 14, color: Colors.textPrimary },
  selectedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  selectedChip: { backgroundColor: Colors.primary + '15' },
  selectedChipText: { fontSize: 12, color: Colors.primary },

  // Autocomplete
  autocomplete: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    marginTop: -8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  autocompleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  autocompleteAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  autocompleteAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  autocompleteName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  autocompleteGrade: { fontSize: 11, color: Colors.textSecondary },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },

  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

import React, { useState, useMemo } from 'react';
import {
  StyleSheet, View, ScrollView, Pressable, Modal,
  ActivityIndicator, Alert, TextInput as RNTextInput,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useAdminStore, DAYS, TIME_SLOTS, SUBJECT_COLORS } from '../../lib/stores/admin-store';
import { useAuthStore } from '../../lib/stores/auth-store';
import { CourseSchedule } from '../../lib/types';
import { Colors } from '../../constants/colors';

const DAY_COLORS = ['#E3F2FD', '#F3E5F5', '#E8F5E9', '#FFF9C4', '#FCE4EC', '#FFF3E0', '#E8EAF6'];
const DAY_TEXT   = ['#1565C0', '#6A1B9A', '#2E7D32', '#F57F17', '#880E4F', '#E65100', '#283593'];

// ─── Time Picker Dropdown ─────────────────────────────────────────────────────

function TimePicker({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={tp.wrapper}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Pressable style={tp.btn} onPress={() => setOpen((o) => !o)}>
        <Text style={tp.btnText}>{value}</Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.textSecondary}
        />
      </Pressable>
      {open && (
        <View style={tp.dropdown}>
          <ScrollView style={tp.dropdownScroll} nestedScrollEnabled>
            {options.map((t) => (
              <Pressable
                key={t}
                style={[tp.option, value === t && tp.optionActive]}
                onPress={() => { onChange(t); setOpen(false); }}
              >
                <Text style={[tp.optionText, value === t && tp.optionTextActive]}>{t}</Text>
                {value === t && <MaterialCommunityIcons name="check" size={15} color={Colors.primary} />}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const tp = StyleSheet.create({
  wrapper: { flex: 1, position: 'relative', zIndex: 10 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 4,
  },
  btnText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  dropdown: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownScroll: { maxHeight: 180 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 },
  optionActive: { backgroundColor: `${Colors.primary}10` },
  optionText: { fontSize: 14, color: Colors.textPrimary },
  optionTextActive: { color: Colors.primary, fontWeight: '600' },
});

// ─── Person Picker (searchable) ────────────────────────────────────────────────

function PersonPicker({
  label, value, people, onChange, placeholder, optional,
}: {
  label: string;
  value: string;
  people: { id: string; name: string }[];
  onChange: (id: string) => void;
  placeholder?: string;
  optional?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = people.find((p) => p.id === value);
  const filtered = people.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const handleClose = () => { setOpen(false); setQuery(''); };
  const handleSelect = (id: string) => { onChange(id); handleClose(); };

  return (
    <View style={pp.wrapper}>
      <View style={s.labelRow}>
        <Text style={s.fieldLabel}>{label}</Text>
        {optional && !!value && (
          <Pressable onPress={() => onChange('')} style={pp.clearBtn}>
            <Text style={pp.clearText}>Quitar</Text>
          </Pressable>
        )}
      </View>
      <Pressable style={[pp.btn, open && pp.btnOpen]} onPress={() => setOpen((o) => !o)}>
        {selected ? (
          <View style={pp.selectedRow}>
            <View style={pp.avatar}>
              <Text style={pp.avatarText}>{selected.name[0]}</Text>
            </View>
            <Text style={pp.selectedName}>{selected.name}</Text>
          </View>
        ) : (
          <Text style={pp.placeholder}>{placeholder ?? 'Seleccionar...'}</Text>
        )}
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.textSecondary}
        />
      </Pressable>

      {open && (
        <View style={pp.dropdown}>
          <View style={pp.searchBox}>
            <MaterialCommunityIcons name="magnify" size={16} color={Colors.textSecondary} />
            <RNTextInput
              style={pp.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar..."
              placeholderTextColor={Colors.textSecondary}
              autoFocus
            />
          </View>
          <ScrollView style={pp.list} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {optional && (
              <Pressable
                style={[pp.option, !value && pp.optionActive]}
                onPress={() => handleSelect('')}
              >
                <Text style={[pp.optionText, !value && pp.optionTextActive]}>Ninguno</Text>
                {!value && <MaterialCommunityIcons name="check" size={15} color={Colors.primary} />}
              </Pressable>
            )}
            {filtered.map((p) => (
              <Pressable
                key={p.id}
                style={[pp.option, value === p.id && pp.optionActive]}
                onPress={() => handleSelect(p.id)}
              >
                <View style={pp.optionAvatar}>
                  <Text style={pp.optionAvatarText}>{p.name[0]}</Text>
                </View>
                <Text style={[pp.optionText, value === p.id && pp.optionTextActive]}>{p.name}</Text>
                {value === p.id && <MaterialCommunityIcons name="check" size={15} color={Colors.primary} />}
              </Pressable>
            ))}
            {filtered.length === 0 && (
              <Text style={pp.emptySearch}>Sin resultados</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const pp = StyleSheet.create({
  wrapper: { marginBottom: 20, zIndex: 8 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  btnOpen: { borderColor: Colors.primary, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  selectedName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  placeholder: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  clearBtn: { paddingHorizontal: 8, paddingVertical: 2 },
  clearText: { fontSize: 12, color: Colors.error, fontWeight: '600' },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: Colors.primary,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: `${Colors.primary}08`,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, paddingVertical: 2 },
  list: { maxHeight: 200 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  optionActive: { backgroundColor: `${Colors.primary}10` },
  optionAvatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  optionAvatarText: { fontSize: 11, fontWeight: '700', color: Colors.textPrimary },
  optionText: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  optionTextActive: { color: Colors.primary, fontWeight: '600' },
  emptySearch: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', padding: 16 },
});

// ─── Inline Subject Form Modal ─────────────────────────────────────────────────

function InlineSubjectModal({
  visible, onClose, onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible) { setName(''); setColor(SUBJECT_COLORS[0]); }
  }, [visible]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name.trim(), color);
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.inlineModal}>
          <Text style={s.sheetTitle}>Nueva materia</Text>
          <Text style={s.fieldLabel}>Nombre</Text>
          <RNTextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Matemática"
            placeholderTextColor={Colors.textSecondary}
            autoFocus
          />
          <Text style={s.fieldLabel}>Color</Text>
          <View style={s.colorGrid}>
            {SUBJECT_COLORS.map((c) => (
              <Pressable
                key={c}
                style={[s.colorDot, { backgroundColor: c }, color === c && s.colorDotSelected]}
                onPress={() => setColor(c)}
              >
                {color === c && <MaterialCommunityIcons name="check" size={13} color="#FFF" />}
              </Pressable>
            ))}
          </View>
          <View style={s.modalActions}>
            <Pressable style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[s.saveBtn, !name.trim() && s.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving || !name.trim()}
            >
              {saving
                ? <ActivityIndicator size={16} color="#FFF" />
                : <Text style={s.saveBtnText}>Guardar</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Schedule Form Modal ──────────────────────────────────────────────────────

function ScheduleFormModal({
  visible, onClose, courseId, initial, onSave,
}: {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  initial?: CourseSchedule | null;
  onSave: (
    subjectId: string, teacherId: string, dayOfWeek: number,
    startTime: string, endTime: string, room: string, assistantId: string
  ) => Promise<void>;
}) {
  const { subjects, teachers, createSubject } = useAdminStore();
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? '');
  const [teacherId, setTeacherId] = useState(initial?.teacherId ?? '');
  const [assistantId, setAssistantId] = useState(initial?.assistantId ?? '');
  const [day, setDay] = useState(initial?.dayOfWeek ?? 1);
  const [startTime, setStartTime] = useState(initial?.startTime ?? TIME_SLOTS[0]);
  const [endTime, setEndTime] = useState(initial?.endTime ?? TIME_SLOTS[1]);
  const [room, setRoom] = useState(initial?.room ?? '');
  const [saving, setSaving] = useState(false);
  const [newSubjectModal, setNewSubjectModal] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setSubjectId(initial?.subjectId ?? '');
      setTeacherId(initial?.teacherId ?? '');
      setAssistantId(initial?.assistantId ?? '');
      setDay(initial?.dayOfWeek ?? 1);
      setStartTime(initial?.startTime ?? TIME_SLOTS[0]);
      setEndTime(initial?.endTime ?? TIME_SLOTS[1]);
      setRoom(initial?.room ?? '');
    }
  }, [visible, initial]);

  const canSave = subjectId && teacherId && startTime && endTime;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    await onSave(subjectId, teacherId, day, startTime, endTime, room, assistantId);
    setSaving(false);
    onClose();
  };

  const startIdx = TIME_SLOTS.indexOf(startTime);
  const endOptions = TIME_SLOTS.slice(startIdx + 1);

  React.useEffect(() => {
    if (endOptions.length > 0 && !endOptions.includes(endTime)) {
      setEndTime(endOptions[0]);
    }
  }, [startTime]);

  // Teachers available for assistant = all except the selected teacher
  const assistantOptions = teachers.filter((t) => t.id !== teacherId);

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={s.overlay}>
          <ScrollView
            style={s.sheet}
            contentContainerStyle={s.sheetContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>{initial ? 'Editar bloque' : 'Nuevo bloque horario'}</Text>

            {/* Day */}
            <Text style={s.fieldLabel}>Día</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {DAYS.map((d, i) => (
                  <Pressable
                    key={d}
                    style={[s.chip, day === i + 1 && { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
                    onPress={() => setDay(i + 1)}
                  >
                    <Text style={[s.chipText, day === i + 1 && { color: '#FFF' }]}>{d.slice(0, 3)}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Time pickers */}
            <View style={s.timeRow}>
              <TimePicker
                label="Desde"
                value={startTime}
                options={TIME_SLOTS.slice(0, -1)}
                onChange={setStartTime}
              />
              <View style={{ width: 12 }} />
              <TimePicker
                label="Hasta"
                value={endTime}
                options={endOptions.length > 0 ? endOptions : TIME_SLOTS.slice(1)}
                onChange={setEndTime}
              />
            </View>

            {/* Subject */}
            <View style={s.labelRow}>
              <Text style={s.fieldLabel}>Materia</Text>
              <Pressable style={s.addInlineBtn} onPress={() => setNewSubjectModal(true)}>
                <MaterialCommunityIcons name="plus" size={14} color={Colors.primary} />
                <Text style={s.addInlineBtnText}>Nueva</Text>
              </Pressable>
            </View>
            <View style={s.subjectGrid}>
              {subjects.map((sub) => (
                <Pressable
                  key={sub.id}
                  style={[s.subjectChip, { borderColor: sub.color }, subjectId === sub.id && { backgroundColor: sub.color }]}
                  onPress={() => setSubjectId(sub.id)}
                >
                  <View style={[s.subjectDot, { backgroundColor: sub.color }]} />
                  <Text style={[s.subjectChipText, subjectId === sub.id && { color: '#FFF' }]}>{sub.name}</Text>
                </Pressable>
              ))}
              {subjects.length === 0 && (
                <Text style={s.emptyNote}>Sin materias. Creá la primera.</Text>
              )}
            </View>

            {/* Teacher */}
            <PersonPicker
              label="Docente"
              value={teacherId}
              people={teachers}
              onChange={(id) => {
                setTeacherId(id);
                if (assistantId === id) setAssistantId('');
              }}
              placeholder="Seleccionar docente..."
            />

            {/* Assistant */}
            <PersonPicker
              label="Ayudante (opcional)"
              value={assistantId}
              people={assistantOptions}
              onChange={setAssistantId}
              placeholder="Sin ayudante"
              optional
            />

            {/* Room */}
            <Text style={s.fieldLabel}>Aula (opcional)</Text>
            <RNTextInput
              style={s.input}
              value={room}
              onChangeText={setRoom}
              placeholder="Ej: Aula 12, Laboratorio"
              placeholderTextColor={Colors.textSecondary}
            />

            {/* Actions */}
            <View style={s.modalActions}>
              <Pressable style={s.cancelBtn} onPress={onClose}>
                <Text style={s.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[s.saveBtn, !canSave && s.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving || !canSave}
              >
                {saving
                  ? <ActivityIndicator size={16} color="#FFF" />
                  : <Text style={s.saveBtnText}>Guardar</Text>}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <InlineSubjectModal
        visible={newSubjectModal}
        onClose={() => setNewSubjectModal(false)}
        onSave={async (name, color) => { await createSubject(name, color); }}
      />
    </>
  );
}

// ─── Student Picker Modal ─────────────────────────────────────────────────────

function StudentPickerModal({
  visible, onClose, courseId, enrolled,
}: {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  enrolled: { id: string; name: string }[];
}) {
  const { students, enrollStudent, unenrollStudent } = useAdminStore();
  const [query, setQuery] = useState('');
  const enrolledIds = new Set(enrolled.map((e) => e.id));
  const filtered = students.filter((st) => st.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={[s.sheet, { maxHeight: '80%' }]}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>Alumnos del curso</Text>
          <RNTextInput
            style={[s.input, { marginHorizontal: 20 }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar alumno..."
            placeholderTextColor={Colors.textSecondary}
          />
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
            {filtered.map((st) => {
              const isEnrolled = enrolledIds.has(st.id);
              return (
                <Pressable
                  key={st.id}
                  style={[s.teacherRow, isEnrolled && s.teacherRowActive]}
                  onPress={() => isEnrolled ? unenrollStudent(courseId, st.id) : enrollStudent(courseId, st.id)}
                >
                  <View style={[s.teacherAvatar, isEnrolled && { backgroundColor: Colors.primary }]}>
                    <Text style={[s.teacherAvatarText, isEnrolled && { color: '#FFF' }]}>{st.name[0]}</Text>
                  </View>
                  <Text style={[s.teacherName, isEnrolled && { color: Colors.primary, fontWeight: '600' }]}>{st.name}</Text>
                  <MaterialCommunityIcons
                    name={isEnrolled ? 'check-circle' : 'plus-circle-outline'}
                    size={20}
                    color={isEnrolled ? Colors.primary : Colors.border}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable style={[s.saveBtn, { margin: 20 }]} onPress={onClose}>
            <Text style={s.saveBtnText}>Listo</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Weekly Schedule Grid ─────────────────────────────────────────────────────

function ScheduleGrid({ schedules, onEdit }: { schedules: CourseSchedule[]; onEdit: (s: CourseSchedule) => void }) {
  const [containerWidth, setContainerWidth] = useState(0);
  const CELL_H = 54;
  const TIME_W = 52;
  const MIN_CELL_W = 80;

  // Always show Mon-Fri (indices 0-4). Show Sat/Sun only if there's a block on that day.
  const usedDayIndices = new Set(schedules.map((sc) => sc.dayOfWeek - 1));
  const visibleDayIndices = [0, 1, 2, 3, 4, ...[5, 6].filter((i) => usedDayIndices.has(i))];

  const CELL_W = containerWidth > 0
    ? Math.max(MIN_CELL_W, Math.floor((containerWidth - TIME_W) / visibleDayIndices.length))
    : MIN_CELL_W;

  // Use TIME_SLOTS as rows (each slot = 50 min), exclude the last which is end-only.
  const slots = TIME_SLOTS.slice(0, -1);

  function parseMins(t: string) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  function getBlock(day: number, slotTime: string) {
    const slotMins = parseMins(slotTime);
    return schedules.find((sc) => {
      const startMins = parseMins(sc.startTime);
      const endMins = parseMins(sc.endTime);
      return sc.dayOfWeek === day && slotMins >= startMins && slotMins < endMins;
    });
  }

  function blockHeight(sc: CourseSchedule) {
    const startMins = parseMins(sc.startTime);
    const endMins = parseMins(sc.endTime);
    // Each slot is 50 min
    return ((endMins - startMins) / 50) * CELL_H;
  }

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <ScrollView horizontal={CELL_W <= MIN_CELL_W} showsHorizontalScrollIndicator={false}>
        <View style={{ width: containerWidth > 0 ? containerWidth : undefined }}>
          {/* Header */}
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: TIME_W }} />
            {visibleDayIndices.map((di) => (
              <View key={di} style={[s.gridDayHeader, { flex: 1, minWidth: CELL_W, backgroundColor: DAY_COLORS[di] }]}>
                <Text style={[s.gridDayText, { color: DAY_TEXT[di] }]}>{DAYS[di].slice(0, 3).toUpperCase()}</Text>
              </View>
            ))}
          </View>
          {/* Rows — one per TIME_SLOT */}
          {slots.map((slotTime) => (
            <View key={slotTime} style={{ flexDirection: 'row' }}>
              <View style={[s.gridTimeCell, { width: TIME_W, height: CELL_H }]}>
                <Text style={s.gridTimeText}>{slotTime}</Text>
              </View>
              {visibleDayIndices.map((di) => {
                const day = di + 1;
                const block = getBlock(day, slotTime);
                const isFirst = block && block.startTime === slotTime;
                if (block && !isFirst) {
                  return <View key={day} style={{ flex: 1, minWidth: CELL_W, height: CELL_H, borderBottomWidth: 1, borderBottomColor: Colors.border }} />;
                }
                if (block && isFirst) {
                  return (
                    <View key={day} style={{ flex: 1, minWidth: CELL_W, height: CELL_H, overflow: 'visible' }}>
                      <Pressable
                        style={[s.gridBlock, { height: blockHeight(block) - 4, backgroundColor: block.subjectColor + 'CC', borderColor: block.subjectColor }]}
                        onPress={() => onEdit(block)}
                      >
                        <Text style={s.gridBlockSubject} numberOfLines={1}>{block.subjectName}</Text>
                        <Text style={s.gridBlockTeacher} numberOfLines={1}>{block.teacherName}</Text>
                        {!!block.assistantName && (
                          <Text style={s.gridBlockRoom} numberOfLines={1}>+{block.assistantName}</Text>
                        )}
                        {!!block.room && <Text style={s.gridBlockRoom} numberOfLines={1}>{block.room}</Text>}
                      </Pressable>
                    </View>
                  );
                }
                return <View key={day} style={[s.gridEmptyCell, { flex: 1, minWidth: CELL_W, height: CELL_H }]} />;
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Course Detail Screen ────────────────────────────────────────────────────

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { courses, deleteSchedule, createSchedule, updateSchedule } = useAdminStore();
  const user = useAuthStore((s) => s.user);
  const isDocente = user?.role === 'docente';
  const course = courses.find((c) => c.id === id);

  const [scheduleModal, setScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CourseSchedule | null>(null);
  const [studentModal, setStudentModal] = useState(false);

  // ⚠️ All hooks must be called before any early return
  const schedulesByDay = useMemo(() => {
    const grouped: Record<number, CourseSchedule[]> = {};
    (course?.schedules ?? []).forEach((sch) => {
      if (!grouped[sch.dayOfWeek]) grouped[sch.dayOfWeek] = [];
      grouped[sch.dayOfWeek].push(sch);
    });
    DAYS.forEach((_, i) => {
      const d = i + 1;
      grouped[d] = (grouped[d] ?? []).sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [course?.schedules]);

  if (!course) {
    return (
      <View style={s.center}>
        <Text style={{ color: Colors.textSecondary }}>Curso no encontrado</Text>
      </View>
    );
  }

  const handleDeleteSchedule = (sch: CourseSchedule) => {
    Alert.alert('Eliminar bloque', `¿Eliminar ${sch.subjectName} del ${DAYS[sch.dayOfWeek - 1]}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteSchedule(sch.id, course.id) },
    ]);
  };

  return (
    <View style={s.screen}>
      <View style={s.topBar}>
        <Pressable style={s.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/admin' as any)}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.topBarTitle}>{course.name}</Text>
          <Text style={s.topBarSub}>{course.grade}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {/* Schedule section */}
        <View style={s.sectionHeader2}>
          <MaterialCommunityIcons name="clock-outline" size={18} color={Colors.primary} />
          <Text style={s.sectionTitle2}>Cronograma</Text>
          <View style={{ flex: 1 }} />
          {!isDocente && (
            <Pressable style={s.addBtn} onPress={() => { setEditingSchedule(null); setScheduleModal(true); }}>
              <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
              <Text style={s.addBtnText}>Agregar bloque</Text>
            </Pressable>
          )}
        </View>

        {course.schedules.length === 0 ? (
          <View style={s.emptyCard}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={36} color={Colors.border} />
            <Text style={s.emptyText}>Sin bloques horarios. Agregá el primero.</Text>
          </View>
        ) : (
          <>
            <View style={s.gridContainer}>
              <ScheduleGrid
                schedules={course.schedules}
                onEdit={(sch) => { if (!isDocente) { setEditingSchedule(sch); setScheduleModal(true); } }}
              />
            </View>

            {DAYS.map((dayName, di) => {
              const blocks = schedulesByDay[di + 1];
              if (!blocks || blocks.length === 0) return null;
              return (
                <View key={di} style={s.dayGroup}>
                  <View style={[s.dayBadge, { backgroundColor: DAY_COLORS[di] }]}>
                    <Text style={[s.dayBadgeText, { color: DAY_TEXT[di] }]}>{dayName}</Text>
                  </View>
                  {blocks.map((sch) => (
                    <View key={sch.id} style={s.scheduleRow}>
                      <View style={[s.scheduleColor, { backgroundColor: sch.subjectColor }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.scheduleSubject}>{sch.subjectName}</Text>
                        <Text style={s.scheduleMeta}>
                          {sch.startTime}–{sch.endTime}
                          {' · '}{sch.teacherName}
                          {sch.assistantName ? ` + ${sch.assistantName}` : ''}
                          {sch.room ? ` · ${sch.room}` : ''}
                        </Text>
                      </View>
                      {!isDocente && (
                        <>
                          <Pressable style={s.iconBtn} onPress={() => { setEditingSchedule(sch); setScheduleModal(true); }}>
                            <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.textSecondary} />
                          </Pressable>
                          <Pressable style={s.iconBtn} onPress={() => handleDeleteSchedule(sch)}>
                            <MaterialCommunityIcons name="trash-can-outline" size={16} color={Colors.error} />
                          </Pressable>
                        </>
                      )}
                    </View>
                  ))}
                </View>
              );
            })}
          </>
        )}

        {/* Students section */}
        <View style={[s.sectionHeader2, { marginTop: 24 }]}>
          <MaterialCommunityIcons name="account-group-outline" size={18} color={Colors.primary} />
          <Text style={s.sectionTitle2}>Alumnos</Text>
          <Text style={s.countBadge}>{course.students.length}</Text>
          <View style={{ flex: 1 }} />
          <Pressable style={s.addBtn} onPress={() => setStudentModal(true)}>
            <MaterialCommunityIcons name="account-plus-outline" size={16} color="#FFF" />
            <Text style={s.addBtnText}>Gestionar</Text>
          </Pressable>
        </View>

        {course.students.length === 0 ? (
          <View style={s.emptyCard}>
            <MaterialCommunityIcons name="account-off-outline" size={36} color={Colors.border} />
            <Text style={s.emptyText}>Sin alumnos matriculados.</Text>
          </View>
        ) : (
          <View style={s.studentGrid}>
            {course.students.map((st) => (
              <View key={st.id} style={s.studentChip}>
                <View style={s.studentAvatar}>
                  <Text style={s.studentAvatarText}>{st.name[0]}</Text>
                </View>
                <Text style={s.studentName} numberOfLines={1}>{st.name}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <ScheduleFormModal
        visible={scheduleModal}
        onClose={() => setScheduleModal(false)}
        courseId={course.id}
        initial={editingSchedule}
        onSave={async (subjectId, teacherId, dayOfWeek, startTime, endTime, room, assistantId) => {
          if (editingSchedule) {
            await updateSchedule(editingSchedule.id, subjectId, teacherId, dayOfWeek, startTime, endTime, room, assistantId);
          } else {
            await createSchedule(course.id, subjectId, teacherId, dayOfWeek, startTime, endTime, room, assistantId);
          }
        }}
      />

      <StudentPickerModal
        visible={studentModal}
        onClose={() => setStudentModal(false)}
        courseId={course.id}
        enrolled={course.students}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  topBar: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  topBarTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  topBarSub: { fontSize: 13, color: Colors.textSecondary },

  sectionHeader2: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle2: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  countBadge: { fontSize: 12, color: Colors.textSecondary, backgroundColor: Colors.border, paddingHorizontal: 7, paddingVertical: 1, borderRadius: 10 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 28, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.border, marginBottom: 8 },
  emptyText: { fontSize: 13, color: Colors.textSecondary },

  gridContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: 16 },
  gridDayHeader: { height: 34, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: Colors.border },
  gridDayText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  gridTimeCell: { justifyContent: 'flex-start', paddingTop: 4, paddingRight: 6, alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: Colors.border },
  gridTimeText: { fontSize: 10, color: Colors.textSecondary },
  gridEmptyCell: { borderRightWidth: 1, borderRightColor: Colors.border, borderBottomWidth: 1, borderBottomColor: Colors.border },
  gridBlock: { margin: 2, borderRadius: 6, borderWidth: 1, padding: 4, zIndex: 1 },
  gridBlockSubject: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  gridBlockTeacher: { fontSize: 9, color: 'rgba(255,255,255,0.85)', marginTop: 1 },
  gridBlockRoom: { fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 1 },

  dayGroup: { marginBottom: 12 },
  dayBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 6 },
  dayBadgeText: { fontSize: 12, fontWeight: '700' },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  scheduleColor: { width: 4, height: 36, borderRadius: 2 },
  scheduleSubject: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  scheduleMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  iconBtn: { padding: 6 },

  studentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  studentChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border, maxWidth: 160 },
  studentAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  studentAvatarText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  studentName: { fontSize: 13, color: Colors.textPrimary, flex: 1 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%' },
  sheetContent: { padding: 20 },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20 },

  inlineModal: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, margin: 20 },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  addInlineBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 },
  addInlineBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },

  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

  timeRow: { flexDirection: 'row', marginBottom: 28, zIndex: 10 },

  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  subjectChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  subjectDot: { width: 8, height: 8, borderRadius: 4 },
  subjectChipText: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },

  teacherRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: Colors.border },
  teacherRowActive: { backgroundColor: `${Colors.primary}10`, borderColor: Colors.primary },
  teacherAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  teacherAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  teacherName: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  emptyNote: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },

  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: Colors.textPrimary, marginBottom: 16 },

  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  colorDot: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  colorDotSelected: { borderWidth: 3, borderColor: 'rgba(0,0,0,0.25)' },

  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border },
  cancelBtnText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.primary },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
});

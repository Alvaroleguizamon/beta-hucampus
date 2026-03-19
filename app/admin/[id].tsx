import React, { useState, useMemo } from 'react';
import {
  StyleSheet, View, ScrollView, Pressable, Modal,
  ActivityIndicator, Alert, TextInput as RNTextInput,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useAdminStore, DAYS, TIME_SLOTS } from '../../lib/stores/admin-store';
import { CourseSchedule } from '../../lib/types';
import { Colors } from '../../constants/colors';

const DAY_COLORS = ['#E3F2FD', '#F3E5F5', '#E8F5E9', '#FFF9C4', '#FCE4EC'];
const DAY_TEXT   = ['#1565C0', '#6A1B9A', '#2E7D32', '#F57F17', '#880E4F'];

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
    startTime: string, endTime: string, room: string
  ) => Promise<void>;
}) {
  const { subjects, teachers } = useAdminStore();
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? '');
  const [teacherId, setTeacherId] = useState(initial?.teacherId ?? '');
  const [day, setDay] = useState(initial?.dayOfWeek ?? 1);
  const [startTime, setStartTime] = useState(initial?.startTime ?? TIME_SLOTS[0]);
  const [endTime, setEndTime] = useState(initial?.endTime ?? TIME_SLOTS[1]);
  const [room, setRoom] = useState(initial?.room ?? '');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setSubjectId(initial?.subjectId ?? '');
      setTeacherId(initial?.teacherId ?? '');
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
    await onSave(subjectId, teacherId, day, startTime, endTime, room);
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <ScrollView style={s.sheet} contentContainerStyle={s.sheetContent} keyboardShouldPersistTaps="handled">
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>{initial ? 'Editar bloque' : 'Nuevo bloque horario'}</Text>

          {/* Day */}
          <Text style={s.fieldLabel}>Día</Text>
          <View style={s.chipRow}>
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

          {/* Time */}
          <View style={s.timeRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Desde</Text>
              <View style={s.timeScroll}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {TIME_SLOTS.slice(0, -1).map((t) => (
                    <Pressable
                      key={t}
                      style={[s.timeChip, startTime === t && { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
                      onPress={() => setStartTime(t)}
                    >
                      <Text style={[s.timeChipText, startTime === t && { color: '#FFF' }]}>{t}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Hasta</Text>
              <View style={s.timeScroll}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {TIME_SLOTS.slice(1).map((t) => (
                    <Pressable
                      key={t}
                      style={[s.timeChip, endTime === t && { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
                      onPress={() => setEndTime(t)}
                    >
                      <Text style={[s.timeChipText, endTime === t && { color: '#FFF' }]}>{t}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Subject */}
          <Text style={s.fieldLabel}>Materia</Text>
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
          </View>

          {/* Teacher */}
          <Text style={s.fieldLabel}>Docente</Text>
          {teachers.length === 0 && (
            <Text style={s.emptyNote}>No hay docentes disponibles</Text>
          )}
          {teachers.map((t) => (
            <Pressable
              key={t.id}
              style={[s.teacherRow, teacherId === t.id && s.teacherRowActive]}
              onPress={() => setTeacherId(t.id)}
            >
              <View style={s.teacherAvatar}>
                <Text style={s.teacherAvatarText}>{t.name[0]}</Text>
              </View>
              <Text style={[s.teacherName, teacherId === t.id && { color: Colors.primary, fontWeight: '600' }]}>{t.name}</Text>
              {teacherId === t.id && <MaterialCommunityIcons name="check-circle" size={18} color={Colors.primary} />}
            </Pressable>
          ))}

          {/* Room */}
          <Text style={[s.fieldLabel, { marginTop: 16 }]}>Aula (opcional)</Text>
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
  const CELL_W = 110;
  const CELL_H = 54;
  const TIME_W = 52;

  const startHour = 7;
  const endHour = 18;
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  function getBlock(day: number, hour: number) {
    return schedules.find((sc) => {
      const sh = parseInt(sc.startTime.split(':')[0]);
      const sm = parseInt(sc.startTime.split(':')[1]);
      const eh = parseInt(sc.endTime.split(':')[0]);
      const em = parseInt(sc.endTime.split(':')[1]);
      const startMins = sh * 60 + sm;
      const endMins = eh * 60 + em;
      const cellMins = hour * 60;
      return sc.dayOfWeek === day && cellMins >= startMins && cellMins < endMins;
    });
  }

  function isFirstCell(sc: CourseSchedule, hour: number) {
    return parseInt(sc.startTime.split(':')[0]) === hour;
  }

  function blockHeight(sc: CourseSchedule) {
    const sh = parseInt(sc.startTime.split(':')[0]);
    const sm = parseInt(sc.startTime.split(':')[1]);
    const eh = parseInt(sc.endTime.split(':')[0]);
    const em = parseInt(sc.endTime.split(':')[1]);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    return (mins / 60) * CELL_H;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Header row */}
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: TIME_W }} />
          {DAYS.map((d, i) => (
            <View key={d} style={[s.gridDayHeader, { width: CELL_W, backgroundColor: DAY_COLORS[i] }]}>
              <Text style={[s.gridDayText, { color: DAY_TEXT[i] }]}>{d.slice(0, 3).toUpperCase()}</Text>
            </View>
          ))}
        </View>

        {/* Time rows */}
        {hours.map((hour) => (
          <View key={hour} style={{ flexDirection: 'row' }}>
            <View style={[s.gridTimeCell, { width: TIME_W, height: CELL_H }]}>
              <Text style={s.gridTimeText}>{`${hour}:00`}</Text>
            </View>
            {DAYS.map((_, di) => {
              const day = di + 1;
              const block = getBlock(day, hour);
              if (block && !isFirstCell(block, hour)) {
                return <View key={day} style={{ width: CELL_W, height: CELL_H, borderBottomWidth: 1, borderBottomColor: Colors.border }} />;
              }
              if (block && isFirstCell(block, hour)) {
                const h = blockHeight(block);
                return (
                  <Pressable
                    key={day}
                    style={[s.gridBlock, { width: CELL_W - 4, height: h - 4, backgroundColor: block.subjectColor + 'CC', borderColor: block.subjectColor }]}
                    onPress={() => onEdit(block)}
                  >
                    <Text style={s.gridBlockSubject} numberOfLines={1}>{block.subjectName}</Text>
                    <Text style={s.gridBlockTeacher} numberOfLines={1}>{block.teacherName.split(' ')[0]}</Text>
                    {block.room && <Text style={s.gridBlockRoom} numberOfLines={1}>{block.room}</Text>}
                  </Pressable>
                );
              }
              return (
                <View key={day} style={[s.gridEmptyCell, { width: CELL_W, height: CELL_H }]} />
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Course Detail Screen ────────────────────────────────────────────────────

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { courses, deleteSchedule } = useAdminStore();
  const course = courses.find((c) => c.id === id);

  const [scheduleModal, setScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CourseSchedule | null>(null);
  const [studentModal, setStudentModal] = useState(false);
  const { createSchedule, updateSchedule } = useAdminStore();

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

  // Group schedules by day for list view
  const schedulesByDay = useMemo(() => {
    const grouped: Record<number, CourseSchedule[]> = {};
    course.schedules.forEach((sch) => {
      if (!grouped[sch.dayOfWeek]) grouped[sch.dayOfWeek] = [];
      grouped[sch.dayOfWeek].push(sch);
    });
    [1, 2, 3, 4, 5].forEach((d) => {
      grouped[d] = (grouped[d] ?? []).sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [course.schedules]);

  return (
    <View style={s.screen}>
      {/* Top Bar */}
      <View style={s.topBar}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.topBarTitle}>{course.name}</Text>
          <Text style={s.topBarSub}>{course.grade}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {/* ── Schedule section ── */}
        <View style={s.sectionHeader2}>
          <MaterialCommunityIcons name="clock-outline" size={18} color={Colors.primary} />
          <Text style={s.sectionTitle2}>Cronograma</Text>
          <View style={{ flex: 1 }} />
          <Pressable
            style={s.addBtn}
            onPress={() => { setEditingSchedule(null); setScheduleModal(true); }}
          >
            <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
            <Text style={s.addBtnText}>Agregar bloque</Text>
          </Pressable>
        </View>

        {course.schedules.length === 0 ? (
          <View style={s.emptyCard}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={36} color={Colors.border} />
            <Text style={s.emptyText}>Sin bloques horarios. Agregá el primero.</Text>
          </View>
        ) : (
          <>
            {/* Grid view */}
            <View style={s.gridContainer}>
              <ScheduleGrid
                schedules={course.schedules}
                onEdit={(sch) => { setEditingSchedule(sch); setScheduleModal(true); }}
              />
            </View>

            {/* List view by day */}
            {[1, 2, 3, 4, 5].map((day) => {
              const blocks = schedulesByDay[day];
              if (!blocks || blocks.length === 0) return null;
              return (
                <View key={day} style={s.dayGroup}>
                  <View style={[s.dayBadge, { backgroundColor: DAY_COLORS[day - 1] }]}>
                    <Text style={[s.dayBadgeText, { color: DAY_TEXT[day - 1] }]}>{DAYS[day - 1]}</Text>
                  </View>
                  {blocks.map((sch) => (
                    <View key={sch.id} style={s.scheduleRow}>
                      <View style={[s.scheduleColor, { backgroundColor: sch.subjectColor }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.scheduleSubject}>{sch.subjectName}</Text>
                        <Text style={s.scheduleMeta}>
                          {sch.startTime}–{sch.endTime} · {sch.teacherName}{sch.room ? ` · ${sch.room}` : ''}
                        </Text>
                      </View>
                      <Pressable style={s.iconBtn} onPress={() => { setEditingSchedule(sch); setScheduleModal(true); }}>
                        <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.textSecondary} />
                      </Pressable>
                      <Pressable style={s.iconBtn} onPress={() => handleDeleteSchedule(sch)}>
                        <MaterialCommunityIcons name="trash-can-outline" size={16} color={Colors.error} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              );
            })}
          </>
        )}

        {/* ── Students section ── */}
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

      {/* Schedule Modal */}
      <ScheduleFormModal
        visible={scheduleModal}
        onClose={() => setScheduleModal(false)}
        courseId={course.id}
        initial={editingSchedule}
        onSave={async (subjectId, teacherId, dayOfWeek, startTime, endTime, room) => {
          if (editingSchedule) {
            await updateSchedule(editingSchedule.id, subjectId, teacherId, dayOfWeek, startTime, endTime, room);
          } else {
            await createSchedule(course.id, subjectId, teacherId, dayOfWeek, startTime, endTime, room);
          }
        }}
      />

      {/* Student Modal */}
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

  // Grid
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

  // Day list
  dayGroup: { marginBottom: 12 },
  dayBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 6 },
  dayBadgeText: { fontSize: 12, fontWeight: '700' },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  scheduleColor: { width: 4, height: 36, borderRadius: 2 },
  scheduleSubject: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  scheduleMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  iconBtn: { padding: 6 },

  // Students
  studentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  studentChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border, maxWidth: 160 },
  studentAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  studentAvatarText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  studentName: { fontSize: 13, color: Colors.textPrimary, flex: 1 },

  // Modal / Sheet
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%' },
  sheetContent: { padding: 20 },
  sheetHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20 },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

  timeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  timeScroll: { marginBottom: 4 },
  timeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5, borderColor: Colors.border, marginRight: 6 },
  timeChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },

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
  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border },
  cancelBtnText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.primary },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
});

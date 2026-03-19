import React, { useState, useMemo } from 'react';
import {
  StyleSheet, View, FlatList, Pressable, ScrollView,
  TextInput as RNTextInput, Modal, Alert, Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/stores/auth-store';
import { useGradesStore } from '../../lib/stores/grades-store';
import { useCoursesStore } from '../../lib/stores/courses-store';
import { useSubjectsStore } from '../../lib/stores/subjects-store';
import { Colors } from '../../constants/colors';
import { Grade } from '../../lib/types';

// Padre → child mapping para este demo
const PADRE_CHILD: Record<string, { id: string; name: string }> = {
  u1: { id: 'st1', name: 'Juan Pérez' },
};

const COL_NAME = 160;
const COL_GRADE = 76;
const COL_AVG = 88;
const PASSING = 7;

function getGradeColor(value: number) {
  if (value >= PASSING) return Colors.success;
  if (value >= 4) return Colors.warning;
  return Colors.error;
}

// ─── Alumno / Padre view ──────────────────────────────────────────────────────
function GradesList({ studentId }: { studentId: string }) {
  const grades = useGradesStore((s) => s.grades);
  const subjects = useSubjectsStore((s) => s.subjects);
  const studentGrades = grades.filter((g) => g.studentId === studentId);

  const bySubject = subjects.map((subject) => {
    const subGrades = studentGrades.filter((g) => g.subjectId === subject.id);
    const avg = subGrades.length
      ? subGrades.reduce((s, g) => s + g.value, 0) / subGrades.length
      : null;
    return { subject, grades: subGrades, average: avg };
  });

  const generalAvg = studentGrades.length
    ? (studentGrades.reduce((s, g) => s + g.value, 0) / studentGrades.length).toFixed(1)
    : null;

  if (studentGrades.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="school-outline" size={48} color={Colors.border} />
        <Text style={styles.emptyTitle}>Sin notas aún</Text>
        <Text style={styles.emptyBody}>Las notas aparecerán aquí cuando sean cargadas.</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.avgCard}>
        <Text style={styles.avgLabel}>Promedio general</Text>
        <Text style={styles.avgValue}>{generalAvg ?? '-'}</Text>
        <Text style={styles.avgPeriod}>1er Trimestre</Text>
      </View>

      <FlatList
        data={bySubject.filter((s) => s.grades.length > 0)}
        keyExtractor={(item) => item.subject.id}
        contentContainerStyle={styles.list}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <View style={[styles.subjectDot, { backgroundColor: item.subject.color }]} />
              <Text style={styles.subjectName}>{item.subject.name}</Text>
              {item.average !== null && (
                <View style={[styles.avgBadge, { backgroundColor: getGradeColor(item.average) }]}>
                  <Text style={styles.avgBadgeText}>{item.average.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.teacherName}>{item.subject.teacher}</Text>
            {item.grades.map((grade) => (
              <View key={grade.id} style={styles.gradeRow}>
                <View style={styles.gradeInfo}>
                  <Text style={styles.gradeDesc}>{grade.description}</Text>
                  <Text style={styles.gradeDate}>{grade.date} · {grade.category === 'tp' ? 'TP' : 'Examen'}</Text>
                </View>
                <View style={[styles.gradeValue, { backgroundColor: getGradeColor(grade.value) }]}>
                  <Text style={styles.gradeValueText}>{grade.value}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      />
    </>
  );
}

function AlumnoView({ userId }: { userId: string }) {
  return (
    <ScrollView style={styles.container}>
      <GradesList studentId={userId} />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function PadreView({ userId }: { userId: string }) {
  const child = PADRE_CHILD[userId] ?? { id: 'st1', name: 'Estudiante' };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.childBanner}>
        <MaterialCommunityIcons name="account-child" size={18} color={Colors.primary} />
        <Text style={styles.childBannerText}>Notas de {child.name}</Text>
      </View>
      <GradesList studentId={child.id} />
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── Docente spreadsheet view ─────────────────────────────────────────────────

interface GradeModalState {
  studentId: string;
  studentName: string;
  evalName: string;
  existingGrade: Grade | null;
}

function DocenteView() {
  const grades = useGradesStore((s) => s.grades);
  const addGrade = useGradesStore((s) => s.addGrade);
  const updateGrade = useGradesStore((s) => s.updateGrade);
  const deleteGrade = useGradesStore((s) => s.deleteGrade);
  const courses = useCoursesStore((s) => s.courses);
  const subjects = useSubjectsStore((s) => s.subjects);
  const user = useAuthStore((s) => s.user);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [category, setCategory] = useState<'examen' | 'tp'>('examen');
  const [gradeModal, setGradeModal] = useState<GradeModalState | null>(null);
  const [gradeInput, setGradeInput] = useState('');
  const [addEvalModal, setAddEvalModal] = useState(false);
  const [newEvalName, setNewEvalName] = useState('');

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const students = selectedCourse?.students ?? [];

  // Evaluations = unique descriptions for (subjectId, category) derived from saved grades
  const evaluations = useMemo(() => {
    if (!selectedSubjectId) return [];
    const seen = new Set<string>();
    const list: string[] = [];
    grades
      .filter((g) => g.subjectId === selectedSubjectId && g.category === category)
      .forEach((g) => {
        if (!seen.has(g.description)) {
          seen.add(g.description);
          list.push(g.description);
        }
      });
    return list;
  }, [grades, selectedSubjectId, category]);

  const getGrade = (studentId: string, evalName: string): Grade | null =>
    grades.find(
      (g) => g.studentId === studentId && g.subjectId === selectedSubjectId &&
             g.description === evalName && g.category === category
    ) ?? null;

  const getAverage = (studentId: string): number | null => {
    const relevant = grades.filter(
      (g) => g.studentId === studentId && g.subjectId === selectedSubjectId
    );
    if (!relevant.length) return null;
    return relevant.reduce((s, g) => s + g.value, 0) / relevant.length;
  };

  const openGradeModal = (studentId: string, studentName: string, evalName: string) => {
    const existing = getGrade(studentId, evalName);
    setGradeModal({ studentId, studentName, evalName, existingGrade: existing });
    setGradeInput(existing ? String(existing.value) : '');
  };

  const handleSaveGrade = () => {
    if (!gradeModal || !selectedSubjectId) return;
    const val = parseFloat(gradeInput);
    if (isNaN(val) || val < 0 || val > 10) {
      if (Platform.OS === 'web') window.alert('Ingresá una nota entre 0 y 10');
      else Alert.alert('Error', 'Ingresá una nota entre 0 y 10');
      return;
    }
    if (gradeModal.existingGrade) {
      updateGrade(gradeModal.existingGrade.id, val);
    } else {
      const subject = subjects.find((s) => s.id === selectedSubjectId);
      addGrade({
        subjectId: selectedSubjectId,
        subjectName: subject?.name ?? '',
        studentId: gradeModal.studentId,
        studentName: gradeModal.studentName,
        value: val,
        date: new Date().toISOString().split('T')[0],
        description: gradeModal.evalName,
        period: '1er Trimestre',
        category,
      });
    }
    setGradeModal(null);
  };

  const handleDeleteGrade = () => {
    if (!gradeModal?.existingGrade) return;
    const id = gradeModal.existingGrade.id;
    const doDelete = () => { deleteGrade(id); setGradeModal(null); };
    if (Platform.OS === 'web') {
      if (window.confirm('¿Eliminar esta nota?')) doDelete();
    } else {
      Alert.alert('Eliminar nota', '¿Eliminar esta nota?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const handleAddEval = () => {
    if (!newEvalName.trim()) return;
    // Add a placeholder grade (value=-1 means no grade, but we use a different approach:
    // just add the eval name to a local list so the column appears)
    setAddEvalModal(false);
    setNewEvalName('');
    // We need a way to show the column without a grade yet.
    // Use local state for pending eval names.
    setPendingEvals((prev) => [...prev, newEvalName.trim()]);
  };

  const [pendingEvals, setPendingEvals] = useState<string[]>([]);

  // Combined evaluations: from grades + pending (not yet graded)
  const allEvals = useMemo(() => {
    const combined = [...evaluations];
    pendingEvals.forEach((e) => {
      if (!combined.includes(e)) combined.push(e);
    });
    return combined;
  }, [evaluations, pendingEvals]);

  // When subject changes, clear pending evals
  const handleSelectSubject = (id: string) => {
    setSelectedSubjectId(id);
    setPendingEvals([]);
  };

  if (!selectedCourseId || !selectedSubjectId) {
    return (
      <View style={styles.root}>
        {/* Course selector */}
        <View style={styles.selectorSection}>
          <Text style={styles.selectorLabel}>Curso</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {courses.map((c) => (
              <Pressable
                key={c.id}
                style={[styles.chip, selectedCourseId === c.id && styles.chipActive]}
                onPress={() => { setSelectedCourseId(c.id); setSelectedSubjectId(''); }}
              >
                <Text style={[styles.chipText, selectedCourseId === c.id && styles.chipTextActive]}>
                  {c.grade} — {c.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {selectedCourseId && (
          <View style={styles.selectorSection}>
            <Text style={styles.selectorLabel}>Materia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {subjects.map((s) => (
                <Pressable
                  key={s.id}
                  style={[styles.chip, selectedSubjectId === s.id && styles.chipActive]}
                  onPress={() => handleSelectSubject(s.id)}
                >
                  <Text style={[styles.chipText, selectedSubjectId === s.id && styles.chipTextActive]}>
                    {s.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {!selectedCourseId && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="table-edit" size={52} color={Colors.border} />
            <Text style={styles.emptyTitle}>Seleccioná un curso</Text>
            <Text style={styles.emptyBody}>Elegí un curso y una materia para cargar notas.</Text>
          </View>
        )}
      </View>
    );
  }

  const subject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <View style={styles.root}>
      {/* Selectors row */}
      <View style={styles.selectorBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          {courses.map((c) => (
            <Pressable
              key={c.id}
              style={[styles.chip, selectedCourseId === c.id && styles.chipActive]}
              onPress={() => { setSelectedCourseId(c.id); setSelectedSubjectId(''); }}
            >
              <Text style={[styles.chipText, selectedCourseId === c.id && styles.chipTextActive]}>
                {c.grade}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.selectorDivider} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 2 }}>
          {subjects.map((s) => (
            <Pressable
              key={s.id}
              style={[styles.chip, selectedSubjectId === s.id && styles.chipActive]}
              onPress={() => handleSelectSubject(s.id)}
            >
              <Text style={[styles.chipText, selectedSubjectId === s.id && styles.chipTextActive]}>
                {s.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Category tabs */}
      <View style={styles.categoryTabs}>
        <Pressable
          style={[styles.categoryTab, category === 'examen' && styles.categoryTabActive]}
          onPress={() => setCategory('examen')}
        >
          <MaterialCommunityIcons name="pencil-box-outline" size={16} color={category === 'examen' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.categoryTabText, category === 'examen' && styles.categoryTabTextActive]}>
            Exámenes
          </Text>
        </Pressable>
        <Pressable
          style={[styles.categoryTab, category === 'tp' && styles.categoryTabActive]}
          onPress={() => setCategory('tp')}
        >
          <MaterialCommunityIcons name="clipboard-text-outline" size={16} color={category === 'tp' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.categoryTabText, category === 'tp' && styles.categoryTabTextActive]}>
            Trabajos Prácticos
          </Text>
        </Pressable>
      </View>

      {/* Spreadsheet */}
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
            {/* Header row */}
            <View style={styles.tableHeaderRow}>
              <View style={[styles.tableCell, styles.tableHeaderCell, { width: COL_NAME }]}>
                <Text style={styles.tableHeaderText}>Alumno</Text>
              </View>
              {allEvals.map((evalName) => (
                <View key={evalName} style={[styles.tableCell, styles.tableHeaderCell, { width: COL_GRADE }]}>
                  <Text style={styles.tableHeaderText} numberOfLines={2}>{evalName}</Text>
                </View>
              ))}
              {/* Add eval column */}
              <Pressable
                style={[styles.tableCell, styles.addEvalBtn, { width: COL_GRADE }]}
                onPress={() => { setNewEvalName(''); setAddEvalModal(true); }}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={20} color={Colors.primary} />
              </Pressable>
              <View style={[styles.tableCell, styles.tableHeaderCell, styles.avgHeaderCell, { width: COL_AVG }]}>
                <Text style={[styles.tableHeaderText, { color: Colors.primary }]}>Promedio</Text>
              </View>
            </View>

            {/* Student rows */}
            {students.length === 0 ? (
              <View style={{ padding: 24 }}>
                <Text style={{ color: Colors.textSecondary, textAlign: 'center' }}>Sin alumnos en este curso</Text>
              </View>
            ) : students.map((student, idx) => {
              const avg = getAverage(student.id);
              const isEven = idx % 2 === 0;
              return (
                <View key={student.id} style={[styles.tableRow, isEven && styles.tableRowEven]}>
                  {/* Name cell */}
                  <View style={[styles.tableCell, styles.nameCell, { width: COL_NAME }]}>
                    <View style={styles.studentAvatar}>
                      <Text style={styles.studentAvatarText}>{student.name[0]}</Text>
                    </View>
                    <Text style={styles.studentNameCell} numberOfLines={2}>{student.name}</Text>
                  </View>

                  {/* Grade cells */}
                  {allEvals.map((evalName) => {
                    const g = getGrade(student.id, evalName);
                    return (
                      <Pressable
                        key={evalName}
                        style={[styles.tableCell, styles.gradeCell, { width: COL_GRADE }]}
                        onPress={() => openGradeModal(student.id, student.name, evalName)}
                      >
                        {g ? (
                          <View style={[styles.gradeBubble, { backgroundColor: getGradeColor(g.value) }]}>
                            <Text style={styles.gradeBubbleText}>{g.value}</Text>
                          </View>
                        ) : (
                          <View style={styles.emptyGradeCell}>
                            <Text style={styles.emptyGradeDash}>—</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}

                  {/* Spacer for add button column */}
                  <View style={[styles.tableCell, { width: COL_GRADE }]} />

                  {/* Average cell */}
                  <View style={[styles.tableCell, styles.avgCell, { width: COL_AVG }]}>
                    {avg !== null ? (
                      <View style={[styles.avgBubble, { backgroundColor: avg >= PASSING ? Colors.success : Colors.error }]}>
                        <Text style={styles.avgBubbleText}>{avg.toFixed(1)}</Text>
                      </View>
                    ) : (
                      <Text style={styles.emptyGradeDash}>—</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Grade entry modal */}
      {gradeModal && (
        <Modal visible transparent animationType="fade">
          <Pressable style={styles.overlay} onPress={() => setGradeModal(null)}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>{gradeModal.evalName}</Text>
              <Text style={styles.modalSubtitle}>{gradeModal.studentName}</Text>
              <RNTextInput
                style={styles.gradeInput}
                placeholder="Nota (0 – 10)"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="decimal-pad"
                value={gradeInput}
                onChangeText={setGradeInput}
                autoFocus
                selectTextOnFocus
              />
              <View style={styles.modalActions}>
                {gradeModal.existingGrade && (
                  <Pressable style={styles.deleteBtn} onPress={handleDeleteGrade}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error} />
                    <Text style={styles.deleteBtnText}>Eliminar</Text>
                  </Pressable>
                )}
                <Pressable style={styles.cancelBtn} onPress={() => setGradeModal(null)}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.saveBtn} onPress={handleSaveGrade}>
                  <Text style={styles.saveBtnText}>Guardar</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Add evaluation modal */}
      {addEvalModal && (
        <Modal visible transparent animationType="fade">
          <Pressable style={styles.overlay} onPress={() => setAddEvalModal(false)}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>
                Nueva {category === 'examen' ? 'evaluación' : 'entrega'}
              </Text>
              <RNTextInput
                style={styles.gradeInput}
                placeholder={category === 'examen' ? 'Ej: Examen 1' : 'Ej: TP 1'}
                placeholderTextColor={Colors.textSecondary}
                value={newEvalName}
                onChangeText={setNewEvalName}
                autoFocus
              />
              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setAddEvalModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.saveBtn, !newEvalName.trim() && { opacity: 0.5 }]}
                  onPress={handleAddEval}
                  disabled={!newEvalName.trim()}
                >
                  <Text style={styles.saveBtnText}>Agregar columna</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

// ─── Screen root ──────────────────────────────────────────────────────────────
export default function NotasScreen() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'alumno';
  const userId = user?.id ?? 'u1';

  return (
    <View style={styles.root}>
      {role === 'alumno' && <AlumnoView userId={userId} />}
      {role === 'padre' && <PadreView userId={userId} />}
      {role === 'docente' && <DocenteView />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },

  // ── Selector ──
  selectorSection: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 12 },
  selectorLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  chipsScroll: { paddingHorizontal: 12 },
  selectorBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 10, paddingHorizontal: 12 },
  selectorDivider: { width: 1, height: 24, backgroundColor: Colors.border, marginHorizontal: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.primary, marginRight: 8 },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF' },

  // ── Category tabs ──
  categoryTabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Colors.border },
  categoryTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  categoryTabActive: { borderBottomColor: Colors.primary },
  categoryTabText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  categoryTabTextActive: { color: Colors.primary, fontWeight: '700' },

  // ── Table ──
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#F0F4FF', borderBottomWidth: 1.5, borderBottomColor: Colors.border },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tableRowEven: { backgroundColor: '#FAFAFA' },
  tableCell: { justifyContent: 'center', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 6, minHeight: 52 },
  tableHeaderCell: { paddingVertical: 10 },
  tableHeaderText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  avgHeaderCell: { backgroundColor: Colors.primary + '10' },
  addEvalBtn: { justifyContent: 'center', alignItems: 'center' },
  nameCell: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 10, gap: 8 },
  gradeCell: {},
  avgCell: { backgroundColor: '#F0F4FF' },
  gradeBubble: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  gradeBubbleText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  avgBubble: { width: 44, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  avgBubbleText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  emptyGradeCell: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  emptyGradeDash: { fontSize: 18, color: Colors.border, fontWeight: '300' },
  studentAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  studentAvatarText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  studentNameCell: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary, flex: 1 },

  // ── Modals ──
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', maxWidth: 360 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
  gradeInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 24, fontWeight: '700', color: Colors.textPrimary,
    textAlign: 'center', marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: Colors.error },
  deleteBtnText: { fontSize: 13, color: Colors.error, fontWeight: '600' },
  cancelBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  saveBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center' },
  saveBtnText: { fontSize: 14, color: '#FFFFFF', fontWeight: '700' },

  // ── Alumno/Padre reused ──
  avgCard: { backgroundColor: Colors.primary, margin: 16, borderRadius: 16, padding: 20, alignItems: 'center' },
  avgLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  avgValue: { color: '#FFFFFF', fontSize: 42, fontWeight: '700', marginVertical: 4 },
  avgPeriod: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  list: { paddingHorizontal: 16 },
  subjectCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12 },
  subjectHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  subjectDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  subjectName: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  avgBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  avgBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  teacherName: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12, marginLeft: 20 },
  gradeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  gradeInfo: { flex: 1 },
  gradeDesc: { fontSize: 14, color: Colors.textPrimary },
  gradeDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  gradeValue: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  gradeValueText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  childBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary + '15', marginHorizontal: 16, marginTop: 12, marginBottom: 4, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  childBannerText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  emptyState: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32, gap: 10, flex: 1, justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  emptyBody: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});

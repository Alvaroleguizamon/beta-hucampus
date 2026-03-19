import React, { useState } from 'react';
import {
  StyleSheet, View, ScrollView, Pressable, TextInput as RNTextInput,
  Modal, ActivityIndicator, Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAdminStore, SUBJECT_COLORS } from '../../lib/stores/admin-store';
import { Colors } from '../../constants/colors';

// ─── Small reusable components ───────────────────────────────────────────────

function SectionHeader({ title, count, onAdd }: { title: string; count: number; onAdd: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{count}</Text>
      <View style={{ flex: 1 }} />
      <Pressable style={styles.addBtn} onPress={onAdd}>
        <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
        <Text style={styles.addBtnText}>Nuevo</Text>
      </Pressable>
    </View>
  );
}

// ─── Course Form Modal ────────────────────────────────────────────────────────

function CourseFormModal({
  visible, onClose, initial, onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initial?: { id: string; name: string; grade: string } | null;
  onSave: (name: string, grade: string) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [grade, setGrade] = useState(initial?.grade ?? '');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible) { setName(initial?.name ?? ''); setGrade(initial?.grade ?? ''); }
  }, [visible, initial]);

  const handleSave = async () => {
    if (!name.trim() || !grade.trim()) return;
    setSaving(true);
    await onSave(name.trim(), grade.trim());
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>{initial ? 'Editar curso' : 'Nuevo curso'}</Text>
          <Text style={styles.fieldLabel}>Nombre del curso</Text>
          <RNTextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: 3ro A"
            placeholderTextColor={Colors.textSecondary}
            autoFocus
          />
          <Text style={styles.fieldLabel}>Año / División</Text>
          <RNTextInput
            style={styles.input}
            value={grade}
            onChangeText={setGrade}
            placeholder="Ej: 3er Año"
            placeholderTextColor={Colors.textSecondary}
          />
          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.saveBtn, (!name.trim() || !grade.trim()) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving || !name.trim() || !grade.trim()}
            >
              {saving ? <ActivityIndicator size={16} color="#FFF" /> : <Text style={styles.saveBtnText}>Guardar</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Subject Form Modal ───────────────────────────────────────────────────────

function SubjectFormModal({
  visible, onClose, initial, onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initial?: { id: string; name: string; color: string } | null;
  onSave: (name: string, color: string) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? SUBJECT_COLORS[0]);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible) { setName(initial?.name ?? ''); setColor(initial?.color ?? SUBJECT_COLORS[0]); }
  }, [visible, initial]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name.trim(), color);
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>{initial ? 'Editar materia' : 'Nueva materia'}</Text>
          <Text style={styles.fieldLabel}>Nombre</Text>
          <RNTextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Matemática"
            placeholderTextColor={Colors.textSecondary}
            autoFocus
          />
          <Text style={styles.fieldLabel}>Color</Text>
          <View style={styles.colorGrid}>
            {SUBJECT_COLORS.map((c) => (
              <Pressable
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
                onPress={() => setColor(c)}
              >
                {color === c && <MaterialCommunityIcons name="check" size={14} color="#FFF" />}
              </Pressable>
            ))}
          </View>
          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving || !name.trim()}
            >
              {saving ? <ActivityIndicator size={16} color="#FFF" /> : <Text style={styles.saveBtnText}>Guardar</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminScreen() {
  const { courses, subjects, loading, createCourse, updateCourse, deleteCourse, createSubject, updateSubject, deleteSubject } = useAdminStore();

  const [courseModal, setCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<{ id: string; name: string; grade: string } | null>(null);
  const [subjectModal, setSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<{ id: string; name: string; color: string } | null>(null);

  const handleDeleteCourse = (id: string, name: string) => {
    Alert.alert('Eliminar curso', `¿Eliminar "${name}"? Se borrarán sus horarios y matrículas.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteCourse(id) },
    ]);
  };

  const handleDeleteSubject = (id: string, name: string) => {
    Alert.alert('Eliminar materia', `¿Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteSubject(id) },
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="shield-crown" size={22} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.headerTitle}>Administración</Text>
          <Text style={styles.headerSubtitle}>{courses.length} cursos · {subjects.length} materias</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{courses.length}</Text>
          <Text style={styles.statLabel}>Cursos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{subjects.length}</Text>
          <Text style={styles.statLabel}>Materias</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{courses.reduce((s, c) => s + c.students.length, 0)}</Text>
          <Text style={styles.statLabel}>Alumnos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{courses.reduce((s, c) => s + c.schedules.length, 0)}</Text>
          <Text style={styles.statLabel}>Bloques</Text>
        </View>
      </View>

      {/* ── Courses ── */}
      <SectionHeader
        title="Cursos"
        count={courses.length}
        onAdd={() => { setEditingCourse(null); setCourseModal(true); }}
      />

      {courses.length === 0 && (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="google-classroom" size={36} color={Colors.border} />
          <Text style={styles.emptyText}>Sin cursos. Creá el primero.</Text>
        </View>
      )}

      {courses.map((course) => (
        <Pressable
          key={course.id}
          style={styles.card}
          onPress={() => router.push(`/admin/${course.id}` as any)}
        >
          <View style={styles.cardLeft}>
            <View style={styles.courseIcon}>
              <MaterialCommunityIcons name="google-classroom" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>{course.name}</Text>
              <Text style={styles.cardMeta}>
                {course.grade} · {course.students.length} alumnos · {course.schedules.length} bloques horarios
              </Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <Pressable
              style={styles.iconBtn}
              onPress={(e) => { e.stopPropagation(); setEditingCourse({ id: course.id, name: course.name, grade: course.grade }); setCourseModal(true); }}
            >
              <MaterialCommunityIcons name="pencil-outline" size={18} color={Colors.textSecondary} />
            </Pressable>
            <Pressable
              style={styles.iconBtn}
              onPress={(e) => { e.stopPropagation(); handleDeleteCourse(course.id, course.name); }}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error} />
            </Pressable>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.border} />
          </View>
        </Pressable>
      ))}

      {/* ── Subjects ── */}
      <View style={{ height: 24 }} />
      <SectionHeader
        title="Materias"
        count={subjects.length}
        onAdd={() => { setEditingSubject(null); setSubjectModal(true); }}
      />

      {subjects.length === 0 && (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="book-open-variant" size={36} color={Colors.border} />
          <Text style={styles.emptyText}>Sin materias. Creá la primera.</Text>
        </View>
      )}

      {subjects.map((subject) => (
        <View key={subject.id} style={styles.card}>
          <View style={styles.cardLeft}>
            <View style={[styles.subjectDot, { backgroundColor: subject.color }]} />
            <Text style={styles.cardTitle}>{subject.name}</Text>
          </View>
          <View style={styles.cardActions}>
            <Pressable
              style={styles.iconBtn}
              onPress={() => { setEditingSubject(subject); setSubjectModal(true); }}
            >
              <MaterialCommunityIcons name="pencil-outline" size={18} color={Colors.textSecondary} />
            </Pressable>
            <Pressable
              style={styles.iconBtn}
              onPress={() => handleDeleteSubject(subject.id, subject.name)}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error} />
            </Pressable>
          </View>
        </View>
      ))}

      <View style={{ height: 40 }} />

      {/* Modals */}
      <CourseFormModal
        visible={courseModal}
        onClose={() => setCourseModal(false)}
        initial={editingCourse}
        onSave={async (name, grade) => {
          if (editingCourse) await updateCourse(editingCourse.id, name, grade);
          else await createCourse(name, grade);
        }}
      />
      <SubjectFormModal
        visible={subjectModal}
        onClose={() => setSubjectModal(false)}
        initial={editingSubject}
        onSave={async (name, color) => {
          if (editingSubject) await updateSubject(editingSubject.id, name, color);
          else await createSubject(name, color);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  headerIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  headerSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 1 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statNumber: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  sectionCount: { fontSize: 13, color: Colors.textSecondary, backgroundColor: Colors.border, paddingHorizontal: 7, paddingVertical: 1, borderRadius: 10 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  cardMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { padding: 6, borderRadius: 8 },

  courseIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: `${Colors.primary}15`, justifyContent: 'center', alignItems: 'center' },
  subjectDot: { width: 14, height: 14, borderRadius: 7 },

  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 32, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: Colors.border, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modal: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: Colors.textPrimary, marginBottom: 16 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  colorDot: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  colorDotSelected: { borderWidth: 3, borderColor: 'rgba(0,0,0,0.3)' },
  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border },
  cancelBtnText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.primary },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
});

import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView, Alert, Modal, Platform, useWindowDimensions } from 'react-native';
import { Text, TextInput, IconButton, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Colors } from '../../constants/colors';
import { mockSubjects, mockClassmates, mockCourses } from '../../lib/mock-data';
import { useAuthStore } from '../../lib/stores/auth-store';

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
  subjectColor: string;
  teacher: string;
  dueDate: string;
  status: 'pendiente' | 'entregado';
  priority: 'alta' | 'media' | 'baja';
  grupal: boolean;
  integrantes?: string[];
  description?: string;
  submission?: {
    type: 'texto' | 'archivo';
    content: string;
    date: string;
  };
}

const initialTasks: Task[] = [
  { id: 't1', title: 'Resolver ejercicios pág. 45-48', subject: 'Matemática', subjectColor: '#5B77D3', teacher: 'Prof. García', dueDate: '2026-03-20', status: 'pendiente', priority: 'alta', grupal: false, description: 'Resolver todos los ejercicios de las páginas 45 a 48. Mostrar procedimiento completo.' },
  { id: 't2', title: 'Leer capítulo 5 - Revolución de Mayo', subject: 'Historia', subjectColor: '#FF9800', teacher: 'Prof. López', dueDate: '2026-03-21', status: 'pendiente', priority: 'media', grupal: false, description: 'Leer el capítulo 5 del manual y responder las preguntas de la página 120.' },
  { id: 't3', title: 'Trabajo práctico grupal - Análisis literario', subject: 'Lengua', subjectColor: '#0693E3', teacher: 'Prof. Martínez', dueDate: '2026-03-25', status: 'pendiente', priority: 'alta', grupal: true, integrantes: ['Lucía Gómez', 'Martín Ruiz', 'Sofía Díaz'], description: 'Elegir una obra del siglo XIX y realizar análisis de personajes, contexto histórico y estilo narrativo. Extensión: 3 a 5 páginas.' },
  { id: 't4', title: 'Preparar herbario - 10 especies', subject: 'Biología', subjectColor: '#4CAF50', teacher: 'Prof. Fernández', dueDate: '2026-03-28', status: 'pendiente', priority: 'media', grupal: true, integrantes: ['Tomás López'], description: 'Recolectar y clasificar 10 especies de plantas. Presentar en carpeta con foto, nombre común y nombre científico.' },
  { id: 't5', title: 'Reading comprehension Unit 3', subject: 'Inglés', subjectColor: '#9C27B0', teacher: 'Prof. Rodríguez', dueDate: '2026-03-22', status: 'entregado', priority: 'baja', grupal: false, description: 'Complete reading comprehension exercises from Unit 3, pages 30-35.', submission: { type: 'texto', content: 'Ejercicios resueltos y enviados por la plataforma.', date: '2026-03-19' } },
  { id: 't6', title: 'Estudiar para parcial', subject: 'Matemática', subjectColor: '#5B77D3', teacher: 'Prof. García', dueDate: '2026-03-20', status: 'pendiente', priority: 'alta', grupal: false, description: 'Estudiar unidades 1 a 3 para el parcial. Revisar guía de ejercicios y apuntes de clase.' },
];

// ─── Docente types & mock data ───
interface StudentDelivery {
  studentId: string;
  studentName: string;
  status: 'pendiente' | 'entregado';
  submissionDate?: string;
  submissionContent?: string;
}

interface DocenteTask {
  id: string;
  title: string;
  courseId: string;
  dueDate: string;
  priority: 'alta' | 'media' | 'baja';
  description?: string;
  deliveries: StudentDelivery[];
}

const initialDocenteTasks: DocenteTask[] = [
  {
    id: 'dt1', title: 'Resolver ejercicios pág. 45-48', courseId: 'c1', dueDate: '2026-03-20', priority: 'alta',
    description: 'Resolver todos los ejercicios de las páginas 45 a 48. Mostrar procedimiento completo.',
    deliveries: [
      { studentId: 'st1', studentName: 'Juan Pérez', status: 'entregado', submissionDate: '2026-03-18', submissionContent: 'Ejercicios resueltos.' },
      { studentId: 'st2', studentName: 'María González', status: 'entregado', submissionDate: '2026-03-19', submissionContent: 'Adjunto PDF con resolución.' },
      { studentId: 'st3', studentName: 'Lucas Rodríguez', status: 'pendiente' },
      { studentId: 'st4', studentName: 'Sofía Martínez', status: 'pendiente' },
      { studentId: 'st5', studentName: 'Mateo López', status: 'entregado', submissionDate: '2026-03-17', submissionContent: 'Resuelto completo.' },
    ],
  },
  {
    id: 'dt2', title: 'Estudiar para parcial - Unidades 1-3', courseId: 'c1', dueDate: '2026-03-25', priority: 'media',
    description: 'Estudiar unidades 1 a 3 para el parcial.',
    deliveries: [
      { studentId: 'st1', studentName: 'Juan Pérez', status: 'pendiente' },
      { studentId: 'st2', studentName: 'María González', status: 'pendiente' },
      { studentId: 'st3', studentName: 'Lucas Rodríguez', status: 'pendiente' },
      { studentId: 'st4', studentName: 'Sofía Martínez', status: 'pendiente' },
      { studentId: 'st5', studentName: 'Mateo López', status: 'pendiente' },
    ],
  },
  {
    id: 'dt3', title: 'Trabajo práctico - Ecuaciones', courseId: 'c2', dueDate: '2026-03-22', priority: 'alta',
    description: 'Resolver guía de ecuaciones cuadráticas.',
    deliveries: [
      { studentId: 'st6', studentName: 'Valentina Díaz', status: 'entregado', submissionDate: '2026-03-20', submissionContent: 'Guía resuelta.' },
      { studentId: 'st7', studentName: 'Tomás Fernández', status: 'pendiente' },
      { studentId: 'st8', studentName: 'Camila Ruiz', status: 'entregado', submissionDate: '2026-03-21', submissionContent: 'Adjunto archivo.' },
    ],
  },
  {
    id: 'dt4', title: 'Ejercicios de repaso', courseId: 'c2', dueDate: '2026-03-28', priority: 'baja',
    description: 'Completar ejercicios de repaso del cuadernillo.',
    deliveries: [
      { studentId: 'st6', studentName: 'Valentina Díaz', status: 'pendiente' },
      { studentId: 'st7', studentName: 'Tomás Fernández', status: 'pendiente' },
      { studentId: 'st8', studentName: 'Camila Ruiz', status: 'pendiente' },
    ],
  },
];

const priorityConfig = {
  alta: { color: Colors.error, label: 'Alta' },
  media: { color: Colors.warning, label: 'Media' },
  baja: { color: Colors.success, label: 'Baja' },
};

const courseClassmates = mockClassmates.filter((c) => c.grade === '3ro A');

// ─── Helper functions ───
const formatDate = (dateStr: string) => {
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
};

const getDaysLeft = (dateStr: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00:00');
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { text: 'Vencida', color: Colors.error };
  if (diff === 0) return { text: 'Hoy', color: Colors.error };
  if (diff === 1) return { text: 'Mañana', color: Colors.warning };
  return { text: `${diff} días`, color: Colors.textSecondary };
};

export default function TareasScreen() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 768;
  const role = useAuthStore((s) => s.user?.role ?? 'alumno');
  const isReadOnly = role === 'padre';

  // ─── Docente state ───
  const [docenteTasks, setDocenteTasks] = useState(initialDocenteTasks);
  const [selectedCourseId, setSelectedCourseId] = useState(mockCourses[0]?.id ?? '');
  const [studentFilter, setStudentFilter] = useState<string | null>(null);
  const [selectedDocenteTask, setSelectedDocenteTask] = useState<DocenteTask | null>(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [docenteMobileTab, setDocenteMobileTab] = useState<'tareas' | 'organizador'>('tareas');
  const [showDocenteAddModal, setShowDocenteAddModal] = useState(false);

  // Draft state
  interface DraftTask {
    id: string;
    title: string;
    courseId: string;
    dueDate: string;
    priority: 'alta' | 'media' | 'baja';
    description: string;
  }
  const [drafts, setDrafts] = useState<DraftTask[]>([
    { id: 'draft1', title: 'Ejercicios de funciones', courseId: 'c1', dueDate: '2026-04-01', priority: 'media', description: 'Resolver ejercicios 1 a 15 de la guía de funciones lineales.' },
  ]);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCourseId, setDraftCourseId] = useState(mockCourses[0]?.id ?? '');
  const [draftDueDate, setDraftDueDate] = useState('');
  const [draftPriority, setDraftPriority] = useState<'alta' | 'media' | 'baja'>('media');
  const [draftDescription, setDraftDescription] = useState('');
  const [showDraftCalendar, setShowDraftCalendar] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState<string | null>(null);

  // ─── Docente view ───
  if (role === 'docente') {
    const courseTasks = docenteTasks.filter((t) => t.courseId === selectedCourseId);
    const selectedCourse = mockCourses.find((c) => c.id === selectedCourseId);
    const courseStudents = selectedCourse?.students ?? [];

    const filteredCourseTasks = studentFilter
      ? courseTasks.map((t) => ({
          ...t,
          deliveries: t.deliveries.filter((d) => d.studentId === studentFilter),
        }))
      : courseTasks;

    // Detail view for a docente task
    if (selectedDocenteTask) {
      const freshDT = docenteTasks.find((t) => t.id === selectedDocenteTask.id) ?? selectedDocenteTask;
      const totalStudents = freshDT.deliveries.length;
      const deliveredCount = freshDT.deliveries.filter((d) => d.status === 'entregado').length;
      const pendingCount = totalStudents - deliveredCount;
      const pCfg = priorityConfig[freshDT.priority];
      const daysLeft = getDaysLeft(freshDT.dueDate);

      return (
        <View style={styles.container}>
          <Pressable style={styles.backRow} onPress={() => setSelectedDocenteTask(null)}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.primary} />
            <Text style={styles.backText}>Atrás</Text>
          </Pressable>

          <ScrollView contentContainerStyle={[styles.detailContent, isWide && { maxWidth: 900, alignSelf: 'center', width: '100%', paddingTop: 32 }]}>
            <View style={styles.detailStatusRow}>
              <View style={[styles.priorityBadge, { backgroundColor: pCfg.color + '15', borderColor: pCfg.color }]}>
                <View style={[styles.priorityDotSmall, { backgroundColor: pCfg.color }]} />
                <Text style={[styles.priorityBadgeText, { color: pCfg.color }]}>Prioridad {pCfg.label}</Text>
              </View>
            </View>

            <Text style={styles.detailTitle}>{freshDT.title}</Text>
            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 16 }}>
              {selectedCourse?.name} — {selectedCourse?.grade}
            </Text>

            <View style={styles.detailInfoCard}>
              <View style={styles.detailInfoRow}>
                <MaterialCommunityIcons name="calendar" size={18} color={Colors.textSecondary} />
                <Text style={styles.detailInfoLabel}>Fecha de entrega</Text>
                <Text style={styles.detailInfoValue}>{formatDate(freshDT.dueDate)}</Text>
              </View>
              <View style={styles.detailInfoRow}>
                <MaterialCommunityIcons name="clock-outline" size={18} color={daysLeft.color} />
                <Text style={styles.detailInfoLabel}>Tiempo restante</Text>
                <Text style={[styles.detailInfoValue, { color: daysLeft.color, fontWeight: '600' }]}>{daysLeft.text}</Text>
              </View>
              <View style={styles.detailInfoRow}>
                <MaterialCommunityIcons name="account-group" size={18} color={Colors.primary} />
                <Text style={styles.detailInfoLabel}>Entregas</Text>
                <Text style={[styles.detailInfoValue, { color: Colors.primary, fontWeight: '600' }]}>{deliveredCount}/{totalStudents}</Text>
              </View>
            </View>

            {freshDT.description && (
              <View style={styles.descriptionCard}>
                <Text style={styles.descriptionTitle}>Consigna</Text>
                <Text style={styles.descriptionText}>{freshDT.description}</Text>
              </View>
            )}

            {/* Summary bar */}
            <View style={docenteStyles.summaryBar}>
              <View style={docenteStyles.summaryItem}>
                <Text style={[docenteStyles.summaryNumber, { color: Colors.success }]}>{deliveredCount}</Text>
                <Text style={docenteStyles.summaryLabel}>Entregaron</Text>
              </View>
              <View style={docenteStyles.summaryDivider} />
              <View style={docenteStyles.summaryItem}>
                <Text style={[docenteStyles.summaryNumber, { color: Colors.warning }]}>{pendingCount}</Text>
                <Text style={docenteStyles.summaryLabel}>Pendientes</Text>
              </View>
            </View>

            {/* Deliveries list */}
            <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 }}>Estado por alumno</Text>
            {freshDT.deliveries.map((d) => (
              <View key={d.studentId} style={docenteStyles.deliveryRow}>
                <View style={docenteStyles.deliveryAvatar}>
                  <Text style={docenteStyles.deliveryAvatarText}>{d.studentName[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={docenteStyles.deliveryName}>{d.studentName}</Text>
                  {d.status === 'entregado' && d.submissionDate && (
                    <Text style={docenteStyles.deliveryDate}>Entregado el {formatDate(d.submissionDate)}</Text>
                  )}
                  {d.status === 'entregado' && d.submissionContent && (
                    <Text style={docenteStyles.deliveryContent} numberOfLines={2}>{d.submissionContent}</Text>
                  )}
                </View>
                <View style={[docenteStyles.deliveryBadge, d.status === 'entregado' ? docenteStyles.deliveryBadgeDone : docenteStyles.deliveryBadgePending]}>
                  <MaterialCommunityIcons
                    name={d.status === 'entregado' ? 'check-circle' : 'clock-outline'}
                    size={14}
                    color={d.status === 'entregado' ? Colors.success : Colors.warning}
                  />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: d.status === 'entregado' ? Colors.success : Colors.warning }}>
                    {d.status === 'entregado' ? 'Entregado' : 'Pendiente'}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }

    // ─── Docente main list ───
    const renderCourseTabs = () => (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, flexShrink: 0 }} contentContainerStyle={docenteStyles.courseTabs}>
        {mockCourses.map((c) => {
          const active = selectedCourseId === c.id;
          return (
            <Pressable
              key={c.id}
              style={[docenteStyles.courseTab, active && docenteStyles.courseTabActive]}
              onPress={() => { setSelectedCourseId(c.id); setStudentFilter(null); setShowStudentDropdown(false); setStudentSearch(''); }}
            >
              <Text style={[docenteStyles.courseTabText, active && docenteStyles.courseTabTextActive]}>
                {c.name} — {c.grade}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );

    const filteredStudents = useMemo(() => {
      if (!studentSearch.trim()) return courseStudents;
      const q = studentSearch.toLowerCase();
      return courseStudents.filter((s) => s.name.toLowerCase().includes(q));
    }, [studentSearch, courseStudents]);

    const renderStudentFilter = () => {
      const selectedStudent = courseStudents.find((s) => s.id === studentFilter);

      return (
        <View style={docenteStyles.searchContainer}>
          {/* Selected student chip */}
          {studentFilter && selectedStudent && (
            <View style={docenteStyles.selectedStudentRow}>
              <View style={docenteStyles.selectedStudentChip}>
                <View style={docenteStyles.studentAvatar}>
                  <Text style={docenteStyles.studentAvatarText}>{selectedStudent.name[0]}</Text>
                </View>
                <Text style={docenteStyles.selectedStudentName}>{selectedStudent.name}</Text>
                <Pressable onPress={() => { setStudentFilter(null); setStudentSearch(''); }} hitSlop={8}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={Colors.textSecondary} />
                </Pressable>
              </View>
            </View>
          )}

          {/* Search input */}
          {!studentFilter && (
            <View style={docenteStyles.searchInputWrapper}>
              <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
              <TextInput
                placeholder="Buscar alumno..."
                placeholderTextColor={Colors.textSecondary}
                value={studentSearch}
                onChangeText={(text) => { setStudentSearch(text); setShowStudentDropdown(true); }}
                onFocus={() => setShowStudentDropdown(true)}
                style={docenteStyles.searchTextInput}
                dense
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
              />
              {studentSearch.length > 0 && (
                <Pressable onPress={() => setStudentSearch('')} hitSlop={8}>
                  <MaterialCommunityIcons name="close" size={18} color={Colors.textSecondary} />
                </Pressable>
              )}
            </View>
          )}

          {/* Dropdown results */}
          {!studentFilter && showStudentDropdown && (
            <View style={docenteStyles.searchDropdown}>
              <Pressable
                style={[styles.dropdownItem, !studentFilter && styles.dropdownItemActive]}
                onPress={() => { setStudentFilter(null); setShowStudentDropdown(false); setStudentSearch(''); }}
              >
                <MaterialCommunityIcons name="account-group" size={16} color={Colors.primary} />
                <Text style={[styles.dropdownItemText, { color: Colors.primary, fontWeight: '600' }]}>Todos los alumnos</Text>
              </Pressable>
              {filteredStudents.map((s) => (
                <Pressable
                  key={s.id}
                  style={styles.dropdownItem}
                  onPress={() => { setStudentFilter(s.id); setShowStudentDropdown(false); setStudentSearch(''); }}
                >
                  <View style={docenteStyles.studentAvatar}>
                    <Text style={docenteStyles.studentAvatarText}>{s.name[0]}</Text>
                  </View>
                  <Text style={styles.dropdownItemText}>{s.name}</Text>
                </Pressable>
              ))}
              {filteredStudents.length === 0 && (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: Colors.textSecondary }}>No se encontraron alumnos</Text>
                </View>
              )}
            </View>
          )}
        </View>
      );
    };

    const renderDocenteTaskList = () => (
      <FlatList
        data={filteredCourseTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const pCfg = priorityConfig[item.priority];
          const daysLeft = getDaysLeft(item.dueDate);
          const totalD = item.deliveries.length;
          const doneD = item.deliveries.filter((d) => d.status === 'entregado').length;
          return (
            <Pressable style={styles.taskRow} onPress={() => setSelectedDocenteTask(docenteTasks.find((t) => t.id === item.id) ?? item)}>
              <View style={[styles.taskStatusIcon, doneD === totalD ? styles.taskStatusDone : styles.taskStatusPending]}>
                <MaterialCommunityIcons
                  name={doneD === totalD ? 'check-all' : 'clipboard-text-outline'}
                  size={16}
                  color={doneD === totalD ? Colors.success : Colors.warning}
                />
              </View>
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <View style={styles.taskMeta}>
                  <Text style={[styles.taskDateText, { color: daysLeft.color }]}>{daysLeft.text}</Text>
                  <Text style={docenteStyles.deliveryCount}>{doneD}/{totalD} entregas</Text>
                </View>
              </View>
              <View style={styles.taskRight}>
                <View style={[styles.priorityDot, { backgroundColor: pCfg.color }]} />
                <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textSecondary} />
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No hay tareas asignadas</Text>
          </View>
        }
      />
    );

    // ─── Docente draft helpers ───
    const resetDraftForm = () => {
      setDraftTitle('');
      setDraftCourseId(mockCourses[0]?.id ?? '');
      setDraftDueDate('');
      setDraftPriority('media');
      setDraftDescription('');
      setShowDraftCalendar(false);
    };

    const saveDraft = () => {
      if (!draftTitle.trim()) return;
      setDrafts((prev) => [{
        id: `draft${Date.now()}`,
        title: draftTitle,
        courseId: draftCourseId,
        dueDate: draftDueDate || new Date().toISOString().split('T')[0],
        priority: draftPriority,
        description: draftDescription,
      }, ...prev]);
      resetDraftForm();
      setShowDocenteAddModal(false);
    };

    const sendDraft = (draftId: string) => {
      const draft = drafts.find((d) => d.id === draftId);
      if (!draft) return;
      const course = mockCourses.find((c) => c.id === draft.courseId);
      if (!course) return;

      const newTask: DocenteTask = {
        id: `dt${Date.now()}`,
        title: draft.title,
        courseId: draft.courseId,
        dueDate: draft.dueDate,
        priority: draft.priority,
        description: draft.description || undefined,
        deliveries: course.students.map((s) => ({
          studentId: s.id,
          studentName: s.name,
          status: 'pendiente' as const,
        })),
      };

      setDocenteTasks((prev) => [newTask, ...prev]);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      setShowSendConfirm(null);
      Alert.alert('Tarea enviada', `La tarea fue asignada a ${course.students.length} alumnos de ${course.name} — ${course.grade}.`);
    };

    const deleteDraft = (draftId: string) => {
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    };

    // ─── Docente organizer panel ───
    const renderDocenteOrganizer = () => (
      <View style={{ flex: 1 }}>
        <ScrollView style={isWide ? styles.sidebarScroll : styles.mobileOrgScroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.orgContent}>
          <Text style={styles.orgSectionTitle}>Borradores</Text>
          {drafts.length === 0 ? (
            <View style={styles.orgEmpty}>
              <MaterialCommunityIcons name="file-edit-outline" size={32} color={Colors.border} />
              <Text style={styles.orgEmptyText}>No tenés borradores</Text>
            </View>
          ) : (
            drafts.map((draft) => {
              const course = mockCourses.find((c) => c.id === draft.courseId);
              const dl = getDaysLeft(draft.dueDate);
              return (
                <View key={draft.id} style={docenteStyles.draftCard}>
                  <View style={docenteStyles.draftHeader}>
                    <View style={docenteStyles.draftBadge}>
                      <MaterialCommunityIcons name="file-edit-outline" size={12} color={Colors.warning} />
                      <Text style={docenteStyles.draftBadgeText}>Borrador</Text>
                    </View>
                    <Pressable onPress={() => deleteDraft(draft.id)} hitSlop={8}>
                      <MaterialCommunityIcons name="close" size={18} color={Colors.textSecondary} />
                    </Pressable>
                  </View>
                  <Text style={docenteStyles.draftTitle} numberOfLines={2}>{draft.title}</Text>
                  <Text style={docenteStyles.draftMeta}>{course?.name} — {course?.grade}</Text>
                  <View style={docenteStyles.draftFooter}>
                    <Text style={[docenteStyles.draftDate, { color: dl.color }]}>{formatDate(draft.dueDate)} · {dl.text}</Text>
                    <Pressable style={docenteStyles.sendBtn} onPress={() => setShowSendConfirm(draft.id)}>
                      <MaterialCommunityIcons name="send" size={14} color="#FFFFFF" />
                      <Text style={docenteStyles.sendBtnText}>Enviar</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <Pressable style={styles.fab} onPress={() => setShowDocenteAddModal(true)}>
          <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
        </Pressable>

        {/* Send confirm modal */}
        <Modal visible={showSendConfirm !== null} transparent animationType="fade">
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmCard}>
              <MaterialCommunityIcons name="send-circle-outline" size={48} color={Colors.primary} />
              <Text style={styles.confirmTitle}>Enviar tarea</Text>
              <Text style={styles.confirmBody}>
                {(() => {
                  const draft = drafts.find((d) => d.id === showSendConfirm);
                  const course = mockCourses.find((c) => c.id === draft?.courseId);
                  return draft ? `"${draft.title}" será asignada a todos los alumnos de ${course?.name} — ${course?.grade}.` : '';
                })()}
              </Text>
              <View style={styles.confirmButtons}>
                <Pressable style={styles.confirmCancel} onPress={() => setShowSendConfirm(null)}>
                  <Text style={styles.confirmCancelText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.confirmOk} onPress={() => showSendConfirm && sendDraft(showSendConfirm)}>
                  <Text style={styles.confirmOkText}>Enviar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );

    // ─── Docente add draft modal ───
    const renderDocenteAddModal = () => (
      <Modal visible={showDocenteAddModal} transparent animationType="fade">
        <View style={styles.addModalOverlay}>
          <View style={[styles.addModalCard, isWide && { maxWidth: 520 }]}>
            <View style={styles.addHeader}>
              <Text style={styles.addTitle}>Nueva tarea (borrador)</Text>
              <IconButton icon="close" iconColor={Colors.textSecondary} size={20} onPress={() => { resetDraftForm(); setShowDocenteAddModal(false); }} />
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" style={styles.addModalScroll}>
              <TextInput
                label="Título de la tarea"
                value={draftTitle}
                onChangeText={setDraftTitle}
                mode="outlined"
                dense
                style={styles.formInput}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
                autoFocus
              />

              <TextInput
                label="Consigna (opcional)"
                value={draftDescription}
                onChangeText={setDraftDescription}
                mode="outlined"
                dense
                multiline
                numberOfLines={3}
                style={styles.formInput}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
              />

              <Text style={styles.formLabel}>Curso</Text>
              <View style={styles.subjectSelectList}>
                {mockCourses.map((c) => {
                  const selected = draftCourseId === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      style={[styles.subjectSelectRow, selected && { backgroundColor: Colors.primary + '10', borderColor: Colors.primary }]}
                      onPress={() => setDraftCourseId(c.id)}
                    >
                      <MaterialCommunityIcons name="google-classroom" size={16} color={selected ? Colors.primary : Colors.textSecondary} style={{ marginRight: 8 }} />
                      <Text style={[styles.subjectSelectText, selected && { color: Colors.primary, fontWeight: '600' }]}>{c.name} — {c.grade}</Text>
                      {selected && <MaterialCommunityIcons name="check" size={18} color={Colors.primary} />}
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.formLabel}>Fecha de entrega</Text>
              <Pressable style={styles.datePickerBtn} onPress={() => setShowDraftCalendar(!showDraftCalendar)}>
                <MaterialCommunityIcons name="calendar" size={20} color={Colors.primary} />
                <Text style={[styles.datePickerText, !draftDueDate && { color: Colors.textSecondary }]}>
                  {draftDueDate ? formatDate(draftDueDate) : 'Seleccionar fecha'}
                </Text>
                <MaterialCommunityIcons name={showDraftCalendar ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textSecondary} />
              </Pressable>
              {showDraftCalendar && (
                <Calendar
                  onDayPress={(day: { dateString: string }) => {
                    setDraftDueDate(day.dateString);
                    setShowDraftCalendar(false);
                  }}
                  markedDates={draftDueDate ? { [draftDueDate]: { selected: true, selectedColor: Colors.primary } } : {}}
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

              <Text style={styles.formLabel}>Prioridad</Text>
              <View style={styles.priorityRow}>
                {(['baja', 'media', 'alta'] as const).map((p) => {
                  const cfg = priorityConfig[p];
                  const selected = draftPriority === p;
                  return (
                    <Pressable
                      key={p}
                      style={[styles.priorityOption, selected && { backgroundColor: cfg.color + '20', borderColor: cfg.color }]}
                      onPress={() => setDraftPriority(p)}
                    >
                      <View style={[styles.priorityDotForm, { backgroundColor: cfg.color }]} />
                      <Text style={[styles.priorityOptionText, selected && { color: cfg.color, fontWeight: '600' }]}>{cfg.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable style={[styles.submitFormBtn, !draftTitle.trim() && styles.submitFormBtnDisabled]} onPress={saveDraft}>
                <MaterialCommunityIcons name="content-save-outline" size={20} color="#FFFFFF" />
                <Text style={styles.submitFormBtnText}>Guardar borrador</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );

    // ─── Docente main view with tasks list ───
    const renderDocenteMain = () => (
      <View style={{ flex: 1 }}>
        {renderCourseTabs()}
        <View style={docenteStyles.docenteStatsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{courseTasks.length}</Text>
            <Text style={styles.statLabel}>Tareas asignadas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>{courseStudents.length}</Text>
            <Text style={styles.statLabel}>Alumnos</Text>
          </View>
        </View>
        {renderStudentFilter()}
        {renderDocenteTaskList()}
      </View>
    );

    // ─── WIDE LAYOUT (web) ───
    if (isWide) {
      return (
        <View style={styles.wideContainer}>
          <View style={styles.mainPanel}>
            {renderDocenteMain()}
          </View>
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <MaterialCommunityIcons name="file-edit-outline" size={22} color={Colors.primary} />
              <Text style={styles.sidebarTitle}>Organizador personal</Text>
            </View>
            {renderDocenteOrganizer()}
          </View>
          {renderDocenteAddModal()}
        </View>
      );
    }

    // ─── MOBILE LAYOUT ───
    return (
      <View style={styles.container}>
        <View style={styles.mobileTabBar}>
          <Pressable
            style={[styles.mobileTabBtn, docenteMobileTab === 'tareas' && styles.mobileTabBtnActive]}
            onPress={() => setDocenteMobileTab('tareas')}
          >
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={20}
              color={docenteMobileTab === 'tareas' ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.mobileTabText, docenteMobileTab === 'tareas' && styles.mobileTabTextActive]}>Tareas</Text>
          </Pressable>
          <Pressable
            style={[styles.mobileTabBtn, docenteMobileTab === 'organizador' && styles.mobileTabBtnActive]}
            onPress={() => setDocenteMobileTab('organizador')}
          >
            <MaterialCommunityIcons
              name="file-edit-outline"
              size={20}
              color={docenteMobileTab === 'organizador' ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.mobileTabText, docenteMobileTab === 'organizador' && styles.mobileTabTextActive]}>Organizador</Text>
          </Pressable>
        </View>

        {docenteMobileTab === 'tareas' ? renderDocenteMain() : renderDocenteOrganizer()}
        {renderDocenteAddModal()}
      </View>
    );
  }

  const [tasks, setTasks] = useState(initialTasks);
  const [statusFilter, setStatusFilter] = useState<'todas' | 'pendientes' | 'entregadas'>('pendientes');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [mobileTab, setMobileTab] = useState<'tareas' | 'organizador'>('tareas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  // Submission state
  const [submissionText, setSubmissionText] = useState('');
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Add form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'alta' | 'media' | 'baja'>('media');
  const [newGrupal, setNewGrupal] = useState(false);
  const [newDescription, setNewDescription] = useState('');
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

  const resetForm = () => {
    setNewTitle('');
    setNewSubject('');
    setNewDueDate('');
    setNewPriority('media');
    setNewGrupal(false);
    setNewDescription('');
    setSelectedClassmates([]);
    setClassmateSearch('');
    setShowCalendar(false);
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    const subjectData = mockSubjects.find((s) => s.name === newSubject);
    const integrantes = newGrupal && selectedClassmates.length > 0 ? selectedClassmates : undefined;

    setTasks((prev) => [{
      id: `t${Date.now()}`,
      title: newTitle,
      subject: newSubject || 'General',
      subjectColor: subjectData?.color ?? Colors.textSecondary,
      teacher: subjectData?.teacher ?? '',
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      status: 'pendiente',
      priority: newPriority,
      grupal: newGrupal,
      integrantes,
      description: newDescription || undefined,
    }, ...prev]);

    if (integrantes && integrantes.length > 0) {
      Alert.alert(
        'Tarea compartida',
        `Se envió una notificación a ${integrantes.join(', ')} para que confirmen agregar esta tarea.`,
        [{ text: 'OK' }],
      );
    }

    resetForm();
    setShowAddModal(false);
    if (!isWide) setMobileTab('tareas');
  };

  const handleSubmit = () => {
    if (!selectedTask || !submissionText.trim()) return;
    setShowSubmitConfirm(true);
  };

  const confirmSubmission = () => {
    if (!selectedTask) return;
    const today = new Date().toISOString().split('T')[0];
    setTasks((prev) => prev.map((t) =>
      t.id === selectedTask.id
        ? { ...t, status: 'entregado' as const, submission: { type: 'texto' as const, content: submissionText, date: today } }
        : t
    ));
    setSelectedTask({ ...selectedTask, status: 'entregado', submission: { type: 'texto', content: submissionText, date: today } });
    setSubmissionText('');
    setShowSubmitConfirm(false);
    const teacherMsg = selectedTask.teacher ? ` a ${selectedTask.teacher}` : '';
    Alert.alert('Entrega confirmada', `Tu tarea fue enviada${teacherMsg} correctamente.`);
  };

  const handleAttachFile = () => {
    if (!selectedTask) return;
    const today = new Date().toISOString().split('T')[0];
    Alert.alert(
      'Adjuntar archivo',
      'Seleccioná el archivo a entregar',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Simular adjunto',
          onPress: () => {
            setTasks((prev) => prev.map((t) =>
              t.id === selectedTask.id
                ? { ...t, status: 'entregado' as const, submission: { type: 'archivo' as const, content: 'Tarea_TP.pdf', date: today } }
                : t
            ));
            setSelectedTask({ ...selectedTask, status: 'entregado', submission: { type: 'archivo', content: 'Tarea_TP.pdf', date: today } });
            const tMsg = selectedTask.teacher ? ` a ${selectedTask.teacher}` : '';
            Alert.alert('Entrega confirmada', `Tu archivo fue enviado${tMsg} correctamente.`);
          },
        },
      ],
    );
  };

  const filtered = useMemo(() => {
    let result = tasks;
    if (statusFilter === 'pendientes') result = result.filter((t) => t.status === 'pendiente');
    if (statusFilter === 'entregadas') result = result.filter((t) => t.status === 'entregado');
    if (subjectFilter) result = result.filter((t) => t.subject === subjectFilter);
    return result.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, statusFilter, subjectFilter]);

  const pending = tasks.filter((t) => t.status === 'pendiente').length;
  const delivered = tasks.filter((t) => t.status === 'entregado').length;

  const taskSubjects = useMemo(() => {
    const unique = [...new Set(tasks.map((t) => t.subject))];
    return unique.map((name) => {
      const s = mockSubjects.find((ms) => ms.name === name);
      return { name, color: s?.color ?? Colors.textSecondary };
    });
  }, [tasks]);

  // Upcoming deadlines for organizer
  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'pendiente')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);
  }, [tasks]);

  // ─── Task Detail View ───
  if (selectedTask) {
    const pCfg = priorityConfig[selectedTask.priority];
    const daysLeft = getDaysLeft(selectedTask.dueDate);
    const freshTask = tasks.find((t) => t.id === selectedTask.id) ?? selectedTask;

    return (
      <View style={styles.container}>
        <Pressable style={styles.backRow} onPress={() => { setSelectedTask(null); setSubmissionText(''); }}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Atrás</Text>
        </Pressable>

        <ScrollView contentContainerStyle={[styles.detailContent, isWide && { maxWidth: 900, alignSelf: 'center', width: '100%', paddingTop: 32 }]}>
          <View style={styles.detailStatusRow}>
            <View style={[styles.statusBadge, freshTask.status === 'entregado' ? styles.statusEntregado : styles.statusPendiente]}>
              <MaterialCommunityIcons
                name={freshTask.status === 'entregado' ? 'check-circle' : 'clock-outline'}
                size={16}
                color={freshTask.status === 'entregado' ? Colors.success : Colors.warning}
              />
              <Text style={[styles.statusBadgeText, { color: freshTask.status === 'entregado' ? Colors.success : Colors.warning }]}>
                {freshTask.status === 'entregado' ? 'Entregado' : 'Pendiente'}
              </Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: pCfg.color + '15', borderColor: pCfg.color }]}>
              <View style={[styles.priorityDotSmall, { backgroundColor: pCfg.color }]} />
              <Text style={[styles.priorityBadgeText, { color: pCfg.color }]}>{pCfg.label}</Text>
            </View>
          </View>

          <Text style={styles.detailTitle}>{freshTask.title}</Text>
          <View style={[styles.subjectTag, { backgroundColor: freshTask.subjectColor + '15' }]}>
            <MaterialCommunityIcons name="book-open-variant" size={14} color={freshTask.subjectColor} />
            <Text style={[styles.subjectTagText, { color: freshTask.subjectColor }]}>{freshTask.subject}</Text>
          </View>

          <View style={styles.detailInfoCard}>
            {freshTask.teacher ? (
              <View style={styles.detailInfoRow}>
                <MaterialCommunityIcons name="account-tie" size={18} color={Colors.primary} />
                <Text style={styles.detailInfoLabel}>Profesor/a</Text>
                <Text style={[styles.detailInfoValue, { color: Colors.primary }]}>{freshTask.teacher}</Text>
              </View>
            ) : null}
            <View style={styles.detailInfoRow}>
              <MaterialCommunityIcons name="calendar" size={18} color={Colors.textSecondary} />
              <Text style={styles.detailInfoLabel}>Fecha de entrega</Text>
              <Text style={styles.detailInfoValue}>{formatDate(freshTask.dueDate)}</Text>
            </View>
            {freshTask.status === 'pendiente' && (
              <View style={styles.detailInfoRow}>
                <MaterialCommunityIcons name="clock-outline" size={18} color={daysLeft.color} />
                <Text style={styles.detailInfoLabel}>Tiempo restante</Text>
                <Text style={[styles.detailInfoValue, { color: daysLeft.color, fontWeight: '600' }]}>{daysLeft.text}</Text>
              </View>
            )}
            {freshTask.grupal && (
              <View style={styles.detailInfoRow}>
                <MaterialCommunityIcons name="account-group" size={18} color={Colors.accent} />
                <Text style={styles.detailInfoLabel}>Grupal</Text>
                <Text style={styles.detailInfoValue}>{freshTask.integrantes?.join(', ')}</Text>
              </View>
            )}
          </View>

          {freshTask.description && (
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionTitle}>Consigna</Text>
              <Text style={styles.descriptionText}>{freshTask.description}</Text>
            </View>
          )}

          {freshTask.status === 'entregado' && freshTask.submission && (
            <View style={styles.submissionCard}>
              <View style={styles.submissionHeader}>
                <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
                <Text style={styles.submissionTitle}>Tu entrega</Text>
                <Text style={styles.submissionDate}>{formatDate(freshTask.submission.date)}</Text>
              </View>
              {freshTask.submission.type === 'texto' ? (
                <Text style={styles.submissionContent}>{freshTask.submission.content}</Text>
              ) : (
                <View style={styles.fileRow}>
                  <MaterialCommunityIcons name="file-pdf-box" size={24} color="#E74C3C" />
                  <Text style={styles.fileName}>{freshTask.submission.content}</Text>
                </View>
              )}
            </View>
          )}

          {!isReadOnly && freshTask.status === 'pendiente' && (
            <View style={styles.submitSection}>
              <Text style={styles.submitSectionTitle}>Entregar tarea</Text>
              <TextInput
                label="Escribí tu respuesta o comentario"
                value={submissionText}
                onChangeText={setSubmissionText}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.submissionInput}
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
              />
              <View style={styles.submitButtons}>
                <Pressable style={styles.attachBtn} onPress={handleAttachFile}>
                  <MaterialCommunityIcons name="paperclip" size={20} color={Colors.primary} />
                  <Text style={styles.attachBtnText}>Adjuntar archivo</Text>
                </Pressable>
                <Pressable
                  style={[styles.deliverBtn, !submissionText.trim() && styles.deliverBtnDisabled]}
                  onPress={handleSubmit}
                >
                  <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
                  <Text style={styles.deliverBtnText}>Entregar</Text>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>

        <Modal visible={showSubmitConfirm} transparent animationType="fade">
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmCard}>
              <MaterialCommunityIcons name="help-circle-outline" size={48} color={Colors.primary} />
              <Text style={styles.confirmTitle}>Confirmar entrega</Text>
              <Text style={styles.confirmBody}>
                {selectedTask?.teacher
                  ? `Tu tarea será enviada a ${selectedTask.teacher}. Una vez entregada no podrás modificarla.`
                  : '¿Estás seguro de que querés entregar esta tarea? Una vez entregada no podrás modificarla.'}
              </Text>
              <View style={styles.confirmButtons}>
                <Pressable style={styles.confirmCancel} onPress={() => setShowSubmitConfirm(false)}>
                  <Text style={styles.confirmCancelText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.confirmOk} onPress={confirmSubmission}>
                  <Text style={styles.confirmOkText}>Confirmar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ─── Organizer panel (shared between sidebar & mobile tab) ───
  const renderOrganizer = () => (
    <View style={{ flex: 1 }}>
      <ScrollView style={isWide ? styles.sidebarScroll : styles.mobileOrgScroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.orgContent}>
        {/* Upcoming deadlines */}
        <Text style={styles.orgSectionTitle}>Próximas entregas</Text>
        {upcomingDeadlines.length === 0 ? (
          <View style={styles.orgEmpty}>
            <MaterialCommunityIcons name="check-all" size={32} color={Colors.border} />
            <Text style={styles.orgEmptyText}>Sin tareas pendientes</Text>
          </View>
        ) : (
          upcomingDeadlines.map((t) => {
            const dl = getDaysLeft(t.dueDate);
            return (
              <Pressable key={t.id} style={styles.orgDeadlineRow} onPress={() => { setSelectedTask(t); if (!isWide) setMobileTab('tareas'); }}>
                <View style={[styles.orgDeadlineDot, { backgroundColor: t.subjectColor }]} />
                <View style={styles.orgDeadlineInfo}>
                  <Text style={styles.orgDeadlineTitle} numberOfLines={1}>{t.title}</Text>
                  <Text style={styles.orgDeadlineSubject}>{t.subject}</Text>
                </View>
                <View style={styles.orgDeadlineRight}>
                  <Text style={[styles.orgDeadlineDate, { color: dl.color }]}>{dl.text}</Text>
                  <Text style={styles.orgDeadlineDateFull}>{formatDate(t.dueDate)}</Text>
                </View>
              </Pressable>
            );
          })
        )}

      </ScrollView>

      {/* FAB to add task */}
      <Pressable style={styles.fab} onPress={() => setShowAddModal(true)}>
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );

  // ─── Add task modal ───
  const renderAddModal = () => (
    <Modal visible={showAddModal} transparent animationType="fade">
      <View style={styles.addModalOverlay}>
        <View style={[styles.addModalCard, isWide && { maxWidth: 520 }]}>
          <View style={styles.addHeader}>
            <Text style={styles.addTitle}>Nueva tarea</Text>
            <IconButton icon="close" iconColor={Colors.textSecondary} size={20} onPress={() => { resetForm(); setShowAddModal(false); }} />
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" style={styles.addModalScroll}>
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

            <TextInput
              label="Descripción (opcional)"
              value={newDescription}
              onChangeText={setNewDescription}
              mode="outlined"
              dense
              multiline
              numberOfLines={2}
              style={styles.formInput}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.primary}
            />

            <Text style={styles.formLabel}>Materia</Text>
            <View style={styles.subjectSelectList}>
              {mockSubjects.map((s) => {
                const selected = newSubject === s.name;
                return (
                  <Pressable
                    key={s.id}
                    style={[styles.subjectSelectRow, selected && { backgroundColor: s.color + '10', borderColor: s.color }]}
                    onPress={() => setNewSubject(selected ? '' : s.name)}
                  >
                    <View style={[styles.subjectSelectDot, { backgroundColor: s.color }]} />
                    <Text style={[styles.subjectSelectText, selected && { color: s.color, fontWeight: '600' }]}>{s.name}</Text>
                    {selected && <MaterialCommunityIcons name="check" size={18} color={s.color} />}
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.formLabel}>Fecha de entrega</Text>
            <Pressable style={styles.datePickerBtn} onPress={() => setShowCalendar(!showCalendar)}>
              <MaterialCommunityIcons name="calendar" size={20} color={Colors.primary} />
              <Text style={[styles.datePickerText, !newDueDate && { color: Colors.textSecondary }]}>
                {newDueDate ? formatDate(newDueDate) : 'Seleccionar fecha'}
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

            <Pressable style={styles.grupalToggle} onPress={() => setNewGrupal(!newGrupal)}>
              <MaterialCommunityIcons
                name={newGrupal ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={newGrupal ? Colors.primary : Colors.textSecondary}
              />
              <Text style={styles.grupalToggleText}>Es trabajo grupal</Text>
            </Pressable>

            {newGrupal && (
              <View>
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

            <Pressable style={[styles.submitFormBtn, !newTitle.trim() && styles.submitFormBtnDisabled]} onPress={addTask}>
              <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
              <Text style={styles.submitFormBtnText}>
                {newGrupal && selectedClassmates.length > 0 ? 'Crear y notificar' : 'Agregar tarea'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ─── Task list panel ───
  const renderTaskList = () => (
    <View style={styles.taskListContainer}>
      {/* Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{pending}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.success }]}>{delivered}</Text>
          <Text style={styles.statLabel}>Entregadas</Text>
        </View>
      </View>

      {/* Status filters */}
      <View style={styles.filters}>
        {(['pendientes', 'entregadas', 'todas'] as const).map((f) => (
          <Chip
            key={f}
            selected={statusFilter === f}
            onPress={() => setStatusFilter(f)}
            style={[styles.chip, statusFilter === f && styles.chipActive]}
            textStyle={[styles.chipText, statusFilter === f && styles.chipTextActive]}
            showSelectedCheck={false}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </View>

      {/* Subject filter */}
      {isWide ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScrollOuter} contentContainerStyle={styles.subjectFilters}>
          <Pressable
            style={[styles.subjectFilterChip, !subjectFilter && styles.subjectFilterActive]}
            onPress={() => setSubjectFilter(null)}
          >
            <Text style={[styles.subjectFilterText, !subjectFilter && styles.subjectFilterTextActive]}>Todas</Text>
          </Pressable>
          {taskSubjects.map((s) => {
            const active = subjectFilter === s.name;
            return (
              <Pressable
                key={s.name}
                style={[styles.subjectFilterChip, active && { backgroundColor: s.color + '15', borderColor: s.color }]}
                onPress={() => setSubjectFilter(active ? null : s.name)}
              >
                <View style={[styles.subjectDot, { backgroundColor: s.color }]} />
                <Text style={[styles.subjectFilterText, active && { color: s.color, fontWeight: '500' }]}>{s.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.dropdownContainer}>
          <Pressable style={styles.dropdownBtn} onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}>
            {subjectFilter ? (
              <>
                <View style={[styles.subjectDot, { backgroundColor: taskSubjects.find((s) => s.name === subjectFilter)?.color }]} />
                <Text style={[styles.dropdownBtnText, { color: taskSubjects.find((s) => s.name === subjectFilter)?.color }]}>{subjectFilter}</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="book-open-variant" size={16} color={Colors.textSecondary} />
                <Text style={styles.dropdownBtnText}>Todas las materias</Text>
              </>
            )}
            <MaterialCommunityIcons name={showSubjectDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textSecondary} />
          </Pressable>
          {showSubjectDropdown && (
            <View style={styles.dropdownList}>
              <Pressable
                style={[styles.dropdownItem, !subjectFilter && styles.dropdownItemActive]}
                onPress={() => { setSubjectFilter(null); setShowSubjectDropdown(false); }}
              >
                <Text style={[styles.dropdownItemText, !subjectFilter && { color: Colors.primary, fontWeight: '600' }]}>Todas las materias</Text>
                {!subjectFilter && <MaterialCommunityIcons name="check" size={16} color={Colors.primary} />}
              </Pressable>
              {taskSubjects.map((s) => {
                const active = subjectFilter === s.name;
                return (
                  <Pressable
                    key={s.name}
                    style={[styles.dropdownItem, active && { backgroundColor: s.color + '08' }]}
                    onPress={() => { setSubjectFilter(active ? null : s.name); setShowSubjectDropdown(false); }}
                  >
                    <View style={[styles.subjectDot, { backgroundColor: s.color }]} />
                    <Text style={[styles.dropdownItemText, active && { color: s.color, fontWeight: '600' }]}>{s.name}</Text>
                    {active && <MaterialCommunityIcons name="check" size={16} color={s.color} />}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const pCfg = priorityConfig[item.priority];
          const daysLeft = getDaysLeft(item.dueDate);
          return (
            <Pressable style={styles.taskRow} onPress={() => setSelectedTask(item)}>
              <View style={[styles.taskStatusIcon, item.status === 'entregado' ? styles.taskStatusDone : styles.taskStatusPending]}>
                <MaterialCommunityIcons
                  name={item.status === 'entregado' ? 'check' : 'clock-outline'}
                  size={16}
                  color={item.status === 'entregado' ? Colors.success : Colors.warning}
                />
              </View>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, item.status === 'entregado' && styles.taskDone]}>{item.title}</Text>
                <View style={styles.taskMeta}>
                  <View style={[styles.taskSubjectTag, { backgroundColor: item.subjectColor + '15' }]}>
                    <Text style={[styles.taskSubjectText, { color: item.subjectColor }]}>{item.subject}</Text>
                  </View>
                  {item.teacher ? <Text style={styles.taskTeacher}>{item.teacher}</Text> : null}
                  <Text style={[styles.taskDateText, { color: daysLeft.color }]}>
                    {item.status === 'pendiente' ? daysLeft.text : `Entregado ${formatDate(item.submission?.date ?? item.dueDate)}`}
                  </Text>
                </View>
                {item.grupal && (
                  <View style={styles.grupalRow}>
                    <MaterialCommunityIcons name="account-group" size={14} color={Colors.accent} />
                    <Text style={styles.grupalText}>Grupal · {item.integrantes?.length ?? 0} integrantes</Text>
                  </View>
                )}
              </View>
              <View style={styles.taskRight}>
                <View style={[styles.priorityDot, { backgroundColor: pCfg.color }]} />
                <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textSecondary} />
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="checkbox-marked-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No hay tareas{statusFilter !== 'todas' ? ` ${statusFilter}` : ''}</Text>
          </View>
        }
      />
    </View>
  );

  // ─── WIDE LAYOUT (web) ───
  if (isWide) {
    return (
      <View style={styles.wideContainer}>
        <View style={styles.mainPanel}>
          {renderTaskList()}
        </View>
        {!isReadOnly && (
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <MaterialCommunityIcons name="calendar-check" size={22} color={Colors.primary} />
              <Text style={styles.sidebarTitle}>Organizador personal</Text>
            </View>
            {renderOrganizer()}
          </View>
        )}
        {!isReadOnly && renderAddModal()}
      </View>
    );
  }

  // ─── MOBILE LAYOUT (tabs) ───
  return (
    <View style={styles.container}>
      {!isReadOnly && (
        <View style={styles.mobileTabBar}>
          <Pressable
            style={[styles.mobileTabBtn, mobileTab === 'tareas' && styles.mobileTabBtnActive]}
            onPress={() => setMobileTab('tareas')}
          >
            <MaterialCommunityIcons
              name="format-list-checks"
              size={20}
              color={mobileTab === 'tareas' ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.mobileTabText, mobileTab === 'tareas' && styles.mobileTabTextActive]}>Mis tareas</Text>
          </Pressable>
          <Pressable
            style={[styles.mobileTabBtn, mobileTab === 'organizador' && styles.mobileTabBtnActive]}
            onPress={() => setMobileTab('organizador')}
          >
            <MaterialCommunityIcons
              name="calendar-check"
              size={20}
              color={mobileTab === 'organizador' ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.mobileTabText, mobileTab === 'organizador' && styles.mobileTabTextActive]}>Organizador</Text>
          </Pressable>
        </View>
      )}

      {isReadOnly || mobileTab === 'tareas' ? renderTaskList() : renderOrganizer()}
      {!isReadOnly && renderAddModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  taskListContainer: { flex: 1 },

  // ─── Wide layout ───
  wideContainer: { flex: 1, flexDirection: 'row', backgroundColor: Colors.background },
  mainPanel: { flex: 1 },
  sidebar: {
    width: 360,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    height: 72,
  },
  sidebarTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  sidebarScroll: { flex: 1 },

  // ─── Mobile tabs ───
  mobileTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mobileTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  mobileTabBtnActive: { borderBottomColor: Colors.primary },
  mobileTabText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  mobileTabTextActive: { color: Colors.primary, fontWeight: '600' },
  mobileOrgScroll: { flex: 1 },

  // ─── Organizer ───
  orgContent: { padding: 20, paddingBottom: 40 },
  orgSectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  orgEmpty: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  orgEmptyText: { fontSize: 13, color: Colors.textSecondary },
  orgDeadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  orgDeadlineDot: { width: 6, height: 6, borderRadius: 3, marginRight: 10 },
  orgDeadlineInfo: { flex: 1, marginRight: 10 },
  orgDeadlineTitle: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  orgDeadlineSubject: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  orgDeadlineRight: { alignItems: 'flex-end' },
  orgDeadlineDate: { fontSize: 13, fontWeight: '600' },
  orgDeadlineDateFull: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  orgDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 20 },
  orgSubjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 2,
  },
  orgSubjectDot: { width: 6, height: 6, borderRadius: 3, marginRight: 10 },
  orgSubjectName: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  orgSubjectCount: { fontSize: 12 },

  // ─── Stats ───
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    height: 72,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },

  // ─── Filters ───
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  chip: { backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { color: Colors.textSecondary },
  chipTextActive: { color: '#FFFFFF' },
  subjectScrollOuter: { flexGrow: 0, flexShrink: 0 },
  subjectFilters: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20, gap: 6, alignItems: 'center' },
  subjectFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  subjectFilterActive: { backgroundColor: Colors.primary + '15', borderColor: Colors.primary },
  subjectFilterText: { fontSize: 12, color: Colors.textSecondary },
  subjectFilterTextActive: { color: Colors.primary, fontWeight: '500' },
  subjectDot: { width: 6, height: 6, borderRadius: 3 },

  // ─── Mobile dropdown ───
  dropdownContainer: { paddingHorizontal: 16, paddingBottom: 10, zIndex: 10 },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  dropdownBtnText: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    marginTop: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemActive: { backgroundColor: Colors.primary + '08' },
  dropdownItemText: { flex: 1, fontSize: 14, color: Colors.textPrimary },

  // ─── Task list ───
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    padding: 14,
    minHeight: 76,
  },
  taskStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskStatusDone: { backgroundColor: Colors.success + '15' },
  taskStatusPending: { backgroundColor: Colors.warning + '15' },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  taskDone: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  taskSubjectTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  taskSubjectText: { fontSize: 11, fontWeight: '600' },
  taskTeacher: { fontSize: 11, color: Colors.textSecondary },
  taskDateText: { fontSize: 12 },
  grupalRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  grupalText: { fontSize: 11, color: Colors.accent, fontWeight: '500' },
  taskRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: 15 },

  // ─── Detail view ───
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF' },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '500' },
  detailContent: { padding: 16 },
  detailStatusRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusEntregado: { backgroundColor: Colors.success + '15' },
  statusPendiente: { backgroundColor: Colors.warning + '15' },
  statusBadgeText: { fontSize: 13, fontWeight: '600' },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  priorityDotSmall: { width: 8, height: 8, borderRadius: 4 },
  priorityBadgeText: { fontSize: 13, fontWeight: '500' },
  detailTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 16,
  },
  subjectTagText: { fontSize: 14, fontWeight: '600' },
  detailInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    gap: 14,
  },
  detailInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailInfoLabel: { flex: 1, fontSize: 14, color: Colors.textSecondary },
  detailInfoValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  descriptionTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  descriptionText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  submissionCard: {
    backgroundColor: Colors.success + '08',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.success + '30',
    marginBottom: 16,
  },
  submissionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  submissionTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.success },
  submissionDate: { fontSize: 12, color: Colors.textSecondary },
  submissionContent: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fileName: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  submitSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
  },
  submitSectionTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 12 },
  submissionInput: { backgroundColor: '#FFFFFF', marginBottom: 12 },
  submitButtons: { flexDirection: 'row', gap: 10 },
  attachBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
  },
  attachBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  deliverBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  deliverBtnDisabled: { opacity: 0.5 },
  deliverBtnText: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },

  // ─── Confirm modal ───
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  confirmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  confirmTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginTop: 12 },
  confirmBody: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginTop: 8, marginBottom: 20 },
  confirmButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  confirmCancelText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  confirmOk: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmOkText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },

  // ─── Add modal ───
  addModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  addHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  addModalScroll: { padding: 20 },
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

  // ─── Form shared ───
  formInput: { backgroundColor: '#FFFFFF', marginBottom: 12 },
  formLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  subjectSelectList: { marginBottom: 12, gap: 4 },
  subjectSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  subjectSelectDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  subjectSelectText: { flex: 1, fontSize: 14, color: Colors.textPrimary },
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
  grupalToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  grupalToggleText: { fontSize: 14, color: Colors.textPrimary },
  selectedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  selectedChip: { backgroundColor: Colors.primary + '15' },
  selectedChipText: { fontSize: 12, color: Colors.primary },
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
  submitFormBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  submitFormBtnDisabled: { opacity: 0.5 },
  submitFormBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});

// ─── Docente-specific styles ───
const docenteStyles = StyleSheet.create({
  courseTabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  courseTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  courseTabActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  courseTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  courseTabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  docenteStatsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    height: 72,
  },
  deliveryCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNumber: { fontSize: 28, fontWeight: '700' },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: Colors.border },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  deliveryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  deliveryName: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  deliveryDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  deliveryContent: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontStyle: 'italic' },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 8,
  },
  deliveryBadgeDone: { backgroundColor: Colors.success + '15' },
  deliveryBadgePending: { backgroundColor: Colors.warning + '15' },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 10,
  },
  selectedStudentRow: {
    paddingTop: 10,
  },
  selectedStudentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '12',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  selectedStudentName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    marginTop: 10,
  },
  searchTextInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 14,
    height: 40,
  },
  searchDropdown: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    marginTop: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    maxHeight: 280,
  },
  studentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  draftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  draftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  draftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  draftBadgeText: { fontSize: 10, fontWeight: '600', color: Colors.warning },
  draftTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  draftMeta: { fontSize: 12, color: Colors.textSecondary, marginBottom: 10 },
  draftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  draftDate: { fontSize: 12, fontWeight: '500' },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  sendBtnText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
});

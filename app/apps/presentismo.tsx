import React, { useMemo, useState } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView, TextInput } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useAttendanceStore } from '../../lib/stores/attendance-store';
import { useCoursesStore } from '../../lib/stores/courses-store';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../lib/stores/auth-store';
import { AttendanceRecord } from '../../lib/types';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

type AttendanceStatus = 'presente' | 'ausente' | 'tardanza';
type StatusFilter = 'todos' | AttendanceStatus;

const statusConfig: Record<AttendanceStatus, { color: string; label: string }> = {
  presente: { color: Colors.present, label: 'Presente' },
  tardanza: { color: Colors.late,    label: 'Tardanza' },
  ausente:  { color: Colors.absent,  label: 'Ausente'  },
};

const TODAY = new Date().toISOString().split('T')[0];

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

function formatDateWithDay(dateStr: string) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${days[date.getDay()]} · ${formatDate(dateStr)}`;
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

// ─── Historial desplegable ────────────────────────────────────────────────────

function StudentHistory({ studentId, courseId }: { studentId: string; courseId: string }) {
  const attendance = useAttendanceStore((s) => s.records);
  const history = attendance
    .filter((a) => a.studentId === studentId && a.courseId === courseId)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (history.length === 0) {
    return (
      <View style={styles.historyEmpty}>
        <Text style={styles.historyEmptyText}>Sin registros anteriores</Text>
      </View>
    );
  }

  return (
    <View style={styles.historyContainer}>
      {history.map((record) => {
        const cfg = statusConfig[record.status];
        return (
          <View key={record.id} style={styles.historyRow}>
            <Text style={styles.historyDate}>{formatDateWithDay(record.date)}</Text>
            <Text style={styles.historyTime}>{record.checkInTime ?? '—'}</Text>
            <View style={[styles.historyBadge, { backgroundColor: cfg.color }]}>
              <Text style={styles.historyBadgeText}>{cfg.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Card de alumno ───────────────────────────────────────────────────────────

type StudentEntry = { id: string; name: string; record: AttendanceRecord | undefined };

type StudentCardProps = {
  entry: StudentEntry;
  override: AttendanceStatus | null;
  onOverride: (studentId: string, status: AttendanceStatus | null) => void;
  courseId: string;
};

function StudentCard({ entry, override, onOverride, courseId }: StudentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const kioskStatus: AttendanceStatus = entry.record?.status ?? 'ausente';
  const status: AttendanceStatus = override ?? kioskStatus;
  const cfg = statusConfig[status];
  const isModified = override !== null && override !== kioskStatus;

  return (
    <View style={styles.card}>
      <Pressable style={styles.cardRow} onPress={() => setExpanded((v) => !v)}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: cfg.color + '22' }]}>
          <Text style={[styles.avatarText, { color: cfg.color }]}>{initials(entry.name)}</Text>
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{entry.name}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardTime}>
              {entry.record?.checkInTime ? `${entry.record.checkInTime} hs` : 'Sin fichaje'}
            </Text>
            {isModified && <Text style={styles.modifiedTag}>✏ Modificado</Text>}
          </View>
        </View>

        {/* Dot de estado */}
        <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
      </Pressable>

      {expanded && (
        <>
          {/* Modificar marcaje */}
          <View style={styles.editSection}>
            <Text style={styles.editTitle}>Modificar marcaje</Text>
            <View style={styles.editButtons}>
              {(['presente', 'tardanza', 'ausente'] as AttendanceStatus[]).map((s) => (
                <Pressable
                  key={s}
                  style={[
                    styles.editBtn,
                    { borderColor: statusConfig[s].color },
                    override === s && { backgroundColor: statusConfig[s].color },
                  ]}
                  onPress={() => onOverride(entry.id, override === s ? null : s)}
                >
                  <Text style={[styles.editBtnText, { color: override === s ? '#FFFFFF' : statusConfig[s].color }]}>
                    {statusConfig[s].label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {isModified && (
              <Pressable onPress={() => onOverride(entry.id, null)}>
                <Text style={styles.revertText}>Revertir al marcaje original</Text>
              </Pressable>
            )}
          </View>

          <StudentHistory studentId={entry.id} courseId={courseId} />
        </>
      )}
    </View>
  );
}

// ─── Vista Docente ────────────────────────────────────────────────────────────

function DocenteView() {
  const courses = useCoursesStore((s) => s.courses);
  const attendance = useAttendanceStore((s) => s.records);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, AttendanceStatus | null>>({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('todos');

  const course = courses.find((c) => c.id === selectedCourseId) ?? courses[0];;

  const handleOverride = (studentId: string, status: AttendanceStatus | null) => {
    setOverrides((prev) => ({ ...prev, [studentId]: status }));
  };

  const entries: StudentEntry[] = useMemo(() => {
    return course.students.map((s) => ({
      id: s.id,
      name: s.name,
      record: attendance.find(
        (a) => a.studentId === s.id && a.courseId === selectedCourseId && a.date === selectedDate
      ),
    }));
  }, [selectedCourseId, selectedDate]);

  const effectiveStatus = (e: StudentEntry): AttendanceStatus =>
    overrides[e.id] ?? e.record?.status ?? 'ausente';

  const summary = useMemo(() => ({
    presente: entries.filter((e) => effectiveStatus(e) === 'presente').length,
    tardanza: entries.filter((e) => effectiveStatus(e) === 'tardanza').length,
    ausente:  entries.filter((e) => effectiveStatus(e) === 'ausente').length,
  }), [entries, overrides]);

  const visibleEntries = useMemo(() => {
    let list = entries;
    if (filter !== 'todos') list = list.filter((e) => effectiveStatus(e) === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }
    return list;
  }, [entries, filter, search, overrides]);

  const markedDates = useMemo(() => ({
    [selectedDate]: { selected: true, selectedColor: Colors.primary },
  }), [selectedDate]);

  const filterLabels: Record<StatusFilter, string> = {
    todos: 'Todos',
    presente: 'Presentes',
    tardanza: 'Tardanzas',
    ausente: 'Ausentes',
  };

  return (
    <View style={styles.container}>

      {/* Filtro de cursos */}
      <View style={styles.courseFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {courses.map((c) => (
            <Pressable
              key={c.id}
              style={[styles.courseChip, selectedCourseId === c.id && styles.courseChipActive]}
              onPress={() => { setSelectedCourseId(c.id); setOverrides({}); }}
            >
              <Text style={[styles.courseChipText, selectedCourseId === c.id && styles.courseChipTextActive]}>
                {c.grade} — {c.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Selector de fecha */}
      <Pressable style={styles.dateBar} onPress={() => setCalendarOpen((v) => !v)}>
        <View style={styles.dateBarLeft}>
          <Text style={styles.dateBarIcon}>📅</Text>
          <Text style={styles.dateText}>
            {selectedDate === TODAY ? `Hoy · ${formatDate(selectedDate)}` : formatDate(selectedDate)}
          </Text>
        </View>
        <Text style={styles.dateChevron}>{calendarOpen ? '▲' : '▼'}</Text>
      </Pressable>

      {calendarOpen && (
        <Calendar
          current={selectedDate}
          markedDates={markedDates}
          onDayPress={(day: { dateString: string }) => { setSelectedDate(day.dateString); setCalendarOpen(false); }}
          theme={{
            calendarBackground: '#FFFFFF',
            todayTextColor: Colors.primary,
            dayTextColor: Colors.textPrimary,
            textDisabledColor: '#D9D9D9',
            arrowColor: Colors.primary,
            monthTextColor: Colors.textPrimary,
            textMonthFontWeight: '600',
          }}
          style={styles.inlineCalendar}
        />
      )}

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.present }]}>{summary.presente}</Text>
          <Text style={styles.statLabel}>Presentes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.late }]}>{summary.tardanza}</Text>
          <Text style={styles.statLabel}>Tardanzas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.absent }]}>{summary.ausente}</Text>
          <Text style={styles.statLabel}>Ausentes</Text>
        </View>
      </View>

      {/* Filtros de estado */}
      <View style={styles.filters}>
        {(['todos', 'presente', 'tardanza', 'ausente'] as StatusFilter[]).map((f) => (
          <Chip
            key={f}
            selected={filter === f}
            onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && styles.chipActive]}
            textStyle={[styles.chipText, filter === f && styles.chipTextActive]}
            showSelectedCheck={false}
          >
            {filterLabels[f]}
          </Chip>
        ))}
      </View>

      {/* Buscador */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar alumno..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Lista de cards */}
      <FlatList
        data={visibleEntries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <Text style={styles.kioskNote}>Fichajes vía Humand Kiosk</Text>
        }
        renderItem={({ item }) => (
          <StudentCard
            entry={item}
            override={overrides[item.id] ?? null}
            onOverride={handleOverride}
            courseId={selectedCourseId}
          />
        )}
      />
    </View>
  );
}

// ─── Vista Alumno/Padre ───────────────────────────────────────────────────────

function AlumnoView() {
  const allRecords = useAttendanceStore((s) => s.records);
  const records = allRecords.filter((a) => a.studentId === 'st1');
  const present  = records.filter((a) => a.status === 'presente').length;
  const absent   = records.filter((a) => a.status === 'ausente').length;
  const late     = records.filter((a) => a.status === 'tardanza').length;
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
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.primary }]}>{percentage}%</Text>
          <Text style={styles.statLabel}>Asistencia</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.present }]}>{present}</Text>
          <Text style={styles.statLabel}>Presentes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.late }]}>{late}</Text>
          <Text style={styles.statLabel}>Tardanzas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.absent }]}>{absent}</Text>
          <Text style={styles.statLabel}>Ausentes</Text>
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

      <View style={styles.legend}>
        {(['presente', 'tardanza', 'ausente'] as AttendanceStatus[]).map((s) => (
          <View key={s} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: statusConfig[s].color }]} />
            <Text style={styles.legendText}>{statusConfig[s].label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.recentTitle}>Últimos fichajes</Text>
      <FlatList
        data={records.filter((r) => r.status !== 'ausente').sort((a, b) => b.date.localeCompare(a.date))}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.recentList}
        renderItem={({ item }) => {
          const cfg = statusConfig[item.status];
          return (
            <View style={styles.recentRow}>
              <View>
                <Text style={styles.recentDate}>{formatDate(item.date)}</Text>
                {item.checkInTime && <Text style={styles.recentTime}>{item.checkInTime} hs</Text>}
              </View>
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

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function PresentismoScreen() {
  const role = useAuthStore((s) => s.user?.role);
  return role === 'docente' ? <DocenteView /> : <AlumnoView />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Filtro de cursos
  courseFilterContainer: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  courseChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.primary, marginRight: 8 },
  courseChipActive: { backgroundColor: Colors.primary },
  courseChipText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  courseChipTextActive: { color: '#FFFFFF' },

  // Selector de fecha
  dateBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Colors.border },
  dateBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBarIcon: { fontSize: 16 },
  dateText: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  dateChevron: { fontSize: 11, color: Colors.textSecondary },
  inlineCalendar: { borderBottomWidth: 1, borderBottomColor: Colors.border },

  // Stats bar (igual que tareas)
  statsBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },

  // Filtros de estado (igual que tareas)
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  chip: { backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: 13 },
  chipTextActive: { color: '#FFFFFF' },

  // Buscador
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginVertical: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, padding: 0 },

  // Lista
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  kioskNote: { textAlign: 'center', fontSize: 12, color: Colors.textSecondary, marginTop: 12, marginBottom: 4 },

  // Card de alumno (igual que tareas)
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 8, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 12, paddingRight: 16, paddingVertical: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 14, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 3 },
  cardTime: { fontSize: 12, color: Colors.textSecondary },
  modifiedTag: { fontSize: 11, color: Colors.warning, fontWeight: '500' },
  statusDot: { width: 14, height: 14, borderRadius: 7 },

  // Edición
  editSection: { marginHorizontal: 12, marginBottom: 10, padding: 12, backgroundColor: '#FFFBF0', borderRadius: 8, borderWidth: 1, borderColor: '#FFE0A0' },
  editTitle: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 },
  editButtons: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  editBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1.5, alignItems: 'center' },
  editBtnText: { fontSize: 13, fontWeight: '600' },
  revertText: { fontSize: 12, color: Colors.textSecondary, textDecorationLine: 'underline', textAlign: 'center' },

  // Historial
  historyContainer: { marginHorizontal: 12, marginBottom: 10, backgroundColor: '#F0F4FF', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12 },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#E0E8FF' },
  historyDate: { flex: 1, fontSize: 13, color: Colors.textPrimary },
  historyTime: { width: 44, textAlign: 'center', fontSize: 13, color: Colors.textSecondary },
  historyBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  historyBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  historyEmpty: { marginHorizontal: 12, marginBottom: 10, paddingVertical: 10, alignItems: 'center' },
  historyEmptyText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic' },

  // Alumno
  calendar: { marginHorizontal: 16, marginTop: 16, borderRadius: 12 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: Colors.textSecondary },
  recentTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, paddingHorizontal: 20, paddingTop: 12 },
  recentList: { paddingHorizontal: 16, paddingTop: 8 },
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: Colors.border },
  recentDate: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  recentTime: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  recentBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  recentBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});

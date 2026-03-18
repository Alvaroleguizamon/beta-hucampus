import React, { useMemo, useState } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { mockAttendance, mockCourses } from '../../lib/mock-data';
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

// ─── Historial desplegable de un alumno ──────────────────────────────────────

function StudentHistory({ studentId, courseId }: { studentId: string; courseId: string }) {
  const history = mockAttendance
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
            <Text style={styles.historyDate}>{formatDate(record.date)}</Text>
            <Text style={styles.historyTime}>
              {record.checkInTime ? record.checkInTime : '—'}
            </Text>
            <View style={[styles.historyBadge, { backgroundColor: cfg.color }]}>
              <Text style={styles.historyBadgeText}>{cfg.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Fila de alumno (solo lectura) ───────────────────────────────────────────

type StudentEntry = {
  id: string;
  name: string;
  record: AttendanceRecord | undefined;
};

type StudentRowProps = {
  entry: StudentEntry;
  index: number;
  override: AttendanceStatus | null;
  onOverride: (studentId: string, status: AttendanceStatus | null) => void;
  courseId: string;
};

function StudentRow({ entry, index, override, onOverride, courseId }: StudentRowProps) {
  const [expanded, setExpanded] = useState(false);
  const kioskStatus: AttendanceStatus = entry.record?.status ?? 'ausente';
  const status: AttendanceStatus = override ?? kioskStatus;
  const cfg = statusConfig[status];
  const isModified = override !== null && override !== kioskStatus;

  return (
    <View style={index % 2 === 0 ? styles.rowWrapperAlt : styles.rowWrapper}>
      <Pressable style={styles.studentRow} onPress={() => setExpanded((v) => !v)}>
        <View style={[styles.statusBar, { backgroundColor: cfg.color }]} />
        <View style={styles.nameCol}>
          <Text style={styles.studentName} numberOfLines={1}>{entry.name}</Text>
          {isModified && <Text style={styles.modifiedTag}>✏ Modificado</Text>}
        </View>
        <Text style={styles.checkInTime}>{entry.record?.checkInTime ?? '—'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: cfg.color + '22', borderColor: cfg.color }]}>
          <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded && (
        <>
          {/* Modificar marcaje */}
          <View style={styles.editSection}>
            <Text style={styles.editTitle}>Modificar marcaje</Text>
            <View style={styles.editButtons}>
              {(['presente', 'tardanza', 'ausente'] as AttendanceStatus[]).map((s) => {
                const active = status === s && (override === s || (override === null && kioskStatus === s));
                const isOverriding = override === s;
                return (
                  <Pressable
                    key={s}
                    style={[
                      styles.editBtn,
                      { borderColor: statusConfig[s].color },
                      isOverriding && { backgroundColor: statusConfig[s].color },
                    ]}
                    onPress={() => onOverride(entry.id, override === s ? null : s)}
                  >
                    <Text style={[
                      styles.editBtnText,
                      { color: isOverriding ? '#FFFFFF' : statusConfig[s].color },
                    ]}>
                      {statusConfig[s].label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {isModified && (
              <Pressable onPress={() => onOverride(entry.id, null)}>
                <Text style={styles.revertText}>Revertir al marcaje original</Text>
              </Pressable>
            )}
          </View>

          {/* Historial */}
          <StudentHistory studentId={entry.id} courseId={courseId} />
        </>
      )}
    </View>
  );
}

// ─── Vista Docente ────────────────────────────────────────────────────────────

function DocenteView() {
  const [selectedCourseId, setSelectedCourseId] = useState(mockCourses[0].id);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, AttendanceStatus | null>>({});
  const [search, setSearch] = useState('');

  const course = mockCourses.find((c) => c.id === selectedCourseId)!;

  const handleOverride = (studentId: string, status: AttendanceStatus | null) => {
    setOverrides((prev) => ({ ...prev, [studentId]: status }));
  };

  const entries: StudentEntry[] = useMemo(() => {
    return course.students.map((s) => ({
      id: s.id,
      name: s.name,
      record: mockAttendance.find(
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

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter((e) => e.name.toLowerCase().includes(q));
  }, [entries, search]);

  const markedDates = useMemo(() => ({
    [selectedDate]: { selected: true, selectedColor: Colors.primary },
  }), [selectedDate]);

  return (
    <View style={styles.container}>

      {/* Filtro de cursos */}
      <View style={styles.courseFilterContainer}>
        <Text style={styles.filterLabel}>Curso</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {mockCourses.map((c) => (
            <Pressable
              key={c.id}
              style={[styles.courseChip, selectedCourseId === c.id && styles.courseChipActive]}
              onPress={() => setSelectedCourseId(c.id)}
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

      {/* Calendario desplegable */}
      {calendarOpen && (
        <Calendar
          current={selectedDate}
          markedDates={markedDates}
          onDayPress={(day: { dateString: string }) => {
            setSelectedDate(day.dateString);
            setCalendarOpen(false);
          }}
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

      {/* Resumen */}
      <View style={styles.summaryBar}>
        {(['presente', 'tardanza', 'ausente'] as AttendanceStatus[]).map((s) => (
          <View key={s} style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: statusConfig[s].color }]} />
            <Text style={styles.summaryCount}>{summary[s]}</Text>
            <Text style={styles.summaryLabel}>{statusConfig[s].label}</Text>
          </View>
        ))}
        <Text style={styles.kioskNote}>vía Humand Kiosk</Text>
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

      {/* Encabezado de columnas */}
      <View style={styles.tableHeader}>
        <Text style={[styles.colAlumno]}>Alumno</Text>
        <Text style={styles.colHora}>Hora</Text>
        <Text style={styles.colEstado}>Estado</Text>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <StudentRow
            entry={item}
            index={index}
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
  const records = mockAttendance.filter((a) => a.studentId === 'st1');
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
      <View style={styles.statsRow}>
        <View style={styles.mainStat}>
          <Text style={styles.mainStatNumber}>{percentage}%</Text>
          <Text style={styles.mainStatLabel}>Asistencia</Text>
        </View>
        <View style={styles.miniStats}>
          {(['presente', 'ausente', 'tardanza'] as AttendanceStatus[]).map((s) => (
            <View key={s} style={styles.miniStat}>
              <View style={[styles.miniDot, { backgroundColor: statusConfig[s].color }]} />
              <Text style={styles.miniNumber}>
                {s === 'presente' ? present : s === 'ausente' ? absent : late}
              </Text>
              <Text style={styles.miniLabel}>{statusConfig[s].label}</Text>
            </View>
          ))}
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
                {item.checkInTime && (
                  <Text style={styles.recentTime}>{item.checkInTime} hs</Text>
                )}
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
  courseFilterContainer: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  filterLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  courseChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.primary, marginRight: 8 },
  courseChipActive: { backgroundColor: Colors.primary },
  courseChipText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  courseChipTextActive: { color: '#FFFFFF' },

  // Selector de fecha
  dateBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 1 },
  dateBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBarIcon: { fontSize: 16 },
  dateText: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  dateChevron: { fontSize: 11, color: Colors.textSecondary },
  inlineCalendar: { borderBottomWidth: 1, borderBottomColor: Colors.border },

  // Resumen
  summaryBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 16, gap: 12, borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 1 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  summaryDot: { width: 8, height: 8, borderRadius: 4 },
  summaryCount: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary },
  kioskNote: { marginLeft: 'auto' as any, fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

  // Buscador
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginVertical: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, padding: 0 },

  // Encabezado de columnas
  tableHeader: { flexDirection: 'row', alignItems: 'center', paddingLeft: 32, paddingRight: 32, paddingVertical: 8, backgroundColor: '#F0F0F0', borderBottomWidth: 1, borderBottomColor: Colors.border },
  colAlumno: { flex: 1, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: Colors.textSecondary },
  colHora: { width: 95, textAlign: 'center', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: Colors.textSecondary },
  colEstado: { width: 125, textAlign: 'center', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', color: Colors.textSecondary },

  // Filas de alumno
  rowWrapper: { backgroundColor: '#FFFFFF' },
  rowWrapperAlt: { backgroundColor: '#FAFAFA' },
  studentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingRight: 14 },
  statusBar: { width: 4, alignSelf: 'stretch', borderRadius: 2, marginRight: 12 },
  nameCol: { flex: 1 },
  studentName: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  modifiedTag: { fontSize: 11, color: Colors.warning, marginTop: 1 },
  checkInTime: { width: 95, textAlign: 'center', fontSize: 14, color: Colors.textSecondary, fontVariant: ['tabular-nums'] as any },
  statusBadge: { width: 125, paddingVertical: 3, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  chevron: { fontSize: 10, color: Colors.textSecondary, marginLeft: 8 },

  // Edición de marcaje
  editSection: { marginHorizontal: 16, marginBottom: 6, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FFFBF0', borderRadius: 8, borderWidth: 1, borderColor: '#FFE0A0' },
  editTitle: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 },
  editButtons: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  editBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1.5, alignItems: 'center' },
  editBtnText: { fontSize: 13, fontWeight: '600' },
  revertText: { fontSize: 12, color: Colors.textSecondary, textDecorationLine: 'underline', textAlign: 'center' },

  // Historial
  historyContainer: { marginHorizontal: 16, marginBottom: 10, backgroundColor: '#F0F4FF', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12 },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#E0E8FF' },
  historyDate: { flex: 1, fontSize: 13, color: Colors.textPrimary },
  historyTime: { width: 44, textAlign: 'center', fontSize: 13, color: Colors.textSecondary },
  historyBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  historyBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  historyEmpty: { marginHorizontal: 16, marginBottom: 10, paddingVertical: 10, alignItems: 'center' },
  historyEmptyText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic' },

  // Alumno / Padre
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
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: Colors.border },
  recentDate: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  recentTime: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  recentBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  recentBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});

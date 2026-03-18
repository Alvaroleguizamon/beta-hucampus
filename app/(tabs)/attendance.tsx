import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useAuthStore } from '../../lib/stores/auth-store';
import { AttendanceRow } from '../../components/attendance/AttendanceRow';
import { mockAttendance, mockCourses } from '../../lib/mock-data';
import { Colors } from '../../constants/colors';
import { Layout } from '../../constants/layout';
import { AttendanceRecord } from '../../lib/types';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

export default function AttendanceScreen() {
  const role = useAuthStore((s) => s.user?.role ?? 'alumno');
  const [selectedCourse, setSelectedCourse] = useState(mockCourses[0]?.id ?? '');
  const [todayAttendance, setTodayAttendance] = useState<Record<string, AttendanceRecord['status']>>({});

  if (role === 'docente') {
    const course = mockCourses.find((c) => c.id === selectedCourse);
    const today = new Date().toISOString().split('T')[0];

    return (
      <View style={styles.container}>
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Tomar asistencia</Text>

          <View style={styles.courseSelector}>
            {mockCourses.map((c) => (
              <Button
                key={c.id}
                mode={selectedCourse === c.id ? 'contained' : 'outlined'}
                onPress={() => setSelectedCourse(c.id)}
                compact
                buttonColor={selectedCourse === c.id ? Colors.primary : undefined}
                textColor={selectedCourse === c.id ? '#FFFFFF' : Colors.primary}
              >
                {c.grade}
              </Button>
            ))}
          </View>

          <Text variant="bodyMedium" style={styles.dateText}>
            Fecha: {today}
          </Text>
        </View>

        {course && (
          <FlatList
            data={course.students}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const status = todayAttendance[item.id];
              return (
                <View style={styles.studentRow}>
                  <Text variant="bodyMedium" style={styles.studentName}>{item.name}</Text>
                  <View style={styles.statusButtons}>
                    {(['presente', 'ausente', 'tardanza'] as const).map((s) => (
                      <Pressable
                        key={s}
                        style={[
                          styles.statusBtn,
                          {
                            backgroundColor: status === s
                              ? s === 'presente' ? Colors.present : s === 'ausente' ? Colors.absent : Colors.late
                              : '#E5E5E5',
                          },
                        ]}
                        onPress={() =>
                          setTodayAttendance((prev) => ({ ...prev, [item.id]: s }))
                        }
                      >
                        <Text style={[styles.statusText, { color: status === s ? '#FFF' : '#666' }]}>
                          {s === 'presente' ? 'P' : s === 'ausente' ? 'A' : 'T'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    );
  }

  // Alumno o Padre — con calendario visual
  const studentAttendance = mockAttendance.filter((a) => a.studentId === 'st1');
  const total = studentAttendance.length;
  const present = studentAttendance.filter((a) => a.status === 'presente').length;
  const absent = studentAttendance.filter((a) => a.status === 'ausente').length;
  const late = studentAttendance.filter((a) => a.status === 'tardanza').length;

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    studentAttendance.forEach((a) => {
      const color = a.status === 'presente' ? Colors.present : a.status === 'ausente' ? Colors.absent : Colors.late;
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
      <FlatList
        data={studentAttendance}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AttendanceRow record={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {role === 'padre' ? 'Asistencia de tu hijo/a' : 'Mi asistencia'}
            </Text>
            <View style={styles.stats}>
              <View style={[styles.statCard, { backgroundColor: Colors.present }]}>
                <Text variant="headlineSmall" style={styles.statNumber}>{present}</Text>
                <Text variant="bodySmall" style={styles.statLabel}>Presente</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.absent }]}>
                <Text variant="headlineSmall" style={styles.statNumber}>{absent}</Text>
                <Text variant="bodySmall" style={styles.statLabel}>Ausente</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.late }]}>
                <Text variant="headlineSmall" style={styles.statNumber}>{late}</Text>
                <Text variant="bodySmall" style={styles.statLabel}>Tardanza</Text>
              </View>
            </View>

            <Calendar
              markingType="custom"
              markedDates={markedDates}
              theme={{
                backgroundColor: '#FFFFFF',
                calendarBackground: '#FFFFFF',
                todayTextColor: Colors.primary,
                dayTextColor: Colors.textPrimary,
                textDisabledColor: '#D9D9D9',
                arrowColor: Colors.primary,
                monthTextColor: Colors.textPrimary,
                textMonthFontWeight: '600',
                textDayFontSize: 14,
                textMonthFontSize: 16,
              }}
              style={styles.calendar}
            />

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.present }]} />
                <Text variant="bodySmall" style={styles.legendText}>Presente</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.absent }]} />
                <Text variant="bodySmall" style={styles.legendText}>Ausente</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.late }]} />
                <Text variant="bodySmall" style={styles.legendText}>Tardanza</Text>
              </View>
            </View>

            <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 16 }]}>
              Historial
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: Layout.padding,
  },
  section: {
    padding: Layout.padding,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 12,
  },
  courseSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dateText: {
    color: Colors.textSecondary,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  studentName: {
    color: Colors.textPrimary,
    flex: 1,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontWeight: '700',
    fontSize: 14,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  calendar: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: Colors.textSecondary,
  },
});

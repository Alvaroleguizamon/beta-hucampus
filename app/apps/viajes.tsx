import React, { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Trip } from '../../lib/types';
import { useAuthStore } from '../../lib/stores/auth-store';
import { useTripsStore } from '../../lib/stores/trips-store';
import { useNotificationsStore } from '../../lib/stores/notifications-store';
import { useCoursesStore } from '../../lib/stores/courses-store';
import CourseFilter from '../../components/ui/CourseFilter';
import StudentSearch from '../../components/ui/StudentSearch';

const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getWeekDays(offset: number) {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

export const tripTypeConfig = {
  excursion: { color: Colors.accent, icon: 'bus', label: 'Excursión' },
  campamento: { color: Colors.success, icon: 'tent', label: 'Campamento' },
  egresados: { color: '#9C27B0', icon: 'airplane', label: 'Viaje de Egresados' },
  salida: { color: Colors.primary, icon: 'walk', label: 'Salida Educativa' },
};

const statusConfig = {
  proximo: { color: Colors.warning, label: 'Próximo' },
  confirmado: { color: Colors.success, label: 'Confirmado' },
  finalizado: { color: Colors.textSecondary, label: 'Finalizado' },
};

export default function ViajesScreen() {
  const role = useAuthStore((s) => s.user?.role ?? 'alumno');
  const trips = useTripsStore((s) => s.trips);
  const attendees = useTripsStore((s) => s.attendees);
  const courses = useCoursesStore((s) => s.courses);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [studentFilterIds, setStudentFilterIds] = useState<string[]>([]);
  const courseForFilter = courses.find((c) => c.id === selectedCourseId);
  const toggleStudent = (id: string) => setStudentFilterIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const selectedTrip = selectedTripId ? trips.find((t) => t.id === selectedTripId) ?? null : null;
  const [weekOffset, setWeekOffset] = useState(0);
  const [reminded, setReminded] = useState<Record<string, boolean>>({});
  const userName = useAuthStore((s) => s.user?.name ?? 'Alumno');

  const sendAuthReminder = (tripId: string, tripTitle: string) => {
    useNotificationsStore.getState().addNotification({
      type: 'autorizacion',
      title: 'Autorización pendiente',
      body: `${userName} necesita tu autorización para "${tripTitle}".\nIngresá a Autorizaciones para firmar.`,
      date: new Date().toISOString().split('T')[0],
      targetRole: 'padre',
      deepLink: '/apps/autorizaciones',
    });
    setReminded((prev) => ({ ...prev, [tripId]: true }));
    Alert.alert('Recordatorio enviado', 'Se notificó a tu padre/madre/tutor para que autorice este viaje.');
  };

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const todayStr = formatDate(new Date());

  const tripsByDate = useMemo(() => {
    const map: Record<string, Trip> = {};
    trips.forEach((t) => { map[t.date] = t; });
    return map;
  }, [trips]);

  // Trips that fall within the current week
  const weekTrips = useMemo(() => {
    const start = formatDate(weekDays[0]);
    const end = formatDate(weekDays[6]);
    return trips.filter((t) => t.date >= start && t.date <= end);
  }, [weekDays, trips]);

  const weekMonth = monthNames[weekDays[3].getMonth()];
  const weekYear = weekDays[3].getFullYear();

  if (selectedTrip) {
    const tCfg = tripTypeConfig[selectedTrip.type];
    const sCfg = statusConfig[selectedTrip.status];
    const d = selectedTrip.details;

    return (
      <ScrollView style={styles.container}>
        <Pressable style={styles.backRow} onPress={() => setSelectedTripId(null)}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Viajes y Salidas</Text>
        </Pressable>

        <View style={[styles.detailBanner, { backgroundColor: tCfg.color + '15' }]}>
          <MaterialCommunityIcons name={tCfg.icon as any} size={40} color={tCfg.color} />
          <Text style={[styles.detailType, { color: tCfg.color }]}>{tCfg.label}</Text>
          <Text style={styles.detailTitle}>{selectedTrip.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: sCfg.color }]}>
            <Text style={styles.statusBadgeText}>{sCfg.label}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Información general</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar" size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fecha</Text>
                <Text style={styles.infoValue}>{selectedTrip.date}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Lugar</Text>
                <Text style={styles.infoValue}>{selectedTrip.location}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-start" size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Salida</Text>
                <Text style={styles.infoValue}>{d.horarioSalida}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clock-end" size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Regreso</Text>
                <Text style={styles.infoValue}>{d.horarioRegreso}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker-check" size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Punto de encuentro</Text>
                <Text style={styles.infoValue}>{d.puntoEncuentro}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="bus" size={18} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Transporte</Text>
                <Text style={styles.infoValue}>{d.transporte}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Descripción</Text>
            <Text style={styles.descText}>{d.descripcion}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>¿Qué llevar?</Text>
            {d.queLlevar.map((item, i) => {
              const key = `${selectedTrip.id}-${i}`;
              const checked = !!checkedItems[key];
              return (
                <Pressable key={i} style={styles.checkItem} onPress={() => setCheckedItems((prev) => ({ ...prev, [key]: !checked }))}>
                  <MaterialCommunityIcons
                    name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={20}
                    color={checked ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[styles.checkText, checked && styles.checkTextDone]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>

          {d.autorizacionRequerida && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Autorización</Text>
              <View style={styles.authRow}>
                <MaterialCommunityIcons
                  name={d.autorizacionEstado === 'autorizado' ? 'check-circle' : 'clock-outline'}
                  size={24}
                  color={d.autorizacionEstado === 'autorizado' ? Colors.success : Colors.warning}
                />
                <Text style={[
                  styles.authText,
                  { color: d.autorizacionEstado === 'autorizado' ? Colors.success : Colors.warning },
                ]}>
                  {d.autorizacionEstado === 'autorizado' ? 'Autorizado por padre/madre' : 'Pendiente de autorización'}
                </Text>
              </View>
              {d.autorizacionEstado !== 'autorizado' && role === 'alumno' && (
                reminded[selectedTrip.id] ? (
                  <View style={styles.reminderSent}>
                    <MaterialCommunityIcons name="check-circle-outline" size={18} color={Colors.success} />
                    <Text style={styles.reminderSentText}>Recordatorio enviado</Text>
                  </View>
                ) : (
                  <Pressable style={styles.reminderBtn} onPress={() => sendAuthReminder(selectedTrip.id, selectedTrip.title)}>
                    <MaterialCommunityIcons name="bell-ring-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.reminderBtnText}>Notificar a padre/madre/tutor</Text>
                  </Pressable>
                )
              )}
            </View>
          )}

          {role === 'docente' && (() => {
            const attendees_list = attendees[selectedTrip.id] ?? [];
            const authCount = attendees_list.filter((a) => a.authorized).length;
            return (
              <View style={styles.infoCard}>
                <View style={styles.attendeesHeader}>
                  <Text style={styles.infoCardTitle}>Alumnos ({attendees_list.length})</Text>
                  <Text style={[styles.attendeesCount, { color: authCount === attendees_list.length ? Colors.success : Colors.warning }]}>
                    {authCount}/{attendees_list.length} autorizados
                  </Text>
                </View>
                {attendees_list.map((a) => (
                  <View key={a.studentId} style={styles.attendeeRow}>
                    <View style={[styles.attendeeAvatar, { backgroundColor: a.authorized ? Colors.success + '15' : Colors.border }]}>
                      <Text style={[styles.attendeeAvatarText, { color: a.authorized ? Colors.success : Colors.textSecondary }]}>
                        {a.studentName[0]}
                      </Text>
                    </View>
                    <View style={styles.attendeeInfo}>
                      <Text style={styles.attendeeName}>{a.studentName}</Text>
                      {a.authorized ? (
                        <Text style={styles.attendeeAuth}>{a.authorizedBy}</Text>
                      ) : (
                        <Text style={styles.attendeePending}>Autorización pendiente</Text>
                      )}
                    </View>
                    <MaterialCommunityIcons
                      name={a.authorized ? 'check-circle' : 'clock-outline'}
                      size={20}
                      color={a.authorized ? Colors.success : Colors.warning}
                    />
                  </View>
                ))}
              </View>
            );
          })()}

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Contacto de emergencia</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={18} color={Colors.primary} />
              <Text style={styles.infoValue}>{d.contactoEmergencia}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  const upcoming = trips.filter((t) => t.status !== 'finalizado');
  const past = trips.filter((t) => t.status === 'finalizado');
  const allTrips = [...upcoming, ...past];

  return (
    <View style={styles.container}>
      {role === 'docente' && (
        <>
          <CourseFilter courses={courses} selectedCourseId={selectedCourseId} onSelect={(id) => { setSelectedCourseId(id); setStudentFilterIds([]); }} />
          {selectedCourseId && <StudentSearch students={courseForFilter?.students ?? []} selectedIds={studentFilterIds} onToggle={toggleStudent} onClear={() => setStudentFilterIds([])} />}
        </>
      )}
      <FlatList
        data={allTrips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* Week strip */}
            <View style={styles.weekCard}>
              <View style={styles.weekNav}>
                <Pressable onPress={() => setWeekOffset((w) => w - 1)}>
                  <MaterialCommunityIcons name="chevron-left" size={24} color={Colors.primary} />
                </Pressable>
                <Text style={styles.weekMonth}>{weekMonth} {weekYear}</Text>
                <Pressable onPress={() => setWeekOffset((w) => w + 1)}>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.primary} />
                </Pressable>
              </View>
              <View style={styles.weekRow}>
                {weekDays.map((day) => {
                  const dateStr = formatDate(day);
                  const isToday = dateStr === todayStr;
                  const tripOnDay = tripsByDate[dateStr];
                  return (
                    <Pressable
                      key={dateStr}
                      style={styles.weekDayCol}
                      onPress={() => { if (tripOnDay) setSelectedTripId(tripOnDay.id); }}
                    >
                      <Text style={[styles.weekDayLabel, isToday && styles.weekDayLabelToday]}>
                        {dayLabels[day.getDay()]}
                      </Text>
                      <View style={[styles.weekDayCircle, isToday && styles.weekDayCircleToday, tripOnDay && !isToday && styles.weekDayCircleEvent]}>
                        <Text style={[styles.weekDayNum, isToday && styles.weekDayNumToday]}>
                          {day.getDate()}
                        </Text>
                      </View>
                      {tripOnDay && (
                        <View style={[styles.weekDot, { backgroundColor: tripTypeConfig[tripOnDay.type].color }]} />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* Week events */}
              {weekTrips.length > 0 && (
                <View style={styles.weekEvents}>
                  {weekTrips.map((trip) => {
                    const tCfg = tripTypeConfig[trip.type];
                    return (
                      <Pressable key={trip.id} style={styles.weekEventRow} onPress={() => setSelectedTripId(trip.id)}>
                        <View style={[styles.weekEventDot, { backgroundColor: tCfg.color }]} />
                        <View style={styles.weekEventInfo}>
                          <Text style={styles.weekEventTitle} numberOfLines={1}>{trip.title}</Text>
                          <Text style={styles.weekEventDate}>{trip.date} · {trip.location}</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textSecondary} />
                      </Pressable>
                    );
                  })}
                </View>
              )}
              {weekTrips.length === 0 && (
                <Text style={styles.weekNoEvents}>No hay viajes esta semana</Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Todos los viajes</Text>
          </View>
        }
        renderItem={({ item }) => {
          const tCfg = tripTypeConfig[item.type];
          const sCfg = statusConfig[item.status];
          return (
            <Pressable style={styles.tripCard} onPress={() => setSelectedTripId(item.id)}>
              <View style={[styles.tripIconBox, { backgroundColor: tCfg.color + '15' }]}>
                <MaterialCommunityIcons name={tCfg.icon as any} size={28} color={tCfg.color} />
              </View>
              <View style={styles.tripInfo}>
                <View style={styles.tripHeader}>
                  <Text style={styles.tripType}>{tCfg.label}</Text>
                  <View style={[styles.tripStatus, { backgroundColor: sCfg.color + '20' }]}>
                    <Text style={[styles.tripStatusText, { color: sCfg.color }]}>{sCfg.label}</Text>
                  </View>
                </View>
                <Text style={styles.tripTitle}>{item.title}</Text>
                <View style={styles.tripMeta}>
                  <MaterialCommunityIcons name="calendar" size={14} color={Colors.textSecondary} />
                  <Text style={styles.tripDate}>{item.date}</Text>
                  <MaterialCommunityIcons name="map-marker" size={14} color={Colors.textSecondary} />
                  <Text style={styles.tripLocation} numberOfLines={1}>{item.location}</Text>
                </View>
                {item.details.autorizacionRequerida && item.details.autorizacionEstado === 'pendiente' && (
                  <View style={styles.pendingBadge}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={14} color={Colors.warning} />
                    <Text style={styles.pendingText}>Autorización pendiente</Text>
                  </View>
                )}
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.textSecondary} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16 },

  // Week strip
  weekCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 16 },
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  weekMonth: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
  weekDayCol: { alignItems: 'center', width: 40 },
  weekDayLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 6 },
  weekDayLabelToday: { color: Colors.primary, fontWeight: '600' },
  weekDayCircle: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  weekDayCircleToday: { backgroundColor: Colors.primary },
  weekDayCircleEvent: { backgroundColor: Colors.primary + '15' },
  weekDayNum: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  weekDayNumToday: { color: '#FFFFFF', fontWeight: '700' },
  weekDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },

  // Week events list
  weekEvents: { marginTop: 14, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  weekEventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  weekEventDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  weekEventInfo: { flex: 1 },
  weekEventTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  weekEventDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  weekNoEvents: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },

  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginBottom: 12 },
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  tripIconBox: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  tripInfo: { flex: 1 },
  tripHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  tripType: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  tripStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  tripStatusText: { fontSize: 11, fontWeight: '600' },
  tripTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  tripMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tripDate: { fontSize: 12, color: Colors.textSecondary, marginRight: 8 },
  tripLocation: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  pendingText: { fontSize: 12, color: Colors.warning, fontWeight: '500' },

  // Detail
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 16, paddingBottom: 0 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '500' },
  detailBanner: { margin: 16, borderRadius: 16, padding: 24, alignItems: 'center' },
  detailType: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  detailTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginTop: 4 },
  statusBadge: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  detailSection: { paddingHorizontal: 16, paddingBottom: 30 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12 },
  infoCardTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: Colors.textSecondary },
  infoValue: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500', marginTop: 1 },
  descText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  checkText: { fontSize: 14, color: Colors.textPrimary },
  checkTextDone: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  authRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  authText: { fontSize: 15, fontWeight: '600' },
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  reminderBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  reminderSent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success + '10',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  reminderSentText: { color: Colors.success, fontSize: 14, fontWeight: '600' },

  // Attendees (docente)
  attendeesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  attendeesCount: { fontSize: 13, fontWeight: '600' },
  attendeeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  attendeeAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  attendeeAvatarText: { fontSize: 14, fontWeight: '700' },
  attendeeInfo: { flex: 1 },
  attendeeName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  attendeeAuth: { fontSize: 11, color: Colors.success, marginTop: 1 },
  attendeePending: { fontSize: 11, color: Colors.warning, marginTop: 1 },
});

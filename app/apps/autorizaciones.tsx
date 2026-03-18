import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView, Alert } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../lib/stores/auth-store';
import { useTripsStore, Authorization } from '../../lib/stores/trips-store';

interface AuthorizedPerson {
  id: string;
  name: string;
  relationship: string;
  dni: string;
  phone: string;
  active: boolean;
}

const typeConfig = {
  salida: { color: Colors.primary, icon: 'bus', label: 'Salida educativa' },
  retiro: { color: '#9C27B0', icon: 'account-arrow-right', label: 'Retiro anticipado' },
  actividad: { color: Colors.accent, icon: 'run', label: 'Actividad especial' },
  medica: { color: Colors.error, icon: 'medical-bag', label: 'Médica' },
};

const statusConfig = {
  pendiente: { color: Colors.warning, icon: 'clock-outline', label: 'Pendiente' },
  autorizado: { color: Colors.success, icon: 'check-circle', label: 'Autorizado' },
  rechazado: { color: Colors.error, icon: 'close-circle', label: 'Rechazado' },
  vencido: { color: Colors.textSecondary, icon: 'clock-alert-outline', label: 'Vencido' },
};

const mockAuthorizedPersons: AuthorizedPerson[] = [
  { id: 'ap1', name: 'Carlos Pérez', relationship: 'Padre', dni: '28.456.789', phone: '11-5555-1234', active: true },
  { id: 'ap2', name: 'María López de Pérez', relationship: 'Madre', dni: '30.123.456', phone: '11-5555-5678', active: true },
  { id: 'ap3', name: 'Roberto Pérez', relationship: 'Abuelo', dni: '15.789.012', phone: '11-5555-9012', active: true },
  { id: 'ap4', name: 'Laura Gómez', relationship: 'Tía', dni: '32.456.123', phone: '11-5555-3456', active: false },
];

export default function AutorizacionesScreen() {
  const role = useAuthStore((s) => s.user?.role ?? 'alumno');
  const [tab, setTab] = useState('autorizaciones');
  const [selectedAuth, setSelectedAuth] = useState<Authorization | null>(null);
  const [reminded, setReminded] = useState<Record<string, boolean>>({});

  const authorizations = useTripsStore((s) => s.authorizations);
  const authorize = useTripsStore((s) => s.authorize);
  const reject = useTripsStore((s) => s.reject);

  const handleAuthorize = (authId: string) => {
    authorize(authId, 'Carlos Pérez (Padre)');
    setSelectedAuth((prev) => {
      if (!prev) return null;
      const today = new Date().toISOString().split('T')[0];
      return { ...prev, status: 'autorizado', authorizedBy: 'Carlos Pérez (Padre)', authorizedDate: today };
    });
    Alert.alert('Autorizado', 'La autorización fue aprobada correctamente.');
  };

  const handleReject = (authId: string) => {
    reject(authId);
    setSelectedAuth((prev) => prev ? { ...prev, status: 'rechazado' } : null);
    Alert.alert('Rechazado', 'La autorización fue rechazada.');
  };

  const sendReminder = (authId: string, authTitle: string) => {
    Alert.alert(
      'Recordatorio enviado',
      `Se envió una notificación a Carlos Pérez (Padre) y María López de Pérez (Madre) para que autoricen "${authTitle}".`,
      [{ text: 'OK' }],
    );
    setReminded((prev) => ({ ...prev, [authId]: true }));
  };

  // Detail view
  if (selectedAuth) {
    const tCfg = typeConfig[selectedAuth.type];
    const sCfg = statusConfig[selectedAuth.status];
    return (
      <ScrollView style={styles.container}>
        <Pressable style={styles.backRow} onPress={() => setSelectedAuth(null)}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Autorizaciones</Text>
        </Pressable>

        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={[styles.detailIconBox, { backgroundColor: tCfg.color + '15' }]}>
              <MaterialCommunityIcons name={tCfg.icon as any} size={28} color={tCfg.color} />
            </View>
            <Text style={styles.detailTypeLabel}>{tCfg.label}</Text>
          </View>

          <Text style={styles.detailTitle}>{selectedAuth.title}</Text>

          <View style={[styles.statusRow, { backgroundColor: sCfg.color + '15' }]}>
            <MaterialCommunityIcons name={sCfg.icon as any} size={20} color={sCfg.color} />
            <Text style={[styles.statusLabel, { color: sCfg.color }]}>{sCfg.label}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={18} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Fecha: {selectedAuth.date}</Text>
          </View>

          <Text style={styles.detailDesc}>{selectedAuth.description}</Text>

          {selectedAuth.authorizedBy && (
            <View style={styles.authByCard}>
              <Text style={styles.authByTitle}>Autorizado por</Text>
              <Text style={styles.authByName}>{selectedAuth.authorizedBy}</Text>
              <Text style={styles.authByDate}>Fecha: {selectedAuth.authorizedDate}</Text>
            </View>
          )}

          {selectedAuth.status === 'pendiente' && role === 'padre' && (
            <View>
              <View style={styles.pendingNotice}>
                <MaterialCommunityIcons name="alert-circle-outline" size={20} color={Colors.warning} />
                <Text style={styles.pendingNoticeText}>
                  Esta autorización requiere tu aprobación.
                </Text>
              </View>
              <View style={styles.authActions}>
                <Pressable style={styles.authorizeBtn} onPress={() => handleAuthorize(selectedAuth.id)}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.authorizeBtnText}>Autorizar</Text>
                </Pressable>
                <Pressable style={styles.rejectBtn} onPress={() => handleReject(selectedAuth.id)}>
                  <MaterialCommunityIcons name="close-circle" size={20} color={Colors.error} />
                  <Text style={styles.rejectBtnText}>Rechazar</Text>
                </Pressable>
              </View>
            </View>
          )}

          {selectedAuth.status === 'pendiente' && role !== 'padre' && (
            <View>
              <View style={styles.pendingNotice}>
                <MaterialCommunityIcons name="alert-circle-outline" size={20} color={Colors.warning} />
                <Text style={styles.pendingNoticeText}>
                  Esta autorización está pendiente. Tu padre/madre debe aprobarla desde su app.
                </Text>
              </View>
              {reminded[selectedAuth.id] ? (
                <View style={styles.reminderSent}>
                  <MaterialCommunityIcons name="check-circle-outline" size={20} color={Colors.success} />
                  <Text style={styles.reminderSentText}>Recordatorio enviado</Text>
                </View>
              ) : (
                <Pressable
                  style={styles.reminderBtn}
                  onPress={() => sendReminder(selectedAuth.id, selectedAuth.title)}
                >
                  <MaterialCommunityIcons name="bell-ring-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.reminderBtnText}>Recordar a mi padre/madre</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        buttons={[
          { value: 'autorizaciones', label: 'Autorizaciones' },
          { value: 'personas', label: 'Personas autorizadas' },
        ]}
        style={styles.segmented}
      />

      {tab === 'autorizaciones' ? (
        <FlatList
          data={authorizations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const tCfg = typeConfig[item.type];
            const sCfg = statusConfig[item.status];
            return (
              <Pressable style={styles.authCard} onPress={() => setSelectedAuth(item)}>
                <View style={[styles.authIcon, { backgroundColor: tCfg.color + '15' }]}>
                  <MaterialCommunityIcons name={tCfg.icon as any} size={22} color={tCfg.color} />
                </View>
                <View style={styles.authInfo}>
                  <Text style={styles.authType}>{tCfg.label}</Text>
                  <Text style={styles.authTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.authDate}>{item.date}</Text>
                </View>
                <View style={styles.authStatusCol}>
                  <MaterialCommunityIcons name={sCfg.icon as any} size={22} color={sCfg.color} />
                  <Text style={[styles.authStatusText, { color: sCfg.color }]}>{sCfg.label}</Text>
                  {item.status === 'pendiente' && !reminded[item.id] && (
                    <Pressable
                      style={styles.miniReminderBtn}
                      onPress={(e) => { e.stopPropagation(); sendReminder(item.id, item.title); }}
                    >
                      <MaterialCommunityIcons name="bell-ring-outline" size={14} color={Colors.primary} />
                    </Pressable>
                  )}
                  {item.status === 'pendiente' && reminded[item.id] && (
                    <MaterialCommunityIcons name="bell-check-outline" size={16} color={Colors.success} style={{ marginTop: 4 }} />
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      ) : (
        <FlatList
          data={mockAuthorizedPersons}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.personsSubtitle}>
              Personas autorizadas a retirar al alumno del establecimiento
            </Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.personCard, !item.active && styles.personCardInactive]}>
              <View style={[styles.personAvatar, { backgroundColor: item.active ? Colors.primary + '20' : Colors.border }]}>
                <Text style={[styles.personAvatarText, { color: item.active ? Colors.primary : Colors.textSecondary }]}>
                  {item.name[0]}
                </Text>
              </View>
              <View style={styles.personInfo}>
                <View style={styles.personNameRow}>
                  <Text style={styles.personName}>{item.name}</Text>
                  {!item.active && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveBadgeText}>Inactivo</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.personRelation}>{item.relationship}</Text>
                <View style={styles.personDetails}>
                  <Text style={styles.personDetail}>DNI: {item.dni}</Text>
                  <Text style={styles.personDetail}>Tel: {item.phone}</Text>
                </View>
              </View>
              {item.active && (
                <MaterialCommunityIcons name="check-decagram" size={22} color={Colors.success} />
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  segmented: { marginHorizontal: 16, marginTop: 12, marginBottom: 4 },
  list: { padding: 16 },
  personsSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 14, lineHeight: 18 },

  // Auth list
  authCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  authIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  authInfo: { flex: 1 },
  authType: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  authTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginVertical: 2 },
  authDate: { fontSize: 12, color: Colors.textSecondary },
  authStatusCol: { alignItems: 'center', marginLeft: 8 },
  authStatusText: { fontSize: 10, fontWeight: '600', marginTop: 2 },

  // Person card
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  personCardInactive: { opacity: 0.6 },
  personAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  personAvatarText: { fontSize: 20, fontWeight: '700' },
  personInfo: { flex: 1 },
  personNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  personName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  inactiveBadge: { backgroundColor: Colors.border, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  inactiveBadgeText: { fontSize: 10, color: Colors.textSecondary, fontWeight: '500' },
  personRelation: { fontSize: 13, color: Colors.primary, fontWeight: '500', marginTop: 2 },
  personDetails: { flexDirection: 'row', gap: 16, marginTop: 4 },
  personDetail: { fontSize: 12, color: Colors.textSecondary },

  // Detail
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 16, paddingBottom: 0 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '500' },
  detailCard: { margin: 16, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20 },
  detailHeader: { alignItems: 'center', marginBottom: 16 },
  detailIconBox: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  detailTypeLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  detailTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginBottom: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginBottom: 16 },
  statusLabel: { fontSize: 14, fontWeight: '600' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  detailText: { fontSize: 14, color: Colors.textPrimary },
  detailDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: 16 },
  authByCard: { backgroundColor: Colors.success + '10', borderRadius: 10, padding: 14, marginBottom: 12 },
  authByTitle: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  authByName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  authByDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  pendingNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: Colors.warning + '10', borderRadius: 10, padding: 14 },
  pendingNoticeText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  authActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  authorizeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success,
    paddingVertical: 14,
    borderRadius: 12,
  },
  authorizeBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.error + '10',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  rejectBtnText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  reminderBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  reminderSent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success + '10',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  reminderSentText: { color: Colors.success, fontSize: 14, fontWeight: '600' },
  miniReminderBtn: {
    marginTop: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView, Alert, Platform, TextInput as RNTextInput, Animated } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../lib/stores/auth-store';
import { useTripsStore, Authorization } from '../../lib/stores/trips-store';
import { useNotificationsStore } from '../../lib/stores/notifications-store';
import SignaturePad, { SignaturePreview } from '../../components/ui/SignaturePad';

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

const initialAuthorizedPersons: AuthorizedPerson[] = [
  { id: 'ap1', name: 'Carlos Pérez', relationship: 'Padre', dni: '28.456.789', phone: '11-5555-1234', active: true },
  { id: 'ap2', name: 'María López de Pérez', relationship: 'Madre', dni: '30.123.456', phone: '11-5555-5678', active: true },
  { id: 'ap3', name: 'Roberto Pérez', relationship: 'Abuelo', dni: '15.789.012', phone: '11-5555-9012', active: true },
  { id: 'ap4', name: 'Laura Gómez', relationship: 'Tía', dni: '32.456.123', phone: '11-5555-3456', active: false },
];

function AddPersonForm({ onAdd, onCancel }: { onAdd: (p: AuthorizedPerson) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [showSig, setShowSig] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(fadeAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }).start();
  }, []);

  const handleSave = () => {
    if (!name.trim()) { setError('Ingresá el nombre'); return; }
    if (!relationship.trim()) { setError('Ingresá el parentesco'); return; }
    if (!dni.trim()) { setError('Ingresá el DNI'); return; }
    if (!phone.trim()) { setError('Ingresá el teléfono'); return; }
    if (!signed) { setError('Firmá para confirmar la autorización'); return; }
    onAdd({
      id: `ap${Date.now()}`,
      name: name.trim(),
      relationship: relationship.trim(),
      dni: dni.trim(),
      phone: phone.trim(),
      active: true,
    });
  };

  return (
    <Animated.View style={[styles.addPersonCard, {
      opacity: fadeAnim,
      transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
    }]}>
      <Text style={styles.addPersonTitle}>Nueva persona autorizada</Text>

      <Text style={styles.fieldLabel}>Nombre completo</Text>
      <RNTextInput style={styles.fieldInput} value={name} onChangeText={(v) => { setName(v); setError(''); }} placeholder="Ej: Juan Pérez" placeholderTextColor={Colors.textSecondary} />

      <Text style={styles.fieldLabel}>Parentesco</Text>
      <RNTextInput style={styles.fieldInput} value={relationship} onChangeText={(v) => { setRelationship(v); setError(''); }} placeholder="Ej: Tío, Abuela..." placeholderTextColor={Colors.textSecondary} />

      <Text style={styles.fieldLabel}>DNI</Text>
      <RNTextInput style={styles.fieldInput} value={dni} onChangeText={(v) => { setDni(v); setError(''); }} placeholder="Ej: 30.123.456" placeholderTextColor={Colors.textSecondary} keyboardType="numeric" />

      <Text style={styles.fieldLabel}>Teléfono</Text>
      <RNTextInput style={styles.fieldInput} value={phone} onChangeText={(v) => { setPhone(v); setError(''); }} placeholder="Ej: 11-5555-1234" placeholderTextColor={Colors.textSecondary} keyboardType="phone-pad" />

      <Text style={styles.fieldLabel}>Firma del padre/madre</Text>
      {signed ? (
        <View style={styles.signedConfirm}>
          <MaterialCommunityIcons name="check-circle" size={20} color={Colors.success} />
          <Text style={styles.signedConfirmText}>Firmado</Text>
          <Pressable onPress={() => { setSigned(false); setShowSig(true); }}>
            <Text style={styles.resignText}>Volver a firmar</Text>
          </Pressable>
        </View>
      ) : showSig ? (
        <SignaturePad
          onConfirm={() => { setSigned(true); setShowSig(false); setError(''); }}
          onCancel={() => setShowSig(false)}
        />
      ) : (
        <Pressable style={styles.openSigBtn} onPress={() => setShowSig(true)}>
          <MaterialCommunityIcons name="draw-pen" size={18} color={Colors.primary} />
          <Text style={styles.openSigBtnText}>Firmar</Text>
        </Pressable>
      )}

      {!!error && <Text style={styles.formError}>{error}</Text>}

      <View style={styles.addPersonActions}>
        <Pressable style={styles.addPersonCancelBtn} onPress={onCancel}>
          <Text style={styles.addPersonCancelText}>Cancelar</Text>
        </Pressable>
        <Pressable style={[styles.addPersonSaveBtn, !signed && { opacity: 0.4 }]} onPress={handleSave}>
          <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
          <Text style={styles.addPersonSaveText}>Guardar</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function buildPdfHtml(auth: Authorization, signatureSvgPaths: string[]) {
  const svgPathsHtml = signatureSvgPaths
    .map((d) => `<path d="${d}" stroke="#1A1A1A" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`)
    .join('');

  return `
    <html>
    <head><meta charset="utf-8"/><style>
      body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 40px; color: #1A1A1A; }
      .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #5B77D3; padding-bottom: 20px; }
      .logo { font-size: 24px; font-weight: 700; color: #5B77D3; }
      .subtitle { font-size: 12px; color: #717171; margin-top: 4px; }
      h1 { font-size: 20px; margin: 0 0 8px; }
      .type-badge { display: inline-block; background: #5B77D315; color: #5B77D3; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; }
      .status { display: inline-block; background: #4CAF5015; color: #4CAF50; padding: 4px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; margin: 12px 0; }
      .field { margin: 8px 0; }
      .field-label { font-size: 11px; color: #717171; text-transform: uppercase; letter-spacing: 0.5px; }
      .field-value { font-size: 14px; margin-top: 2px; }
      .description { background: #F7F7F7; padding: 12px; border-radius: 8px; margin: 16px 0; font-size: 13px; line-height: 1.6; color: #333; }
      .signature-section { margin-top: 32px; border-top: 1px solid #E5E5E5; padding-top: 20px; }
      .signature-box { border: 1.5px dashed #E5E5E5; border-radius: 8px; height: 120px; margin: 12px 0; display: flex; align-items: center; justify-content: center; background: #FAFAFA; }
      .signature-box svg { width: 100%; height: 100%; }
      .signed-by { font-size: 13px; color: #717171; text-align: center; margin-top: 8px; }
      .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #E5E5E5; padding-top: 16px; }
    </style></head>
    <body>
      <div class="header">
        <div class="logo">Hu Campus</div>
        <div class="subtitle">Autorización escolar</div>
      </div>
      <div style="text-align:center;">
        <span class="type-badge">${typeConfig[auth.type].label}</span>
      </div>
      <h1 style="text-align:center; margin-top:16px;">${auth.title}</h1>
      <div style="text-align:center;">
        <span class="status">Autorizado</span>
      </div>
      <div class="field">
        <div class="field-label">Fecha del evento</div>
        <div class="field-value">${auth.date}</div>
      </div>
      <div class="description">${auth.description}</div>
      <div class="field">
        <div class="field-label">Autorizado por</div>
        <div class="field-value">${auth.authorizedBy ?? ''}</div>
      </div>
      <div class="field">
        <div class="field-label">Fecha de autorización</div>
        <div class="field-value">${auth.authorizedDate ?? ''}</div>
      </div>
      <div class="signature-section">
        <div class="field-label">Firma digital</div>
        <div class="signature-box">
          <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg">${svgPathsHtml}</svg>
        </div>
        <div class="signed-by">Firmado digitalmente por ${auth.authorizedBy ?? ''} el ${auth.authorizedDate ?? ''}</div>
      </div>
      <div class="footer">
        Documento generado por Hu Campus — Este documento tiene validez como constancia de autorización digital.
      </div>
    </body>
    </html>
  `;
}

export default function AutorizacionesScreen() {
  const role = useAuthStore((s) => s.user?.role ?? 'alumno');
  const [tab, setTab] = useState('autorizaciones');
  const [selectedAuth, setSelectedAuth] = useState<Authorization | null>(null);
  const [reminded, setReminded] = useState<Record<string, boolean>>({});
  const [showSignature, setShowSignature] = useState(false);
  const [signedPaths, setSignedPaths] = useState<Record<string, string[]>>({});
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [authorizedPersons, setAuthorizedPersons] = useState<AuthorizedPerson[]>(initialAuthorizedPersons);
  const [showAddPerson, setShowAddPerson] = useState(false);

  const disableScroll = useCallback(() => setScrollEnabled(false), []);
  const enableScroll = useCallback(() => setScrollEnabled(true), []);

  const authorizations = useTripsStore((s) => s.authorizations);
  const authorize = useTripsStore((s) => s.authorize);
  const reject = useTripsStore((s) => s.reject);
  const userName = useAuthStore((s) => s.user?.name ?? 'Padre/Madre');

  const handleAuthorize = (authId: string, svgPaths: string[]) => {
    const signedBy = `${userName} (Firma digital)`;
    const today = new Date().toISOString().split('T')[0];
    authorize(authId, signedBy);
    setSignedPaths((prev) => ({ ...prev, [authId]: svgPaths }));
    setSelectedAuth((prev) => {
      if (!prev) return null;
      return { ...prev, status: 'autorizado', authorizedBy: signedBy, authorizedDate: today };
    });
    setShowSignature(false);

    useNotificationsStore.getState().addNotification({
      type: 'autorizacion',
      title: 'Autorización firmada',
      body: `${userName} firmó la autorización "${selectedAuth?.title ?? ''}"`,
      date: new Date().toISOString().split('T')[0],
      targetRole: 'alumno',
      deepLink: '/apps/autorizaciones',
    });

    Alert.alert('Autorizado', 'La autorización fue firmada y aprobada correctamente.');
  };

  const handleReject = (authId: string) => {
    reject(authId);
    setSelectedAuth((prev) => prev ? { ...prev, status: 'rechazado' } : null);
    Alert.alert('Rechazado', 'La autorización fue rechazada.');
  };

  const handleDownloadPdf = async (auth: Authorization) => {
    const paths = signedPaths[auth.id] ?? [];
    const html = buildPdfHtml(auth, paths);
    try {
      if (Platform.OS === 'web') {
        const w = window.open('', '_blank');
        if (w) {
          w.document.write(html);
          w.document.close();
          setTimeout(() => w.print(), 300);
        }
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
      }
    } catch {
      Alert.alert('Error', 'No se pudo generar el PDF.');
    }
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
      <ScrollView scrollEnabled={scrollEnabled} style={styles.container}>
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
              {signedPaths[selectedAuth.id] && (
                <SignaturePreview paths={signedPaths[selectedAuth.id]} />
              )}
            </View>
          )}

          {selectedAuth.status === 'autorizado' && role === 'padre' && (
            <Pressable style={styles.downloadBtn} onPress={() => handleDownloadPdf(selectedAuth)}>
              <MaterialCommunityIcons name="file-download-outline" size={20} color="#FFFFFF" />
              <Text style={styles.downloadBtnText}>Descargar PDF</Text>
            </Pressable>
          )}

          {selectedAuth.status === 'pendiente' && role === 'padre' && (
            <View>
              <View style={styles.pendingNotice}>
                <MaterialCommunityIcons name="alert-circle-outline" size={20} color={Colors.warning} />
                <Text style={styles.pendingNoticeText}>
                  Esta autorización requiere tu firma para ser aprobada.
                </Text>
              </View>

              {showSignature ? (
                <SignaturePad
                  onConfirm={(svgPaths) => handleAuthorize(selectedAuth.id, svgPaths)}
                  onCancel={() => setShowSignature(false)}
                  onTouchStart={disableScroll}
                  onTouchEnd={enableScroll}
                />
              ) : (
                <View style={styles.authActions}>
                  <Pressable style={styles.authorizeBtn} onPress={() => setShowSignature(true)}>
                    <MaterialCommunityIcons name="draw-pen" size={20} color="#FFFFFF" />
                    <Text style={styles.authorizeBtnText}>Firmar</Text>
                  </Pressable>
                  <Pressable style={styles.rejectBtn} onPress={() => handleReject(selectedAuth.id)}>
                    <MaterialCommunityIcons name="close-circle" size={20} color={Colors.textSecondary} />
                    <Text style={styles.rejectBtnText}>Rechazar</Text>
                  </Pressable>
                </View>
              )}
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

        <Pressable style={styles.backBtn} onPress={() => { setSelectedAuth(null); setShowSignature(false); }}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={Colors.primary} />
          <Text style={styles.backBtnText}>Volver a autorizaciones</Text>
        </Pressable>

        <View style={{ height: 32 }} />
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
                  {item.status === 'pendiente' && role !== 'padre' && !reminded[item.id] && (
                    <Pressable
                      style={styles.miniReminderBtn}
                      onPress={(e) => { e.stopPropagation(); sendReminder(item.id, item.title); }}
                    >
                      <MaterialCommunityIcons name="bell-ring-outline" size={14} color={Colors.primary} />
                    </Pressable>
                  )}
                  {item.status === 'pendiente' && role !== 'padre' && reminded[item.id] && (
                    <MaterialCommunityIcons name="bell-check-outline" size={16} color={Colors.success} style={{ marginTop: 4 }} />
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      ) : (
        <FlatList
          data={authorizedPersons}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <Text style={styles.personsSubtitle}>
                Personas autorizadas a retirar al alumno del establecimiento
              </Text>
              {role === 'padre' && !showAddPerson && (
                <Pressable style={styles.addPersonBtn} onPress={() => setShowAddPerson(true)}>
                  <MaterialCommunityIcons name="account-plus" size={20} color="#FFFFFF" />
                  <Text style={styles.addPersonBtnText}>Agregar persona</Text>
                </Pressable>
              )}
              {showAddPerson && (
                <AddPersonForm
                  onAdd={(p) => {
                    setAuthorizedPersons((prev) => [p, ...prev]);
                    setShowAddPerson(false);
                  }}
                  onCancel={() => setShowAddPerson(false)}
                />
              )}
            </View>
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
  authStatusCol: { alignItems: 'center', marginLeft: 8, width: 70 },
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
  detailCard: { margin: 16, marginBottom: 0, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20 },
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
    backgroundColor: Colors.primary,
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
    backgroundColor: Colors.border,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rejectBtnText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  backBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  downloadBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

  // Add person
  addPersonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  addPersonBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  addPersonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addPersonTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginTop: 10, marginBottom: 4 },
  fieldInput: {
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  formError: { color: Colors.error, fontSize: 13, marginTop: 8, textAlign: 'center' },
  addPersonActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  addPersonCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  addPersonCancelText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  addPersonSaveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  addPersonSaveText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  openSigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    backgroundColor: Colors.primary + '08',
  },
  openSigBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  signedConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.success + '10',
  },
  signedConfirmText: { fontSize: 14, fontWeight: '600', color: Colors.success, flex: 1 },
  resignText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
});

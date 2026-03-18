import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, Animated, Dimensions, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IconButton, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/stores/auth-store';
import { useCourseStore } from '../../lib/stores/course-store';
import { mockCourses, mockBirthdays } from '../../lib/mock-data';
import { Colors } from '../../constants/colors';
import { Role } from '../../lib/types';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface Notification {
  id: string;
  type: 'evento' | 'nota' | 'tarea' | 'viaje' | 'autorizacion' | 'comunicado';
  title: string;
  body: string;
  time: string;
  read: boolean;
  route: string;
}

const notifIcon: Record<string, { icon: string; color: string }> = {
  evento: { icon: 'calendar-star', color: '#9C27B0' },
  nota: { icon: 'school', color: Colors.warning },
  tarea: { icon: 'checkbox-marked-outline', color: '#7C6BC4' },
  viaje: { icon: 'bus', color: Colors.accent },
  autorizacion: { icon: 'file-sign', color: '#8D6E63' },
  comunicado: { icon: 'bullhorn', color: Colors.primary },
};

const mockNotifications: Notification[] = [
  { id: 'n1', type: 'nota', title: 'Nueva nota cargada', body: 'Prof. García cargó una nota en Matemática: 8', time: 'Hace 1 hora', read: false, route: '/apps/notas' },
  { id: 'n2', type: 'evento', title: 'Evento próximo', body: 'Acto del 25 de Mayo - Mañana a las 10:00 hs', time: 'Hace 2 horas', read: false, route: '/apps/eventos' },
  { id: 'n3', type: 'tarea', title: 'Tarea grupal recibida', body: 'Lucía Gómez te agregó a "Análisis literario"', time: 'Hace 3 horas', read: false, route: '/apps/tareas' },
  { id: 'n4', type: 'viaje', title: 'Salida educativa', body: 'Museo de Ciencias Naturales - 25/03. Recordá traer DNI.', time: 'Hoy 08:30', read: true, route: '/apps/viajes' },
  { id: 'n5', type: 'autorizacion', title: 'Autorización pendiente', body: 'La autorización para el Museo de Ciencias sigue pendiente.', time: 'Ayer', read: true, route: '/apps/autorizaciones' },
  { id: 'n6', type: 'comunicado', title: 'Nuevo comunicado', body: 'Jornada de capacitación docente - No hay clases el viernes.', time: 'Ayer', read: true, route: '/apps/noticias' },
  { id: 'n7', type: 'nota', title: 'Nueva nota cargada', body: 'Prof. Martínez cargó una nota en Lengua: 7', time: 'Hace 2 días', read: true, route: '/apps/notas' },
];

const rolLabel: Record<Role, string> = {
  alumno: 'Alumno',
  docente: 'Docente',
  padre: 'Padre / Tutor',
};

export default function UserTopBar() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'alumno';
  const { selectedCourseId, setSelectedCourse } = useCourseStore();
  const logout = useAuthStore((s) => s.logout);
  const { isDesktop } = useBreakpoint();
  const [sidePanel, setSidePanel] = useState<'notifs' | 'birthdays' | null>(null);
  const [sidePanelVisible, setSidePanelVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const screenWidth = Dimensions.get('window').width;
  const panelWidth = isDesktop ? 400 : screenWidth;

  const openSidePanel = (panel: 'notifs' | 'birthdays') => {
    if (sidePanel === panel) { closeSidePanel(); return; }
    setSidePanel(panel);
    setSidePanelVisible(true);
    slideAnim.setValue(panelWidth);
    backdropAnim.setValue(0);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.exp), useNativeDriver: true }),
    ]).start();
  };

  const closeSidePanel = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: panelWidth, duration: 350, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 350, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      setSidePanel(null);
      setSidePanelVisible(false);
    });
  };
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchAnim = useRef(new Animated.Value(0)).current;

  const openSearch = () => {
    setShowSearch(true);
    searchAnim.setValue(0);
    Animated.timing(searchAnim, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  };
  const closeSearch = () => {
    Animated.timing(searchAnim, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: false }).start(() => {
      setShowSearch(false);
      setSearchQuery('');
    });
  };

  const selectedCourse = mockCourses.find((c) => c.id === selectedCourseId);

  // Birthdays
  const [showBirthdays, setShowBirthdays] = useState(false);
  const [bdTab, setBdTab] = useState<'hoy' | 'proximos'>('hoy');

  const todayMD = useMemo(() => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const todayBirthdays = mockBirthdays.filter((b) => b.date === todayMD);
  const upcomingBirthdays = useMemo(() => {
    return mockBirthdays
      .filter((b) => b.date > todayMD)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [todayMD]);

  // Notifications
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const closeAll = () => {
    setCourseDropdownOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {/* ── Left: logo / course selector (hidden when search open) ── */}
        {!showSearch && (
          <View style={styles.left}>
            {!isDesktop ? (
              <Pressable style={styles.mobileLogoRow} onPress={() => router.replace('/(tabs)/wall' as any)}>
                <View style={styles.mobileLogoIcon}>
                  <MaterialCommunityIcons name="school" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.mobileLogoText}>Humand School</Text>
              </Pressable>
            ) : role === 'docente' ? (
              <View style={styles.courseSelectorRow}>
                <Text style={styles.courseSelectorLabel}>Curso activo</Text>
                <Pressable style={styles.courseSelector} onPress={() => { setCourseDropdownOpen(!courseDropdownOpen); setUserDropdownOpen(false); }}>
                  <View style={styles.courseIcon}>
                    <MaterialCommunityIcons name="google-classroom" size={15} color={Colors.primary} />
                  </View>
                  <Text style={styles.courseName}>{selectedCourse?.name ?? '—'}</Text>
                  <MaterialCommunityIcons
                    name={courseDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={15}
                    color={Colors.primary}
                  />
                </Pressable>
              </View>
            ) : null}
          </View>
        )}

        {/* ── Search bar (replaces left section, extends to icons) ── */}
        {showSearch && (
          <Animated.View style={[styles.searchOverlay, {
            flex: 1,
            opacity: searchAnim,
            transform: [{ translateX: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }],
          }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
            <TextInput
              placeholder="Buscar..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              autoFocus
              dense
              mode="flat"
              underlineStyle={{ display: 'none' }}
              contentStyle={{ paddingLeft: 0, fontSize: 14 }}
            />
            <Pressable onPress={closeSearch} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={18} color={Colors.textSecondary} />
            </Pressable>
          </Animated.View>
        )}

        {!(showSearch && !isDesktop) && (
        <View style={styles.rightGroup}>
          <View style={styles.actionIcons}>
            <Pressable style={styles.iconBtn} onPress={() => { closeAll(); showSearch ? closeSearch() : openSearch(); }} hitSlop={6}>
              <MaterialCommunityIcons name="magnify" size={24} color={Colors.primary} />
            </Pressable>
            <View>
              <Pressable style={styles.iconBtn} onPress={() => { closeAll(); openSidePanel('birthdays'); }} hitSlop={6}>
                <MaterialCommunityIcons name="cake-variant" size={22} color={Colors.primary} />
              </Pressable>
              {todayBirthdays.length > 0 && (
                <View style={styles.badgeIcon}>
                  <Text style={styles.badgeText}>{todayBirthdays.length}</Text>
                </View>
              )}
            </View>
            <View>
              <Pressable style={styles.iconBtn} onPress={() => { closeAll(); openSidePanel('notifs'); }} hitSlop={6}>
                <MaterialCommunityIcons name="bell-outline" size={22} color={Colors.primary} />
              </Pressable>
              {unreadCount > 0 && (
                <View style={styles.badgeIcon}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
          <Pressable style={styles.userInfo} onPress={() => { setUserDropdownOpen(!userDropdownOpen); setCourseDropdownOpen(false); }}>
            {isDesktop && (
              <View style={styles.userText}>
                <Text style={styles.userName}>{user?.name ?? '—'}</Text>
                <Text style={styles.userRole}>{rolLabel[role]}</Text>
              </View>
            )}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.name ?? 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          </Pressable>
        </View>
        )}
      </View>

      {/* Course dropdown */}
      {courseDropdownOpen && role === 'docente' && (
        <View style={styles.dropdown}>
          {mockCourses.map((course) => {
            const isActive = course.id === selectedCourseId;
            return (
              <Pressable
                key={course.id}
                style={[styles.option, isActive && styles.optionActive]}
                onPress={() => { setSelectedCourse(course.id); setCourseDropdownOpen(false); }}
              >
                <MaterialCommunityIcons name="google-classroom" size={15} color={isActive ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.optionText, isActive && styles.optionTextActive]}>{course.name}</Text>
                {isActive && <MaterialCommunityIcons name="check" size={13} color={Colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* User dropdown */}
      {userDropdownOpen && (
        <View style={[styles.dropdown, styles.userDropdown]}>
          {!isDesktop && (
            <>
              <View style={styles.dropdownUserInfo}>
                <View style={styles.dropdownAvatar}>
                  <Text style={styles.dropdownAvatarText}>{(user?.name ?? 'U').charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.dropdownUserName}>{user?.name ?? '—'}</Text>
                  <Text style={styles.dropdownUserRole}>{rolLabel[role]}</Text>
                </View>
              </View>
              <View style={styles.optionDivider} />
            </>
          )}
          <Pressable style={styles.option}>
            <MaterialCommunityIcons name="cog-outline" size={17} color={Colors.textSecondary} />
            <Text style={styles.optionText}>Configuración</Text>
          </Pressable>
          <View style={styles.optionDivider} />
          <Pressable
            style={styles.option}
            onPress={() => { setUserDropdownOpen(false); logout(); router.replace('/'); }}
          >
            <MaterialCommunityIcons name="logout" size={17} color={Colors.error} />
            <Text style={[styles.optionText, { color: Colors.error }]}>Cerrar sesión</Text>
          </Pressable>
        </View>
      )}

      {/* Side Panel - full height from right */}
      {sidePanelVisible && (
        <Modal visible transparent animationType="none">
          <View style={styles.sidePanelOverlay}>
            {isDesktop && (
              <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)', opacity: backdropAnim }]}>
                <Pressable style={{ flex: 1 }} onPress={closeSidePanel} />
              </Animated.View>
            )}
            <Animated.View style={[styles.sidePanel, !isDesktop && { width: '100%', borderLeftWidth: 0 }, { transform: [{ translateX: slideAnim }] }]}>
              <View style={styles.sidePanelHeader}>
                <Text style={styles.sidePanelTitle}>
                  {sidePanel === 'birthdays' ? '🎂 Cumpleaños' : 'Notificaciones'}
                </Text>
                <IconButton icon="close" size={18} iconColor={Colors.textSecondary} onPress={closeSidePanel} />
              </View>

              {sidePanel === 'birthdays' && (
                <>
                  <View style={styles.bdTabs}>
                    <Pressable style={[styles.bdTab, bdTab === 'hoy' && styles.bdTabActive]} onPress={() => setBdTab('hoy')}>
                      <Text style={[styles.bdTabText, bdTab === 'hoy' && styles.bdTabTextActive]}>
                        Hoy {todayBirthdays.length > 0 ? `(${todayBirthdays.length})` : ''}
                      </Text>
                    </Pressable>
                    <Pressable style={[styles.bdTab, bdTab === 'proximos' && styles.bdTabActive]} onPress={() => setBdTab('proximos')}>
                      <Text style={[styles.bdTabText, bdTab === 'proximos' && styles.bdTabTextActive]}>Próximos</Text>
                    </Pressable>
                  </View>
                  <ScrollView style={styles.sidePanelScroll}>
                    {bdTab === 'hoy' && (
                      <View style={styles.bdSection}>
                        {todayBirthdays.length > 0 ? todayBirthdays.map((b) => (
                          <View key={b.id} style={styles.bdRow}>
                            <View style={styles.bdAvatar}>
                              <MaterialCommunityIcons name="cake-variant" size={20} color={Colors.primary} />
                            </View>
                            <View style={styles.bdInfo}>
                              <Text style={styles.bdName}>{b.name}</Text>
                              <Text style={styles.bdGrade}>{b.grade === 'Docente' ? '👩‍🏫 Docente' : `🎒 ${b.grade}`}</Text>
                            </View>
                            <Text style={styles.bdEmoji}>🎉</Text>
                          </View>
                        )) : (
                          <Text style={styles.bdEmpty}>No hay cumpleaños hoy</Text>
                        )}
                      </View>
                    )}
                    {bdTab === 'proximos' && (
                      <View style={styles.bdSection}>
                        {upcomingBirthdays.length > 0 ? upcomingBirthdays.map((b) => (
                          <View key={b.id} style={styles.bdRow}>
                            <View style={[styles.bdAvatar, { backgroundColor: Colors.border }]}>
                              <Text style={styles.bdAvatarText}>{b.name[0]}</Text>
                            </View>
                            <View style={styles.bdInfo}>
                              <Text style={styles.bdName}>{b.name}</Text>
                              <Text style={styles.bdGrade}>{b.grade === 'Docente' ? '👩‍🏫 Docente' : `🎒 ${b.grade}`} · {b.date}</Text>
                            </View>
                          </View>
                        )) : (
                          <Text style={styles.bdEmpty}>No hay cumpleaños próximos</Text>
                        )}
                      </View>
                    )}
                  </ScrollView>
                </>
              )}

              {sidePanel === 'notifs' && (
                <>
                  {unreadCount > 0 && (
                    <Pressable style={styles.sidePanelMarkRead} onPress={markAllRead}>
                      <Text style={styles.markReadText}>Marcar todas como leídas</Text>
                    </Pressable>
                  )}
                  <ScrollView style={styles.sidePanelScroll}>
                    <View style={styles.notifList}>
                      {notifications.map((n) => {
                        const cfg = notifIcon[n.type];
                        return (
                          <Pressable
                            key={n.id}
                            style={[styles.notifRow, !n.read && styles.notifRowUnread]}
                            onPress={() => {
                              setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
                              closeSidePanel();
                              setTimeout(() => router.push(n.route as any), 300);
                            }}
                          >
                            <View style={[styles.notifIcon, { backgroundColor: cfg.color + '15' }]}>
                              <MaterialCommunityIcons name={cfg.icon as any} size={20} color={cfg.color} />
                            </View>
                            <View style={styles.notifContent}>
                              <Text style={[styles.notifTitle, !n.read && styles.notifTitleUnread]}>{n.title}</Text>
                              <Text style={styles.notifBody} numberOfLines={2}>{n.body}</Text>
                              <Text style={styles.notifTime}>{n.time}</Text>
                            </View>
                            {!n.read && <View style={styles.notifDot} />}
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                </>
              )}
            </Animated.View>
          </View>
        </Modal>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 100,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 20,
    height: 60,
  },
  left: {
    flex: 1,
  },
  mobileLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileLogoIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileLogoText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Inter_700Bold',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBtn: {
    padding: 4,
  },
  courseSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseSelectorLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  courseSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: `${Colors.primary}10`,
    borderWidth: 1,
    borderColor: `${Colors.primary}25`,
    borderRadius: 9,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  courseIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 4,
  },
  userText: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  userRole: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  badgeIcon: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    left: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 160,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  optionActive: {
    backgroundColor: `${Colors.primary}10`,
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: 'Inter_500Medium',
  },
  optionTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  userDropdown: {
    left: 'auto' as any,
    right: 16,
  },
  dropdownUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dropdownUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dropdownUserRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  optionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },

  // Birthday modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bdTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
  },
  bdTab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  bdTabActive: {
    borderBottomColor: Colors.primary,
  },
  bdTabText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bdTabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  bdSection: {
    padding: 16,
    gap: 12,
  },
  bdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bdAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bdAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  bdInfo: {
    flex: 1,
  },
  bdName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  bdGrade: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bdEmoji: {
    fontSize: 20,
  },
  bdEmpty: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },

  // Notifications full screen
  notifScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notifScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  notifBackBtn: {
    padding: 4,
  },
  notifScreenTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  markReadText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  notifList: {
    padding: 16,
    gap: 8,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
  },
  notifRowUnread: {
    backgroundColor: `${Colors.primary}08`,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  notifTitleUnread: {
    fontWeight: '700',
  },
  notifBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },

  // Desktop side panel
  sidePanelOverlay: {
    flex: 1,
  },
  sidePanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 400,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  sidePanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 8,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sidePanelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sidePanelScroll: {
    flex: 1,
  },
  sidePanelMarkRead: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    backgroundColor: 'transparent',
    height: 32,
    paddingVertical: 0,
  },
});

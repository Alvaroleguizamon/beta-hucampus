import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView, Platform, useWindowDimensions, ActivityIndicator, Alert, Modal, TextInput as RNTextInput, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../../constants/colors';
import { useSubjectsStore } from '../../lib/stores/subjects-store';
import { useAuthStore } from '../../lib/stores/auth-store';
import { useMaterialStore, uploadMaterialFile, SubjectMaterial } from '../../lib/stores/material-store';
import { useBreakpoint, SIDEBAR_WIDTH } from '../../hooks/useBreakpoint';
import { useCoursesStore } from '../../lib/stores/courses-store';
import CourseFilter from '../../components/ui/CourseFilter';
import StudentSearch from '../../components/ui/StudentSearch';

// ─── Static seed data (always visible) ───────────────────────────────────────
const staticMaterials: SubjectMaterial[] = [
  { id: 'mat1', subjectId: 's1', name: 'Guía de ejercicios - Unidad 3', type: 'pdf', createdAt: '2026-03-15' },
  { id: 'mat2', subjectId: 's1', name: 'Video: Ecuaciones cuadráticas', type: 'youtube_embed', youtubeUrl: 'https://www.youtube.com/watch?v=2ZzuZvz33X0', description: 'Clase 8 — Unidad 3: Ecuaciones cuadráticas.', createdAt: '2026-03-10' },
  { id: 'mat3', subjectId: 's1', name: 'Resumen teórico - Funciones', type: 'doc', createdAt: '2026-03-05' },
  { id: 'mat4', subjectId: 's2', name: 'Martín Fierro', type: 'pdf', url: 'https://digitales.bcn.gob.ar/files/textos/publicacion-martin-fierro.pdf', createdAt: '2026-03-14' },
  { id: 'mat5', subjectId: 's2', name: 'Guía de comprensión lectora', type: 'doc', createdAt: '2026-03-08' },
  { id: 'mat6', subjectId: 's3', name: 'Línea de tiempo - Rev. de Mayo', type: 'pdf', createdAt: '2026-03-12' },
  { id: 'mat7', subjectId: 's3', name: 'Documental: 25 de Mayo de 1810', type: 'youtube_embed', youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0', description: 'Clase 5 — La Revolución de Mayo.', createdAt: '2026-03-06' },
  { id: 'mat8', subjectId: 's3', name: 'Bibliografía complementaria', type: 'link', createdAt: '2026-03-01' },
  { id: 'mat9', subjectId: 's4', name: 'Guía de laboratorio - Célula', type: 'pdf', createdAt: '2026-03-13' },
  { id: 'mat10', subjectId: 's4', name: 'Clasificación de seres vivos', type: 'doc', createdAt: '2026-03-07' },
  { id: 'mat11', subjectId: 's5', name: 'Reading: Unit 3 - Technology', type: 'pdf', createdAt: '2026-03-11' },
  { id: 'mat12', subjectId: 's5', name: 'Grammar exercises', type: 'doc', createdAt: '2026-03-04' },
];

const typeIcon: Record<string, { icon: string; color: string }> = {
  pdf:           { icon: 'file-pdf-box',          color: '#E74C3C' },
  youtube_embed: { icon: 'youtube',                color: '#FF0000' },
  link:          { icon: 'link-variant',           color: Colors.accent },
  doc:           { icon: 'file-document-outline',  color: Colors.primary },
  file:          { icon: 'file-outline',           color: Colors.primary },
};

function getYoutubeId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : '';
}

function YoutubePlayer({ videoId, containerWidth }: { videoId: string; containerWidth?: number }) {
  const { width } = useWindowDimensions();
  const { isDesktop } = useBreakpoint();
  const baseWidth = containerWidth ?? (isDesktop ? width - SIDEBAR_WIDTH - 32 : width - 32);
  const playerWidth = Math.min(baseWidth, 860);
  const playerHeight = Math.round(playerWidth * (9 / 16));
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const containerStyle = { width: playerWidth, height: playerHeight, borderRadius: 12, overflow: 'hidden' as const, backgroundColor: '#000' };

  if (Platform.OS === 'web') {
    return (
      <View style={containerStyle}>
        <iframe width="100%" height="100%" src={embedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: 'none' }} />
      </View>
    );
  }
  return (
    <View style={containerStyle}>
      <WebView source={{ uri: embedUrl }} style={{ flex: 1 }} allowsFullscreenVideo javaScriptEnabled />
    </View>
  );
}

function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i.test(url);
}

async function downloadFile(url: string, fileName: string) {
  if (Platform.OS !== 'web') return;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch {
    // fallback: open in new tab
    window.open(url, '_blank');
  }
}

function PDFDetail({ item, onBack }: { item: SubjectMaterial; onBack: () => void }) {
  const { width } = useWindowDimensions();
  const { isDesktop } = useBreakpoint();
  const contentWidth = isDesktop ? width - SIDEBAR_WIDTH - 48 : width - 32;
  const viewerHeight = Math.round(contentWidth * 1.35);
  const isImage = isImageUrl(item.url ?? '');
  const viewerUrl = isImage
    ? item.url!
    : `https://docs.google.com/viewer?url=${encodeURIComponent(item.url!)}&embedded=true`;

  return (
    <View style={styles.container}>
      <View style={styles.pdfHeader}>
        <Pressable style={styles.pdfBackBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Material</Text>
        </Pressable>
        <Pressable style={styles.downloadBtn} onPress={() => downloadFile(item.url!, item.name)}>
          <MaterialCommunityIcons name="download" size={18} color={Colors.primary} />
          <Text style={styles.downloadBtnText}>Descargar</Text>
        </Pressable>
      </View>
      <Text style={styles.pdfTitle}>{item.name}</Text>
      <View style={[styles.pdfViewer, { height: isImage ? undefined : viewerHeight, marginHorizontal: isDesktop ? 24 : 16 }]}>
        {isImage ? (
          Platform.OS === 'web' ? (
            <img src={item.url!} alt={item.name} style={{ maxWidth: '100%', borderRadius: 12, display: 'block', margin: '0 auto' }} />
          ) : (
            <Image source={{ uri: item.url! }} style={{ width: contentWidth, height: contentWidth * 0.75, borderRadius: 12 }} resizeMode="contain" />
          )
        ) : Platform.OS === 'web' ? (
          <iframe src={viewerUrl} width="100%" height="100%" style={{ border: 'none', borderRadius: 12 }} />
        ) : (
          <WebView source={{ uri: viewerUrl }} style={{ flex: 1 }} javaScriptEnabled />
        )}
      </View>
    </View>
  );
}

function VideoDetail({ item, onBack, subject, allMaterials, onSelectVideo }: {
  item: SubjectMaterial;
  onBack: () => void;
  subject?: { name: string; color: string; teacher: string };
  allMaterials: SubjectMaterial[];
  onSelectVideo: (v: SubjectMaterial) => void;
}) {
  const videoId = getYoutubeId(item.youtubeUrl ?? '');
  const { isDesktop } = useBreakpoint();
  const [leftWidth, setLeftWidth] = useState<number | undefined>(undefined);
  const related = allMaterials.filter((m) => m.id !== item.id);

  const infoPanel = (
    <View style={[styles.infoPanel, isDesktop && styles.infoPanelDesktop]}>
      <Text style={styles.videoTitle}>{item.name}</Text>
      <Text style={styles.videoDate}>{item.createdAt.split('T')[0]}</Text>
      {subject && (
        <>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <View style={[styles.infoSubjectDot, { backgroundColor: subject.color }]} />
            <View>
              <Text style={styles.classInfoLabel}>Materia</Text>
              <Text style={[styles.classInfoValue, { color: subject.color }]}>{subject.name}</Text>
              <Text style={styles.classInfoLabel}>{subject.teacher}</Text>
            </View>
          </View>
        </>
      )}
      {item.description && (
        <>
          <View style={styles.infoDivider} />
          <View style={{ flex: 1 }}>
            <Text style={styles.descriptionLabel}>Descripción</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>
        </>
      )}
    </View>
  );

  const relatedSection = related.length > 0 && (
    <View style={styles.relatedSection}>
      <Text style={styles.relatedTitle}>Más material{subject ? ` de ${subject.name}` : ''}</Text>
      <View style={styles.relatedGrid}>
        {related.map((m) => {
          const tIcon = typeIcon[m.type] ?? typeIcon.file;
          return (
            <Pressable key={m.id} style={styles.relatedCard} onPress={() => m.type === 'youtube_embed' ? onSelectVideo(m) : undefined}>
              <View style={[styles.relatedIcon, { backgroundColor: tIcon.color + '15' }]}>
                <MaterialCommunityIcons name={tIcon.icon as any} size={22} color={tIcon.color} />
              </View>
              <Text style={styles.relatedName} numberOfLines={2}>{m.name}</Text>
              <Text style={styles.relatedDate}>{m.createdAt.split('T')[0]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  if (isDesktop) {
    const videoHeight = leftWidth ? Math.round(Math.min(leftWidth, 860) * (9 / 16)) : undefined;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.videoDetailContent}>
        <Pressable style={styles.backRow} onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={20} color={Colors.primary} /><Text style={styles.backText}>Material</Text></Pressable>
        <View style={styles.desktopLayout}>
          <View style={styles.desktopLeft} onLayout={(e) => setLeftWidth(e.nativeEvent.layout.width)}><YoutubePlayer videoId={videoId} containerWidth={leftWidth} /></View>
          <View style={[styles.desktopRight, videoHeight ? { height: videoHeight } : undefined]}>{infoPanel}</View>
        </View>
        {relatedSection}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.videoDetailContent}>
      <Pressable style={styles.backRow} onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={20} color={Colors.primary} /><Text style={styles.backText}>Material</Text></Pressable>
      <YoutubePlayer videoId={videoId} />
      {infoPanel}
      {relatedSection}
    </ScrollView>
  );
}

// ─── Upload modal for docente ─────────────────────────────────────────────────
function UploadModal({ subjectId, onClose }: { subjectId: string; onClose: () => void }) {
  const addMaterial = useMaterialStore((s) => s.addMaterial);
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<'file' | 'link' | 'youtube'>('file');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const publicUrl = await uploadMaterialFile(asset.uri, asset.name);
      const ext = asset.name.split('.').pop()?.toLowerCase();
      const type: SubjectMaterial['type'] = ext === 'pdf' ? 'pdf' : 'file';
      await addMaterial({ subjectId, name: name.trim() || asset.name, type, url: publicUrl, uploadedBy: user?.id });
      onClose();
    } catch (e: any) {
      if (Platform.OS === 'web') window.alert('Error al subir archivo: ' + (e.message ?? ''));
      else Alert.alert('Error', e.message ?? 'Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveLink = async () => {
    if (!name.trim() || !url.trim()) return;
    await addMaterial({ subjectId, name: name.trim(), type: 'link', url: url.trim(), uploadedBy: user?.id });
    onClose();
  };

  const handleSaveYoutube = async () => {
    if (!name.trim() || !url.trim()) return;
    await addMaterial({ subjectId, name: name.trim(), type: 'youtube_embed', youtubeUrl: url.trim(), description: description.trim() || undefined, uploadedBy: user?.id });
    onClose();
  };

  return (
    <Modal visible transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Agregar material</Text>
            <Pressable onPress={onClose}><MaterialCommunityIcons name="close" size={22} color={Colors.textSecondary} /></Pressable>
          </View>

          <View style={styles.modalTabs}>
            {([['file', 'Archivo', 'paperclip'], ['link', 'Link', 'link-variant'], ['youtube', 'YouTube', 'youtube']] as const).map(([key, label, icon]) => (
              <Pressable key={key} style={[styles.modalTab, tab === key && styles.modalTabActive]} onPress={() => setTab(key)}>
                <MaterialCommunityIcons name={icon as any} size={16} color={tab === key ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.modalTabText, tab === key && styles.modalTabTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <ScrollView style={{ maxHeight: 340 }} keyboardShouldPersistTaps="handled">
            <RNTextInput
              style={styles.input}
              placeholder="Nombre del material"
              placeholderTextColor={Colors.textSecondary}
              value={name}
              onChangeText={setName}
            />

            {tab === 'file' && (
              <Pressable style={[styles.pickFileBtn, uploading && { opacity: 0.6 }]} onPress={handlePickFile} disabled={uploading}>
                {uploading ? <ActivityIndicator size={18} color={Colors.primary} /> : <MaterialCommunityIcons name="upload" size={20} color={Colors.primary} />}
                <Text style={styles.pickFileBtnText}>{uploading ? 'Subiendo...' : 'Seleccionar archivo'}</Text>
              </Pressable>
            )}

            {(tab === 'link' || tab === 'youtube') && (
              <RNTextInput
                style={styles.input}
                placeholder={tab === 'youtube' ? 'URL de YouTube' : 'https://...'}
                placeholderTextColor={Colors.textSecondary}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
              />
            )}

            {tab === 'youtube' && (
              <RNTextInput
                style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                placeholder="Descripción (opcional)"
                placeholderTextColor={Colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            )}

            {tab !== 'file' && (
              <Pressable
                style={[styles.saveBtn, (!name.trim() || !url.trim()) && { opacity: 0.5 }]}
                onPress={tab === 'link' ? handleSaveLink : handleSaveYoutube}
                disabled={!name.trim() || !url.trim()}
              >
                <Text style={styles.saveBtnText}>Guardar</Text>
              </Pressable>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function MaterialScreen() {
  const subjects = useSubjectsStore((s) => s.subjects);
  const storeMaterials = useMaterialStore((s) => s.materials);
  const deleteMaterial = useMaterialStore((s) => s.deleteMaterial);
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = role === 'docente' || role === 'admin';
  const courses = useCoursesStore((s) => s.courses);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [studentFilterIds, setStudentFilterIds] = useState<string[]>([]);
  const courseForFilter = courses.find((c) => c.id === (selectedCourseId || courses[0]?.id));
  const toggleStudent = (id: string) => setStudentFilterIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<SubjectMaterial | null>(null);
  const [selectedPDF, setSelectedPDF] = useState<SubjectMaterial | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const getMaterials = (subjectId: string): SubjectMaterial[] => {
    const staticIds = new Set(staticMaterials.map((m) => m.id));
    const dynamic = storeMaterials.filter((m) => m.subjectId === subjectId);
    return [
      ...staticMaterials.filter((m) => m.subjectId === subjectId),
      ...dynamic.filter((m) => !staticIds.has(m.id)),
    ];
  };

  const handleDelete = (id: string) => {
    const doDelete = () => deleteMaterial(id);
    if (Platform.OS === 'web') {
      if (window.confirm('¿Eliminar este material?')) doDelete();
    } else {
      Alert.alert('Eliminar', '¿Eliminar este material?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  if (selectedPDF) {
    return <PDFDetail item={selectedPDF} onBack={() => setSelectedPDF(null)} />;
  }

  if (selectedVideo) {
    const subject = subjects.find((s) => s.id === (selectedSubject ?? ''));
    return (
      <VideoDetail
        item={selectedVideo}
        onBack={() => setSelectedVideo(null)}
        subject={subject}
        allMaterials={getMaterials(selectedSubject ?? '')}
        onSelectVideo={setSelectedVideo}
      />
    );
  }

  if (selectedSubject) {
    const subject = subjects.find((s) => s.id === selectedSubject);
    const materials = getMaterials(selectedSubject);
    const isStoreMaterial = (id: string) => !staticMaterials.find((m) => m.id === id);

    return (
      <View style={styles.container}>
        {showUpload && <UploadModal subjectId={selectedSubject} onClose={() => setShowUpload(false)} />}

        <Pressable style={styles.backRow} onPress={() => setSelectedSubject(null)}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Materias</Text>
        </Pressable>

        <View style={[styles.subjectBanner, { backgroundColor: subject?.color + '20' }]}>
          <MaterialCommunityIcons name="book-open-variant" size={32} color={subject?.color} />
          <Text style={[styles.subjectBannerTitle, { color: subject?.color }]}>{subject?.name}</Text>
          <Text style={styles.subjectBannerTeacher}>{subject?.teacher}</Text>
        </View>

        {canEdit && (
          <Pressable style={styles.uploadBtn} onPress={() => setShowUpload(true)}>
            <MaterialCommunityIcons name="cloud-upload-outline" size={20} color="#FFFFFF" />
            <Text style={styles.uploadBtnText}>Subir material</Text>
          </Pressable>
        )}

        <FlatList
          data={materials}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const tIcon = typeIcon[item.type] ?? typeIcon.file;
            const isVideo = item.type === 'youtube_embed';
            const isPDFWithUrl = (item.type === 'pdf' || item.type === 'file') && !!item.url;
            const isLink = item.type === 'link' && !!item.url;
            const canDelete = canEdit && isStoreMaterial(item.id);
            return (
              <Pressable
                style={styles.materialRow}
                onPress={() => {
                  if (isVideo) setSelectedVideo(item);
                  else if (isPDFWithUrl) setSelectedPDF(item);
                  else if (isLink && item.url) {
                    if (Platform.OS === 'web') window.open(item.url, '_blank');
                  }
                }}
              >
                <View style={[styles.materialIcon, { backgroundColor: tIcon.color + '15' }]}>
                  <MaterialCommunityIcons name={tIcon.icon as any} size={24} color={tIcon.color} />
                </View>
                <View style={styles.materialInfo}>
                  <Text style={styles.materialName}>{item.name}</Text>
                  <Text style={styles.materialDate}>{item.createdAt.split('T')[0]}</Text>
                </View>
                {isVideo && <MaterialCommunityIcons name="play-circle-outline" size={22} color={Colors.primary} />}
                {isPDFWithUrl && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Pressable hitSlop={8} onPress={(e) => { e.stopPropagation(); downloadFile(item.url!, item.name); }}>
                      <MaterialCommunityIcons name="download-outline" size={22} color={Colors.primary} />
                    </Pressable>
                    <MaterialCommunityIcons name="eye-outline" size={22} color={Colors.primary} />
                  </View>
                )}
                {isLink && <MaterialCommunityIcons name="open-in-new" size={22} color={Colors.primary} />}
                {canDelete && (
                  <Pressable onPress={() => handleDelete(item.id)} hitSlop={8} style={{ padding: 4 }}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.error} />
                  </Pressable>
                )}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No hay material disponible</Text>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {role === 'docente' && (
        <>
          <CourseFilter courses={courses} selectedCourseId={selectedCourseId || courses[0]?.id || ''} onSelect={(id) => { setSelectedCourseId(id); setStudentFilterIds([]); }} />
          <StudentSearch students={courseForFilter?.students ?? []} selectedIds={studentFilterIds} onToggle={toggleStudent} onClear={() => setStudentFilterIds([])} />
        </>
      )}
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const count = getMaterials(item.id).length;
          return (
            <Pressable style={styles.subjectRow} onPress={() => setSelectedSubject(item.id)}>
              <View style={[styles.subjectIcon, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name="book-open-variant" size={24} color={item.color} />
              </View>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{item.name}</Text>
                <Text style={styles.subjectCount}>{count} archivos</Text>
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
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 16, paddingBottom: 0 },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '500' },
  subjectBanner: { margin: 16, borderRadius: 16, padding: 20, alignItems: 'center' },
  subjectBannerTitle: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  subjectBannerTeacher: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, marginHorizontal: 16, marginBottom: 8,
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10,
    alignSelf: 'flex-start',
  },
  uploadBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10 },
  subjectIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  subjectCount: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  materialRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 8 },
  materialIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  materialInfo: { flex: 1 },
  materialName: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  materialDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: Colors.textSecondary },

  // Video detail
  videoDetailContent: { paddingBottom: 40 },
  desktopLayout: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 8, gap: 24 },
  desktopLeft: { flex: 3 },
  desktopRight: { flex: 2 },
  infoPanel: { paddingHorizontal: 16, paddingTop: 16 },
  infoPanelDesktop: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  videoTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  videoDate: { fontSize: 12, color: Colors.textSecondary },
  infoDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoSubjectDot: { width: 4, borderRadius: 4, alignSelf: 'stretch', minHeight: 40 },
  classInfoLabel: { fontSize: 11, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginTop: 2 },
  classInfoValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  descriptionLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  descriptionText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },
  relatedSection: { marginTop: 24, paddingHorizontal: 16 },
  relatedTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  relatedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  relatedCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, width: 180, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  relatedIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  relatedName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, lineHeight: 18, marginBottom: 6 },
  relatedDate: { fontSize: 11, color: Colors.textSecondary },

  // PDF viewer
  pdfHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  pdfBackBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pdfTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, paddingHorizontal: 16, paddingBottom: 12 },
  pdfViewer: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', flex: 1 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary },
  downloadBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  // Upload modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', maxWidth: 480 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  modalTabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  modalTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  modalTabActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  modalTabText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  modalTabTextActive: { color: Colors.primary, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary, marginBottom: 12 },
  pickFileBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: Colors.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 12, justifyContent: 'center' },
  pickFileBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
});

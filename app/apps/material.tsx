import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Pressable, ScrollView, Platform, useWindowDimensions, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import { Colors } from '../../constants/colors';
import { useSubjectsStore } from '../../lib/stores/subjects-store';
import { useBreakpoint, SIDEBAR_WIDTH } from '../../hooks/useBreakpoint';

interface MaterialBase {
  id: string;
  name: string;
  date: string;
}

interface MaterialFile extends MaterialBase {
  type: 'pdf' | 'link' | 'doc';
  url?: string;
}

interface MaterialVideo extends MaterialBase {
  type: 'youtube_embed';
  youtubeUrl: string;
  description: string;
}

type Material = MaterialFile | MaterialVideo;

const materialBySubject: Record<string, Material[]> = {
  s1: [
    { id: 'mat1', name: 'Guía de ejercicios - Unidad 3', type: 'pdf', date: '2026-03-15' },
    {
      id: 'mat2',
      name: 'Video: Ecuaciones cuadráticas',
      type: 'youtube_embed',
      date: '2026-03-10',
      youtubeUrl: 'https://www.youtube.com/watch?v=2ZzuZvz33X0',
      description: 'Clase 8 — Unidad 3: Ecuaciones cuadráticas. En este video el profesor explica el método de la fórmula cuadrática y sus aplicaciones en problemas de la vida real.',
    },
    { id: 'mat3', name: 'Resumen teórico - Funciones', type: 'doc', date: '2026-03-05' },
  ],
  s2: [
    { id: 'mat4', name: 'Martín Fierro', type: 'pdf', date: '2026-03-14', url: 'https://digitales.bcn.gob.ar/files/textos/publicacion-martin-fierro.pdf' },
    { id: 'mat5', name: 'Guía de comprensión lectora', type: 'doc', date: '2026-03-08' },
  ],
  s3: [
    { id: 'mat6', name: 'Línea de tiempo - Rev. de Mayo', type: 'pdf', date: '2026-03-12' },
    {
      id: 'mat7',
      name: 'Documental: 25 de Mayo de 1810',
      type: 'youtube_embed',
      date: '2026-03-06',
      youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      description: 'Clase 5 — La Revolución de Mayo. Documental sobre los eventos del 25 de mayo de 1810 y la formación de la Primera Junta de Gobierno en el Río de la Plata.',
    },
    { id: 'mat8', name: 'Bibliografía complementaria', type: 'link', date: '2026-03-01' },
  ],
  s4: [
    { id: 'mat9', name: 'Guía de laboratorio - Célula', type: 'pdf', date: '2026-03-13' },
    { id: 'mat10', name: 'Clasificación de seres vivos', type: 'doc', date: '2026-03-07' },
  ],
  s5: [
    { id: 'mat11', name: 'Reading: Unit 3 - Technology', type: 'pdf', date: '2026-03-11' },
    { id: 'mat12', name: 'Grammar exercises', type: 'doc', date: '2026-03-04' },
  ],
};

const typeIcon: Record<string, { icon: string; color: string }> = {
  pdf: { icon: 'file-pdf-box', color: '#E74C3C' },
  youtube_embed: { icon: 'youtube', color: '#FF0000' },
  link: { icon: 'link-variant', color: Colors.accent },
  doc: { icon: 'file-document-outline', color: Colors.primary },
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

  const containerStyle = {
    width: playerWidth,
    height: playerHeight,
    borderRadius: 12,
    overflow: 'hidden' as const,
    backgroundColor: '#000',
  };

  if (Platform.OS === 'web') {
    return (
      <View style={containerStyle}>
        <iframe
          width="100%"
          height="100%"
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none' }}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <WebView
        source={{ uri: embedUrl }}
        style={{ flex: 1 }}
        allowsFullscreenVideo
        javaScriptEnabled
      />
    </View>
  );
}

function PDFDetail({ item, onBack }: { item: MaterialFile; onBack: () => void }) {
  const { width } = useWindowDimensions();
  const { isDesktop } = useBreakpoint();
  const contentWidth = isDesktop ? width - SIDEBAR_WIDTH - 48 : width - 32;
  const viewerHeight = Math.round(contentWidth * 1.35);

  // Google Docs Viewer bypasses X-Frame-Options restrictions on both web and native
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(item.url!)}&embedded=true`;

  return (
    <View style={styles.container}>
      <View style={styles.pdfHeader}>
        <Pressable style={styles.pdfBackBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Material</Text>
        </Pressable>
        <Pressable
          style={styles.downloadBtn}
          onPress={() => {
            if (Platform.OS === 'web') {
              const a = document.createElement('a');
              a.href = item.url!;
              a.download = item.name;
              a.target = '_blank';
              a.click();
            }
          }}
        >
          <MaterialCommunityIcons name="download" size={18} color={Colors.primary} />
          <Text style={styles.downloadBtnText}>Descargar</Text>
        </Pressable>
      </View>

      <Text style={styles.pdfTitle}>{item.name}</Text>

      <View style={[styles.pdfViewer, { height: viewerHeight, marginHorizontal: isDesktop ? 24 : 16 }]}>
        {Platform.OS === 'web' ? (
          <iframe
            src={viewerUrl}
            width="100%"
            height="100%"
            style={{ border: 'none', borderRadius: 12 }}
          />
        ) : (
          <WebView
            source={{ uri: viewerUrl }}
            style={{ flex: 1 }}
            javaScriptEnabled
          />
        )}
      </View>
    </View>
  );
}

function VideoDetail({ item, onBack, subject, subjectId, onSelectVideo }: {
  item: MaterialVideo;
  onBack: () => void;
  subject?: { name: string; color: string; teacher: string };
  subjectId?: string;
  onSelectVideo: (v: MaterialVideo) => void;
}) {
  const videoId = getYoutubeId(item.youtubeUrl);
  const { isDesktop } = useBreakpoint();
  const [leftWidth, setLeftWidth] = useState<number | undefined>(undefined);

  const relatedMaterials = subjectId
    ? (materialBySubject[subjectId] ?? []).filter((m) => m.id !== item.id)
    : [];

  const infoPanel = (
    <View style={[styles.infoPanel, isDesktop && styles.infoPanelDesktop]}>
      <Text style={styles.videoTitle}>{item.name}</Text>
      <Text style={styles.videoDate}>{item.date}</Text>

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

      <View style={styles.infoDivider} />
      <View style={{ flex: 1 }}>
        <Text style={styles.descriptionLabel}>Descripción de la clase</Text>
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>
    </View>
  );

  const relatedSection = relatedMaterials.length > 0 && (
    <View style={styles.relatedSection}>
      <Text style={styles.relatedTitle}>
        Más material{subject ? ` de ${subject.name}` : ''}
      </Text>
      <View style={styles.relatedGrid}>
        {relatedMaterials.map((m) => {
          const tIcon = typeIcon[m.type];
          const isVideo = m.type === 'youtube_embed';
          return (
            <Pressable
              key={m.id}
              style={styles.relatedCard}
              onPress={() => isVideo ? onSelectVideo(m as MaterialVideo) : undefined}
            >
              <View style={[styles.relatedIcon, { backgroundColor: tIcon.color + '15' }]}>
                <MaterialCommunityIcons name={tIcon.icon as any} size={22} color={tIcon.color} />
              </View>
              <Text style={styles.relatedName} numberOfLines={2}>{m.name}</Text>
              <Text style={styles.relatedDate}>{m.date}</Text>
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
        <Pressable style={styles.backRow} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Material</Text>
        </Pressable>
        <View style={styles.desktopLayout}>
          <View style={styles.desktopLeft} onLayout={(e) => setLeftWidth(e.nativeEvent.layout.width)}>
            <YoutubePlayer videoId={videoId} containerWidth={leftWidth} />
          </View>
          <View style={[styles.desktopRight, videoHeight ? { height: videoHeight } : undefined]}>
            {infoPanel}
          </View>
        </View>
        {relatedSection}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.videoDetailContent}>
      <Pressable style={styles.backRow} onPress={onBack}>
        <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Material</Text>
      </Pressable>
      <YoutubePlayer videoId={videoId} />
      {infoPanel}
      {relatedSection}
    </ScrollView>
  );
}

export default function MaterialScreen() {
  const subjects = useSubjectsStore((s) => s.subjects);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MaterialVideo | null>(null);
  const [selectedPDF, setSelectedPDF] = useState<MaterialFile | null>(null);

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
        subjectId={selectedSubject ?? undefined}
        onSelectVideo={setSelectedVideo}
      />
    );
  }

  if (selectedSubject) {
    const subject = subjects.find((s) => s.id === selectedSubject);
    const materials = materialBySubject[selectedSubject] ?? [];

    return (
      <View style={styles.container}>
        <Pressable style={styles.backRow} onPress={() => setSelectedSubject(null)}>
          <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Materias</Text>
        </Pressable>

        <View style={[styles.subjectBanner, { backgroundColor: subject?.color + '20' }]}>
          <MaterialCommunityIcons name="book-open-variant" size={32} color={subject?.color} />
          <Text style={[styles.subjectBannerTitle, { color: subject?.color }]}>{subject?.name}</Text>
          <Text style={styles.subjectBannerTeacher}>{subject?.teacher}</Text>
        </View>

        <FlatList
          data={materials}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const tIcon = typeIcon[item.type];
            const isVideo = item.type === 'youtube_embed';
            const isPDFWithUrl = item.type === 'pdf' && !!(item as MaterialFile).url;
            const isInteractive = isVideo || isPDFWithUrl;
            return (
              <Pressable
                style={styles.materialRow}
                onPress={() => {
                  if (isVideo) setSelectedVideo(item as MaterialVideo);
                  else if (isPDFWithUrl) setSelectedPDF(item as MaterialFile);
                }}
              >
                <View style={[styles.materialIcon, { backgroundColor: tIcon.color + '15' }]}>
                  <MaterialCommunityIcons name={tIcon.icon as any} size={24} color={tIcon.color} />
                </View>
                <View style={styles.materialInfo}>
                  <Text style={styles.materialName}>{item.name}</Text>
                  <Text style={styles.materialDate}>{item.date}</Text>
                </View>
                {isVideo && <MaterialCommunityIcons name="play-circle-outline" size={22} color={Colors.primary} />}
                {isPDFWithUrl && <MaterialCommunityIcons name="eye-outline" size={22} color={Colors.primary} />}
                {!isInteractive && <MaterialCommunityIcons name="download" size={22} color={Colors.textSecondary} />}
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
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const count = (materialBySubject[item.id] ?? []).length;
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
  subjectBanner: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  subjectBannerTitle: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  subjectBannerTeacher: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  subjectIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  subjectCount: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  materialIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  materialInfo: { flex: 1 },
  materialName: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  materialDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: Colors.textSecondary },

  // Video detail
  videoDetailContent: { paddingBottom: 40 },
  desktopLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 24,
  },
  desktopLeft: { flex: 3 },
  desktopRight: { flex: 2, paddingTop: 0 },
  infoPanel: { paddingHorizontal: 16, paddingTop: 16 },
  infoPanelDesktop: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  videoMeta: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  videoTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  videoDate: { fontSize: 12, color: Colors.textSecondary },
  infoDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  infoSubjectDot: { width: 4, borderRadius: 4, alignSelf: 'stretch', minHeight: 40 },
  classInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderLeftWidth: 4,
  },
  classInfoLabel: { fontSize: 11, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginTop: 2 },
  classInfoValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
  },
  descriptionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  descriptionText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22 },
  relatedSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  relatedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  relatedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  relatedIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  relatedName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 6,
  },
  relatedDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  pdfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pdfBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pdfTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  pdfViewer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    flex: 1,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  downloadBtnText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
});

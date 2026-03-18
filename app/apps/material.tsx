import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { mockSubjects } from '../../lib/mock-data';

interface Material {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'link' | 'doc';
  date: string;
}

const materialBySubject: Record<string, Material[]> = {
  s1: [
    { id: 'mat1', name: 'Guía de ejercicios - Unidad 3', type: 'pdf', date: '2026-03-15' },
    { id: 'mat2', name: 'Video: Ecuaciones cuadráticas', type: 'video', date: '2026-03-10' },
    { id: 'mat3', name: 'Resumen teórico - Funciones', type: 'doc', date: '2026-03-05' },
  ],
  s2: [
    { id: 'mat4', name: 'Análisis de "Martín Fierro"', type: 'pdf', date: '2026-03-14' },
    { id: 'mat5', name: 'Guía de comprensión lectora', type: 'doc', date: '2026-03-08' },
  ],
  s3: [
    { id: 'mat6', name: 'Línea de tiempo - Rev. de Mayo', type: 'pdf', date: '2026-03-12' },
    { id: 'mat7', name: 'Documental: 25 de Mayo', type: 'video', date: '2026-03-06' },
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
  video: { icon: 'play-circle', color: '#9C27B0' },
  link: { icon: 'link-variant', color: Colors.accent },
  doc: { icon: 'file-document-outline', color: Colors.primary },
};

export default function MaterialScreen() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  if (selectedSubject) {
    const subject = mockSubjects.find((s) => s.id === selectedSubject);
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
            return (
              <Pressable style={styles.materialRow}>
                <View style={[styles.materialIcon, { backgroundColor: tIcon.color + '15' }]}>
                  <MaterialCommunityIcons name={tIcon.icon as any} size={24} color={tIcon.color} />
                </View>
                <View style={styles.materialInfo}>
                  <Text style={styles.materialName}>{item.name}</Text>
                  <Text style={styles.materialDate}>{item.date}</Text>
                </View>
                <MaterialCommunityIcons name="download" size={22} color={Colors.textSecondary} />
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
        data={mockSubjects}
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
});

import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface Student {
  id: string;
  name: string;
}

interface StudentSearchProps {
  students: Student[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}

export default function StudentSearch({ students, selectedIds, onToggle, onClear }: StudentSearchProps) {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter((s) => s.name.toLowerCase().includes(q));
  }, [search, students]);

  const selectedStudents = students.filter((s) => selectedIds.includes(s.id));
  const isAllSelected = selectedIds.length === 0;

  return (
    <>
      {showDropdown && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => { setShowDropdown(false); setSearch(''); }}
        />
      )}
      <View style={styles.container}>
        {selectedStudents.length > 0 && (
          <View style={styles.chipsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              <Pressable style={styles.clearChip} onPress={onClear}>
                <MaterialCommunityIcons name="account-group" size={14} color={Colors.textSecondary} />
                <Text style={styles.clearChipText}>Ver todos</Text>
                <MaterialCommunityIcons name="close" size={14} color={Colors.textSecondary} />
              </Pressable>
              {selectedStudents.map((s) => (
                <View key={s.id} style={styles.selectedChip}>
                  <View style={styles.avatarSmall}>
                    <Text style={styles.avatarSmallText}>{s.name[0]}</Text>
                  </View>
                  <Text style={styles.selectedName}>{s.name}</Text>
                  <Pressable onPress={() => onToggle(s.id)} hitSlop={8}>
                    <MaterialCommunityIcons name="close-circle" size={16} color={Colors.textSecondary} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
          <TextInput
            placeholder={isAllSelected ? 'Buscar alumno...' : `${selectedStudents.length} seleccionado${selectedStudents.length > 1 ? 's' : ''}`}
            placeholderTextColor={Colors.textSecondary}
            value={search}
            onChangeText={(t) => { setSearch(t); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            style={styles.input}
            dense
            mode="flat"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={18} color={Colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {showDropdown && (
          <View style={styles.dropdown}>
            <Pressable
              style={[styles.dropdownItem, isAllSelected && { backgroundColor: Colors.primary + '10' }]}
              onPress={() => { onClear(); setShowDropdown(false); setSearch(''); }}
            >
              <MaterialCommunityIcons name="account-group" size={18} color={Colors.primary} />
              <Text style={styles.allText}>Todos los alumnos</Text>
              {isAllSelected && <MaterialCommunityIcons name="check-circle" size={18} color={Colors.primary} />}
            </Pressable>
            {filtered.map((s) => {
              const selected = selectedIds.includes(s.id);
              return (
                <Pressable
                  key={s.id}
                  style={[styles.dropdownItem, selected && { backgroundColor: Colors.primary + '08' }]}
                  onPress={() => { onToggle(s.id); setSearch(''); }}
                >
                  <MaterialCommunityIcons
                    name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={20}
                    color={selected ? Colors.primary : Colors.border}
                  />
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{s.name[0]}</Text>
                  </View>
                  <Text style={[styles.studentName, selected && { color: Colors.primary, fontWeight: '600' }]}>{s.name}</Text>
                </Pressable>
              );
            })}
            {filtered.length === 0 && (
              <View style={styles.emptyRow}>
                <Text style={styles.emptyText}>No se encontraron alumnos</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 10,
  },
  chipsRow: {
    marginBottom: 8,
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.border,
  },
  clearChipText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
  },
  avatarSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary + '25',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  selectedName: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 6,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 14,
    height: 38,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 250,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '50',
  },
  allText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.primary },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  studentName: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  emptyRow: { padding: 16, alignItems: 'center' },
  emptyText: { fontSize: 13, color: Colors.textSecondary },
});

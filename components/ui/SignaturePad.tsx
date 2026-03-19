import React, { useRef, useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Pressable, Animated, GestureResponderEvent } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface SignaturePadProps {
  onConfirm: (svgPaths: string[]) => void;
  onCancel: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
}

export default function SignaturePad({ onConfirm, onCancel, onTouchStart, onTouchEnd }: SignaturePadProps) {
  const pathsRef = useRef<string[]>([]);
  const currentPath = useRef('');
  const [renderKey, setRenderKey] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fadeAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTouchStart = useCallback((e: GestureResponderEvent) => {
    e.stopPropagation();
    onTouchStart?.();
    setDrawing(true);
    const { locationX, locationY } = e.nativeEvent;
    currentPath.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
    setRenderKey((k) => k + 1);
  }, [onTouchStart]);

  const handleTouchMove = useCallback((e: GestureResponderEvent) => {
    e.stopPropagation();
    if (!currentPath.current) return;
    const { locationX, locationY } = e.nativeEvent;
    currentPath.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
    setRenderKey((k) => k + 1);
  }, []);

  const handleTouchEnd = useCallback(() => {
    onTouchEnd?.();
    setDrawing(false);
    if (currentPath.current) {
      pathsRef.current = [...pathsRef.current, currentPath.current];
      currentPath.current = '';
      setHasSigned(true);
      setRenderKey((k) => k + 1);
    }
  }, [onTouchEnd]);

  const handleClear = useCallback(() => {
    pathsRef.current = [];
    currentPath.current = '';
    setHasSigned(false);
    setRenderKey((k) => k + 1);
  }, []);

  const allPaths = currentPath.current
    ? [...pathsRef.current, currentPath.current]
    : pathsRef.current;

  return (
    <Animated.View style={[styles.container, {
      opacity: fadeAnim,
      transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
    }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="draw-pen" size={20} color={Colors.primary} />
        <Text style={styles.title}>Firmá para autorizar</Text>
      </View>

      <Text style={styles.hint}>Dibujá tu firma en el recuadro</Text>

      <View
        style={styles.canvasWrapper}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
        onResponderTerminate={handleTouchEnd}
      >
        <Svg style={styles.canvas} key={renderKey}>
          {allPaths.map((d, i) => (
            <Path key={i} d={d} stroke={Colors.textPrimary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </Svg>
        {!hasSigned && !drawing && (
          <View style={styles.placeholder} pointerEvents="none">
            <MaterialCommunityIcons name="gesture" size={32} color={Colors.border} />
          </View>
        )}
        <View style={styles.signatureLine} pointerEvents="none" />
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.clearBtn} onPress={handleClear}>
          <MaterialCommunityIcons name="eraser" size={18} color={Colors.textSecondary} />
          <Text style={styles.clearBtnText}>Borrar</Text>
        </Pressable>

        <View style={styles.mainActions}>
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.confirmBtn, !hasSigned && styles.confirmBtnDisabled]}
            onPress={hasSigned ? () => onConfirm(pathsRef.current) : undefined}
          >
            <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />
            <Text style={styles.confirmBtnText}>Confirmar firma</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

export function SignaturePreview({ paths }: { paths: string[] }) {
  if (paths.length === 0) return null;
  return (
    <View style={styles.previewContainer}>
      <Svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet" style={styles.previewCanvas}>
        {paths.map((d, i) => (
          <Path key={i} d={d} stroke={Colors.textPrimary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  hint: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  canvasWrapper: {
    height: 160,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
    position: 'relative',
    touchAction: 'none',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureLine: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: Colors.border,
  },
  actions: {
    marginTop: 12,
    gap: 10,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  clearBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  mainActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  previewContainer: {
    height: 120,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginTop: 8,
  },
  previewCanvas: {
    width: '100%',
    height: '100%',
  },
});

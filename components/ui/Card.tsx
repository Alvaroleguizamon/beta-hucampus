import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import { Layout } from '../../constants/layout';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: Props) {
  return (
    <PaperCard style={[styles.card, style]} onPress={onPress} mode="elevated">
      <PaperCard.Content>{children}</PaperCard.Content>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Layout.paddingSmall,
    borderRadius: Layout.borderRadius,
    backgroundColor: '#FFFFFF',
  },
});

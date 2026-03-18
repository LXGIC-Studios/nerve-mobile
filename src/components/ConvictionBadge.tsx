import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface ConvictionBadgeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
}

export function ConvictionBadge({ score, size = 'md' }: ConvictionBadgeProps) {
  const getColor = () => {
    if (score >= 70) return colors.profit;
    if (score >= 40) return colors.caution;
    return colors.loss;
  };

  const getLabel = () => {
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MED';
    return 'LOW';
  };

  const dim = size === 'lg' ? 64 : size === 'md' ? 48 : 36;
  const fontSz = size === 'lg' ? 20 : size === 'md' ? 16 : 12;
  const labelSz = size === 'lg' ? 9 : size === 'md' ? 8 : 7;
  const color = getColor();

  return (
    <View style={[styles.container, { width: dim, height: dim, borderColor: `${color}40` }]}>
      <View style={[styles.ring, { width: dim - 4, height: dim - 4, borderColor: color }]}>
        <Text style={[styles.score, { fontSize: fontSz, color }]}>{score}</Text>
        <Text style={[styles.label, { fontSize: labelSz, color: `${color}99` }]}>{getLabel()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: -2,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface StatBoxProps {
  label: string;
  value: string;
  change?: string;
  changeLabel?: string;
  accent?: boolean;
}

export function StatBox({ label, value, change, changeLabel, accent }: StatBoxProps) {
  const isPositive = change?.startsWith('+');

  return (
    <View style={[styles.container, accent && styles.accent]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent && styles.valueAccent]}>{value}</Text>
      {change && (
        <Text style={[styles.change, { color: isPositive ? colors.profit : colors.loss }]}>
          {change}{changeLabel ? ` ${changeLabel}` : ''}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  accent: {
    borderColor: colors.borderAccent,
    backgroundColor: `${colors.accent}08`,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  valueAccent: {
    color: colors.accent,
  },
  change: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});

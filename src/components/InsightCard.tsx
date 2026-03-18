import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import type { AIInsight } from '../data/mockData';

const iconMap = {
  warning: '⚠️',
  info: 'ℹ️',
  caution: '🔥',
  success: '✅',
};

const borderColorMap = {
  warning: colors.loss,
  info: colors.accent,
  caution: colors.caution,
  success: colors.profit,
};

interface InsightCardProps {
  insight: AIInsight;
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <View style={[styles.container, { borderLeftColor: borderColorMap[insight.type] }]}>
      <Text style={styles.icon}>{iconMap[insight.type]}</Text>
      <Text style={styles.text}>{insight.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  icon: {
    fontSize: 16,
    marginTop: 1,
  },
  text: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});

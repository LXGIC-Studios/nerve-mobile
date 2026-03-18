import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fmt, pnlColor, pnlSign } from '../hooks/useFormatters';
import type { Position } from '../data/mockData';

interface PositionCardProps {
  position: Position;
  onPress?: () => void;
}

export function PositionCard({ position, onPress }: PositionCardProps) {
  const isLong = position.side === 'long';
  const pnl = position.unrealizedPnl;
  const pnlPct = position.unrealizedPnlPct;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.market}>{position.market}</Text>
          <View style={[styles.sideBadge, { backgroundColor: isLong ? 'rgba(0,214,143,0.15)' : 'rgba(255,107,138,0.15)' }]}>
            <Text style={[styles.sideText, { color: isLong ? colors.profit : colors.loss }]}>
              {position.side.toUpperCase()}
            </Text>
          </View>
          <View style={styles.leverageBadge}>
            <Text style={styles.leverageText}>{position.leverage}x</Text>
          </View>
        </View>
        <Text style={styles.openedAt}>{position.openedAt}</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Size</Text>
          <Text style={styles.statValue}>{position.size} {position.market.split('-')[0]}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Entry</Text>
          <Text style={styles.statValue}>${fmt(position.entryPrice)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Mark</Text>
          <Text style={styles.statValue}>${fmt(position.currentPrice)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Liq. Price</Text>
          <Text style={[styles.statValue, { color: colors.caution }]}>${fmt(position.liquidationPrice)}</Text>
        </View>
      </View>

      {/* PnL Footer */}
      <View style={styles.footer}>
        <View style={styles.marginInfo}>
          <Text style={styles.marginLabel}>Margin</Text>
          <Text style={styles.marginValue}>${fmt(position.margin)}</Text>
        </View>
        <View style={styles.pnlBox}>
          <Text style={[styles.pnlValue, { color: pnlColor(pnl) }]}>
            {pnlSign(pnl)}${fmt(Math.abs(pnl))}
          </Text>
          <Text style={[styles.pnlPct, { color: pnlColor(pnl) }]}>
            {pnlSign(pnlPct)}{pnlPct.toFixed(2)}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  pressed: {
    backgroundColor: colors.bgElevated,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  market: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  sideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sideText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  leverageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  leverageText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  openedAt: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  marginInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  marginLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  marginValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  pnlBox: {
    alignItems: 'flex-end',
  },
  pnlValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pnlPct: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});

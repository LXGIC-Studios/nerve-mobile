import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fmt } from '../hooks/useFormatters';
import type { Market } from '../data/mockData';

interface MarketCardProps {
  market: Market;
  onPress?: () => void;
}

export function MarketCard({ market, onPress }: MarketCardProps) {
  const isPositive = market.change24h >= 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.left}>
        <View style={styles.symbolRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>{market.base[0]}</Text>
          </View>
          <View>
            <Text style={styles.symbol}>{market.symbol}</Text>
            <Text style={styles.volume}>Vol {market.volume}</Text>
          </View>
        </View>
      </View>

      <View style={styles.center}>
        <MiniSparkline positive={isPositive} />
      </View>

      <View style={styles.right}>
        <Text style={styles.price}>${fmt(market.price, market.price < 1 ? 4 : 2)}</Text>
        <View style={[styles.changeBadge, { backgroundColor: isPositive ? 'rgba(0,214,143,0.12)' : 'rgba(255,107,138,0.12)' }]}>
          <Text style={[styles.changeText, { color: isPositive ? colors.profit : colors.loss }]}>
            {isPositive ? '+' : ''}{market.change24h.toFixed(2)}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function MiniSparkline({ positive }: { positive: boolean }) {
  // Simple SVG-free sparkline placeholder using views
  const heights = [30, 45, 35, 55, 40, 60, 50, 70, 55, 65, 75, 68];
  const color = positive ? colors.profit : colors.loss;

  return (
    <View style={styles.sparkline}>
      {heights.map((h, i) => (
        <View
          key={i}
          style={[
            styles.sparkBar,
            {
              height: h * 0.4,
              backgroundColor: i === heights.length - 1 ? color : `${color}40`,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.bgHover,
  },
  left: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  symbol: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  volume: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 30,
  },
  sparkBar: {
    width: 3,
    borderRadius: 1.5,
  },
});

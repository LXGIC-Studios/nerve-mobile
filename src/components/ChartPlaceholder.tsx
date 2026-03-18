import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface ChartPlaceholderProps {
  height?: number;
  symbol?: string;
}

export function ChartPlaceholder({ height = 240, symbol }: ChartPlaceholderProps) {
  // Generate mock candlestick-like bars
  const bars = Array.from({ length: 40 }, (_, i) => {
    const base = 50 + Math.sin(i * 0.3) * 20 + Math.random() * 15;
    const wick = Math.random() * 10 + 5;
    const isGreen = Math.random() > 0.45;
    return { base, wick, isGreen };
  });

  return (
    <View style={[styles.container, { height }]}>
      {/* Time selector */}
      <View style={styles.timeBar}>
        {['1m', '5m', '15m', '1H', '4H', '1D'].map((tf, i) => (
          <Text key={tf} style={[styles.timeBtn, i === 2 && styles.timeBtnActive]}>
            {tf}
          </Text>
        ))}
      </View>

      {/* Mock chart */}
      <View style={styles.chartArea}>
        {bars.map((bar, i) => (
          <View key={i} style={styles.candleCol}>
            <View
              style={[
                styles.wick,
                {
                  height: bar.wick,
                  backgroundColor: bar.isGreen ? `${colors.profit}60` : `${colors.loss}60`,
                },
              ]}
            />
            <View
              style={[
                styles.body,
                {
                  height: Math.max(bar.base * 0.3, 4),
                  backgroundColor: bar.isGreen ? colors.profit : colors.loss,
                },
              ]}
            />
            <View
              style={[
                styles.wick,
                {
                  height: bar.wick * 0.7,
                  backgroundColor: bar.isGreen ? `${colors.profit}60` : `${colors.loss}60`,
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Price line */}
      <View style={styles.priceLine}>
        <View style={styles.priceLineBar} />
        {symbol && (
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>Mark</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  timeBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timeBtn: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeBtnActive: {
    color: colors.accent,
    backgroundColor: colors.accentGlow,
    overflow: 'hidden',
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  candleCol: {
    alignItems: 'center',
    flex: 1,
  },
  wick: {
    width: 1,
  },
  body: {
    width: 4,
    borderRadius: 1,
  },
  priceLine: {
    position: 'absolute',
    top: '55%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLineBar: {
    flex: 1,
    height: 1,
    backgroundColor: colors.accent,
    opacity: 0.3,
  },
  priceTag: {
    backgroundColor: colors.accentDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceTagText: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: '600',
  },
});

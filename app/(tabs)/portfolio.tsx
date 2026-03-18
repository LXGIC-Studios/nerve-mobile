import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { colors } from '../../src/theme/colors';
import { positions, portfolioStats, feeTiers } from '../../src/data/mockData';
import { fmt, pnlColor, pnlSign } from '../../src/hooks/useFormatters';
import { PositionCard } from '../../src/components/PositionCard';

export default function PortfolioScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showFees, setShowFees] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const stats = portfolioStats;
  const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <View style={styles.equityBox}>
            <Text style={styles.equityLabel}>Account Equity</Text>
            <Text style={styles.equityValue}>${fmt(stats.equity)}</Text>
            <Text style={[styles.pnlToday, { color: pnlColor(stats.realizedPnlToday) }]}>
              {pnlSign(stats.realizedPnlToday)}${fmt(stats.realizedPnlToday)} today
            </Text>
          </View>
        </View>

        {/* Key Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Margin Used</Text>
              <Text style={styles.statValue}>${fmt(stats.marginUsed)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Available</Text>
              <Text style={[styles.statValue, { color: colors.profit }]}>${fmt(stats.availableMargin)}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Unrealized PnL</Text>
              <Text style={[styles.statValue, { color: pnlColor(stats.unrealizedPnl) }]}>
                {pnlSign(stats.unrealizedPnl)}${fmt(stats.unrealizedPnl)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Margin Ratio</Text>
              <Text style={styles.statValue}>{stats.marginRatio}%</Text>
            </View>
          </View>
        </View>

        {/* Margin Usage Bar */}
        <View style={styles.marginBarContainer}>
          <View style={styles.marginBarHeader}>
            <Text style={styles.marginBarLabel}>Margin Utilization</Text>
            <Text style={styles.marginBarPct}>{stats.marginRatio.toFixed(1)}%</Text>
          </View>
          <View style={styles.marginBarTrack}>
            <View
              style={[
                styles.marginBarFill,
                {
                  width: `${Math.min(stats.marginRatio, 100)}%`,
                  backgroundColor:
                    stats.marginRatio > 80 ? colors.loss :
                    stats.marginRatio > 50 ? colors.caution : colors.accent,
                },
              ]}
            />
          </View>
        </View>

        {/* Positions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Open Positions</Text>
            <View style={styles.posCountBadge}>
              <Text style={styles.posCountText}>{positions.length}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Text style={[styles.totalPnl, { color: pnlColor(totalPnl) }]}>
              {pnlSign(totalPnl)}${fmt(Math.abs(totalPnl))}
            </Text>
          </View>

          {positions.map((pos) => (
            <PositionCard key={pos.id} position={pos} />
          ))}
        </View>

        {/* Fee Tier */}
        <Pressable onPress={() => setShowFees(!showFees)} style={styles.feeTierCard}>
          <View style={styles.feeTierHeader}>
            <Text style={styles.feeTierTitle}>Fee Tier</Text>
            <View style={styles.feeTierBadge}>
              <Text style={styles.feeTierBadgeText}>Bronze</Text>
            </View>
            <Text style={styles.feeTierChevron}>{showFees ? '▲' : '▼'}</Text>
          </View>
          {showFees && (
            <View style={styles.feeTierTable}>
              {feeTiers.map((tier) => (
                <View
                  key={tier.tier}
                  style={[styles.feeTierRow, tier.current && styles.feeTierRowActive]}
                >
                  <Text style={[styles.feeCell, styles.feeTierName, tier.current && { color: colors.accent }]}>
                    {tier.tier}
                  </Text>
                  <Text style={styles.feeCell}>{tier.volume}</Text>
                  <Text style={[styles.feeCell, { color: colors.profit }]}>{tier.maker}</Text>
                  <Text style={styles.feeCell}>{tier.taker}</Text>
                </View>
              ))}
            </View>
          )}
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    padding: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  equityBox: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    padding: 20,
    alignItems: 'center',
  },
  equityLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  equityValue: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  pnlToday: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  statsGrid: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  marginBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  marginBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  marginBarLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  marginBarPct: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  marginBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.bgCard,
    overflow: 'hidden',
  },
  marginBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  posCountBadge: {
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  posCountText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  totalPnl: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  feeTierCard: {
    marginHorizontal: 16,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  feeTierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  feeTierTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  feeTierBadge: {
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  feeTierBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  feeTierChevron: {
    color: colors.textSecondary,
    fontSize: 10,
    marginLeft: 'auto',
  },
  feeTierTable: {
    marginTop: 14,
    gap: 6,
  },
  feeTierRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  feeTierRowActive: {
    backgroundColor: colors.accentGlow,
  },
  feeCell: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  feeTierName: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

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
import { positions, portfolioStats, feeTiers, pnlData } from '../../src/data/mockData';
import { fmt, pnlColor, pnlSign } from '../../src/hooks/useFormatters';
import { PositionCard } from '../../src/components/PositionCard';
import { ShieldIcon, FlameIcon, ChartIcon } from '../../src/components/icons';

export default function PortfolioScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showFees, setShowFees] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const stats = portfolioStats;
  const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);

  const marginRatioColor =
    stats.marginRatio > 80 ? colors.loss :
    stats.marginRatio > 50 ? colors.caution :
    stats.marginRatio > 25 ? colors.accent : colors.profit;

  // PnL chart
  const maxPnl = Math.max(...pnlData.map((d) => Math.abs(d.pnl)));

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
          {/* Margin Mode Indicator */}
          <View style={styles.marginModeRow}>
            <View style={styles.marginModeBadge}>
              <ShieldIcon size={12} color={colors.accent} />
              <Text style={styles.marginModeText}>
                {stats.marginMode === 'cross' ? 'Cross Margin' : 'Portfolio Margin'}
              </Text>
            </View>
          </View>
        </View>

        {/* Equity Card */}
        <View style={styles.equityCard}>
          <View style={styles.equityBox}>
            <Text style={styles.equityLabel}>ACCOUNT EQUITY</Text>
            <Text style={styles.equityValue}>${fmt(stats.equity)}</Text>
            <Text style={[styles.pnlToday, { color: pnlColor(stats.realizedPnlToday) }]}>
              {pnlSign(stats.realizedPnlToday)}${fmt(stats.realizedPnlToday)} today
            </Text>
          </View>

          {/* Equity Breakdown */}
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Account Value</Text>
              <Text style={styles.breakdownValue}>${fmt(stats.accountValue)}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Unrealized PnL</Text>
              <Text style={[styles.breakdownValue, { color: pnlColor(stats.unrealizedPnl) }]}>
                {pnlSign(stats.unrealizedPnl)}${fmt(stats.unrealizedPnl)}
              </Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Maint. Margin</Text>
              <Text style={styles.breakdownValue}>${fmt(stats.maintenanceMargin)}</Text>
            </View>
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
              <Text style={styles.statLabel}>Avg Leverage</Text>
              <Text style={styles.statValue}>{stats.avgLeverage}x</Text>
            </View>
          </View>
        </View>

        {/* Margin Ratio Bar */}
        <View style={styles.marginBarContainer}>
          <View style={styles.marginBarHeader}>
            <View style={styles.marginBarHeaderLeft}>
              <FlameIcon size={14} color={marginRatioColor} />
              <Text style={styles.marginBarLabel}>Margin Ratio</Text>
            </View>
            <Text style={[styles.marginBarPct, { color: marginRatioColor }]}>
              {stats.marginRatio.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.marginBarTrack}>
            <View
              style={[
                styles.marginBarFill,
                {
                  width: `${Math.min(stats.marginRatio, 100)}%`,
                  backgroundColor: marginRatioColor,
                },
              ]}
            />
            {/* Danger zone markers */}
            <View style={[styles.marginMarker, { left: '50%' }]} />
            <View style={[styles.marginMarker, { left: '80%' }]} />
          </View>
          <View style={styles.marginBarFooter}>
            <Text style={styles.marginBarFooterText}>Safe</Text>
            <Text style={styles.marginBarFooterText}>Caution (50%)</Text>
            <Text style={styles.marginBarFooterText}>Danger (80%)</Text>
          </View>
        </View>

        {/* 7-Day PnL Chart */}
        <View style={styles.pnlChartCard}>
          <View style={styles.pnlChartHeader}>
            <ChartIcon size={14} color={colors.accent} />
            <Text style={styles.pnlChartTitle}>7-DAY PNL</Text>
          </View>
          <View style={styles.pnlBars}>
            {pnlData.map((d) => {
              const barH = (Math.abs(d.pnl) / maxPnl) * 60;
              const isProfit = d.pnl >= 0;
              return (
                <View key={d.day} style={styles.pnlBarCol}>
                  <View style={styles.pnlBarArea}>
                    {isProfit ? (
                      <>
                        <View style={{ flex: 1 }} />
                        <View style={[styles.pnlBar, { height: barH, backgroundColor: colors.profit }]} />
                        <View style={styles.pnlBarCenter} />
                        <View style={{ height: 30 }} />
                      </>
                    ) : (
                      <>
                        <View style={{ flex: 1 }} />
                        <View style={{ height: 30 }} />
                        <View style={styles.pnlBarCenter} />
                        <View style={[styles.pnlBar, { height: barH, backgroundColor: colors.loss }]} />
                      </>
                    )}
                  </View>
                  <Text style={styles.pnlBarLabel}>{d.day}</Text>
                  <Text style={[styles.pnlBarValue, { color: pnlColor(d.pnl) }]}>
                    {pnlSign(d.pnl)}${Math.abs(d.pnl)}
                  </Text>
                </View>
              );
            })}
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
    paddingBottom: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  marginModeRow: {
    marginTop: 8,
  },
  marginModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  marginModeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  equityCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    overflow: 'hidden',
  },
  equityBox: {
    padding: 20,
    alignItems: 'center',
  },
  equityLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
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
  breakdownRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  breakdownLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  breakdownValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
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
  // Margin bar
  marginBarContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  marginBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  marginBarHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  marginBarLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  marginBarPct: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  marginBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgCard,
    overflow: 'hidden',
    position: 'relative',
  },
  marginBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  marginMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.textMuted,
  },
  marginBarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  marginBarFooterText: {
    color: colors.textMuted,
    fontSize: 9,
  },
  // PnL Chart
  pnlChartCard: {
    marginHorizontal: 16,
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 20,
  },
  pnlChartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  pnlChartTitle: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  pnlBars: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  pnlBarCol: {
    flex: 1,
    alignItems: 'center',
  },
  pnlBarArea: {
    height: 80,
    width: '100%',
    alignItems: 'center',
  },
  pnlBar: {
    width: '70%',
    borderRadius: 3,
    minHeight: 4,
  },
  pnlBarCenter: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
  },
  pnlBarLabel: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 4,
  },
  pnlBarValue: {
    fontSize: 8,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  // Positions
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
  // Fee tier
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

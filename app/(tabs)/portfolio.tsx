import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/theme/colors';
import { fmt, pnlColor, pnlSign } from '../../src/hooks/useFormatters';
import { useTradingEngine } from '../../src/lib/hooks/useTradingEngine';
import { usePrices, getLatestPrice } from '../../src/lib/hooks/usePrices';
import { ShieldIcon, FlameIcon, ChartIcon } from '../../src/components/icons';

export default function PortfolioScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');
  const { positions, trades, balance, stats, closePosition } = useTradingEngine();
  const { refresh } = usePrices();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleClosePosition = useCallback(async (posId: string) => {
    const pos = positions.find((p) => p.id === posId);
    if (!pos) return;
    
    Alert.alert(
      'Close Position',
      `Close ${pos.side.toUpperCase()} ${pos.symbol} at market?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            const baseSymbol = pos.symbol.replace('-PERP', '');
            const price = getLatestPrice(baseSymbol) ?? pos.markPrice;
            closePosition(posId, price);
          },
        },
      ]
    );
  }, [positions, closePosition]);

  const totalPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const marginRatio = balance.equity > 0 ? (balance.marginUsed / balance.equity) * 100 : 0;
  const marginRatioColor = marginRatio > 80 ? colors.loss : marginRatio > 50 ? colors.caution : marginRatio > 25 ? colors.accent : colors.profit;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <View style={styles.marginModeBadge}>
            <ShieldIcon size={12} color={colors.accent} />
            <Text style={styles.marginModeText}>Cross Margin</Text>
          </View>
        </View>

        {/* Equity Card */}
        <View style={styles.equityCard}>
          <Text style={styles.equityLabel}>ACCOUNT EQUITY</Text>
          <Text style={styles.equityValue}>${fmt(balance.equity)}</Text>
          <Text style={[styles.pnlToday, { color: pnlColor(totalPnl) }]}>
            {pnlSign(totalPnl)}${fmt(Math.abs(totalPnl))} unrealized
          </Text>
          <View style={styles.equityBreakdown}>
            <View style={styles.eqItem}>
              <Text style={styles.eqItemLabel}>Balance</Text>
              <Text style={styles.eqItemValue}>${fmt(balance.total)}</Text>
            </View>
            <View style={styles.eqDivider} />
            <View style={styles.eqItem}>
              <Text style={styles.eqItemLabel}>Unrealized</Text>
              <Text style={[styles.eqItemValue, { color: pnlColor(balance.unrealizedPnl) }]}>
                {pnlSign(balance.unrealizedPnl)}${fmt(Math.abs(balance.unrealizedPnl))}
              </Text>
            </View>
            <View style={styles.eqDivider} />
            <View style={styles.eqItem}>
              <Text style={styles.eqItemLabel}>Available</Text>
              <Text style={[styles.eqItemValue, { color: colors.profit }]}>${fmt(balance.available)}</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Margin Used</Text>
              <Text style={styles.statValue}>${fmt(balance.marginUsed)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Win Rate</Text>
              <Text style={[styles.statValue, { color: stats.winRate >= 50 ? colors.profit : colors.loss }]}>
                {stats.winRate.toFixed(1)}%
              </Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total PnL</Text>
              <Text style={[styles.statValue, { color: pnlColor(stats.totalPnl) }]}>
                {pnlSign(stats.totalPnl)}${fmt(Math.abs(stats.totalPnl))}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Trades</Text>
              <Text style={styles.statValue}>{stats.totalTrades}</Text>
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
              {marginRatio.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.marginBarTrack}>
            <View style={[styles.marginBarFill, { width: `${Math.min(marginRatio, 100)}%`, backgroundColor: marginRatioColor }]} />
          </View>
          <View style={styles.marginBarFooter}>
            <Text style={styles.marginBarFooterText}>Safe</Text>
            <Text style={styles.marginBarFooterText}>Caution (50%)</Text>
            <Text style={styles.marginBarFooterText}>Danger (80%)</Text>
          </View>
        </View>

        {/* Tab Toggle: Positions / History */}
        <View style={styles.tabToggle}>
          <Pressable
            onPress={() => setActiveTab('positions')}
            style={[styles.tab, activeTab === 'positions' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'positions' && styles.tabTextActive]}>
              Positions ({positions.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('history')}
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              History ({trades.length})
            </Text>
          </Pressable>
        </View>

        {/* Positions */}
        {activeTab === 'positions' && (
          <View style={styles.section}>
            {positions.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <ChartIcon size={32} color={colors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No Open Positions</Text>
                <Text style={styles.emptySubtitle}>
                  Open a trade from the Trade tab to start building your portfolio
                </Text>
              </View>
            ) : (
              positions.map((pos) => {
                const isLong = pos.side === 'long';
                const pnl = pos.unrealizedPnl;
                return (
                  <View key={pos.id} style={styles.posCard}>
                    <View style={styles.posHeader}>
                      <View style={styles.posHeaderLeft}>
                        <Text style={styles.posMarket}>{pos.symbol}</Text>
                        <View style={[styles.sideBadge, { backgroundColor: isLong ? 'rgba(0,214,143,0.15)' : 'rgba(255,107,138,0.15)' }]}>
                          <Text style={[styles.sideText, { color: isLong ? colors.profit : colors.loss }]}>
                            {pos.side.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.leverageTag}>{pos.leverage}x</Text>
                      </View>
                      <Pressable onPress={() => handleClosePosition(pos.id)} style={styles.closeBtn}>
                        <Text style={styles.closeBtnText}>Close</Text>
                      </Pressable>
                    </View>
                    <View style={styles.posBody}>
                      <View style={styles.posStat}>
                        <Text style={styles.posStatLabel}>Size</Text>
                        <Text style={styles.posStatValue}>${fmt(pos.sizeUsd, 0)}</Text>
                      </View>
                      <View style={styles.posStat}>
                        <Text style={styles.posStatLabel}>Entry</Text>
                        <Text style={styles.posStatValue}>${fmt(pos.entryPrice, 2)}</Text>
                      </View>
                      <View style={styles.posStat}>
                        <Text style={styles.posStatLabel}>Mark</Text>
                        <Text style={styles.posStatValue}>${fmt(pos.markPrice, 2)}</Text>
                      </View>
                      <View style={styles.posStat}>
                        <Text style={styles.posStatLabel}>Liq</Text>
                        <Text style={[styles.posStatValue, { color: colors.caution }]}>
                          ${fmt(pos.liquidationPrice, 2)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.posFooter}>
                      <Text style={styles.posMargin}>Margin: ${fmt(pos.margin)}</Text>
                      <View style={styles.pnlBox}>
                        <Text style={[styles.pnlValue, { color: pnlColor(pnl) }]}>
                          {pnlSign(pnl)}${fmt(Math.abs(pnl))}
                        </Text>
                        <Text style={[styles.pnlPct, { color: pnlColor(pnl) }]}>
                          {pnlSign(pos.unrealizedPnlPct)}{pos.unrealizedPnlPct.toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Trade History */}
        {activeTab === 'history' && (
          <View style={styles.section}>
            {trades.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <ChartIcon size={32} color={colors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No Trade History</Text>
                <Text style={styles.emptySubtitle}>
                  Closed trades will appear here with detailed performance metrics
                </Text>
              </View>
            ) : (
              trades.slice(0, 50).map((trade) => {
                const isLong = trade.side === 'long';
                return (
                  <View key={trade.id} style={styles.tradeCard}>
                    <View style={styles.tradeCardHeader}>
                      <View style={styles.tradeCardLeft}>
                        <Text style={styles.tradeSymbol}>{trade.symbol}</Text>
                        <View style={[styles.sideBadge, { backgroundColor: isLong ? 'rgba(0,214,143,0.15)' : 'rgba(255,107,138,0.15)' }]}>
                          <Text style={[styles.sideText, { color: isLong ? colors.profit : colors.loss }]}>
                            {trade.side.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.leverageTag}>{trade.leverage}x</Text>
                      </View>
                      <View style={styles.tradeCardRight}>
                        <Text style={[styles.tradePnl, { color: pnlColor(trade.pnl) }]}>
                          {pnlSign(trade.pnl)}${fmt(Math.abs(trade.pnl))}
                        </Text>
                        <Text style={[styles.tradePnlPct, { color: pnlColor(trade.pnl) }]}>
                          {pnlSign(trade.pnlPct)}{trade.pnlPct.toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                    <View style={styles.tradeCardBody}>
                      <Text style={styles.tradeDetail}>
                        Entry: ${fmt(trade.entryPrice, 2)} → Exit: ${fmt(trade.exitPrice, 2)}
                      </Text>
                      <Text style={styles.tradeDetail}>
                        Size: ${fmt(trade.sizeUsd, 0)} · {new Date(trade.closedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  content: { padding: 16 },
  header: { marginBottom: 16 },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800' },
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
    marginTop: 8,
  },
  marginModeText: { color: colors.accent, fontSize: 11, fontWeight: '600' },
  // Equity
  equityCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  equityLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  equityValue: { color: colors.textPrimary, fontSize: 34, fontWeight: '800', fontVariant: ['tabular-nums'] },
  pnlToday: { fontSize: 14, fontWeight: '600', marginTop: 6 },
  equityBreakdown: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
    marginTop: 14,
    width: '100%',
  },
  eqItem: { flex: 1, alignItems: 'center' },
  eqDivider: { width: 1, backgroundColor: colors.border },
  eqItemLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '600', letterSpacing: 0.3, marginBottom: 4 },
  eqItemValue: { color: colors.textPrimary, fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  // Stats
  statsGrid: { gap: 10, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  statLabel: { color: colors.textSecondary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 },
  statValue: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  // Margin Bar
  marginBarContainer: { marginBottom: 20 },
  marginBarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  marginBarHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  marginBarLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  marginBarPct: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  marginBarTrack: { height: 8, borderRadius: 4, backgroundColor: colors.bgCard, overflow: 'hidden' },
  marginBarFill: { height: '100%', borderRadius: 4 },
  marginBarFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  marginBarFooterText: { color: colors.textMuted, fontSize: 9 },
  // Tab Toggle
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.bgElevated },
  tabText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: colors.textPrimary },
  // Sections
  section: {},
  emptyState: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { color: colors.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  // Position Card
  posCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  posHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  posHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  posMarket: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  sideBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sideText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  leverageTag: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  closeBtn: {
    backgroundColor: 'rgba(255,107,138,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,138,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeBtnText: { color: colors.loss, fontSize: 12, fontWeight: '600' },
  posBody: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  posStat: { alignItems: 'center' },
  posStatLabel: { color: colors.textSecondary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  posStatValue: { color: colors.textPrimary, fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },
  posFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  posMargin: { color: colors.textSecondary, fontSize: 12 },
  pnlBox: { alignItems: 'flex-end' },
  pnlValue: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  pnlPct: { fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  // Trade History Card
  tradeCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
  },
  tradeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tradeCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tradeSymbol: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  tradeCardRight: { alignItems: 'flex-end' },
  tradePnl: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  tradePnlPct: { fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },
  tradeCardBody: { gap: 3 },
  tradeDetail: { color: colors.textSecondary, fontSize: 11, fontVariant: ['tabular-nums'] },
});

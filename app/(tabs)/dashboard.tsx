import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { fmt, pnlColor, pnlSign } from '../../src/hooks/useFormatters';
import { useTradingEngine } from '../../src/lib/hooks/useTradingEngine';
import {
  LightningIcon,
  ChartIcon,
  ShieldIcon,
  FlameIcon,
  NeuralIcon,
  StarIcon,
} from '../../src/components/icons';
import { AnimatedCard } from '../../src/components/AnimatedCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 120;

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDuration(ms: number): string {
  if (ms <= 0) return '—';
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = CHART_WIDTH;
  const h = CHART_HEIGHT;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  // Build SVG-like path using Views (lightweight, no SVG dep)
  return (
    <View style={{ width: w, height: h, position: 'relative' }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((pct) => (
        <View
          key={pct}
          style={{
            position: 'absolute',
            top: h * pct,
            left: 0,
            right: 0,
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.border,
          }}
        />
      ))}
      {/* Data points as dots connected by the eye */}
      {data.map((v, i) => {
        const x = i * step;
        const y = h - ((v - min) / range) * (h - 8) - 4;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: x - 2.5,
              top: y - 2.5,
              width: 5,
              height: 5,
              borderRadius: 2.5,
              backgroundColor: color,
            }}
          />
        );
      })}
      {/* Bar chart fallback */}
      {data.map((v, i) => {
        const barH = ((v - min) / range) * (h - 8);
        const x = i * step;
        return (
          <View
            key={`bar-${i}`}
            style={{
              position: 'absolute',
              left: x - 1,
              bottom: 0,
              width: Math.max(2, step - 2),
              height: Math.max(1, barH),
              backgroundColor: color,
              opacity: 0.2,
              borderTopLeftRadius: 1,
              borderTopRightRadius: 1,
            }}
          />
        );
      })}
    </View>
  );
}

function HeatmapGrid({ data }: { data: number[][] }) {
  const maxVal = Math.max(...data.flat(), 1);

  return (
    <View>
      {/* Hour labels */}
      <View style={{ flexDirection: 'row', marginLeft: 30, marginBottom: 4 }}>
        {[0, 4, 8, 12, 16, 20].map((h) => (
          <Text
            key={h}
            style={{
              color: colors.textMuted,
              fontSize: 8,
              width: (CHART_WIDTH - 30) / 6,
              textAlign: 'center',
            }}
          >
            {h}:00
          </Text>
        ))}
      </View>
      {data.map((row, dayIdx) => (
        <View key={dayIdx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text style={{ color: colors.textMuted, fontSize: 8, width: 28 }}>
            {DAY_LABELS[dayIdx]}
          </Text>
          {row.map((val, hourIdx) => {
            const opacity = val / maxVal;
            return (
              <View
                key={hourIdx}
                style={{
                  flex: 1,
                  height: 14,
                  backgroundColor: colors.accent,
                  opacity: val > 0 ? 0.15 + opacity * 0.85 : 0.05,
                  marginHorizontal: 0.5,
                  borderRadius: 2,
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  const { trades, positions, extendedStats, balance, ready } = useTradingEngine();
  const hasTrades = extendedStats.totalTrades > 0;
  const hasPositions = positions.length > 0;

  const bestTradeSymbol = useMemo(() => {
    if (trades.length === 0) return null;
    const best = trades.reduce((a, b) => (a.pnl > b.pnl ? a : b));
    return best.pnl > 0 ? best : null;
  }, [trades]);

  const worstTradeSymbol = useMemo(() => {
    if (trades.length === 0) return null;
    const worst = trades.reduce((a, b) => (a.pnl < b.pnl ? a : b));
    return worst.pnl < 0 ? worst : null;
  }, [trades]);

  const winRateChartData = useMemo(() => {
    return extendedStats.winRateByDay.map((d) => d.rate);
  }, [extendedStats.winRateByDay]);

  const disciplineColor =
    extendedStats.disciplineScore >= 75
      ? colors.profit
      : extendedStats.disciplineScore >= 40
        ? colors.caution
        : colors.loss;

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <LightningIcon size={32} color={colors.accent} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Your trading performance</Text>
          </View>
          <Pressable style={styles.coachBtn} onPress={() => router.push('/coach')}>
            <NeuralIcon size={16} color={colors.accent} />
            <Text style={styles.coachBtnText}>Coach</Text>
          </Pressable>
        </View>

        {!hasTrades && !hasPositions ? (
          /* Empty State */
          <AnimatedCard delay={0}>
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <ChartIcon size={40} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No Trading Data Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start placing trades to see your performance stats, win rate charts, discipline score, and trading heatmap here.
              </Text>
              <Pressable style={styles.startBtn} onPress={() => router.push('/')}>
                <LightningIcon size={16} color="#000" />
                <Text style={styles.startBtnText}>Start Trading</Text>
              </Pressable>
            </View>
          </AnimatedCard>
        ) : (
          <>
            {/* Equity Overview */}
            <AnimatedCard delay={0}>
              <View style={styles.equityCard}>
                <Text style={styles.cardLabel}>ACCOUNT EQUITY</Text>
                <Text style={styles.equityValue}>${fmt(extendedStats.currentEquity)}</Text>
                <Text
                  style={[
                    styles.pnlBadge,
                    { color: pnlColor(extendedStats.totalPnl) },
                  ]}
                >
                  {pnlSign(extendedStats.totalPnl)}${fmt(Math.abs(extendedStats.totalPnl))} all time
                </Text>
              </View>
            </AnimatedCard>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <AnimatedCard delay={50}>
                <View style={styles.statCard}>
                  <View style={styles.statIconRow}>
                    <ChartIcon size={14} color={colors.accent} />
                  </View>
                  <Text style={styles.statLabel}>Win Rate</Text>
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color:
                          extendedStats.winRate >= 50 ? colors.profit : colors.loss,
                      },
                    ]}
                  >
                    {extendedStats.winRate.toFixed(1)}%
                  </Text>
                </View>
              </AnimatedCard>
              <AnimatedCard delay={100}>
                <View style={styles.statCard}>
                  <View style={styles.statIconRow}>
                    <LightningIcon size={14} color={colors.accent} />
                  </View>
                  <Text style={styles.statLabel}>Total Trades</Text>
                  <Text style={styles.statValue}>{extendedStats.totalTrades}</Text>
                </View>
              </AnimatedCard>
              <AnimatedCard delay={150}>
                <View style={styles.statCard}>
                  <View style={styles.statIconRow}>
                    <FlameIcon size={14} color={colors.accent} />
                  </View>
                  <Text style={styles.statLabel}>Avg PnL</Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: pnlColor(extendedStats.avgPnl) },
                    ]}
                  >
                    {pnlSign(extendedStats.avgPnl)}${fmt(Math.abs(extendedStats.avgPnl))}
                  </Text>
                </View>
              </AnimatedCard>
              <AnimatedCard delay={200}>
                <View style={styles.statCard}>
                  <View style={styles.statIconRow}>
                    <StarIcon size={14} color={colors.accent} />
                  </View>
                  <Text style={styles.statLabel}>Avg Hold</Text>
                  <Text style={styles.statValue}>
                    {formatDuration(extendedStats.avgHoldTimeMs)}
                  </Text>
                </View>
              </AnimatedCard>
            </View>

            {/* Best / Worst Trade */}
            <View style={styles.bwRow}>
              <AnimatedCard delay={250}>
                <View style={[styles.bwCard, { borderColor: 'rgba(0,214,143,0.2)' }]}>
                  <Text style={styles.bwLabel}>Best Trade</Text>
                  {bestTradeSymbol ? (
                    <>
                      <Text style={[styles.bwValue, { color: colors.profit }]}>
                        +${fmt(bestTradeSymbol.pnl)}
                      </Text>
                      <Text style={styles.bwSymbol}>{bestTradeSymbol.symbol}</Text>
                    </>
                  ) : (
                    <Text style={styles.bwEmpty}>—</Text>
                  )}
                </View>
              </AnimatedCard>
              <AnimatedCard delay={300}>
                <View style={[styles.bwCard, { borderColor: 'rgba(255,107,138,0.2)' }]}>
                  <Text style={styles.bwLabel}>Worst Trade</Text>
                  {worstTradeSymbol ? (
                    <>
                      <Text style={[styles.bwValue, { color: colors.loss }]}>
                        -${fmt(Math.abs(worstTradeSymbol.pnl))}
                      </Text>
                      <Text style={styles.bwSymbol}>{worstTradeSymbol.symbol}</Text>
                    </>
                  ) : (
                    <Text style={styles.bwEmpty}>—</Text>
                  )}
                </View>
              </AnimatedCard>
            </View>

            {/* Streaks */}
            <AnimatedCard delay={350}>
              <View style={styles.streakRow}>
                <View style={styles.streakItem}>
                  <Text style={styles.streakLabel}>Win Streak</Text>
                  <Text style={[styles.streakValue, { color: colors.profit }]}>
                    {extendedStats.winStreak}
                  </Text>
                </View>
                <View style={styles.streakDivider} />
                <View style={styles.streakItem}>
                  <Text style={styles.streakLabel}>Loss Streak</Text>
                  <Text style={[styles.streakValue, { color: colors.loss }]}>
                    {extendedStats.lossStreak}
                  </Text>
                </View>
                <View style={styles.streakDivider} />
                <View style={styles.streakItem}>
                  <Text style={styles.streakLabel}>Avg Leverage</Text>
                  <Text style={[styles.streakValue, { color: colors.accent }]}>
                    {extendedStats.avgLeverage.toFixed(1)}x
                  </Text>
                </View>
              </View>
            </AnimatedCard>

            {/* Discipline Score */}
            <AnimatedCard delay={400}>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <ShieldIcon size={16} color={disciplineColor} />
                  <Text style={styles.sectionTitle}>Discipline Score</Text>
                  <Text style={[styles.disciplineValue, { color: disciplineColor }]}>
                    {extendedStats.disciplineScore}%
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(extendedStats.disciplineScore, 100)}%`,
                        backgroundColor: disciplineColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.disciplineHint}>
                  {extendedStats.disciplineScore >= 75
                    ? 'Excellent risk management. Keep using TP/SL on every trade.'
                    : extendedStats.disciplineScore >= 40
                      ? 'Room for improvement. Set TP/SL on more trades to protect your capital.'
                      : 'Low discipline. Most trades lack TP/SL. Set risk limits before entering positions.'}
                </Text>
              </View>
            </AnimatedCard>

            {/* Win Rate Chart */}
            {winRateChartData.length >= 2 && (
              <AnimatedCard delay={450}>
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <ChartIcon size={16} color={colors.accent} />
                    <Text style={styles.sectionTitle}>Win Rate (30 Days)</Text>
                  </View>
                  <MiniChart data={winRateChartData} color={colors.accent} />
                  <View style={styles.chartLabels}>
                    <Text style={styles.chartLabelText}>
                      {extendedStats.winRateByDay[0]?.date ?? ''}
                    </Text>
                    <Text style={styles.chartLabelText}>
                      {extendedStats.winRateByDay[extendedStats.winRateByDay.length - 1]?.date ?? ''}
                    </Text>
                  </View>
                </View>
              </AnimatedCard>
            )}

            {/* Heatmap */}
            {hasTrades && (
              <AnimatedCard delay={500}>
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <FlameIcon size={16} color={colors.accent} />
                    <Text style={styles.sectionTitle}>Trading Heatmap</Text>
                  </View>
                  <Text style={styles.heatmapSubtitle}>
                    When you trade (hour of day × day of week)
                  </Text>
                  <HeatmapGrid data={extendedStats.heatmap} />
                </View>
              </AnimatedCard>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  content: { padding: 16 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  coachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  coachBtnText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  // Empty state
  emptyState: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  startBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
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
  cardLabel: {
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
  pnlBadge: { fontSize: 14, fontWeight: '600', marginTop: 6 },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  statIconRow: { marginBottom: 8 },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  // Best/Worst
  bwRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  bwCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  bwLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  bwValue: { fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
  bwSymbol: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  bwEmpty: { color: colors.textMuted, fontSize: 18, fontWeight: '700' },
  // Streaks
  streakRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  streakItem: { flex: 1, alignItems: 'center' },
  streakDivider: { width: 1, backgroundColor: colors.border },
  streakLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  streakValue: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  // Sections
  sectionCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700', flex: 1 },
  // Discipline
  disciplineValue: { fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgSecondary,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  disciplineHint: { color: colors.textSecondary, fontSize: 12, lineHeight: 16 },
  // Chart
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  chartLabelText: { color: colors.textMuted, fontSize: 9 },
  // Heatmap
  heatmapSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 10,
  },
});

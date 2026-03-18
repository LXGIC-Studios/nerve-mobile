import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../src/theme/colors';
import {
  dashboardStats,
  winRateData,
  disciplineData,
  recentTrades,
  aiInsights,
  heatmapData,
} from '../../src/data/mockData';
import { pnlColor, pnlSign } from '../../src/hooks/useFormatters';
import { StatBox } from '../../src/components/StatBox';
import { InsightCard } from '../../src/components/InsightCard';
import { ConvictionBadge } from '../../src/components/ConvictionBadge';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function MiniLineChart({ data, color, label }: { data: number[]; color: string; label: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartLabel}>{label}</Text>
      <View style={styles.chartArea}>
        {data.map((v, i) => {
          const h = ((v - min) / range) * 60 + 4;
          return (
            <View
              key={i}
              style={[
                styles.chartBar,
                {
                  height: h,
                  backgroundColor: i === data.length - 1 ? color : `${color}50`,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.chartFooter}>
        <Text style={styles.chartFooterText}>30d ago</Text>
        <Text style={[styles.chartFooterValue, { color }]}>
          {data[data.length - 1].toFixed(1)}%
        </Text>
        <Text style={styles.chartFooterText}>Today</Text>
      </View>
    </View>
  );
}

function Heatmap() {
  return (
    <View style={styles.heatmapCard}>
      <Text style={styles.heatmapTitle}>TRADING FREQUENCY</Text>
      <View style={styles.heatmapGrid}>
        {heatmapData.map((row, dayIdx) => (
          <View key={dayIdx} style={styles.heatmapRow}>
            <Text style={styles.heatmapDayLabel}>{days[dayIdx]}</Text>
            {row.map((val, hourIdx) => {
              const opacity = val / 10;
              return (
                <View
                  key={hourIdx}
                  style={[
                    styles.heatmapCell,
                    {
                      backgroundColor: `rgba(0,229,255,${opacity})`,
                      borderColor: opacity > 0.5 ? colors.borderAccent : 'transparent',
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
      <View style={styles.heatmapHours}>
        {['00', '06', '12', '18', '23'].map((h) => (
          <Text key={h} style={styles.heatmapHourLabel}>{h}h</Text>
        ))}
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>AI Performance Analytics</Text>
        </View>

        {/* Key Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatBox
              label="Win Rate"
              value={`${dashboardStats.winRate}%`}
              change={dashboardStats.winRateChange}
              changeLabel="vs last week"
            />
            <StatBox
              label="Discipline"
              value={dashboardStats.disciplineScore.toString()}
              change={dashboardStats.disciplineChange}
              changeLabel="pts"
              accent
            />
          </View>
          <View style={styles.statsRow}>
            <StatBox
              label="Avg PnL"
              value={dashboardStats.avgPnl}
              change={dashboardStats.avgPnlChange}
            />
            <StatBox
              label="Sharpe"
              value={dashboardStats.sharpeRatio}
              change={dashboardStats.sharpeChange}
            />
          </View>
        </View>

        {/* Charts */}
        <View style={styles.chartsRow}>
          <MiniLineChart
            data={winRateData.map((d) => d.rate)}
            color={colors.profit}
            label="WIN RATE (30D)"
          />
          <MiniLineChart
            data={disciplineData.map((d) => d.score)}
            color={colors.accent}
            label="DISCIPLINE (30D)"
          />
        </View>

        {/* Heatmap */}
        <Heatmap />

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          {aiInsights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </View>

        {/* Recent Trades */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Trades</Text>
          {recentTrades.map((trade) => (
            <View key={trade.id} style={styles.tradeRow}>
              <View style={styles.tradeLeft}>
                <Text style={styles.tradeMarket}>{trade.market}</Text>
                <View style={styles.tradeMetaRow}>
                  <Text
                    style={[
                      styles.tradeSide,
                      { color: trade.side === 'Long' ? colors.profit : colors.loss },
                    ]}
                  >
                    {trade.side}
                  </Text>
                  <Text style={styles.tradeTime}>{trade.time}</Text>
                </View>
              </View>
              <View style={styles.tradeCenter}>
                <ConvictionBadge score={Math.round(trade.score * 10)} size="sm" />
              </View>
              <View style={styles.tradeRight}>
                <Text style={[styles.tradePnl, { color: pnlColor(trade.pnl) }]}>
                  {pnlSign(trade.pnl)}${Math.abs(trade.pnl).toLocaleString()}
                </Text>
                <Text
                  style={[
                    styles.tradeEdge,
                    {
                      color:
                        trade.edge === 'Aligned' ? colors.profit :
                        trade.edge === 'Misaligned' ? colors.loss : colors.textSecondary,
                    },
                  ]}
                >
                  {trade.edge}
                </Text>
              </View>
            </View>
          ))}
        </View>

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
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  statsGrid: {
    gap: 10,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chartsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  chartCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  chartLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 64,
  },
  chartBar: {
    flex: 1,
    borderRadius: 1.5,
    minWidth: 2,
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartFooterText: {
    color: colors.textMuted,
    fontSize: 9,
  },
  chartFooterValue: {
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  // Heatmap
  heatmapCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 20,
  },
  heatmapTitle: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  heatmapGrid: {
    gap: 3,
  },
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  heatmapDayLabel: {
    color: colors.textMuted,
    fontSize: 8,
    width: 24,
  },
  heatmapCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 2,
    borderWidth: 0.5,
  },
  heatmapHours: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 26,
    marginTop: 4,
  },
  heatmapHourLabel: {
    color: colors.textMuted,
    fontSize: 8,
  },
  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  // Trade rows
  tradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
  },
  tradeLeft: {
    flex: 1,
  },
  tradeMarket: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  tradeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  tradeSide: {
    fontSize: 11,
    fontWeight: '700',
  },
  tradeTime: {
    color: colors.textMuted,
    fontSize: 11,
  },
  tradeCenter: {
    marginHorizontal: 12,
  },
  tradeRight: {
    alignItems: 'flex-end',
  },
  tradePnl: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tradeEdge: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
});

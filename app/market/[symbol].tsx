import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { markets, generateOrderBook } from '../../src/data/mockData';
import { fmt, pnlColor, pnlSign } from '../../src/hooks/useFormatters';
import { usePrice } from '../../src/lib/hooks/usePrices';
import { TradingViewChart } from '../../src/components/TradingViewChart';
import { ChevronLeftIcon, LightningIcon } from '../../src/components/icons';

export default function MarketDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const market = markets.find((m) => m.symbol === symbol);
  
  if (!market) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>Market not found</Text>
      </SafeAreaView>
    );
  }

  const baseSymbol = market.base;
  const { price: liveData, refresh } = usePrice(baseSymbol);
  
  const currentPrice = liveData?.price ?? market.price;
  const currentChange = liveData?.change24h ?? market.change24h;

  const orderBook = useMemo(() => generateOrderBook(currentPrice), [currentPrice]);
  const maxTotal = Math.max(
    orderBook.bids[orderBook.bids.length - 1]?.total ?? 0,
    orderBook.asks[orderBook.asks.length - 1]?.total ?? 0
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh?.();
    setRefreshing(false);
  }, [refresh]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <ChevronLeftIcon size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>{market.base[0]}</Text>
          </View>
          <View>
            <Text style={styles.headerSymbol}>{market.symbol}</Text>
            <Text style={styles.headerLeverage}>Up to {market.maxLeverage}x Leverage</Text>
          </View>
        </View>
        <Pressable 
          style={styles.tradeBtn}
          onPress={() => router.push('/')}
        >
          <LightningIcon size={14} color={colors.accent} />
          <Text style={styles.tradeBtnText}>Trade</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Price Header */}
        <View style={styles.priceHeader}>
          <Text style={styles.priceValue}>
            ${fmt(currentPrice, currentPrice < 1 ? 6 : currentPrice < 100 ? 4 : 2)}
          </Text>
          <View style={[styles.changeBadge, { backgroundColor: currentChange >= 0 ? 'rgba(0,214,143,0.12)' : 'rgba(255,107,138,0.12)' }]}>
            <Text style={[styles.changeText, { color: pnlColor(currentChange) }]}>
              {currentChange >= 0 ? '+' : ''}{currentChange.toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Chart */}
        <TradingViewChart symbol={market.symbol} height={320} />

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>24h High</Text>
              <Text style={styles.statValue}>${fmt(liveData?.high24h ?? market.high24h, 2)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>24h Low</Text>
              <Text style={styles.statValue}>${fmt(liveData?.low24h ?? market.low24h, 2)}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>24h Volume</Text>
              <Text style={styles.statValue}>{market.volume}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Open Interest</Text>
              <Text style={styles.statValue}>{market.openInterest}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Funding Rate</Text>
              <Text style={[styles.statValue, { color: market.fundingRate >= 0 ? colors.profit : colors.loss }]}>
                {(market.fundingRate * 100).toFixed(4)}%
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Max Leverage</Text>
              <Text style={[styles.statValue, { color: colors.accent }]}>{market.maxLeverage}x</Text>
            </View>
          </View>
        </View>

        {/* Order Book */}
        <View style={styles.orderBookCard}>
          <Text style={styles.orderBookTitle}>ORDER BOOK</Text>
          
          {/* Asks (sells) — reversed so lowest ask at bottom */}
          {[...orderBook.asks].reverse().map((level, i) => (
            <View key={`ask-${i}`} style={styles.bookRow}>
              <View style={[styles.bookFill, styles.askFill, { width: `${(level.total / maxTotal) * 100}%` }]} />
              <Text style={[styles.bookPrice, { color: colors.loss }]}>
                {fmt(level.price, currentPrice < 1 ? 6 : 2)}
              </Text>
              <Text style={styles.bookSize}>{level.size.toFixed(4)}</Text>
              <Text style={styles.bookTotal}>{level.total.toFixed(4)}</Text>
            </View>
          ))}

          {/* Spread */}
          <View style={styles.spreadRow}>
            <Text style={styles.spreadLabel}>Spread</Text>
            <Text style={styles.spreadValue}>
              ${fmt(orderBook.asks[0].price - orderBook.bids[0].price, currentPrice < 1 ? 6 : 4)}
            </Text>
          </View>

          {/* Bids (buys) */}
          {orderBook.bids.map((level, i) => (
            <View key={`bid-${i}`} style={styles.bookRow}>
              <View style={[styles.bookFill, styles.bidFill, { width: `${(level.total / maxTotal) * 100}%` }]} />
              <Text style={[styles.bookPrice, { color: colors.profit }]}>
                {fmt(level.price, currentPrice < 1 ? 6 : 2)}
              </Text>
              <Text style={styles.bookSize}>{level.size.toFixed(4)}</Text>
              <Text style={styles.bookTotal}>{level.total.toFixed(4)}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  errorText: { color: colors.loss, fontSize: 16, textAlign: 'center', marginTop: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  headerSymbol: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  headerLeverage: { color: colors.textSecondary, fontSize: 10, marginTop: 1 },
  tradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tradeBtnText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  content: { padding: 16 },
  priceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  priceValue: { color: colors.textPrimary, fontSize: 32, fontWeight: '800', fontVariant: ['tabular-nums'] },
  changeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  changeText: { fontSize: 14, fontWeight: '700' },
  // Stats Grid
  statsGrid: { gap: 10, marginTop: 16, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  statLabel: { color: colors.textSecondary, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 },
  statValue: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  // Order Book
  orderBookCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    overflow: 'hidden',
  },
  orderBookTitle: { color: colors.textSecondary, fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 12 },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    position: 'relative',
  },
  bookFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    borderRadius: 2,
  },
  askFill: { backgroundColor: 'rgba(255,107,138,0.08)' },
  bidFill: { backgroundColor: 'rgba(0,214,143,0.08)' },
  bookPrice: { flex: 1, fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },
  bookSize: { flex: 1, color: colors.textSecondary, fontSize: 11, textAlign: 'center', fontVariant: ['tabular-nums'] },
  bookTotal: { flex: 1, color: colors.textMuted, fontSize: 11, textAlign: 'right', fontVariant: ['tabular-nums'] },
  spreadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginVertical: 4,
  },
  spreadLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '600' },
  spreadValue: { color: colors.accent, fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] },
});

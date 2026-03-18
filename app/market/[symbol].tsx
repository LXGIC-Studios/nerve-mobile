import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/theme/colors';
import { markets, generateOrderBook } from '../../src/data/mockData';
import { fmt } from '../../src/hooks/useFormatters';
import { ChartPlaceholder } from '../../src/components/ChartPlaceholder';
import { ChevronLeftIcon, FlameIcon, TargetIcon } from '../../src/components/icons';

export default function MarketDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const market = markets.find((m) => m.symbol === symbol) ?? markets[0];
  const orderBook = useMemo(() => generateOrderBook(market.price), [market.price]);
  const [activeTab, setActiveTab] = useState<'book' | 'trades'>('book');

  const handleTrade = useCallback(async (side: 'long' | 'short') => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    router.push({ pathname: '/(tabs)', params: { market: market.symbol, side } });
  }, [market.symbol]);

  const maxBookTotal = Math.max(
    orderBook.bids[orderBook.bids.length - 1]?.total ?? 1,
    orderBook.asks[orderBook.asks.length - 1]?.total ?? 1,
  );

  const formatPrice = (p: number) => {
    if (p < 0.001) return p.toFixed(8);
    if (p < 1) return p.toFixed(4);
    return fmt(p, 2);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <ChevronLeftIcon size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>{market.base[0]}</Text>
          </View>
          <Text style={styles.headerTitle}>{market.symbol}</Text>
          <View style={styles.leveragePill}>
            <Text style={styles.leveragePillText}>{market.maxLeverage}x</Text>
          </View>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Price Hero */}
        <View style={styles.priceHero}>
          <Text style={styles.priceMain}>${formatPrice(market.price)}</Text>
          <Text
            style={[
              styles.priceChange,
              { color: market.change24h >= 0 ? colors.profit : colors.loss },
            ]}
          >
            {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
          </Text>
        </View>

        {/* 24h Stats */}
        <View style={styles.statsRow}>
          {[
            { label: '24H HIGH', value: `$${formatPrice(market.high24h)}`, color: colors.profit },
            { label: '24H LOW', value: `$${formatPrice(market.low24h)}`, color: colors.loss },
            { label: 'VOLUME', value: market.volume, color: colors.textPrimary },
            { label: 'OI', value: market.openInterest, color: colors.textPrimary },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCell}>
              <Text style={styles.statCellLabel}>{stat.label}</Text>
              <Text style={[styles.statCellValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Chart */}
        <ChartPlaceholder height={280} symbol={market.symbol} />

        {/* Funding + Open Interest */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <FlameIcon size={14} color={colors.caution} />
              <Text style={styles.infoCardLabel}>FUNDING RATE</Text>
            </View>
            <Text style={[styles.infoCardValue, {
              color: market.fundingRate >= 0 ? colors.profit : colors.loss,
            }]}>
              {(market.fundingRate * 100).toFixed(4)}%
            </Text>
            <Text style={styles.infoCardSub}>resets in 4h 22m</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <TargetIcon size={14} color={colors.accent} />
              <Text style={styles.infoCardLabel}>OPEN INTEREST</Text>
            </View>
            <Text style={styles.infoCardValue}>${market.openInterest}</Text>
            <Text style={styles.infoCardSub}>+2.4% (24h)</Text>
          </View>
        </View>

        {/* Order Book / Recent Trades Tabs */}
        <View style={styles.bookSection}>
          <View style={styles.bookTabs}>
            <Pressable
              onPress={() => setActiveTab('book')}
              style={[styles.bookTab, activeTab === 'book' && styles.bookTabActive]}
            >
              <Text style={[styles.bookTabText, activeTab === 'book' && styles.bookTabTextActive]}>
                Order Book
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('trades')}
              style={[styles.bookTab, activeTab === 'trades' && styles.bookTabActive]}
            >
              <Text style={[styles.bookTabText, activeTab === 'trades' && styles.bookTabTextActive]}>
                Recent Trades
              </Text>
            </Pressable>
          </View>

          {activeTab === 'book' ? (
            <View style={styles.orderBook}>
              {/* Asks (reversed so lowest ask is at bottom) */}
              {[...orderBook.asks].reverse().map((ask, i) => (
                <View key={`ask-${i}`} style={styles.bookRow}>
                  <View
                    style={[
                      styles.bookDepthBar,
                      styles.bookDepthAsk,
                      { width: `${(ask.total / maxBookTotal) * 100}%` },
                    ]}
                  />
                  <Text style={[styles.bookPrice, { color: colors.loss }]}>
                    {formatPrice(ask.price)}
                  </Text>
                  <Text style={styles.bookSize}>{ask.size.toFixed(3)}</Text>
                  <Text style={styles.bookTotal}>{ask.total.toFixed(3)}</Text>
                </View>
              ))}
              {/* Spread */}
              <View style={styles.spreadRow}>
                <Text style={styles.spreadLabel}>Spread</Text>
                <Text style={styles.spreadValue}>
                  ${(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)}
                </Text>
              </View>
              {/* Bids */}
              {orderBook.bids.map((bid, i) => (
                <View key={`bid-${i}`} style={styles.bookRow}>
                  <View
                    style={[
                      styles.bookDepthBar,
                      styles.bookDepthBid,
                      { width: `${(bid.total / maxBookTotal) * 100}%` },
                    ]}
                  />
                  <Text style={[styles.bookPrice, { color: colors.profit }]}>
                    {formatPrice(bid.price)}
                  </Text>
                  <Text style={styles.bookSize}>{bid.size.toFixed(3)}</Text>
                  <Text style={styles.bookTotal}>{bid.total.toFixed(3)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.recentTradesBook}>
              {Array.from({ length: 15 }, (_, i) => {
                const isBuy = Math.random() > 0.5;
                const price = market.price + (Math.random() - 0.5) * market.price * 0.002;
                const size = (Math.random() * 3 + 0.1).toFixed(3);
                const secs = Math.floor(Math.random() * 300);
                return (
                  <View key={i} style={styles.bookRow}>
                    <Text style={[styles.bookPrice, { color: isBuy ? colors.profit : colors.loss }]}>
                      {formatPrice(price)}
                    </Text>
                    <Text style={styles.bookSize}>{size}</Text>
                    <Text style={styles.bookTotal}>{secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m`} ago</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Trade Buttons */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => handleTrade('long')}
          style={({ pressed }) => [styles.longBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.longBtnText}>Long</Text>
        </Pressable>
        <Pressable
          onPress={() => handleTrade('short')}
          style={({ pressed }) => [styles.shortBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.shortBtnText}>Short</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  leveragePill: {
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  leveragePillText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  priceHero: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 16,
  },
  priceMain: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  priceChange: {
    fontSize: 18,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 16,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statCellLabel: {
    color: colors.textSecondary,
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statCellValue: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  infoCardLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  infoCardValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  infoCardSub: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  // Order Book
  bookSection: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  bookTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bookTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  bookTabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  bookTabTextActive: {
    color: colors.accent,
  },
  orderBook: {
    padding: 10,
  },
  recentTradesBook: {
    padding: 10,
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    position: 'relative',
  },
  bookDepthBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    borderRadius: 2,
  },
  bookDepthBid: {
    backgroundColor: 'rgba(0,214,143,0.08)',
  },
  bookDepthAsk: {
    backgroundColor: 'rgba(255,77,106,0.08)',
  },
  bookPrice: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  bookSize: {
    flex: 1,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  bookTotal: {
    flex: 1,
    textAlign: 'right',
    color: colors.textMuted,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  spreadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginVertical: 4,
  },
  spreadLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  spreadValue: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgSecondary,
  },
  longBtn: {
    flex: 1,
    backgroundColor: colors.profit,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  longBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  shortBtn: {
    flex: 1,
    backgroundColor: colors.loss,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  shortBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

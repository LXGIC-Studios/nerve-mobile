import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
  Platform,
  Alert,
  Dimensions,
  RefreshControl,
  Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { markets } from '../../src/data/mockData';
import { fmt, pnlColor, pnlSign } from '../../src/hooks/useFormatters';
import { TradingViewChart } from '../../src/components/TradingViewChart';
import { OrderForm } from '../../src/components/OrderForm';
import { OrderConfirmSheet } from '../../src/components/OrderConfirmSheet';
import { SkeletonPositions } from '../../src/components/Skeleton';
import { usePrices, getLatestPrice } from '../../src/lib/hooks/usePrices';
import { useTradingEngine } from '../../src/lib/hooks/useTradingEngine';
import {
  LightningIcon,
  WalletIcon,
  ChevronDownIcon,
  CloseIcon,
  NeuralIcon,
} from '../../src/components/icons';
import { PositionDetailSheet } from '../../src/components/PositionDetailSheet';
import type { Position } from '../../src/lib/engine/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TradeScreen() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showMarketPicker, setShowMarketPicker] = useState(false);
  const [showPositions, setShowPositions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const { prices, error: priceError, refresh } = usePrices();
  const { positions, balance, openPosition, closePosition, ready } = useTradingEngine();
  
  // Order confirmation state
  const [confirmOrder, setConfirmOrder] = useState<{
    side: 'long' | 'short';
    sizeUsd: number;
    leverage: number;
    price: number;
    tp?: number;
    sl?: number;
    orderType: string;
  } | null>(null);

  const market = markets[selectedIdx];
  const baseSymbol = market.base;
  
  // Use live price if available, fall back to mock
  const livePrice = prices[baseSymbol]?.price ?? market.price;
  const liveChange = prices[baseSymbol]?.change24h ?? market.change24h;
  const liveHigh = prices[baseSymbol]?.high24h ?? market.high24h;
  const liveLow = prices[baseSymbol]?.low24h ?? market.low24h;

  // Filter positions for current market
  const marketPositions = positions.filter((p) => p.symbol === market.symbol);
  const allPositions = positions;

  const handleOrderSubmit = useCallback((side: 'long' | 'short', sizeUsd: number, leverage: number, orderType: string, tp?: number, sl?: number) => {
    setConfirmOrder({
      side,
      sizeUsd,
      leverage,
      price: livePrice,
      tp: tp ? parseFloat(String(tp)) : undefined,
      sl: sl ? parseFloat(String(sl)) : undefined,
      orderType,
    });
  }, [livePrice]);

  const handleConfirmOrder = useCallback(async () => {
    if (!confirmOrder) return;
    
    setIsSubmittingOrder(true);
    
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      const result = openPosition({
        symbol: market.symbol,
        side: confirmOrder.side,
        sizeUsd: confirmOrder.sizeUsd,
        leverage: confirmOrder.leverage,
        price: confirmOrder.price,
        tp: confirmOrder.tp,
        sl: confirmOrder.sl,
      });

      if (!result) {
        Alert.alert('Insufficient Margin', 'Not enough available margin to open this position.');
      }
    } catch (error) {
      Alert.alert('Order Failed', 'Failed to place order. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
      setConfirmOrder(null);
    }
  }, [confirmOrder, market.symbol, openPosition]);

  const handleClosePosition = useCallback(async (posId: string) => {
    const pos = positions.find((p) => p.id === posId);
    if (!pos) return;
    
    const baseSymbol = pos.symbol.replace('-PERP', '');
    const currentPrice = getLatestPrice(baseSymbol) ?? pos.markPrice;
    
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    closePosition(posId, currentPrice);
  }, [positions, closePosition]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LightningIcon size={18} color={colors.accent} />
          <Text style={styles.logo}>NERVE</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.balanceBadge}>
            <Text style={styles.balanceLabel}>Equity</Text>
            <Text style={styles.balanceValue}>${fmt(balance.equity)}</Text>
          </View>
          <Pressable style={styles.coachBtn} onPress={() => router.push('/coach')}>
            <NeuralIcon size={14} color={colors.accent} />
          </Pressable>
          <View style={styles.connectionBadge}>
            <View style={styles.connectionDot} />
            <Text style={styles.connectionText}>Paper</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Market Selector */}
        <Pressable onPress={() => setShowMarketPicker(true)} style={styles.marketSelector}>
          <View style={styles.marketSelectorLeft}>
            <View style={styles.marketIcon}>
              <Text style={styles.marketIconText}>{market.base[0]}</Text>
            </View>
            <View>
              <Text style={styles.marketSymbol}>{market.symbol}</Text>
              <Text style={styles.marketLeverage}>Up to {market.maxLeverage}x</Text>
            </View>
          </View>
          <View style={styles.marketSelectorRight}>
            <Text style={styles.marketPrice}>
              ${fmt(livePrice, livePrice < 1 ? 6 : livePrice < 100 ? 4 : 2)}
            </Text>
            <Text
              style={[
                styles.marketChange,
                { color: liveChange >= 0 ? colors.profit : colors.loss },
              ]}
            >
              {liveChange >= 0 ? '+' : ''}{liveChange.toFixed(2)}%
            </Text>
          </View>
          <ChevronDownIcon size={14} color={colors.textSecondary} />
        </Pressable>

        {/* Market Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>24h High</Text>
            <Text style={styles.statItemValue}>${fmt(liveHigh, liveHigh < 1 ? 4 : 2)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>24h Low</Text>
            <Text style={styles.statItemValue}>${fmt(liveLow, liveLow < 1 ? 4 : 2)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>Volume</Text>
            <Text style={styles.statItemValue}>{market.volume}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>Funding</Text>
            <Text style={[styles.statItemValue, { color: market.fundingRate >= 0 ? colors.profit : colors.loss }]}>
              {(market.fundingRate * 100).toFixed(4)}%
            </Text>
          </View>
        </View>

        {/* TradingView Chart */}
        <TradingViewChart symbol={market.symbol} height={280} />

        {/* Price Error Alert */}
        {priceError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Price Data Error</Text>
            <Text style={styles.errorText}>{priceError}</Text>
            <Pressable style={styles.retryBtn} onPress={refresh}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 16 }} />

        {/* Order Form */}
        <OrderForm
          market={market.symbol}
          currentPrice={livePrice}
          maxLeverage={market.maxLeverage}
          availableMargin={balance.available}
          isSubmitting={isSubmittingOrder}
          onSubmit={handleOrderSubmit}
        />

        {/* Open Positions */}
        {!ready ? (
          <View style={styles.positionsSection}>
            <View style={styles.positionsHeader}>
              <Text style={styles.positionsTitle}>Loading Positions...</Text>
            </View>
            <SkeletonPositions count={2} />
          </View>
        ) : allPositions.length > 0 ? (
          <View style={styles.positionsSection}>
            <Pressable 
              style={styles.positionsHeader}
              onPress={() => setShowPositions(!showPositions)}
            >
              <Text style={styles.positionsTitle}>Open Positions</Text>
              <View style={styles.posCountBadge}>
                <Text style={styles.posCountText}>{allPositions.length}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <Text style={styles.positionsToggle}>{showPositions ? '▲' : '▼'}</Text>
            </Pressable>

            {showPositions && allPositions.map((pos) => {
              const isLong = pos.side === 'long';
              const pnl = pos.unrealizedPnl;
              
              const renderRightAction = () => (
                <Animated.View style={styles.swipeAction}>
                  <Pressable
                    style={styles.swipeCloseBtn}
                    onPress={() => handleClosePosition(pos.id)}
                  >
                    <Text style={styles.swipeCloseText}>Close</Text>
                  </Pressable>
                </Animated.View>
              );
              
              return (
                <Swipeable key={pos.id} renderRightActions={renderRightAction}>
                  <Pressable onPress={() => setSelectedPosition(pos)} style={styles.posCard}>
                  <View style={styles.posCardHeader}>
                    <View style={styles.posCardHeaderLeft}>
                      <Text style={styles.posMarket}>{pos.symbol}</Text>
                      <View style={[styles.posSideBadge, { backgroundColor: isLong ? 'rgba(0,214,143,0.15)' : 'rgba(255,107,138,0.15)' }]}>
                        <Text style={[styles.posSideText, { color: isLong ? colors.profit : colors.loss }]}>
                          {pos.side.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.posLeverage}>{pos.leverage}x</Text>
                    </View>
                    <Pressable 
                      onPress={() => handleClosePosition(pos.id)}
                      style={styles.closeBtn}
                    >
                      <Text style={styles.closeBtnText}>Close</Text>
                    </Pressable>
                  </View>
                  <View style={styles.posStats}>
                    <View style={styles.posStat}>
                      <Text style={styles.posStatLabel}>Entry</Text>
                      <Text style={styles.posStatValue}>${fmt(pos.entryPrice, 2)}</Text>
                    </View>
                    <View style={styles.posStat}>
                      <Text style={styles.posStatLabel}>Mark</Text>
                      <Text style={styles.posStatValue}>${fmt(pos.markPrice, 2)}</Text>
                    </View>
                    <View style={styles.posStat}>
                      <Text style={styles.posStatLabel}>Size</Text>
                      <Text style={styles.posStatValue}>${fmt(pos.sizeUsd, 0)}</Text>
                    </View>
                    <View style={styles.posStat}>
                      <Text style={styles.posStatLabel}>PnL</Text>
                      <Text style={[styles.posStatValue, { color: pnlColor(pnl) }]}>
                        {pnlSign(pnl)}${fmt(Math.abs(pnl))}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.posPnlBar}>
                    <View 
                      style={[
                        styles.posPnlFill, 
                        { 
                          width: `${Math.min(Math.abs(pos.unrealizedPnlPct), 100)}%`,
                          backgroundColor: pnl >= 0 ? colors.profit : colors.loss,
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.posPnlPct, { color: pnlColor(pnl) }]}>
                    {pnlSign(pos.unrealizedPnlPct)}{Math.abs(pos.unrealizedPnlPct).toFixed(2)}%
                  </Text>
                </Pressable>
                </Swipeable>
              );
            })}
          </View>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Order Confirmation Sheet */}
      {confirmOrder && (
        <OrderConfirmSheet
          visible={true}
          onClose={() => setConfirmOrder(null)}
          onConfirm={handleConfirmOrder}
          side={confirmOrder.side}
          symbol={market.symbol}
          sizeUsd={confirmOrder.sizeUsd}
          leverage={confirmOrder.leverage}
          price={confirmOrder.price}
          tp={confirmOrder.tp}
          sl={confirmOrder.sl}
          orderType={confirmOrder.orderType}
        />
      )}

      {/* Position Detail Sheet */}
      <PositionDetailSheet
        visible={!!selectedPosition}
        position={selectedPosition}
        onClose={() => setSelectedPosition(null)}
        onClosePosition={(posId) => handleClosePosition(posId)}
      />

      {/* Market Picker Modal */}
      <Modal visible={showMarketPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Market</Text>
              <Pressable onPress={() => setShowMarketPicker(false)} hitSlop={12}>
                <CloseIcon size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <FlatList
              data={markets}
              keyExtractor={(item) => item.symbol}
              renderItem={({ item, index }) => {
                const livePx = prices[item.base]?.price ?? item.price;
                const liveChg = prices[item.base]?.change24h ?? item.change24h;
                return (
                  <Pressable
                    onPress={() => {
                      setSelectedIdx(index);
                      setShowMarketPicker(false);
                    }}
                    style={[
                      styles.modalItem,
                      index === selectedIdx && styles.modalItemActive,
                    ]}
                  >
                    <View style={styles.modalItemLeft}>
                      <View style={styles.marketIcon}>
                        <Text style={styles.marketIconText}>{item.base[0]}</Text>
                      </View>
                      <View>
                        <Text style={styles.modalItemSymbol}>{item.symbol}</Text>
                        <Text style={styles.modalItemVolume}>Vol {item.volume}</Text>
                      </View>
                    </View>
                    <View style={styles.modalItemRight}>
                      <Text style={styles.modalItemPrice}>
                        ${fmt(livePx, livePx < 1 ? 6 : 2)}
                      </Text>
                      <Text
                        style={[
                          styles.modalItemChange,
                          { color: liveChg >= 0 ? colors.profit : colors.loss },
                        ]}
                      >
                        {liveChg >= 0 ? '+' : ''}{liveChg.toFixed(2)}%
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logo: { color: colors.accent, fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balanceBadge: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'flex-end',
  },
  balanceLabel: { color: colors.textSecondary, fontSize: 9, fontWeight: '600' },
  balanceValue: { color: colors.textPrimary, fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  coachBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bgCard,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  connectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.profit },
  connectionText: { color: colors.textSecondary, fontSize: 10, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 12 },
  marketSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  marketSelectorLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  marketIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketIconText: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  marketSymbol: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  marketLeverage: { color: colors.textSecondary, fontSize: 10, marginTop: 2 },
  marketSelectorRight: { alignItems: 'flex-end', marginRight: 8 },
  marketPrice: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  marketChange: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginBottom: 10,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statItemLabel: { color: colors.textSecondary, fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 },
  statItemValue: { color: colors.textPrimary, fontSize: 10, fontWeight: '600', fontVariant: ['tabular-nums'] },
  statDivider: { width: 1, height: 22, backgroundColor: colors.border },
  // Positions
  positionsSection: { marginTop: 16 },
  positionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  positionsTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  posCountBadge: {
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  posCountText: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  positionsToggle: { color: colors.textSecondary, fontSize: 10 },
  posCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  posCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  posCardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  posMarket: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  posSideBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  posSideText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  posLeverage: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  closeBtn: {
    backgroundColor: 'rgba(255,107,138,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,138,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeBtnText: { color: colors.loss, fontSize: 12, fontWeight: '600' },
  posStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  posStat: { alignItems: 'center' },
  posStatLabel: { color: colors.textSecondary, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 3 },
  posStatValue: { color: colors.textPrimary, fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  posPnlBar: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.bgSecondary,
    overflow: 'hidden',
    marginBottom: 6,
  },
  posPnlFill: { height: '100%', borderRadius: 1.5 },
  posPnlPct: { fontSize: 11, fontWeight: '700', textAlign: 'right', fontVariant: ['tabular-nums'] },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemActive: { backgroundColor: colors.accentGlow },
  modalItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalItemSymbol: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  modalItemVolume: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  modalItemRight: { alignItems: 'flex-end' },
  modalItemPrice: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  modalItemChange: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  // Error handling
  errorCard: {
    backgroundColor: 'rgba(255,107,138,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,138,0.3)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  errorTitle: { color: colors.loss, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  errorText: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginBottom: 8 },
  retryBtn: {
    backgroundColor: colors.loss,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  // Swipe actions
  swipeAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  swipeCloseBtn: {
    backgroundColor: colors.loss,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '80%',
    borderRadius: 12,
  },
  swipeCloseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
} from 'react-native';
import { colors } from '../../src/theme/colors';
import { markets } from '../../src/data/mockData';
import { fmt } from '../../src/hooks/useFormatters';
import { ChartPlaceholder } from '../../src/components/ChartPlaceholder';
import { OrderForm } from '../../src/components/OrderForm';
import {
  LightningIcon,
  WalletIcon,
  ChevronDownIcon,
  CloseIcon,
} from '../../src/components/icons';

export default function TradeScreen() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showMarketPicker, setShowMarketPicker] = useState(false);
  const market = markets[selectedIdx];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LightningIcon size={18} color={colors.accent} />
          <Text style={styles.logo}>NERVE</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.walletBtn}>
            <WalletIcon size={14} color={colors.accent} />
            <Text style={styles.walletText}>Connect</Text>
          </Pressable>
          <View style={styles.connectionBadge}>
            <View style={styles.connectionDot} />
            <Text style={styles.connectionText}>Testnet</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
            <Text style={styles.marketPrice}>${fmt(market.price, market.price < 1 ? 4 : 2)}</Text>
            <Text
              style={[
                styles.marketChange,
                { color: market.change24h >= 0 ? colors.profit : colors.loss },
              ]}
            >
              {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
            </Text>
          </View>
          <ChevronDownIcon size={14} color={colors.textSecondary} />
        </Pressable>

        {/* Market Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>24h High</Text>
            <Text style={styles.statItemValue}>${fmt(market.high24h)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>24h Low</Text>
            <Text style={styles.statItemValue}>${fmt(market.low24h)}</Text>
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

        {/* Chart */}
        <ChartPlaceholder height={220} symbol={market.symbol} />

        <View style={{ height: 16 }} />

        {/* Order Form */}
        <OrderForm
          market={market.symbol}
          currentPrice={market.price}
          maxLeverage={market.maxLeverage}
        />

        <View style={{ height: 32 }} />
      </ScrollView>

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
              renderItem={({ item, index }) => (
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
                      ${fmt(item.price, item.price < 1 ? 4 : 2)}
                    </Text>
                    <Text
                      style={[
                        styles.modalItemChange,
                        { color: item.change24h >= 0 ? colors.profit : colors.loss },
                      ]}
                    >
                      {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                    </Text>
                  </View>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  walletText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bgCard,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.profit,
  },
  connectionText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  marketSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  marketSelectorLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  marketIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marketIconText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  marketSymbol: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  marketLeverage: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  marketSelectorRight: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  marketPrice: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  marketChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  statItemValue: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
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
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemActive: {
    backgroundColor: colors.accentGlow,
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalItemSymbol: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalItemVolume: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  modalItemRight: {
    alignItems: 'flex-end',
  },
  modalItemPrice: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  modalItemChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});

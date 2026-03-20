import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Animated, Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import { fmt } from '../hooks/useFormatters';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OrderConfirmSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  side: 'long' | 'short';
  symbol: string;
  sizeUsd: number;
  leverage: number;
  price: number;
  tp?: number;
  sl?: number;
  orderType: string;
}

export function OrderConfirmSheet({
  visible,
  onClose,
  onConfirm,
  side,
  symbol,
  sizeUsd,
  leverage,
  price,
  tp,
  sl,
  orderType,
}: OrderConfirmSheetProps) {
  const isLong = side === 'long';
  const sideColor = isLong ? colors.profit : colors.loss;
  const margin = sizeUsd / leverage;
  const liqDistance = price / leverage;
  const liqPrice = isLong ? price - liqDistance * 0.9 : price + liqDistance * 0.9;

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 200,
          mass: 0.8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: SCREEN_HEIGHT,
        useNativeDriver: true,
        damping: 20,
        stiffness: 180,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  return (
    <Modal visible={visible} animationType="none" transparent>
      <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
      </Animated.View>
      <Animated.View style={[styles.sheetWrapper, { transform: [{ translateY: slideAnim }] }]}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle */}
          <View style={styles.handle} />
          
          {/* Title */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>Confirm Order</Text>
            <View style={[styles.sideBadge, { backgroundColor: `${sideColor}20` }]}>
              <Text style={[styles.sideText, { color: sideColor }]}>
                {side.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summarySymbol}>{symbol}</Text>
              <Text style={styles.summaryType}>{orderType.toUpperCase()}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Size</Text>
              <Text style={styles.value}>${fmt(sizeUsd)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Leverage</Text>
              <Text style={[styles.value, { color: colors.accent }]}>{leverage}x</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Entry Price</Text>
              <Text style={styles.value}>${fmt(price, price < 1 ? 6 : 2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Margin Required</Text>
              <Text style={styles.value}>${fmt(margin)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Est. Liq. Price</Text>
              <Text style={[styles.value, { color: colors.caution }]}>
                ${fmt(liqPrice, price < 1 ? 6 : 2)}
              </Text>
            </View>
            {tp !== undefined && tp > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Take Profit</Text>
                <Text style={[styles.value, { color: colors.profit }]}>${fmt(tp, 2)}</Text>
              </View>
            )}
            {sl !== undefined && sl > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Stop Loss</Text>
                <Text style={[styles.value, { color: colors.loss }]}>${fmt(sl, 2)}</Text>
              </View>
            )}
            <View style={[styles.row, styles.feeRow]}>
              <Text style={styles.label}>Fee</Text>
              <View style={styles.freeFeeBadge}>
                <Text style={styles.freeFeeText}>ZERO</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmBtn, { backgroundColor: sideColor }]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmText, { color: isLong ? '#000' : '#fff' }]}>
                Confirm {side === 'long' ? 'Long' : 'Short'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.borderVisible,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  sideBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sideText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  summaryCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 12,
  },
  summarySymbol: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryType: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  feeRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 4,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  freeFeeBadge: {
    backgroundColor: 'rgba(0,214,143,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,214,143,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  freeFeeText: {
    color: colors.profit,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

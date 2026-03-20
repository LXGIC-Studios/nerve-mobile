import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform, Switch } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { fmt } from '../hooks/useFormatters';
import { ShieldIcon } from './icons';

type OrderType = 'market' | 'limit' | 'stop-limit';

interface OrderFormProps {
  market: string;
  currentPrice: number;
  maxLeverage: number;
  availableMargin?: number;
  onSubmit?: (side: 'long' | 'short', sizeUsd: number, leverage: number, orderType: string, tp?: number, sl?: number) => void;
}

export function OrderForm({ market, currentPrice, maxLeverage, availableMargin = 100000, onSubmit }: OrderFormProps) {
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [sizeUsd, setSizeUsd] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [leverage, setLeverage] = useState(5);
  const [showTpSl, setShowTpSl] = useState(false);
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');

  const handleOrder = useCallback(async (side: 'long' | 'short') => {
    const size = parseFloat(sizeUsd);
    if (!size || size <= 0) return;

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    const tp = tpPrice ? parseFloat(tpPrice) : undefined;
    const sl = slPrice ? parseFloat(slPrice) : undefined;

    onSubmit?.(side, size, leverage, orderType, tp, sl);
  }, [sizeUsd, leverage, orderType, tpPrice, slPrice, onSubmit]);

  const handleQuickSize = useCallback((pct: number) => {
    const maxSize = availableMargin * leverage;
    const size = maxSize * (pct / 100);
    setSizeUsd(Math.floor(size).toString());
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  }, [availableMargin, leverage]);

  const leverageSteps = [1, 2, 3, 5, 10, 15, 20, 50, maxLeverage].filter(
    (v, i, arr) => arr.indexOf(v) === i && v <= maxLeverage
  );

  const margin = sizeUsd ? parseFloat(sizeUsd) / leverage : 0;

  return (
    <View style={styles.container}>
      {/* Order Type Tabs */}
      <View style={styles.typeTabs}>
        {(['market', 'limit'] as const).map((type) => (
          <Pressable
            key={type}
            onPress={() => setOrderType(type)}
            style={[styles.typeTab, orderType === type && styles.typeTabActive]}
          >
            <Text style={[styles.typeTabText, orderType === type && styles.typeTabTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Limit Price */}
      {orderType === 'limit' && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Price</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={limitPrice}
              onChangeText={setLimitPrice}
              placeholder={currentPrice.toString()}
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              keyboardAppearance="dark"
            />
            <Text style={styles.inputUnit}>USD</Text>
          </View>
        </View>
      )}

      {/* Size in USD */}
      <View style={styles.inputGroup}>
        <View style={styles.sizeHeader}>
          <Text style={styles.inputLabel}>Size (USD)</Text>
          {margin > 0 && (
            <Text style={styles.marginNote}>Margin: ${fmt(margin)}</Text>
          )}
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={sizeUsd}
            onChangeText={setSizeUsd}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            keyboardAppearance="dark"
          />
          <Text style={styles.inputUnit}>USD</Text>
        </View>
        <View style={styles.quickButtons}>
          {[10, 25, 50, 75, 100].map((pct) => (
            <Pressable key={pct} style={styles.quickBtn} onPress={() => handleQuickSize(pct)}>
              <Text style={styles.quickBtnText}>{pct}%</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Leverage */}
      <View style={styles.inputGroup}>
        <View style={styles.leverageHeader}>
          <Text style={styles.inputLabel}>Leverage</Text>
          <View style={styles.leverageBadge}>
            <Text style={styles.leverageBadgeText}>{leverage}x</Text>
          </View>
        </View>
        <View style={styles.leverageSteps}>
          {leverageSteps.map((step) => (
            <Pressable
              key={step}
              onPress={() => {
                setLeverage(step);
                if (Platform.OS !== 'web') Haptics.selectionAsync();
              }}
              style={[styles.leverageStep, leverage === step && styles.leverageStepActive]}
            >
              <Text style={[styles.leverageStepText, leverage === step && styles.leverageStepTextActive]}>
                {step}x
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* TP/SL Toggle */}
      <View style={styles.tpslToggle}>
        <View style={styles.tpslToggleLeft}>
          <Text style={styles.tpslLabel}>TP / SL</Text>
          <Text style={styles.tpslDesc}>Take Profit & Stop Loss</Text>
        </View>
        <Switch
          value={showTpSl}
          onValueChange={setShowTpSl}
          trackColor={{ false: colors.bgElevated, true: colors.accentDim }}
          thumbColor={showTpSl ? colors.accent : colors.textSecondary}
        />
      </View>

      {showTpSl && (
        <View style={styles.tpslInputs}>
          <View style={styles.tpslInputGroup}>
            <Text style={[styles.tpslInputLabel, { color: colors.profit }]}>Take Profit</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={tpPrice}
                onChangeText={setTpPrice}
                placeholder="TP Price"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                keyboardAppearance="dark"
              />
            </View>
          </View>
          <View style={styles.tpslInputGroup}>
            <Text style={[styles.tpslInputLabel, { color: colors.loss }]}>Stop Loss</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={slPrice}
                onChangeText={setSlPrice}
                placeholder="SL Price"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                keyboardAppearance="dark"
              />
            </View>
          </View>
        </View>
      )}

      {/* Fee Row */}
      <View style={styles.feeRow}>
        <View style={styles.feeLeft}>
          <ShieldIcon size={12} color={colors.textSecondary} />
          <Text style={styles.feeLabel}>Est. Fee</Text>
        </View>
        <View style={styles.feeBadgeRow}>
          <View style={styles.zeroFeeBadge}>
            <Text style={styles.zeroFeeText}>ZERO FEES</Text>
          </View>
          <Text style={styles.feeValue}>Paper Trading</Text>
        </View>
      </View>

      {/* Long/Short Buttons */}
      <View style={styles.actionButtons}>
        <Pressable
          onPress={() => handleOrder('long')}
          style={({ pressed }) => [styles.longBtn, pressed && styles.btnPressed]}
        >
          <Text style={styles.longBtnText}>Long / Buy</Text>
        </Pressable>
        <Pressable
          onPress={() => handleOrder('short')}
          style={({ pressed }) => [styles.shortBtn, pressed && styles.btnPressed]}
        >
          <Text style={styles.shortBtnText}>Short / Sell</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  typeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  typeTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  typeTabActive: { backgroundColor: colors.bgElevated },
  typeTabText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  typeTabTextActive: { color: colors.textPrimary },
  inputGroup: { marginBottom: 14 },
  sizeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  marginNote: { color: colors.textSecondary, fontSize: 10, fontVariant: ['tabular-nums'] },
  inputLabel: { color: colors.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    paddingVertical: 12,
  },
  inputUnit: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  quickButtons: { flexDirection: 'row', gap: 6, marginTop: 8 },
  quickBtn: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: colors.bgSecondary,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  quickBtnText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  leverageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  leverageBadge: {
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  leverageBadgeText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  leverageSteps: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  leverageStep: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leverageStepActive: { backgroundColor: colors.accentGlow, borderColor: colors.accent },
  leverageStepText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  leverageStepTextActive: { color: colors.accent },
  tpslToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 4,
  },
  tpslToggleLeft: { flex: 1 },
  tpslLabel: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  tpslDesc: { color: colors.textSecondary, fontSize: 10, marginTop: 2 },
  tpslInputs: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  tpslInputGroup: { flex: 1 },
  tpslInputLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  feeLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  feeLabel: { color: colors.textSecondary, fontSize: 11 },
  feeBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  zeroFeeBadge: {
    backgroundColor: 'rgba(0,214,143,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,214,143,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  zeroFeeText: { color: colors.profit, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  feeValue: { color: colors.textTertiary, fontSize: 11, fontVariant: ['tabular-nums'] },
  actionButtons: { flexDirection: 'row', gap: 10 },
  longBtn: { flex: 1, backgroundColor: colors.profit, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  shortBtn: { flex: 1, backgroundColor: colors.loss, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnPressed: { opacity: 0.85 },
  longBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
  shortBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

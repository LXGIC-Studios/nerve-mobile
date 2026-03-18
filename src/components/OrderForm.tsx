import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { ConvictionBadge } from './ConvictionBadge';

interface OrderFormProps {
  market: string;
  currentPrice: number;
  maxLeverage: number;
}

export function OrderForm({ market, currentPrice, maxLeverage }: OrderFormProps) {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [size, setSize] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [leverage, setLeverage] = useState(5);

  const convictionScore = 62; // Mock

  const handleOrder = useCallback(async (side: 'long' | 'short') => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    // Mock order placement
  }, [size, leverage, orderType, limitPrice]);

  const leverageSteps = [1, 2, 3, 5, 10, 15, 20, maxLeverage].filter(
    (v, i, arr) => arr.indexOf(v) === i && v <= maxLeverage
  );

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

      {/* AI Conviction */}
      <View style={styles.convictionRow}>
        <View style={styles.convictionInfo}>
          <Text style={styles.convictionLabel}>AI CONVICTION</Text>
          <Text style={styles.convictionDesc}>Based on momentum, volume, funding</Text>
        </View>
        <ConvictionBadge score={convictionScore} />
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

      {/* Size */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Size</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={size}
            onChangeText={setSize}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            keyboardAppearance="dark"
          />
          <Text style={styles.inputUnit}>{market.split('-')[0]}</Text>
        </View>
        {/* Quick size buttons */}
        <View style={styles.quickButtons}>
          {['10%', '25%', '50%', '75%', '100%'].map((pct) => (
            <Pressable key={pct} style={styles.quickBtn}>
              <Text style={styles.quickBtnText}>{pct}</Text>
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
        {/* Leverage slider using step buttons */}
        <View style={styles.leverageSteps}>
          {leverageSteps.map((step) => (
            <Pressable
              key={step}
              onPress={() => {
                setLeverage(step);
                if (Platform.OS !== 'web') {
                  Haptics.selectionAsync();
                }
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

      {/* Fee info */}
      <View style={styles.feeRow}>
        <Text style={styles.feeLabel}>Est. Fee</Text>
        <Text style={styles.feeValue}>0.05%  ·  Bronze Tier</Text>
      </View>

      {/* Long/Short Buttons */}
      <View style={styles.actionButtons}>
        <Pressable
          onPress={() => handleOrder('long')}
          style={({ pressed }) => [styles.longBtn, pressed && styles.longBtnPressed]}
        >
          <Text style={styles.longBtnText}>Long / Buy</Text>
        </Pressable>
        <Pressable
          onPress={() => handleOrder('short')}
          style={({ pressed }) => [styles.shortBtn, pressed && styles.shortBtnPressed]}
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
  typeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeTabActive: {
    backgroundColor: colors.bgElevated,
  },
  typeTabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  typeTabTextActive: {
    color: colors.textPrimary,
  },
  convictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  convictionInfo: {
    flex: 1,
  },
  convictionLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  convictionDesc: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
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
  inputUnit: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: colors.bgSecondary,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  quickBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  leverageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  leverageBadge: {
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  leverageBadgeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  leverageSteps: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  leverageStep: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leverageStepActive: {
    backgroundColor: colors.accentGlow,
    borderColor: colors.accent,
  },
  leverageStepText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  leverageStepTextActive: {
    color: colors.accent,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  feeLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  feeValue: {
    color: colors.textTertiary,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  longBtn: {
    flex: 1,
    backgroundColor: colors.profit,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  longBtnPressed: {
    opacity: 0.85,
  },
  longBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  shortBtn: {
    flex: 1,
    backgroundColor: colors.loss,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  shortBtnPressed: {
    opacity: 0.85,
  },
  shortBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Share,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { fmt, pnlColor, pnlSign } from '../hooks/useFormatters';
import type { Position } from '../lib/engine/types';
import { CloseIcon, ShieldIcon } from './icons';

interface PositionDetailSheetProps {
  visible: boolean;
  position: Position | null;
  onClose: () => void;
  onClosePosition: (posId: string) => void;
}

export function PositionDetailSheet({
  visible,
  position,
  onClose,
  onClosePosition,
}: PositionDetailSheetProps) {
  if (!position) return null;

  const isLong = position.side === 'long';
  const sideColor = isLong ? colors.profit : colors.loss;
  const pnl = position.unrealizedPnl;
  const pnlPct = position.unrealizedPnlPct;

  const durationMs = Date.now() - position.openedAt;
  const durationMin = Math.floor(durationMs / 60000);
  const durationStr = durationMin < 60
    ? `${durationMin}m`
    : durationMin < 1440
      ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`
      : `${Math.floor(durationMin / 1440)}d ${Math.floor((durationMin % 1440) / 60)}h`;

  const liqDistance = position.side === 'long'
    ? ((position.markPrice - position.liquidationPrice) / position.markPrice) * 100
    : ((position.liquidationPrice - position.markPrice) / position.markPrice) * 100;

  const handleClose = useCallback(() => {
    Alert.alert(
      'Close Position',
      `Close ${position.side.toUpperCase()} ${position.symbol} at market?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            onClosePosition(position.id);
            onClose();
          },
        },
      ]
    );
  }, [position, onClosePosition, onClose]);

  const handleShare = useCallback(async () => {
    const direction = position.side.toUpperCase();
    const pnlText = `${pnlSign(pnl)}$${fmt(Math.abs(pnl))} (${pnlSign(pnlPct)}${Math.abs(pnlPct).toFixed(2)}%)`;
    const message = [
      `NERVE Paper Trade`,
      `${direction} ${position.symbol} @ ${position.leverage}x`,
      `Entry: $${fmt(position.entryPrice, 2)}`,
      `Current: $${fmt(position.markPrice, 2)}`,
      `PnL: ${pnlText}`,
      `Duration: ${durationStr}`,
      ``,
      `Powered by NERVE`,
    ].join('\n');

    try {
      await Share.share({ message });
    } catch (e) {
      // ignore
    }
  }, [position, pnl, pnlPct, durationStr]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerSymbol}>{position.symbol}</Text>
              <View style={[styles.sideBadge, { backgroundColor: `${sideColor}20` }]}>
                <Text style={[styles.sideText, { color: sideColor }]}>
                  {position.side.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.leverageTag}>{position.leverage}x</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12}>
              <CloseIcon size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* PnL Display */}
          <View style={[styles.pnlCard, { borderColor: `${pnlColor(pnl)}30` }]}>
            <Text style={styles.pnlLabel}>UNREALIZED P&L</Text>
            <Text style={[styles.pnlValue, { color: pnlColor(pnl) }]}>
              {pnlSign(pnl)}${fmt(Math.abs(pnl))}
            </Text>
            <Text style={[styles.pnlPct, { color: pnlColor(pnl) }]}>
              {pnlSign(pnlPct)}{Math.abs(pnlPct).toFixed(2)}%
            </Text>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsCard}>
            <DetailRow label="Entry Price" value={`$${fmt(position.entryPrice, 2)}`} />
            <DetailRow label="Mark Price" value={`$${fmt(position.markPrice, 2)}`} />
            <DetailRow label="Size" value={`$${fmt(position.sizeUsd, 0)}`} />
            <DetailRow label="Margin" value={`$${fmt(position.margin)}`} />
            <DetailRow
              label="Liquidation Price"
              value={`$${fmt(position.liquidationPrice, 2)}`}
              valueColor={colors.caution}
            />
            <DetailRow
              label="Liq. Distance"
              value={`${liqDistance.toFixed(1)}%`}
              valueColor={liqDistance < 10 ? colors.loss : liqDistance < 25 ? colors.caution : colors.textSecondary}
            />
            <DetailRow label="Duration" value={durationStr} />
            {position.tp && (
              <DetailRow
                label="Take Profit"
                value={`$${fmt(position.tp, 2)}`}
                valueColor={colors.profit}
              />
            )}
            {position.sl && (
              <DetailRow
                label="Stop Loss"
                value={`$${fmt(position.sl, 2)}`}
                valueColor={colors.loss}
              />
            )}
            <DetailRow
              label="Opened"
              value={new Date(position.openedAt).toLocaleString()}
              isLast
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>Share</Text>
            </Pressable>
            <Pressable style={styles.closePositionBtn} onPress={handleClose}>
              <Text style={styles.closePositionBtnText}>Close Position</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DetailRow({
  label,
  value,
  valueColor,
  isLast,
}: {
  label: string;
  value: string;
  valueColor?: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !isLast && styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    maxHeight: '85%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.borderVisible,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSymbol: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  sideBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sideText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  leverageTag: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  pnlCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  pnlLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pnlValue: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  pnlPct: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  detailsCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  shareBtnText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  closePositionBtn: {
    flex: 2,
    backgroundColor: colors.loss,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  closePositionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

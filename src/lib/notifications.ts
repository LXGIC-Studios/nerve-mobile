/**
 * NERVE Local Push Notifications
 * Fires when TP/SL hit or approaching liquidation
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Position } from './engine/types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function setupNotifications(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  // Configure notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('trading', {
      name: 'Trading Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00E5FF',
    });
  }

  return true;
}

/**
 * Send a local notification for TP/SL hit
 */
export async function notifyTpSlHit(params: {
  symbol: string;
  side: 'long' | 'short';
  type: 'tp' | 'sl';
  pnl: number;
  exitPrice: number;
}) {
  const { symbol, side, type, pnl, exitPrice } = params;
  const isProfit = pnl >= 0;
  const typeLabel = type === 'tp' ? 'Take Profit' : 'Stop Loss';
  const pnlStr = `${isProfit ? '+' : ''}$${Math.abs(pnl).toFixed(2)}`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${typeLabel} Hit — ${symbol}`,
      body: `${side.toUpperCase()} position closed at $${exitPrice.toFixed(2)}. PnL: ${pnlStr}`,
      data: { type: 'tp_sl', symbol },
      ...(Platform.OS === 'android' ? { channelId: 'trading' } : {}),
    },
    trigger: null, // immediate
  });
}

/**
 * Send a local notification for approaching liquidation
 */
export async function notifyLiquidationWarning(params: {
  symbol: string;
  side: 'long' | 'short';
  currentPrice: number;
  liquidationPrice: number;
  distancePct: number;
}) {
  const { symbol, side, currentPrice, liquidationPrice, distancePct } = params;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Liquidation Warning — ${symbol}`,
      body: `${side.toUpperCase()} position is ${distancePct.toFixed(1)}% from liquidation. Current: $${currentPrice.toFixed(2)}, Liq: $${liquidationPrice.toFixed(2)}`,
      data: { type: 'liquidation_warning', symbol },
      ...(Platform.OS === 'android' ? { channelId: 'trading' } : {}),
    },
    trigger: null,
  });
}

// Track which positions we already warned about to avoid spam
const liquidationWarnings = new Set<string>();

/**
 * Check positions for notification triggers
 * Call this when prices update
 */
export function checkPositionAlerts(
  positions: Position[],
  prices: Record<string, number>
) {
  for (const pos of positions) {
    const baseSymbol = pos.symbol.replace('-PERP', '');
    const currentPrice = prices[baseSymbol];
    if (!currentPrice) continue;

    // Check liquidation distance
    const liqDistance = pos.side === 'long'
      ? ((currentPrice - pos.liquidationPrice) / currentPrice) * 100
      : ((pos.liquidationPrice - currentPrice) / currentPrice) * 100;

    if (liqDistance < 10 && liqDistance > 0 && !liquidationWarnings.has(pos.id)) {
      liquidationWarnings.add(pos.id);
      notifyLiquidationWarning({
        symbol: pos.symbol,
        side: pos.side,
        currentPrice,
        liquidationPrice: pos.liquidationPrice,
        distancePct: liqDistance,
      });
    }

    // Reset warning if distance increases back above 15%
    if (liqDistance > 15) {
      liquidationWarnings.delete(pos.id);
    }
  }
}

/**
 * Clear a warning for a closed position
 */
export function clearPositionWarning(posId: string) {
  liquidationWarnings.delete(posId);
}

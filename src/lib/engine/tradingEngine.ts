/**
 * NERVE Paper Trading Engine
 * Handles position management, PnL tracking, and trade execution
 * All trades are simulated locally with realistic fills
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Position, ClosedTrade, Balance, Order, TradeStats, ExtendedStats } from './types';
import { notifyTpSlHit, clearPositionWarning } from '../notifications';
import { cloudSync } from '../supabase/cloudSync';

const STORAGE_KEYS = {
  POSITIONS: 'nerve_positions',
  TRADES: 'nerve_trades',
  BALANCE: 'nerve_balance',
  ORDERS: 'nerve_orders',
} as const;

const INITIAL_BALANCE = 100000;

type Listener = () => void;

class TradingEngine {
  private positions: Position[] = [];
  private closedTrades: ClosedTrade[] = [];
  private balance: Balance = {
    total: INITIAL_BALANCE,
    available: INITIAL_BALANCE,
    unrealizedPnl: 0,
    marginUsed: 0,
    equity: INITIAL_BALANCE,
  };
  private openOrders: Order[] = [];
  private listeners: Set<Listener> = new Set();
  private initialized = false;
  private tradeCounter = 0;

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  async init() {
    if (this.initialized) return;
    try {
      const [posStr, tradesStr, balStr, ordStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.POSITIONS),
        AsyncStorage.getItem(STORAGE_KEYS.TRADES),
        AsyncStorage.getItem(STORAGE_KEYS.BALANCE),
        AsyncStorage.getItem(STORAGE_KEYS.ORDERS),
      ]);
      if (posStr) this.positions = JSON.parse(posStr);
      if (tradesStr) this.closedTrades = JSON.parse(tradesStr);
      if (balStr) this.balance = JSON.parse(balStr);
      if (ordStr) this.openOrders = JSON.parse(ordStr);
      this.tradeCounter = this.closedTrades.length + this.positions.length;
    } catch (e) {
      console.warn('Failed to load trading state:', e);
    }

    // Cloud sync: pull state (cloud wins)
    try {
      const cloudState = await cloudSync.pullState();
      if (cloudState) {
        if (cloudState.positions.length > 0) this.positions = cloudState.positions;
        if (cloudState.closedTrades.length > 0) this.closedTrades = cloudState.closedTrades;
        if (cloudState.balance) { this.balance = { ...this.balance, total: cloudState.balance.total, available: cloudState.balance.available }; this.recalculateBalance(); }
        this.tradeCounter = this.closedTrades.length + this.positions.length;
        await this.persist();
      }
    } catch (e) { console.warn("Cloud sync pull failed, using local:", e); }
    this.initialized = true;
  }

  private async persist() {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(this.positions)),
        AsyncStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(this.closedTrades)),
        AsyncStorage.setItem(STORAGE_KEYS.BALANCE, JSON.stringify(this.balance)),
        AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.openOrders)),
      ]);
    } catch (e) {
      console.warn('Failed to persist trading state:', e);
    }
  }

  getPositions(): Position[] {
    return [...this.positions];
  }

  getClosedTrades(): ClosedTrade[] {
    return [...this.closedTrades];
  }

  getBalance(): Balance {
    return { ...this.balance };
  }

  getOpenOrders(): Order[] {
    return [...this.openOrders];
  }

  getStats(): TradeStats {
    const trades = this.closedTrades;
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalPnl: 0,
        avgPnl: 0,
        bestTrade: 0,
        worstTrade: 0,
        avgLeverage: 0,
        winStreak: 0,
        lossStreak: 0,
      };
    }

    const wins = trades.filter((t) => t.pnl > 0);
    const pnls = trades.map((t) => t.pnl);
    
    let maxWin = 0, maxLoss = 0, curWin = 0, curLoss = 0;
    for (const t of trades) {
      if (t.pnl > 0) { curWin++; curLoss = 0; maxWin = Math.max(maxWin, curWin); }
      else { curLoss++; curWin = 0; maxLoss = Math.max(maxLoss, curLoss); }
    }

    return {
      totalTrades: trades.length,
      winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
      totalPnl: pnls.reduce((s, p) => s + p, 0),
      avgPnl: pnls.reduce((s, p) => s + p, 0) / trades.length,
      bestTrade: Math.max(...pnls, 0),
      worstTrade: Math.min(...pnls, 0),
      avgLeverage: trades.reduce((s, t) => s + t.leverage, 0) / trades.length,
      winStreak: maxWin,
      lossStreak: maxLoss,
    };
  }

  getExtendedStats(): ExtendedStats {
    const base = this.getStats();
    const trades = this.closedTrades;

    // Average hold time
    let avgHoldTimeMs = 0;
    if (trades.length > 0) {
      const totalHold = trades.reduce((s, t) => s + (t.closedAt - t.openedAt), 0);
      avgHoldTimeMs = totalHold / trades.length;
    }

    // Discipline score: % of trades that had TP or SL set
    let disciplineScore = 0;
    if (trades.length > 0) {
      const withRisk = trades.filter((t) => t.hadTp || t.hadSl).length;
      disciplineScore = Math.round((withRisk / trades.length) * 100);
    }

    // Win rate by day (last 30 days)
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const recentTrades = trades.filter((t) => t.closedAt >= thirtyDaysAgo);
    const dayMap = new Map<string, { wins: number; total: number }>();

    for (const t of recentTrades) {
      const d = new Date(t.closedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const entry = dayMap.get(key) || { wins: 0, total: 0 };
      entry.total++;
      if (t.pnl > 0) entry.wins++;
      dayMap.set(key, entry);
    }

    const winRateByDay = Array.from(dayMap.entries())
      .map(([date, { wins, total }]) => ({
        date,
        wins,
        total,
        rate: total > 0 ? (wins / total) * 100 : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Heatmap: 7 rows (Sun-Sat) x 24 cols (hours)
    const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const t of trades) {
      const d = new Date(t.openedAt);
      heatmap[d.getDay()][d.getHours()]++;
    }

    return {
      ...base,
      avgHoldTimeMs,
      disciplineScore,
      currentEquity: this.balance.equity,
      currentBalance: this.balance.total,
      winRateByDay,
      heatmap,
    };
  }

  /**
   * Open a new position
   */
  openPosition(params: {
    symbol: string;
    side: 'long' | 'short';
    sizeUsd: number;
    leverage: number;
    price: number;
    tp?: number;
    sl?: number;
  }): Position | null {
    const { symbol, side, sizeUsd, leverage, price, tp, sl } = params;
    
    const margin = sizeUsd / leverage;
    if (margin > this.balance.available) {
      return null; // Insufficient margin
    }

    const size = sizeUsd / price;
    
    // Calculate liquidation price
    const liqDistance = price / leverage;
    const liquidationPrice = side === 'long' 
      ? price - liqDistance * 0.9
      : price + liqDistance * 0.9;

    // Add small slippage for realism (0.01-0.05%)
    const slippage = price * (0.0001 + Math.random() * 0.0004);
    const fillPrice = side === 'long' ? price + slippage : price - slippage;

    this.tradeCounter++;
    const position: Position = {
      id: `pos-${Date.now()}-${this.tradeCounter}`,
      symbol,
      side,
      size,
      sizeUsd,
      entryPrice: fillPrice,
      markPrice: price,
      leverage,
      margin,
      unrealizedPnl: 0,
      unrealizedPnlPct: 0,
      liquidationPrice,
      tp,
      sl,
      openedAt: Date.now(),
    };

    this.positions.push(position);
    this.balance.available -= margin;
    this.balance.marginUsed += margin;
    this.recalculateBalance();
    this.persist();
    this.notify();

    // Cloud sync: push new position

    cloudSync.pushPosition(position).catch(() => {});
    cloudSync.pushBalance(this.balance).catch(() => {});
    return position;
  }

  /**
   * Close a position at market price
   */
  closePosition(positionId: string, currentPrice: number): ClosedTrade | null {
    const idx = this.positions.findIndex((p) => p.id === positionId);
    if (idx === -1) return null;

    const pos = this.positions[idx];
    
    // Add small slippage
    const slippage = currentPrice * (0.0001 + Math.random() * 0.0004);
    const exitPrice = pos.side === 'long' ? currentPrice - slippage : currentPrice + slippage;

    const priceDiff = pos.side === 'long' 
      ? exitPrice - pos.entryPrice 
      : pos.entryPrice - exitPrice;
    const pnl = priceDiff * pos.size;
    const pnlPct = (priceDiff / pos.entryPrice) * 100 * pos.leverage;

    const trade: ClosedTrade = {
      id: `trade-${Date.now()}`,
      symbol: pos.symbol,
      side: pos.side,
      entryPrice: pos.entryPrice,
      exitPrice,
      size: pos.size,
      sizeUsd: pos.sizeUsd,
      leverage: pos.leverage,
      pnl,
      pnlPct,
      openedAt: pos.openedAt,
      closedAt: Date.now(),
      hadTp: pos.tp != null,
      hadSl: pos.sl != null,
    };

    this.closedTrades.unshift(trade);
    this.positions.splice(idx, 1);
    clearPositionWarning(positionId);
    this.balance.available += pos.margin + pnl;
    this.balance.marginUsed -= pos.margin;
    this.balance.total += pnl;
    this.recalculateBalance();
    this.persist();
    this.notify();

    // Cloud sync: push closed trade + updated balance
    cloudSync.pushClosedTrade(trade, pos.id).catch(() => {});
    cloudSync.pushBalance(this.balance).catch(() => {});
    return trade;
  }

  /**
   * Update mark prices for all positions
   */
  updateMarkPrices(prices: Record<string, number>) {
    let totalPnl = 0;
    let changed = false;

    for (const pos of this.positions) {
      const baseSymbol = pos.symbol.replace('-PERP', '');
      const newPrice = prices[baseSymbol] || prices[pos.symbol];
      if (!newPrice) continue;

      pos.markPrice = newPrice;
      const priceDiff = pos.side === 'long'
        ? newPrice - pos.entryPrice
        : pos.entryPrice - newPrice;
      pos.unrealizedPnl = priceDiff * pos.size;
      pos.unrealizedPnlPct = (priceDiff / pos.entryPrice) * 100 * pos.leverage;
      totalPnl += pos.unrealizedPnl;
      changed = true;

      // Check TP/SL
      if (pos.tp) {
        const hitTp = pos.side === 'long' ? newPrice >= pos.tp : newPrice <= pos.tp;
        if (hitTp) {
          const trade = this.closePosition(pos.id, pos.tp);
          if (trade) {
            notifyTpSlHit({
              symbol: trade.symbol,
              side: trade.side,
              type: 'tp',
              pnl: trade.pnl,
              exitPrice: trade.exitPrice,
            });
          }
          return;
        }
      }
      if (pos.sl) {
        const hitSl = pos.side === 'long' ? newPrice <= pos.sl : newPrice >= pos.sl;
        if (hitSl) {
          const trade = this.closePosition(pos.id, pos.sl);
          if (trade) {
            notifyTpSlHit({
              symbol: trade.symbol,
              side: trade.side,
              type: 'sl',
              pnl: trade.pnl,
              exitPrice: trade.exitPrice,
            });
          }
          return;
        }
      }

      // Check liquidation
      const isLiquidated = pos.side === 'long'
        ? newPrice <= pos.liquidationPrice
        : newPrice >= pos.liquidationPrice;
      if (isLiquidated) {
        this.closePosition(pos.id, pos.liquidationPrice);
        return;
      }
    }

    if (changed) {
      this.balance.unrealizedPnl = totalPnl;
      this.balance.equity = this.balance.total + totalPnl;
      this.notify();
    }
  }

  private recalculateBalance() {
    let totalPnl = 0;
    let totalMargin = 0;
    for (const pos of this.positions) {
      totalPnl += pos.unrealizedPnl;
      totalMargin += pos.margin;
    }
    this.balance.unrealizedPnl = totalPnl;
    this.balance.marginUsed = totalMargin;
    this.balance.equity = this.balance.total + totalPnl;
    this.balance.available = this.balance.total - totalMargin;
  }

  /**
   * Reset account to initial state
   */
  async resetAccount() {
    this.positions = [];
    this.closedTrades = [];
    this.openOrders = [];
    this.balance = {
      total: INITIAL_BALANCE,
      available: INITIAL_BALANCE,
      unrealizedPnl: 0,
      marginUsed: 0,
      equity: INITIAL_BALANCE,
    };
    await this.persist();
    this.notify();

    // Cloud sync: push reset
    cloudSync.pushReset().catch(() => {});  }
}

export const tradingEngine = new TradingEngine();

/**
 * NERVE Paper Trading Engine
 * Handles position management, PnL tracking, and trade execution
 * All trades are simulated locally with realistic fills
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Position, ClosedTrade, Balance, Order, TradeStats } from './types';

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
    };

    this.closedTrades.unshift(trade);
    this.positions.splice(idx, 1);
    this.balance.available += pos.margin + pnl;
    this.balance.marginUsed -= pos.margin;
    this.balance.total += pnl;
    this.recalculateBalance();
    this.persist();
    this.notify();

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
          this.closePosition(pos.id, pos.tp);
          return; // Recalculates and notifies
        }
      }
      if (pos.sl) {
        const hitSl = pos.side === 'long' ? newPrice <= pos.sl : newPrice >= pos.sl;
        if (hitSl) {
          this.closePosition(pos.id, pos.sl);
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
  }
}

export const tradingEngine = new TradingEngine();

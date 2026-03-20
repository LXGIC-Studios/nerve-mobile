export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export interface Fill {
  price: number;
  size: number;
}

export interface MatchResult {
  fills: Fill[];
  avgPrice: number;
  totalFilled: number;
  restingSize: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  sizeUsd: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  margin: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  liquidationPrice: number;
  tp?: number;
  sl?: number;
  openedAt: number;
}

export interface Order {
  id: string;
  symbol: string;
  type: 'market' | 'limit';
  side: 'long' | 'short';
  price: number;
  size: number;
  sizeUsd: number;
  leverage: number;
  filled: number;
  status: 'open' | 'filled' | 'partial' | 'cancelled';
  tp?: number;
  sl?: number;
  time: number;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  size: number;
  sizeUsd: number;
  leverage: number;
  pnl: number;
  pnlPct: number;
  openedAt: number;
  closedAt: number;
}

export interface Balance {
  total: number;
  available: number;
  unrealizedPnl: number;
  marginUsed: number;
  equity: number;
}

export interface TradeStats {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  bestTrade: number;
  worstTrade: number;
  avgLeverage: number;
  winStreak: number;
  lossStreak: number;
}

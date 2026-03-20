/**
 * React hook for the trading engine
 */
import { useState, useEffect, useCallback } from 'react';
import { tradingEngine } from '../engine/tradingEngine';
import type { Position, ClosedTrade, Balance, TradeStats, ExtendedStats } from '../engine/types';

export function useTradingEngine() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<ClosedTrade[]>([]);
  const [balance, setBalance] = useState<Balance>(tradingEngine.getBalance());
  const [stats, setStats] = useState<TradeStats>(tradingEngine.getStats());
  const [extendedStats, setExtendedStats] = useState<ExtendedStats>(tradingEngine.getExtendedStats());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    tradingEngine.init().then(() => {
      setPositions(tradingEngine.getPositions());
      setTrades(tradingEngine.getClosedTrades());
      setBalance(tradingEngine.getBalance());
      setStats(tradingEngine.getStats());
      setExtendedStats(tradingEngine.getExtendedStats());
      setReady(true);
    });

    const unsub = tradingEngine.subscribe(() => {
      setPositions(tradingEngine.getPositions());
      setTrades(tradingEngine.getClosedTrades());
      setBalance(tradingEngine.getBalance());
      setStats(tradingEngine.getStats());
      setExtendedStats(tradingEngine.getExtendedStats());
    });

    return unsub;
  }, []);

  const openPosition = useCallback((params: {
    symbol: string;
    side: 'long' | 'short';
    sizeUsd: number;
    leverage: number;
    price: number;
    tp?: number;
    sl?: number;
  }) => {
    return tradingEngine.openPosition(params);
  }, []);

  const closePosition = useCallback((positionId: string, currentPrice: number) => {
    return tradingEngine.closePosition(positionId, currentPrice);
  }, []);

  const resetAccount = useCallback(() => {
    return tradingEngine.resetAccount();
  }, []);

  return {
    positions,
    trades,
    balance,
    stats,
    extendedStats,
    ready,
    openPosition,
    closePosition,
    resetAccount,
  };
}

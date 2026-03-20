/**
 * Real-time price hook — polls Prism API and updates state
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { getBatchPrices, type PriceData } from '../api/prism';
import { tradingEngine } from '../engine/tradingEngine';
import { checkPositionAlerts } from '../notifications';

const POLL_INTERVAL = 8000; // 8 seconds

// Core symbols we always track
const CORE_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'AVAX', 'LINK', 'SUI', 'ARB'];

// Global price cache shared across components
let globalPrices: Record<string, PriceData> = {};
let globalListeners: Set<() => void> = new Set();
let pollTimer: ReturnType<typeof setInterval> | null = null;
let isPolling = false;
let lastError: string | null = null;

async function fetchAndUpdate(symbols?: string[]) {
  if (isPolling) return;
  isPolling = true;
  try {
    const syms = symbols ?? CORE_SYMBOLS;
    const prices = await getBatchPrices(syms);
    Object.assign(globalPrices, prices);
    
    // Update trading engine with new prices
    const priceMap: Record<string, number> = {};
    for (const [sym, data] of Object.entries(prices)) {
      priceMap[sym] = data.price;
    }
    tradingEngine.updateMarkPrices(priceMap);
    
    // Check for liquidation warnings
    checkPositionAlerts(tradingEngine.getPositions(), priceMap);
    
    // Clear any previous error on success
    lastError = null;
    
    // Notify all listeners
    globalListeners.forEach((l) => l());
  } catch (e) {
    lastError = e instanceof Error ? e.message : 'Failed to fetch prices';
    console.warn('Price poll failed:', e);
    // Still notify listeners so they can display error state
    globalListeners.forEach((l) => l());
  } finally {
    isPolling = false;
  }
}

function startPolling() {
  if (pollTimer) return;
  fetchAndUpdate();
  pollTimer = setInterval(() => fetchAndUpdate(), POLL_INTERVAL);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export function usePrices(additionalSymbols?: string[]) {
  const [prices, setPrices] = useState<Record<string, PriceData>>(globalPrices);
  const [loading, setLoading] = useState(Object.keys(globalPrices).length === 0);
  const [error, setError] = useState<string | null>(lastError);

  useEffect(() => {
    const listener = () => {
      setPrices({ ...globalPrices });
      setLoading(false);
      setError(lastError);
    };
    globalListeners.add(listener);
    startPolling();

    // Fetch additional symbols if needed
    if (additionalSymbols?.length) {
      fetchAndUpdate([...CORE_SYMBOLS, ...additionalSymbols]);
    }

    return () => {
      globalListeners.delete(listener);
      if (globalListeners.size === 0) stopPolling();
    };
  }, []);

  const refresh = useCallback(() => {
    setError(null); // Clear error on manual refresh
    fetchAndUpdate(additionalSymbols ? [...CORE_SYMBOLS, ...additionalSymbols] : undefined);
  }, [additionalSymbols]);

  return { prices, loading, error, refresh };
}

export function usePrice(symbol: string) {
  const { prices, loading, error, refresh } = usePrices([symbol]);
  return {
    price: prices[symbol.toUpperCase()] ?? null,
    loading,
    error,
    refresh,
  };
}

export function getLatestPrice(symbol: string): number | null {
  const data = globalPrices[symbol.toUpperCase()];
  return data?.price ?? null;
}

// Mock data matching the web app patterns

export interface Market {
  symbol: string;
  base: string;
  price: number;
  change24h: number;
  volume: string;
  high24h: number;
  low24h: number;
  maxLeverage: number;
  fundingRate: number;
  category: MarketCategory;
  openInterest: string;
}

export type MarketCategory = 'majors' | 'l1' | 'defi' | 'meme' | 'ai' | 'l2' | 'infra';

export const categoryLabels: Record<MarketCategory, string> = {
  majors: 'Majors',
  l1: 'Layer 1',
  l2: 'Layer 2',
  defi: 'DeFi',
  meme: 'Meme',
  ai: 'AI',
  infra: 'Infra',
};

export interface Position {
  id: string;
  symbol: string; // Changed from 'market' to match trading engine
  side: 'long' | 'short';
  size: number;
  sizeUsd: number; // Added to match trading engine
  entryPrice: number;
  markPrice: number; // Changed from 'currentPrice' to match trading engine
  leverage: number;
  margin: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  liquidationPrice: number;
  openedAt: number; // Changed from string to number to match trading engine
  tp?: number;
  sl?: number;
}

export interface AIInsight {
  type: 'warning' | 'info' | 'caution' | 'success';
  text: string;
  score?: number;
}

export interface RecentTrade {
  id: number;
  market: string;
  side: 'Long' | 'Short';
  pnl: number;
  score: number;
  edge: 'Aligned' | 'Misaligned' | 'Neutral';
  time: string;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export const markets: Market[] = [
  // Majors
  { symbol: 'BTC-PERP', base: 'BTC', price: 94250.4, change24h: 2.34, volume: '1.2B', high24h: 95100, low24h: 92800, maxLeverage: 50, fundingRate: 0.0042, category: 'majors', openInterest: '4.8B' },
  { symbol: 'ETH-PERP', base: 'ETH', price: 3412.8, change24h: -0.87, volume: '487M', high24h: 3480, low24h: 3380, maxLeverage: 50, fundingRate: 0.0031, category: 'majors', openInterest: '2.1B' },
  { symbol: 'BNB-PERP', base: 'BNB', price: 612.3, change24h: 1.12, volume: '89M', high24h: 618, low24h: 604, maxLeverage: 20, fundingRate: 0.0025, category: 'majors', openInterest: '380M' },
  { symbol: 'XRP-PERP', base: 'XRP', price: 2.48, change24h: 3.82, volume: '210M', high24h: 2.55, low24h: 2.38, maxLeverage: 20, fundingRate: 0.0058, category: 'majors', openInterest: '520M' },
  // Layer 1
  { symbol: 'SOL-PERP', base: 'SOL', price: 178.65, change24h: 5.21, volume: '312M', high24h: 182.40, low24h: 169.20, maxLeverage: 20, fundingRate: 0.0085, category: 'l1', openInterest: '890M' },
  { symbol: 'AVAX-PERP', base: 'AVAX', price: 38.9, change24h: -1.33, volume: '67M', high24h: 39.8, low24h: 38.2, maxLeverage: 20, fundingRate: 0.0022, category: 'l1', openInterest: '210M' },
  { symbol: 'SUI-PERP', base: 'SUI', price: 3.42, change24h: 7.82, volume: '28M', high24h: 3.55, low24h: 3.12, maxLeverage: 20, fundingRate: 0.0124, category: 'l1', openInterest: '145M' },
  { symbol: 'ADA-PERP', base: 'ADA', price: 0.72, change24h: -0.42, volume: '52M', high24h: 0.74, low24h: 0.71, maxLeverage: 20, fundingRate: 0.0018, category: 'l1', openInterest: '180M' },
  { symbol: 'DOT-PERP', base: 'DOT', price: 7.84, change24h: 1.95, volume: '34M', high24h: 8.02, low24h: 7.65, maxLeverage: 20, fundingRate: 0.0032, category: 'l1', openInterest: '95M' },
  { symbol: 'NEAR-PERP', base: 'NEAR', price: 5.67, change24h: 2.88, volume: '41M', high24h: 5.82, low24h: 5.48, maxLeverage: 20, fundingRate: 0.0045, category: 'l1', openInterest: '120M' },
  { symbol: 'APT-PERP', base: 'APT', price: 9.15, change24h: -2.34, volume: '29M', high24h: 9.42, low24h: 9.01, maxLeverage: 20, fundingRate: -0.0015, category: 'l1', openInterest: '88M' },
  { symbol: 'ATOM-PERP', base: 'ATOM', price: 10.42, change24h: 0.67, volume: '22M', high24h: 10.58, low24h: 10.28, maxLeverage: 20, fundingRate: 0.0021, category: 'l1', openInterest: '75M' },
  { symbol: 'FTM-PERP', base: 'FTM', price: 0.68, change24h: 4.12, volume: '18M', high24h: 0.71, low24h: 0.65, maxLeverage: 10, fundingRate: 0.0078, category: 'l1', openInterest: '42M' },
  { symbol: 'SEI-PERP', base: 'SEI', price: 0.42, change24h: -1.85, volume: '15M', high24h: 0.44, low24h: 0.41, maxLeverage: 10, fundingRate: -0.0028, category: 'l1', openInterest: '38M' },
  // Layer 2
  { symbol: 'ARB-PERP', base: 'ARB', price: 1.24, change24h: -2.15, volume: '89M', high24h: 1.28, low24h: 1.21, maxLeverage: 20, fundingRate: -0.0012, category: 'l2', openInterest: '245M' },
  { symbol: 'OP-PERP', base: 'OP', price: 2.15, change24h: 0.94, volume: '34M', high24h: 2.20, low24h: 2.10, maxLeverage: 20, fundingRate: 0.0018, category: 'l2', openInterest: '110M' },
  { symbol: 'MATIC-PERP', base: 'MATIC', price: 0.54, change24h: -0.92, volume: '42M', high24h: 0.55, low24h: 0.53, maxLeverage: 20, fundingRate: 0.0008, category: 'l2', openInterest: '95M' },
  { symbol: 'STRK-PERP', base: 'STRK', price: 0.68, change24h: 3.42, volume: '12M', high24h: 0.71, low24h: 0.65, maxLeverage: 10, fundingRate: 0.0065, category: 'l2', openInterest: '28M' },
  // DeFi
  { symbol: 'LINK-PERP', base: 'LINK', price: 18.42, change24h: 3.67, volume: '45M', high24h: 18.90, low24h: 17.60, maxLeverage: 20, fundingRate: 0.0051, category: 'defi', openInterest: '165M' },
  { symbol: 'UNI-PERP', base: 'UNI', price: 12.85, change24h: 1.23, volume: '28M', high24h: 13.10, low24h: 12.60, maxLeverage: 20, fundingRate: 0.0034, category: 'defi', openInterest: '85M' },
  { symbol: 'AAVE-PERP', base: 'AAVE', price: 285.4, change24h: 2.56, volume: '19M', high24h: 292, low24h: 278, maxLeverage: 10, fundingRate: 0.0042, category: 'defi', openInterest: '62M' },
  { symbol: 'MKR-PERP', base: 'MKR', price: 1580, change24h: -0.45, volume: '8M', high24h: 1605, low24h: 1560, maxLeverage: 10, fundingRate: 0.0015, category: 'defi', openInterest: '32M' },
  { symbol: 'CRV-PERP', base: 'CRV', price: 0.62, change24h: -3.12, volume: '14M', high24h: 0.65, low24h: 0.61, maxLeverage: 10, fundingRate: -0.0038, category: 'defi', openInterest: '25M' },
  { symbol: 'PENDLE-PERP', base: 'PENDLE', price: 4.85, change24h: 5.45, volume: '11M', high24h: 5.02, low24h: 4.55, maxLeverage: 10, fundingRate: 0.0092, category: 'defi', openInterest: '35M' },
  { symbol: 'JUP-PERP', base: 'JUP', price: 1.12, change24h: 2.18, volume: '16M', high24h: 1.15, low24h: 1.08, maxLeverage: 10, fundingRate: 0.0055, category: 'defi', openInterest: '48M' },
  // Meme
  { symbol: 'DOGE-PERP', base: 'DOGE', price: 0.1823, change24h: 1.45, volume: '156M', high24h: 0.1860, low24h: 0.1780, maxLeverage: 10, fundingRate: 0.0067, category: 'meme', openInterest: '320M' },
  { symbol: 'WIF-PERP', base: 'WIF', price: 0.87, change24h: -4.39, volume: '52M', high24h: 0.92, low24h: 0.85, maxLeverage: 10, fundingRate: -0.0045, category: 'meme', openInterest: '110M' },
  { symbol: 'PEPE-PERP', base: 'PEPE', price: 0.00001245, change24h: 8.92, volume: '98M', high24h: 0.00001310, low24h: 0.00001125, maxLeverage: 5, fundingRate: 0.0152, category: 'meme', openInterest: '185M' },
  { symbol: 'SHIB-PERP', base: 'SHIB', price: 0.0000242, change24h: 0.85, volume: '65M', high24h: 0.0000248, low24h: 0.0000238, maxLeverage: 10, fundingRate: 0.0028, category: 'meme', openInterest: '140M' },
  { symbol: 'BONK-PERP', base: 'BONK', price: 0.0000185, change24h: -2.78, volume: '35M', high24h: 0.0000195, low24h: 0.0000180, maxLeverage: 5, fundingRate: -0.0055, category: 'meme', openInterest: '58M' },
  { symbol: 'FLOKI-PERP', base: 'FLOKI', price: 0.000178, change24h: 3.45, volume: '22M', high24h: 0.000185, low24h: 0.000170, maxLeverage: 5, fundingRate: 0.0072, category: 'meme', openInterest: '42M' },
  { symbol: 'TRUMP-PERP', base: 'TRUMP', price: 12.85, change24h: -6.23, volume: '45M', high24h: 13.95, low24h: 12.40, maxLeverage: 5, fundingRate: -0.0125, category: 'meme', openInterest: '88M' },
  // AI
  { symbol: 'FET-PERP', base: 'FET', price: 2.15, change24h: 4.56, volume: '38M', high24h: 2.22, low24h: 2.04, maxLeverage: 10, fundingRate: 0.0082, category: 'ai', openInterest: '95M' },
  { symbol: 'RENDER-PERP', base: 'RENDER', price: 8.42, change24h: 3.21, volume: '25M', high24h: 8.65, low24h: 8.12, maxLeverage: 10, fundingRate: 0.0058, category: 'ai', openInterest: '72M' },
  { symbol: 'TAO-PERP', base: 'TAO', price: 425.8, change24h: -1.45, volume: '15M', high24h: 435, low24h: 418, maxLeverage: 10, fundingRate: -0.0022, category: 'ai', openInterest: '55M' },
  { symbol: 'ONDO-PERP', base: 'ONDO', price: 1.35, change24h: 6.32, volume: '21M', high24h: 1.42, low24h: 1.25, maxLeverage: 10, fundingRate: 0.0105, category: 'ai', openInterest: '48M' },
  { symbol: 'WLD-PERP', base: 'WLD', price: 2.82, change24h: 1.88, volume: '18M', high24h: 2.90, low24h: 2.74, maxLeverage: 10, fundingRate: 0.0042, category: 'ai', openInterest: '42M' },
  { symbol: 'AIOZ-PERP', base: 'AIOZ', price: 0.85, change24h: 7.12, volume: '9M', high24h: 0.88, low24h: 0.78, maxLeverage: 5, fundingRate: 0.0118, category: 'ai', openInterest: '22M' },
  // Infra
  { symbol: 'TIA-PERP', base: 'TIA', price: 8.95, change24h: 2.15, volume: '19M', high24h: 9.12, low24h: 8.72, maxLeverage: 10, fundingRate: 0.0048, category: 'infra', openInterest: '55M' },
  { symbol: 'INJ-PERP', base: 'INJ', price: 24.5, change24h: -0.82, volume: '16M', high24h: 25.1, low24h: 24.2, maxLeverage: 10, fundingRate: 0.0018, category: 'infra', openInterest: '48M' },
  { symbol: 'PYTH-PERP', base: 'PYTH', price: 0.38, change24h: 1.56, volume: '8M', high24h: 0.39, low24h: 0.37, maxLeverage: 5, fundingRate: 0.0035, category: 'infra', openInterest: '18M' },
];

// Legacy mock positions/stats removed — all data now comes from the trading engine.
// Only market definitions, order book generation, and fee tiers remain as reference data.

export function generateOrderBook(basePrice: number): { bids: OrderBookEntry[]; asks: OrderBookEntry[] } {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < 12; i++) {
    const bidSize = Math.random() * 5 + 0.5;
    bidTotal += bidSize;
    bids.push({
      price: basePrice - (i + 1) * basePrice * 0.0003,
      size: bidSize,
      total: bidTotal,
    });

    const askSize = Math.random() * 5 + 0.5;
    askTotal += askSize;
    asks.push({
      price: basePrice + (i + 1) * basePrice * 0.0003,
      size: askSize,
      total: askTotal,
    });
  }

  return { bids, asks };
}

// Fee tiers
export const feeTiers = [
  { tier: 'Starter', volume: '< $1M', maker: '0.02%', taker: '0.06%', current: false },
  { tier: 'Bronze', volume: '$1M - $10M', maker: '0.018%', taker: '0.05%', current: true },
  { tier: 'Silver', volume: '$10M - $50M', maker: '0.015%', taker: '0.04%', current: false },
  { tier: 'Gold', volume: '$50M - $250M', maker: '0.012%', taker: '0.035%', current: false },
  { tier: 'Platinum', volume: '> $250M', maker: '0.008%', taker: '0.025%', current: false },
];

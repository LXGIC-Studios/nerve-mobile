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
}

export interface Position {
  id: string;
  market: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  margin: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  liquidationPrice: number;
  openedAt: string;
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

export const markets: Market[] = [
  { symbol: 'BTC-PERP', base: 'BTC', price: 94250.4, change24h: 2.34, volume: '1.2B', high24h: 95100, low24h: 92800, maxLeverage: 50, fundingRate: 0.0042 },
  { symbol: 'ETH-PERP', base: 'ETH', price: 3412.8, change24h: -0.87, volume: '487M', high24h: 3480, low24h: 3380, maxLeverage: 50, fundingRate: 0.0031 },
  { symbol: 'SOL-PERP', base: 'SOL', price: 178.65, change24h: 5.21, volume: '312M', high24h: 182.40, low24h: 169.20, maxLeverage: 20, fundingRate: 0.0085 },
  { symbol: 'ARB-PERP', base: 'ARB', price: 1.24, change24h: -2.15, volume: '89M', high24h: 1.28, low24h: 1.21, maxLeverage: 20, fundingRate: -0.0012 },
  { symbol: 'DOGE-PERP', base: 'DOGE', price: 0.1823, change24h: 1.45, volume: '156M', high24h: 0.1860, low24h: 0.1780, maxLeverage: 10, fundingRate: 0.0067 },
  { symbol: 'AVAX-PERP', base: 'AVAX', price: 38.9, change24h: -1.33, volume: '67M', high24h: 39.8, low24h: 38.2, maxLeverage: 20, fundingRate: 0.0022 },
  { symbol: 'LINK-PERP', base: 'LINK', price: 18.42, change24h: 3.67, volume: '45M', high24h: 18.90, low24h: 17.60, maxLeverage: 20, fundingRate: 0.0051 },
  { symbol: 'OP-PERP', base: 'OP', price: 2.15, change24h: 0.94, volume: '34M', high24h: 2.20, low24h: 2.10, maxLeverage: 20, fundingRate: 0.0018 },
  { symbol: 'SUI-PERP', base: 'SUI', price: 3.42, change24h: 7.82, volume: '28M', high24h: 3.55, low24h: 3.12, maxLeverage: 20, fundingRate: 0.0124 },
  { symbol: 'WIF-PERP', base: 'WIF', price: 0.87, change24h: -4.39, volume: '52M', high24h: 0.92, low24h: 0.85, maxLeverage: 10, fundingRate: -0.0045 },
];

export const positions: Position[] = [
  {
    id: '1',
    market: 'BTC-PERP',
    side: 'long',
    size: 0.5,
    entryPrice: 91800,
    currentPrice: 94250.4,
    leverage: 10,
    margin: 4590,
    unrealizedPnl: 1225.2,
    unrealizedPnlPct: 26.69,
    liquidationPrice: 83620,
    openedAt: '2h ago',
  },
  {
    id: '2',
    market: 'ETH-PERP',
    side: 'short',
    size: 5.0,
    entryPrice: 3520,
    currentPrice: 3412.8,
    leverage: 5,
    margin: 3520,
    unrealizedPnl: 536,
    unrealizedPnlPct: 15.23,
    liquidationPrice: 4224,
    openedAt: '5h ago',
  },
  {
    id: '3',
    market: 'SOL-PERP',
    side: 'long',
    size: 50,
    entryPrice: 172.30,
    currentPrice: 178.65,
    leverage: 3,
    margin: 2871.67,
    unrealizedPnl: 317.5,
    unrealizedPnlPct: 11.06,
    liquidationPrice: 115.53,
    openedAt: '8h ago',
  },
  {
    id: '4',
    market: 'ARB-PERP',
    side: 'short',
    size: 2000,
    entryPrice: 1.28,
    currentPrice: 1.24,
    leverage: 7,
    margin: 365.71,
    unrealizedPnl: 80,
    unrealizedPnlPct: 21.88,
    liquidationPrice: 1.46,
    openedAt: '1d ago',
  },
];

export const aiInsights: AIInsight[] = [
  { type: 'warning', text: 'You tend to overtrade after 3 PM UTC. Current time is in your weak window.' },
  { type: 'info', text: 'Your win rate on SOL-PERP is 71% over the last 30 days. This is your strongest market.' },
  { type: 'caution', text: 'Current portfolio heat is elevated. 4 open positions with aggregate leverage of 6.2x.' },
  { type: 'success', text: 'Discipline score improved 8 points this week. You\'re taking fewer revenge trades.' },
];

export const recentTrades: RecentTrade[] = [
  { id: 1, market: 'BTC-PERP', side: 'Long', pnl: 1240, score: 8.5, edge: 'Aligned', time: '2h ago' },
  { id: 2, market: 'ETH-PERP', side: 'Short', pnl: -320, score: 4.2, edge: 'Misaligned', time: '5h ago' },
  { id: 3, market: 'SOL-PERP', side: 'Long', pnl: 890, score: 7.8, edge: 'Aligned', time: '8h ago' },
  { id: 4, market: 'BTC-PERP', side: 'Short', pnl: 560, score: 6.9, edge: 'Neutral', time: '12h ago' },
  { id: 5, market: 'ARB-PERP', side: 'Long', pnl: -180, score: 3.1, edge: 'Misaligned', time: '1d ago' },
  { id: 6, market: 'DOGE-PERP', side: 'Long', pnl: 430, score: 7.2, edge: 'Aligned', time: '1d ago' },
];

export const portfolioStats = {
  equity: 52480.32,
  marginUsed: 11347.38,
  availableMargin: 41132.94,
  unrealizedPnl: 2158.7,
  realizedPnlToday: 1890.45,
  marginRatio: 21.62,
  winRate: 64.2,
  disciplineScore: 78,
  totalTrades: 147,
  avgLeverage: 6.2,
};

export const dashboardStats = {
  winRate: 64.2,
  winRateChange: '+3.1%',
  disciplineScore: 78,
  disciplineChange: '+8',
  avgPnl: '$482',
  avgPnlChange: '+12.4%',
  sharpeRatio: '2.14',
  sharpeChange: '+0.3',
};

export const winRateData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  rate: 52 + Math.sin(i * 0.3) * 8 + Math.random() * 5,
}));

export const disciplineData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  score: 68 + i * 0.5 + Math.random() * 6 - 3,
}));

export const heatmapData: number[][] = Array.from({ length: 7 }, () =>
  Array.from({ length: 24 }, () => Math.floor(Math.random() * 10))
);

// Fee tiers
export const feeTiers = [
  { tier: 'Starter', volume: '< $1M', maker: '0.02%', taker: '0.06%', current: false },
  { tier: 'Bronze', volume: '$1M - $10M', maker: '0.018%', taker: '0.05%', current: true },
  { tier: 'Silver', volume: '$10M - $50M', maker: '0.015%', taker: '0.04%', current: false },
  { tier: 'Gold', volume: '$50M - $250M', maker: '0.012%', taker: '0.035%', current: false },
  { tier: 'Platinum', volume: '> $250M', maker: '0.008%', taker: '0.025%', current: false },
];

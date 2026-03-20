/**
 * Strykr Prism API Client
 * Live crypto market data for NERVE mobile
 */

const BASE_URL = process.env.EXPO_PUBLIC_PRISM_API_URL || 'https://strykr-prism.up.railway.app';
const API_KEY = process.env.EXPO_PUBLIC_PRISM_API_KEY || '';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
}

export interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
}

export interface GlobalMarketData {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  ethDominance: number;
  activeCurrencies: number;
  markets: number;
}

export interface FundingRate {
  exchange: string;
  symbol: string;
  rate: number;
  nextFundingTime?: string;
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getPrice(symbol: string): Promise<PriceData | null> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/crypto/price/${symbol.toLowerCase()}`);
    if (!res.ok) return null;
    const data = await res.json();
    const price = data.price ?? data.usd ?? 0;
    // Don't return zero prices — they break the UI
    if (!price || price <= 0) return null;
    
    return {
      symbol: symbol.toUpperCase(),
      price,
      change24h: data.change24h ?? data.usd_24h_change ?? 0,
      high24h: data.high24h ?? (price ? price * 1.02 : 0),
      low24h: data.low24h ?? (price ? price * 0.98 : 0),
      volume24h: data.volume24h ?? data.usd_24h_vol ?? 0,
      marketCap: data.marketCap ?? data.usd_market_cap,
    };
  } catch (e) {
    console.warn(`Prism: failed to fetch price for ${symbol}:`, e);
    return null;
  }
}

export async function getBatchPrices(symbols: string[]): Promise<Record<string, PriceData>> {
  const results: Record<string, PriceData> = {};
  // Fetch in parallel batches of 5
  const batches = [];
  for (let i = 0; i < symbols.length; i += 5) {
    batches.push(symbols.slice(i, i + 5));
  }
  
  for (const batch of batches) {
    const promises = batch.map(async (sym) => {
      const data = await getPrice(sym);
      if (data) results[sym.toUpperCase()] = data;
    });
    await Promise.allSettled(promises);
  }
  
  return results;
}

export async function getFearGreed(): Promise<FearGreedData | null> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/market/fear-greed`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      value: data.value ?? data.data?.[0]?.value ?? 50,
      classification: data.classification ?? data.data?.[0]?.value_classification ?? 'Neutral',
      timestamp: data.timestamp ?? new Date().toISOString(),
    };
  } catch (e) {
    console.warn('Prism: failed to fetch fear/greed:', e);
    return null;
  }
}

export async function getGlobalMarket(): Promise<GlobalMarketData | null> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/market/global`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn('Prism: failed to fetch global market:', e);
    return null;
  }
}

export async function getTrending(): Promise<any[] | null> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/market/trending`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.coins ?? data.items ?? data;
  } catch (e) {
    console.warn('Prism: failed to fetch trending:', e);
    return null;
  }
}

export async function getFunding(symbol: string): Promise<FundingRate[] | null> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/funding/${symbol.toLowerCase()}/all`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn(`Prism: failed to fetch funding for ${symbol}:`, e);
    return null;
  }
}

export async function getOpenInterest(symbol: string): Promise<any | null> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/oi/${symbol.toLowerCase()}/all`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn(`Prism: failed to fetch OI for ${symbol}:`, e);
    return null;
  }
}

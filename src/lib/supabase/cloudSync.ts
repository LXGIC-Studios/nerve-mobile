import { supabase } from './client';
import type { Position, ClosedTrade, Balance } from '../engine/types';

export class CloudSync {
  private userId: string | null = null;
  private enabled = false;
  enable(userId: string) { this.userId = userId; this.enabled = true; }
  disable() { this.userId = null; this.enabled = false; }
  isEnabled(): boolean { return this.enabled && this.userId !== null; }

  async pullState(): Promise<{ positions: Position[]; closedTrades: ClosedTrade[]; balance: Balance | null } | null> {
    if (!this.isEnabled()) return null;
    try {
      const [posR, trR, balR] = await Promise.all([
        supabase.from('paper_positions').select('*').eq('user_id', this.userId!).eq('is_open', true),
        supabase.from('paper_positions').select('*').eq('user_id', this.userId!).eq('is_open', false).order('closed_at', { ascending: false }).limit(100),
        supabase.from('paper_balances').select('*').eq('user_id', this.userId!).single(),
      ]);
      if (posR.error) throw posR.error;
      if (trR.error) throw trR.error;
      return {
        positions: (posR.data || []).map(this.dbToPosition),
        closedTrades: (trR.data || []).map(this.dbToClosedTrade),
        balance: balR.data ? { total: Number(balR.data.total), available: Number(balR.data.available), unrealizedPnl: 0, marginUsed: 0, equity: Number(balR.data.total) } : null,
      };
    } catch (e) { console.warn('Cloud sync pull failed:', e); return null; }
  }

  async pushPosition(pos: Position): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await supabase.from('paper_positions').upsert({
        id: pos.id, user_id: this.userId!, symbol: pos.symbol, side: pos.side,
        entry_price: pos.entryPrice, size: pos.size, size_usd: pos.sizeUsd,
        leverage: pos.leverage, margin: pos.margin, tp: pos.tp || null, sl: pos.sl || null,
        liquidation_price: pos.liquidationPrice, opened_at: pos.openedAt, is_open: true,
      });
    } catch (e) { console.warn('pushPosition failed:', e); }
  }

  async pushClosedTrade(trade: ClosedTrade, posId: string): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await supabase.from('paper_positions').update({
        is_open: false, closed_at: trade.closedAt, exit_price: trade.exitPrice,
        pnl: trade.pnl, pnl_pct: trade.pnlPct,
      }).eq('id', posId).eq('user_id', this.userId!);
    } catch (e) { console.warn('pushClosedTrade failed:', e); }
  }

  async pushBalance(bal: Balance): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await supabase.from('paper_balances').upsert(
        { user_id: this.userId!, total: bal.total, available: bal.available },
        { onConflict: 'user_id' }
      );
    } catch (e) { console.warn('pushBalance failed:', e); }
  }

  async pushReset(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Promise.all([
        supabase.from('paper_positions').delete().eq('user_id', this.userId!),
        supabase.from('paper_balances').upsert({ user_id: this.userId!, total: 100000, available: 100000 }, { onConflict: 'user_id' }),
      ]);
    } catch (e) { console.warn('pushReset failed:', e); }
  }

  private dbToPosition(r: any): Position {
    return { id: r.id, symbol: r.symbol, side: r.side, size: Number(r.size), sizeUsd: Number(r.size_usd), entryPrice: Number(r.entry_price), markPrice: Number(r.entry_price), leverage: r.leverage, margin: Number(r.margin), unrealizedPnl: 0, unrealizedPnlPct: 0, liquidationPrice: Number(r.liquidation_price), tp: r.tp ? Number(r.tp) : undefined, sl: r.sl ? Number(r.sl) : undefined, openedAt: Number(r.opened_at) };
  }

  private dbToClosedTrade(r: any): ClosedTrade {
    return { id: r.id, symbol: r.symbol, side: r.side, entryPrice: Number(r.entry_price), exitPrice: Number(r.exit_price), size: Number(r.size), sizeUsd: Number(r.size_usd), leverage: r.leverage, pnl: Number(r.pnl), pnlPct: Number(r.pnl_pct), openedAt: Number(r.opened_at), closedAt: Number(r.closed_at) };
  }
}

export const cloudSync = new CloudSync();

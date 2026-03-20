/**
 * Cloud Sync Layer for Trading Engine
 * Syncs positions, trades, and balances to Supabase.
 * Wraps the existing AsyncStorage-based engine without rewriting it.
 * 
 * Strategy:
 * - On app launch: pull cloud state, merge into local (cloud wins)
 * - After trade open/close: push to cloud
 * - Guest mode: no sync, local-only
 */
import { supabase } from './client';
import type { Position, ClosedTrade, Balance } from '../engine/types';

export class CloudSync {
  private userId: string | null = null;
  private enabled = false;

  /**
   * Enable sync for authenticated user
   */
  enable(userId: string) {
    this.userId = userId;
    this.enabled = true;
  }

  /**
   * Disable sync (guest mode)
   */
  disable() {
    this.userId = null;
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled && this.userId !== null;
  }

  /**
   * Pull cloud state — returns positions, closed trades, and balance
   */
  async pullState(): Promise<{
    positions: Position[];
    closedTrades: ClosedTrade[];
    balance: Balance | null;
  } | null> {
    if (!this.isEnabled()) return null;

    try {
      const [posResult, tradesResult, balResult] = await Promise.all([
        supabase
          .from('paper_positions')
          .select('*')
          .eq('user_id', this.userId!)
          .eq('is_open', true),
        supabase
          .from('paper_positions')
          .select('*')
          .eq('user_id', this.userId!)
          .eq('is_open', false)
          .order('closed_at', { ascending: false })
          .limit(100),
        supabase
          .from('paper_balances')
          .select('*')
          .eq('user_id', this.userId!)
          .single(),
      ]);

      if (posResult.error) throw posResult.error;
      if (tradesResult.error) throw tradesResult.error;

      const positions: Position[] = (posResult.data || []).map(this.dbToPosition);
      const closedTrades: ClosedTrade[] = (tradesResult.data || []).map(this.dbToClosedTrade);
      
      let balance: Balance | null = null;
      if (balResult.data) {
        balance = {
          total: Number(balResult.data.total),
          available: Number(balResult.data.available),
          unrealizedPnl: 0,
          marginUsed: 0,
          equity: Number(balResult.data.total),
        };
      }

      return { positions, closedTrades, balance };
    } catch (e) {
      console.warn('Cloud sync pull failed:', e);
      return null;
    }
  }

  /**
   * Push an opened position to the cloud
   */
  async pushPosition(position: Position): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const { error } = await supabase.from('paper_positions').upsert({
        id: position.id,
        user_id: this.userId!,
        symbol: position.symbol,
        side: position.side,
        entry_price: position.entryPrice,
        size: position.size,
        size_usd: position.sizeUsd,
        leverage: position.leverage,
        margin: position.margin,
        tp: position.tp || null,
        sl: position.sl || null,
        liquidation_price: position.liquidationPrice,
        opened_at: position.openedAt,
        is_open: true,
      });
      if (error) throw error;
    } catch (e) {
      console.warn('Cloud sync push position failed:', e);
    }
  }

  /**
   * Push a closed trade to the cloud
   */
  async pushClosedTrade(trade: ClosedTrade, positionId: string): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      // Update the position row to mark as closed
      const { error } = await supabase
        .from('paper_positions')
        .update({
          is_open: false,
          closed_at: trade.closedAt,
          exit_price: trade.exitPrice,
          pnl: trade.pnl,
          pnl_pct: trade.pnlPct,
        })
        .eq('id', positionId)
        .eq('user_id', this.userId!);
      if (error) throw error;
    } catch (e) {
      console.warn('Cloud sync push closed trade failed:', e);
    }
  }

  /**
   * Push balance update to the cloud
   */
  async pushBalance(balance: Balance): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const { error } = await supabase
        .from('paper_balances')
        .upsert({
          user_id: this.userId!,
          total: balance.total,
          available: balance.available,
        }, { onConflict: 'user_id' });
      if (error) throw error;
    } catch (e) {
      console.warn('Cloud sync push balance failed:', e);
    }
  }

  /**
   * Push full reset (delete all positions, reset balance)
   */
  async pushReset(): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      await Promise.all([
        supabase
          .from('paper_positions')
          .delete()
          .eq('user_id', this.userId!),
        supabase
          .from('paper_balances')
          .upsert({
            user_id: this.userId!,
            total: 100000,
            available: 100000,
          }, { onConflict: 'user_id' }),
      ]);
    } catch (e) {
      console.warn('Cloud sync push reset failed:', e);
    }
  }

  // --- DB row to app type converters ---

  private dbToPosition(row: any): Position {
    return {
      id: row.id,
      symbol: row.symbol,
      side: row.side as 'long' | 'short',
      size: Number(row.size),
      sizeUsd: Number(row.size_usd),
      entryPrice: Number(row.entry_price),
      markPrice: Number(row.entry_price), // will be updated by price feed
      leverage: row.leverage,
      margin: Number(row.margin),
      unrealizedPnl: 0,
      unrealizedPnlPct: 0,
      liquidationPrice: Number(row.liquidation_price),
      tp: row.tp ? Number(row.tp) : undefined,
      sl: row.sl ? Number(row.sl) : undefined,
      openedAt: Number(row.opened_at),
    };
  }

  private dbToClosedTrade(row: any): ClosedTrade {
    return {
      id: row.id,
      symbol: row.symbol,
      side: row.side as 'long' | 'short',
      entryPrice: Number(row.entry_price),
      exitPrice: Number(row.exit_price),
      size: Number(row.size),
      sizeUsd: Number(row.size_usd),
      leverage: row.leverage,
      pnl: Number(row.pnl),
      pnlPct: Number(row.pnl_pct),
      openedAt: Number(row.opened_at),
      closedAt: Number(row.closed_at),
    };
  }
}

export const cloudSync = new CloudSync();

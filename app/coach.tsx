import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../src/theme/colors';
import { ChevronLeftIcon, LightningIcon } from '../src/components/icons';
import { useTradingEngine } from '../src/lib/hooks/useTradingEngine';
import { usePrices } from '../src/lib/hooks/usePrices';
import { fmt, pnlSign } from '../src/hooks/useFormatters';

// Coach API configuration — configurable base URL
const COACH_API_BASE_URL = 'https://nerve-production-f309.up.railway.app';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

const QUICK_ACTIONS = [
  { label: 'Market Analysis', prompt: 'Give me a quick market analysis. What are the key trends right now?' },
  { label: 'Risk Check', prompt: 'Check my current portfolio risk. Am I overexposed?' },
  { label: 'Trade Ideas', prompt: 'Based on current market conditions, what are some trade ideas?' },
  { label: 'Position Review', prompt: 'Review my open positions. Should I adjust any stops or take profit?' },
  { label: 'Funding Rates', prompt: 'What do current funding rates suggest about market sentiment?' },
];

export default function CoachScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey! I'm N Coach, your AI trading assistant. I can help with market analysis, risk management, trade ideas, and reviewing your positions. What would you like to know?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { positions, balance, stats } = useTradingEngine();
  const { prices } = usePrices();

  const buildContext = useCallback(() => {
    const posContext = positions.length > 0
      ? positions.map((p) => `${p.side.toUpperCase()} ${p.symbol} ${p.leverage}x, Entry: $${fmt(p.entryPrice, 2)}, PnL: ${pnlSign(p.unrealizedPnl)}$${fmt(Math.abs(p.unrealizedPnl))}`).join('\n')
      : 'No open positions';
    
    const priceContext = Object.entries(prices)
      .slice(0, 10)
      .map(([sym, data]) => `${sym}: $${fmt(data.price, 2)} (${data.change24h >= 0 ? '+' : ''}${data.change24h.toFixed(2)}%)`)
      .join(', ');

    return `
Account: Equity $${fmt(balance.equity)}, Available $${fmt(balance.available)}, ${stats.totalTrades} trades, ${stats.winRate.toFixed(1)}% win rate
Positions: ${posContext}
Live Prices: ${priceContext}
    `.trim();
  }, [positions, balance, stats, prices]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const context = buildContext();
    let response: string;

    try {
      // Try the real coach API first
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`${COACH_API_BASE_URL}/api/coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          context,
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        response = data.response ?? data.message ?? data.content ?? '';
      } else {
        // API returned error, fall back to local
        response = generateCoachResponse(text.trim(), context, positions, stats);
      }
    } catch (e) {
      // Network error or timeout, fall back to local generation
      response = generateCoachResponse(text.trim(), context, positions, stats);
    }

    const assistantMsg: Message = {
      id: `asst-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [buildContext, positions, stats, messages]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeftIcon size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.coachIcon}>
            <LightningIcon size={16} color={colors.accent} />
          </View>
          <View>
            <Text style={styles.headerTitle}>N Coach</Text>
            <Text style={styles.headerSubtitle}>AI Trading Assistant</Text>
          </View>
        </View>
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.msgBubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.assistantAvatar}>
                  <LightningIcon size={12} color={colors.accent} />
                </View>
              )}
              <View style={[styles.bubbleContent, msg.role === 'user' ? styles.userContent : styles.assistantContent]}>
                <Text style={[styles.msgText, msg.role === 'user' && styles.userText]}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.msgBubble, styles.assistantBubble]}>
              <View style={styles.assistantAvatar}>
                <LightningIcon size={12} color={colors.accent} />
              </View>
              <View style={styles.assistantContent}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Actions */}
        {messages.length <= 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickActionsContainer}
            contentContainerStyle={styles.quickActions}
          >
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.label}
                style={styles.quickAction}
                onPress={() => sendMessage(action.prompt)}
              >
                <Text style={styles.quickActionText}>{action.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask N Coach..."
            placeholderTextColor={colors.textMuted}
            keyboardAppearance="dark"
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(input)}
          />
          <Pressable
            onPress={() => sendMessage(input)}
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            disabled={!input.trim() || isLoading}
          >
            <Text style={styles.sendBtnText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Simple response generator (simulates AI coaching)
function generateCoachResponse(query: string, context: string, positions: any[], stats: any): string {
  const q = query.toLowerCase();

  if (q.includes('market analysis') || q.includes('trend')) {
    return "Looking at current market conditions:\n\n" +
      "BTC is showing strength with sustained buying pressure. The funding rates are moderately positive, suggesting bullish sentiment but not overheated.\n\n" +
      "Key levels to watch:\n" +
      "- BTC: Support at $92K, resistance at $96K\n" +
      "- ETH: Watching the $3,400 level for a breakout\n" +
      "- SOL: Strong momentum, but funding is getting elevated\n\n" +
      "Overall, the market looks constructive but be cautious with high leverage entries at current levels.";
  }

  if (q.includes('risk') || q.includes('overexposed')) {
    if (positions.length === 0) {
      return "You have no open positions right now, so your risk exposure is zero. That said, having dry powder ready is actually a good position to be in. Wait for clear setups before deploying capital.";
    }
    const totalMargin = positions.reduce((s: number, p: any) => s + p.margin, 0);
    const avgLev = positions.reduce((s: number, p: any) => s + p.leverage, 0) / positions.length;
    return `Current risk assessment:\n\n` +
      `- ${positions.length} open position(s)\n` +
      `- Total margin deployed: $${fmt(totalMargin)}\n` +
      `- Average leverage: ${avgLev.toFixed(1)}x\n\n` +
      (avgLev > 10 ? "Your average leverage is quite high. Consider reducing position sizes or leverage on your next entries." :
       avgLev > 5 ? "Moderate leverage levels. Keep monitoring liquidation distances." :
       "Conservative leverage. Good risk management.") +
      "\n\nMake sure all positions have stop losses set to protect your downside.";
  }

  if (q.includes('trade idea') || q.includes('what should i trade')) {
    return "Here are some potential setups I'm watching:\n\n" +
      "1. **SOL-PERP Long**: Strong trend, pull back to $175 support could offer good R:R. Target $190, stop $168.\n\n" +
      "2. **ETH-PERP Long**: Consolidating near resistance. Break above $3,450 could target $3,600. Keep it tight with a $3,380 stop.\n\n" +
      "3. **ARB-PERP Short**: Weak relative strength vs L1s. If it loses $1.22, could see $1.15.\n\n" +
      "Remember: these are ideas, not signals. Always size appropriately and use stops.";
  }

  if (q.includes('position') || q.includes('review')) {
    if (positions.length === 0) {
      return "No open positions to review. When you open trades, I can help you evaluate entry quality, suggest TP/SL levels, and assess whether your position sizing is appropriate.";
    }
    return positions.map((p: any) =>
      `**${p.side.toUpperCase()} ${p.symbol}** (${p.leverage}x)\n` +
      `Entry: $${fmt(p.entryPrice, 2)} | Mark: $${fmt(p.markPrice, 2)}\n` +
      `PnL: ${pnlSign(p.unrealizedPnl)}$${fmt(Math.abs(p.unrealizedPnl))} (${p.unrealizedPnlPct.toFixed(2)}%)\n` +
      (p.unrealizedPnlPct > 20 ? `Consider taking partial profits here.` :
       p.unrealizedPnlPct < -15 ? `Watch this closely. Consider tightening your stop.` :
       `Looking reasonable. Let the trade play out.`)
    ).join('\n\n');
  }

  if (q.includes('funding')) {
    return "Current funding rate insights:\n\n" +
      "Positive funding (longs paying shorts) suggests bullish sentiment. When funding gets extremely high (>0.1%), it often precedes a correction as leveraged longs get flushed.\n\n" +
      "Key observations:\n" +
      "- BTC funding is moderate — market isn't overheated\n" +
      "- Meme coin funding tends to be more volatile\n" +
      "- Negative funding on some alts suggests short interest building\n\n" +
      "Trade idea: When funding is very negative, it can be a contrarian long signal.";
  }

  // Default response
  return "That's a good question. Based on your current account status:\n\n" +
    `- Equity: $${fmt(stats.totalTrades > 0 ? 100000 + stats.totalPnl : 100000)}\n` +
    `- Win rate: ${stats.winRate.toFixed(1)}%\n` +
    `- Total trades: ${stats.totalTrades}\n\n` +
    "Focus on quality over quantity. The best traders aren't the ones who trade the most — they're the ones who wait for the best setups and size appropriately.\n\n" +
    "What specific aspect of your trading would you like to work on?";
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  coachIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  headerSubtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 1 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.profit },
  onlineText: { color: colors.profit, fontSize: 10, fontWeight: '600' },
  messageList: { flex: 1 },
  messageContent: { padding: 16, paddingBottom: 8 },
  msgBubble: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  userBubble: { justifyContent: 'flex-end' },
  assistantBubble: { justifyContent: 'flex-start' },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubbleContent: { maxWidth: '80%', borderRadius: 16, padding: 14 },
  userContent: { backgroundColor: colors.accent, borderBottomRightRadius: 4 },
  assistantContent: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  msgText: { color: colors.textPrimary, fontSize: 14, lineHeight: 20 },
  userText: { color: '#000' },
  quickActionsContainer: { maxHeight: 48 },
  quickActions: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  quickAction: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickActionText: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
});

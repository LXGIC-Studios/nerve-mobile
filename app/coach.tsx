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
  Animated as RNAnimated,
  Linking,
} from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { colors } from '../src/theme/colors';
import { ChevronLeftIcon, LightningIcon } from '../src/components/icons';
import { useTradingEngine } from '../src/lib/hooks/useTradingEngine';
import { usePrices } from '../src/lib/hooks/usePrices';
import { fmt, pnlSign } from '../src/hooks/useFormatters';

const OPENAI_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY
  ?? (typeof process !== 'undefined' ? (process.env as any)?.EXPO_PUBLIC_OPENAI_API_KEY : undefined)
  ?? '';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

const QUICK_ACTIONS = [
  { label: 'Risk Check', prompt: 'Check my current portfolio risk. Am I overexposed?' },
  { label: 'Position Review', prompt: 'Review my open positions. Should I adjust anything?' },
  { label: 'Trade Ideas', prompt: 'Based on my trading history, what should I focus on?' },
  { label: 'Discipline Report', prompt: 'How is my trading discipline? Give me an honest assessment.' },
  { label: 'What Am I Doing Wrong?', prompt: 'Analyze my trading patterns and tell me what I need to fix.' },
];

function TypingIndicator() {
  const dot1 = React.useRef(new RNAnimated.Value(0.3)).current;
  const dot2 = React.useRef(new RNAnimated.Value(0.3)).current;
  const dot3 = React.useRef(new RNAnimated.Value(0.3)).current;

  React.useEffect(() => {
    const animate = (dot: RNAnimated.Value, delay: number) =>
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.delay(delay),
          RNAnimated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          RNAnimated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );
    animate(dot1, 0).start();
    animate(dot2, 200).start();
    animate(dot3, 400).start();
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 6, paddingVertical: 4, paddingHorizontal: 4 }}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <RNAnimated.View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.accent,
            opacity: dot,
          }}
        />
      ))}
    </View>
  );
}

const SYSTEM_PROMPT = `You are N Coach, a direct and analytical AI trading coach inside NERVE, a paper trading app.

Your personality:
- Direct and no-nonsense. Don't sugarcoat poor performance.
- Analytical. Use the trader's actual data to back up every point.
- Focused on discipline: position sizing, TP/SL usage, leverage management, and emotional control.
- Short, actionable advice. No walls of text.

Rules:
- Always reference the trader's ACTUAL data (provided in context) when giving advice.
- If they have no trades, encourage them to start and explain what good discipline looks like.
- Call out risky behavior: high leverage without stops, overtrading, revenge trading patterns.
- Give specific, actionable improvements. Not generic platitudes.
- Keep responses concise. 3-5 short paragraphs max.`;

export default function CoachScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "I'm N Coach. I analyze your actual trading data and tell you what you need to hear, not what you want to hear. Ask me anything about your positions, risk, or discipline.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { positions, trades, balance, stats, extendedStats } = useTradingEngine();
  const { prices } = usePrices();

  const hasApiKey = OPENAI_API_KEY.length > 0;

  const buildContext = useCallback(() => {
    const posContext = positions.length > 0
      ? positions.map((p) => `${p.side.toUpperCase()} ${p.symbol} ${p.leverage}x, Entry: $${fmt(p.entryPrice, 2)}, Mark: $${fmt(p.markPrice, 2)}, PnL: ${pnlSign(p.unrealizedPnl)}$${fmt(Math.abs(p.unrealizedPnl))} (${p.unrealizedPnlPct.toFixed(1)}%), TP: ${p.tp ? `$${fmt(p.tp, 2)}` : 'NONE'}, SL: ${p.sl ? `$${fmt(p.sl, 2)}` : 'NONE'}`).join('\n')
      : 'No open positions';

    const recentTrades = trades.slice(0, 10).map((t) =>
      `${t.side.toUpperCase()} ${t.symbol} ${t.leverage}x: PnL ${pnlSign(t.pnl)}$${fmt(Math.abs(t.pnl))} (${t.pnlPct.toFixed(1)}%), held ${Math.round((t.closedAt - t.openedAt) / 60000)}min, TP: ${t.hadTp ? 'YES' : 'NO'}, SL: ${t.hadSl ? 'YES' : 'NO'}`
    ).join('\n');

    const priceContext = Object.entries(prices)
      .slice(0, 8)
      .map(([sym, data]) => `${sym}: $${fmt(data.price, 2)} (${data.change24h >= 0 ? '+' : ''}${data.change24h.toFixed(2)}%)`)
      .join(', ');

    return `TRADER'S LIVE DATA:
Equity: $${fmt(balance.equity)} | Balance: $${fmt(balance.total)} | Available: $${fmt(balance.available)}
Total Trades: ${stats.totalTrades} | Win Rate: ${stats.winRate.toFixed(1)}% | Total PnL: ${pnlSign(stats.totalPnl)}$${fmt(Math.abs(stats.totalPnl))}
Best Trade: ${pnlSign(stats.bestTrade)}$${fmt(Math.abs(stats.bestTrade))} | Worst: ${pnlSign(stats.worstTrade)}$${fmt(Math.abs(stats.worstTrade))}
Win Streak: ${stats.winStreak} | Loss Streak: ${stats.lossStreak} | Avg Leverage: ${stats.avgLeverage.toFixed(1)}x
Discipline Score: ${extendedStats.disciplineScore}% (% of trades with TP or SL set)
Avg Hold Time: ${Math.round(extendedStats.avgHoldTimeMs / 60000)} minutes

OPEN POSITIONS:
${posContext}

RECENT CLOSED TRADES (latest 10):
${recentTrades || 'None'}

LIVE PRICES: ${priceContext || 'Loading...'}`;
  }, [positions, trades, balance, stats, extendedStats, prices]);

  const sendViaOpenAI = useCallback(async (text: string, context: string, history: Message[]): Promise<string> => {
    const apiMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'system' as const, content: `Current trading context:\n${context}` },
      ...history.slice(-8).filter((m) => m.role !== 'system').map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: text },
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: apiMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? 'No response from coach.';
  }, []);

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
      if (hasApiKey) {
        response = await sendViaOpenAI(text.trim(), context, messages);
      } else {
        response = generateLocalResponse(text.trim(), context, positions, stats, extendedStats);
      }
    } catch (e) {
      // Fallback to local response on any error
      response = generateLocalResponse(text.trim(), context, positions, stats, extendedStats);
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
  }, [buildContext, positions, stats, extendedStats, messages, hasApiKey, sendViaOpenAI]);

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
            <Text style={styles.headerSubtitle}>
              {hasApiKey ? 'AI Trading Coach' : 'Local Analysis Mode'}
            </Text>
          </View>
        </View>
        <View style={styles.onlineBadge}>
          <View style={[styles.onlineDot, !hasApiKey && { backgroundColor: colors.caution }]} />
          <Text style={[styles.onlineText, !hasApiKey && { color: colors.caution }]}>
            {hasApiKey ? 'Online' : 'Local'}
          </Text>
        </View>
      </View>

      {/* API Key Notice */}
      {!hasApiKey && (
        <View style={styles.noKeyBanner}>
          <Text style={styles.noKeyText}>
            Running in local mode. Set EXPO_PUBLIC_OPENAI_API_KEY in your .env for AI-powered coaching.
          </Text>
        </View>
      )}

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
              <View style={[styles.assistantContent, styles.typingContent]}>
                <TypingIndicator />
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

/**
 * Local response generator — analyses real trading data without any external API.
 */
function generateLocalResponse(
  query: string,
  _context: string,
  positions: any[],
  stats: any,
  extendedStats: any
): string {
  const q = query.toLowerCase();

  // Risk / exposure check
  if (q.includes('risk') || q.includes('overexposed') || q.includes('exposure')) {
    if (positions.length === 0) {
      return "Zero open positions. Your risk exposure is flat. That's not a bad thing — cash is a position too. Wait for a clear setup before deploying capital.";
    }
    const totalMargin = positions.reduce((s: number, p: any) => s + p.margin, 0);
    const avgLev = positions.reduce((s: number, p: any) => s + p.leverage, 0) / positions.length;
    const posWithoutSl = positions.filter((p: any) => !p.sl).length;

    let risk = `You have ${positions.length} open position(s).\n`;
    risk += `Total margin deployed: $${fmt(totalMargin)} | Avg leverage: ${avgLev.toFixed(1)}x\n\n`;

    if (posWithoutSl > 0) {
      risk += `WARNING: ${posWithoutSl} position(s) have NO stop loss. This is the fastest way to blow up an account. Set stops immediately.\n\n`;
    }

    if (avgLev > 10) {
      risk += "Your average leverage is dangerously high. You're one black swan from getting liquidated. Reduce to 5x or below.";
    } else if (avgLev > 5) {
      risk += "Moderate leverage. Manageable if you have proper stops, but watch your liquidation distances.";
    } else {
      risk += "Conservative leverage. Good risk management. Keep it up.";
    }

    return risk;
  }

  // Position review
  if (q.includes('position') || q.includes('review')) {
    if (positions.length === 0) {
      return "No open positions to review. When you have trades running, I can evaluate entry quality, TP/SL placement, and whether your sizing makes sense.";
    }
    return positions.map((p: any) => {
      let verdict = '';
      if (!p.tp && !p.sl) verdict = '⚠ No TP or SL set. You are trading blind.';
      else if (!p.sl) verdict = '⚠ No stop loss. You have unlimited downside risk.';
      else if (!p.tp) verdict = 'Has SL but no TP. Consider where you want to take profit.';
      else verdict = 'Has both TP and SL. Good structure.';

      return `${p.side.toUpperCase()} ${p.symbol} (${p.leverage}x)\n` +
        `Entry: $${fmt(p.entryPrice, 2)} → Mark: $${fmt(p.markPrice, 2)}\n` +
        `PnL: ${pnlSign(p.unrealizedPnl)}$${fmt(Math.abs(p.unrealizedPnl))} (${p.unrealizedPnlPct.toFixed(1)}%)\n` +
        verdict;
    }).join('\n\n');
  }

  // Discipline
  if (q.includes('discipline') || q.includes('honest') || q.includes('assessment')) {
    if (stats.totalTrades === 0) {
      return "You have zero completed trades. Can't assess discipline without data. Start with small positions, always set TP and SL, and use low leverage (3-5x). Build the habit first, then scale.";
    }

    let assessment = `Discipline Score: ${extendedStats.disciplineScore}%\n`;
    assessment += `(${extendedStats.disciplineScore}% of your trades had TP or SL set)\n\n`;

    if (extendedStats.disciplineScore < 40) {
      assessment += "Brutal honesty: your discipline is poor. Most of your trades have no risk management. You're gambling, not trading. Fix this before anything else.\n\n";
    } else if (extendedStats.disciplineScore < 70) {
      assessment += "You're inconsistent with risk management. Some trades have stops, others don't. Make it a rule: no entry without TP and SL. No exceptions.\n\n";
    } else {
      assessment += "Good discipline. You're setting risk parameters on most trades. Keep it at 100% and you'll protect your capital through drawdowns.\n\n";
    }

    assessment += `Win Rate: ${stats.winRate.toFixed(1)}% | Avg Leverage: ${stats.avgLeverage.toFixed(1)}x\n`;
    assessment += `Win Streak: ${stats.winStreak} | Loss Streak: ${stats.lossStreak}`;

    if (stats.lossStreak >= 3) {
      assessment += "\n\nYou've had streaks of 3+ consecutive losses. After 2 losses in a row, take a break. Walk away. The market will be there tomorrow.";
    }

    return assessment;
  }

  // What am I doing wrong
  if (q.includes('wrong') || q.includes('fix') || q.includes('improve') || q.includes('better')) {
    if (stats.totalTrades === 0) {
      return "You haven't traded yet, so nothing to diagnose. But here's what most new traders get wrong:\n\n1. Too much leverage (stick to 3-5x)\n2. No stop losses (always set one)\n3. Overtrading (wait for quality setups)\n4. Position too large (risk max 2% per trade)\n\nStart small, be disciplined, and track everything.";
    }

    const issues: string[] = [];

    if (extendedStats.disciplineScore < 60) {
      issues.push(`Only ${extendedStats.disciplineScore}% of trades had TP/SL. Set risk limits on EVERY trade.`);
    }
    if (stats.avgLeverage > 8) {
      issues.push(`Average leverage of ${stats.avgLeverage.toFixed(1)}x is too high. Bring it under 5x.`);
    }
    if (stats.winRate < 45) {
      issues.push(`Win rate of ${stats.winRate.toFixed(1)}% means you're losing more than half your trades. Focus on quality entries.`);
    }
    if (stats.lossStreak >= 3) {
      issues.push(`Loss streak of ${stats.lossStreak} suggests tilt/revenge trading. Take breaks after 2 consecutive losses.`);
    }
    if (Math.abs(stats.worstTrade) > stats.bestTrade * 1.5 && stats.bestTrade > 0) {
      issues.push("Your worst loss is much larger than your best win. Your R:R is inverted. Cut losers faster.");
    }

    if (issues.length === 0) {
      return `Your stats look solid.\n\nWin Rate: ${stats.winRate.toFixed(1)}%, Discipline: ${extendedStats.disciplineScore}%, Avg Leverage: ${stats.avgLeverage.toFixed(1)}x\n\nKeep doing what you're doing. Focus on consistency and don't force trades.`;
    }

    return `Here's what needs fixing:\n\n${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n\n')}\n\nFix these one at a time. Start with discipline — it compounds.`;
  }

  // Trade ideas / what to focus on
  if (q.includes('idea') || q.includes('focus') || q.includes('what should')) {
    if (stats.totalTrades === 0) {
      return "Start with BTC or ETH. They're liquid, the spreads are tight, and the price action is readable. Use 3x leverage, set a TP at +3% and SL at -1.5%. That gives you 2:1 R:R. Do 5 trades like this and then we'll talk strategy.";
    }

    return `Based on your ${stats.totalTrades} trades:\n\n` +
      `Your win rate is ${stats.winRate.toFixed(1)}%. ` +
      (stats.winRate >= 55
        ? "That's decent. Focus on increasing your R:R ratio — let winners run longer and cut losers faster."
        : "That needs work. Be more selective with entries. Wait for confluence of signals before entering.") +
      `\n\nDiscipline score: ${extendedStats.disciplineScore}%. ` +
      (extendedStats.disciplineScore >= 70
        ? "Good — you're managing risk."
        : "This needs improvement. Every trade should have TP and SL before entry.") +
      "\n\nFocus on these three things:\n" +
      "1. Quality over quantity — fewer trades, better entries\n" +
      "2. Always set TP/SL before entering\n" +
      "3. Keep leverage at 3-5x until win rate is consistently above 55%";
  }

  // Default: overview based on data
  if (stats.totalTrades === 0) {
    return "You haven't placed any trades yet. Head to the Trade tab, pick a market, and start with a small position. Use low leverage (3-5x) and always set a stop loss. I'll have more to say once you have some trading data.";
  }

  return `Quick overview of your trading:\n\n` +
    `Equity: $${fmt(extendedStats.currentEquity)} | PnL: ${pnlSign(stats.totalPnl)}$${fmt(Math.abs(stats.totalPnl))}\n` +
    `Win Rate: ${stats.winRate.toFixed(1)}% across ${stats.totalTrades} trades\n` +
    `Discipline: ${extendedStats.disciplineScore}% | Avg Leverage: ${stats.avgLeverage.toFixed(1)}x\n\n` +
    (stats.totalPnl >= 0
      ? "You're in the green. Don't get complacent. Stick to your rules."
      : "You're in drawdown. Review your losing trades and look for patterns. Are you overtrading? Using too much leverage? Not setting stops?") +
    "\n\nAsk me about specific positions, risk, or discipline for deeper analysis.";
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
  noKeyBanner: {
    backgroundColor: 'rgba(255,176,32,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,176,32,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  noKeyText: { color: colors.caution, fontSize: 11, lineHeight: 16 },
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
  typingContent: { paddingVertical: 10, paddingHorizontal: 14 },
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

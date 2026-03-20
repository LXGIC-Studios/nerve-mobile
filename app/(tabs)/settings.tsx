import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Switch,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { colors } from '../../src/theme/colors';
import { useTradingEngine } from '../../src/lib/hooks/useTradingEngine';
import { fmt } from '../../src/hooks/useFormatters';
import { setupNotifications } from '../../src/lib/notifications';
import {
  LightningIcon,
  ShieldIcon,
  WalletIcon,
  ChevronRightIcon,
  StarIcon,
  ChartIcon,
} from '../../src/components/icons';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const SETTINGS_KEY = 'nerve_settings';

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDesc}>{description}</Text>}
      </View>
      {children}
    </View>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

// Leaderboard mock data
const leaderboard = [
  { rank: 1, name: 'CryptoWhale', pnl: 42580, winRate: 72.4, trades: 312 },
  { rank: 2, name: 'AlphaTrader', pnl: 38200, winRate: 68.1, trades: 287 },
  { rank: 3, name: 'DeFiDegen', pnl: 31440, winRate: 65.8, trades: 445 },
  { rank: 4, name: 'NervePilot', pnl: 28900, winRate: 63.2, trades: 198 },
  { rank: 5, name: 'SolanaMaxi', pnl: 24100, winRate: 61.5, trades: 256 },
  { rank: 6, name: 'BTCDiamond', pnl: 21800, winRate: 59.8, trades: 167 },
  { rank: 7, name: 'EthWhisper', pnl: 19200, winRate: 58.3, trades: 234 },
  { rank: 8, name: 'LevMaster', pnl: 16500, winRate: 57.1, trades: 189 },
  { rank: 9, name: 'PerpRunner', pnl: 14800, winRate: 55.6, trades: 312 },
  { rank: 10, name: 'AltSeason', pnl: 12400, winRate: 54.2, trades: 278 },
];

export default function SettingsScreen() {
  const [marginMode, setMarginMode] = useState<'cross' | 'isolated'>('cross');
  const [notifications, setNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [liquidationAlerts, setLiquidationAlerts] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [notifPermission, setNotifPermission] = useState<boolean | null>(null);
  const { balance, stats, resetAccount } = useTradingEngine();
  
  

  // Load persisted settings
  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((data) => {
      if (data) {
        const saved = JSON.parse(data);
        if (saved.notifications !== undefined) setNotifications(saved.notifications);
        if (saved.priceAlerts !== undefined) setPriceAlerts(saved.priceAlerts);
        if (saved.liquidationAlerts !== undefined) setLiquidationAlerts(saved.liquidationAlerts);
        if (saved.haptics !== undefined) setHaptics(saved.haptics);
        if (saved.marginMode) setMarginMode(saved.marginMode);
      }
    });
  }, []);

  // Persist settings on change
  const persistSettings = useCallback((updates: Record<string, any>) => {
    AsyncStorage.getItem(SETTINGS_KEY).then((data) => {
      const current = data ? JSON.parse(data) : {};
      const next = { ...current, ...updates };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    });
  }, []);

  const handleNotificationToggle = useCallback(async (value: boolean) => {
    setNotifications(value);
    persistSettings({ notifications: value });

    if (value && Platform.OS !== 'web') {
      const granted = await setupNotifications();
      setNotifPermission(granted);
      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive trading alerts.'
        );
        setNotifications(false);
        persistSettings({ notifications: false });
      }
    }
  }, [persistSettings]);

  const handlePriceAlertToggle = useCallback((value: boolean) => {
    setPriceAlerts(value);
    persistSettings({ priceAlerts: value });
  }, [persistSettings]);

  const handleLiquidationToggle = useCallback((value: boolean) => {
    setLiquidationAlerts(value);
    persistSettings({ liquidationAlerts: value });
  }, [persistSettings]);

  const handleHapticsToggle = useCallback((value: boolean) => {
    setHaptics(value);
    persistSettings({ haptics: value });
  }, [persistSettings]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset Account',
      'This will reset your paper trading account to $100,000 and clear all positions and history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            await resetAccount();
            Alert.alert('Account Reset', 'Your paper trading account has been reset to $100,000.');
          },
        },
      ]
    );
  }, [resetAccount]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Account Summary */}
        <View style={styles.accountSummary}>
          <View style={styles.accountRow}>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Balance</Text>
              <Text style={styles.accountValue}>${fmt(balance.total)}</Text>
            </View>
            <View style={styles.accountDivider} />
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Total Trades</Text>
              <Text style={styles.accountValue}>{stats.totalTrades}</Text>
            </View>
            <View style={styles.accountDivider} />
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Win Rate</Text>
              <Text style={styles.accountValue}>{stats.winRate.toFixed(1)}%</Text>
            </View>
          </View>
        </View>

        {/* Trading */}
        <SettingSection title="Trading">
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Margin Mode</Text>
              <Text style={styles.settingDesc}>How margin is allocated across positions</Text>
            </View>
            <View style={styles.toggleGroup}>
              <Pressable
                onPress={() => setMarginMode('cross')}
                style={[styles.toggleBtn, marginMode === 'cross' && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleText, marginMode === 'cross' && styles.toggleTextActive]}>Cross</Text>
              </Pressable>
              <Pressable
                onPress={() => setMarginMode('isolated')}
                style={[styles.toggleBtn, marginMode === 'isolated' && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleText, marginMode === 'isolated' && styles.toggleTextActive]}>Isolated</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.divider} />
          <SettingRow label="Default Leverage" description="Applied to new positions">
            <View style={styles.leveragePill}>
              <Text style={styles.leveragePillText}>5x</Text>
            </View>
          </SettingRow>
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="Notifications">
          <SettingRow label="Push Notifications" description="Order fills, liquidation warnings">
            <Switch value={notifications} onValueChange={handleNotificationToggle} trackColor={{ false: colors.bgElevated, true: colors.accentDim }} thumbColor={notifications ? colors.accent : colors.textSecondary} />
          </SettingRow>
          <View style={styles.divider} />
          <SettingRow label="Price Alerts">
            <Switch value={priceAlerts} onValueChange={handlePriceAlertToggle} trackColor={{ false: colors.bgElevated, true: colors.accentDim }} thumbColor={priceAlerts ? colors.accent : colors.textSecondary} />
          </SettingRow>
          <View style={styles.divider} />
          <SettingRow label="Liquidation Warnings">
            <Switch value={liquidationAlerts} onValueChange={handleLiquidationToggle} trackColor={{ false: colors.bgElevated, true: colors.accentDim }} thumbColor={liquidationAlerts ? colors.accent : colors.textSecondary} />
          </SettingRow>
        </SettingSection>

        {/* Preferences */}
        <SettingSection title="Preferences">
          <SettingRow label="Haptic Feedback" description="Vibrate on order placement">
            <Switch value={haptics} onValueChange={handleHapticsToggle} trackColor={{ false: colors.bgElevated, true: colors.accentDim }} thumbColor={haptics ? colors.accent : colors.textSecondary} />
          </SettingRow>
          <View style={styles.divider} />
          <SettingRow label="Theme">
            <View style={styles.themePill}><Text style={styles.themePillText}>Dark</Text></View>
          </SettingRow>
          <View style={styles.divider} />
          <SettingRow label="Currency">
            <Text style={styles.settingValueText}>USD</Text>
          </SettingRow>
        </SettingSection>

        {/* Leaderboard */}
        <SettingSection title="Leaderboard">
          <Pressable style={styles.settingRow} onPress={() => setShowLeaderboard(!showLeaderboard)}>
            <View style={styles.settingInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <StarIcon size={14} color={colors.caution} />
                <Text style={styles.settingLabel}>Top Traders</Text>
              </View>
              <Text style={styles.settingDesc}>Rankings by total PnL</Text>
            </View>
            <Text style={styles.chevronText}>{showLeaderboard ? '▲' : '▼'}</Text>
          </Pressable>

          {showLeaderboard && (
            <>
              <View style={styles.divider} />
              {leaderboard.map((trader) => (
                <View key={trader.rank}>
                  <View style={styles.leaderRow}>
                    <View style={[styles.rankBadge, trader.rank <= 3 && styles.rankBadgeTop]}>
                      <Text style={[styles.rankText, trader.rank <= 3 && styles.rankTextTop]}>
                        {trader.rank}
                      </Text>
                    </View>
                    <View style={styles.leaderInfo}>
                      <Text style={styles.leaderName}>{trader.name}</Text>
                      <Text style={styles.leaderMeta}>
                        WR: {trader.winRate}% · {trader.trades} trades
                      </Text>
                    </View>
                    <Text style={[styles.leaderPnl, { color: colors.profit }]}>
                      +${(trader.pnl / 1000).toFixed(1)}K
                    </Text>
                  </View>
                  {trader.rank < 10 && <View style={styles.divider} />}
                </View>
              ))}
            </>
          )}
        </SettingSection>

        {/* Account */}
        <SettingSection title="Account">
          <Pressable style={styles.settingRow} onPress={handleReset}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.loss }]}>Reset Paper Account</Text>
              <Text style={styles.settingDesc}>Reset to $100,000 and clear all trades</Text>
            </View>
            <ChevronRightIcon size={16} color={colors.loss} />
          </Pressable>

        </SettingSection>

        {/* About */}
        <View style={styles.aboutSection}>
          <LightningIcon size={28} color={colors.accent} />
          <Text style={styles.aboutLogo}>NERVE</Text>
          <Text style={styles.aboutVersion}>v{APP_VERSION} (Paper Trading)</Text>
          <Text style={styles.aboutTagline}>Trade with your brain, not your gut.</Text>
          <Text style={styles.aboutCredit}>Built by LXGIC Studios</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  content: { padding: 16 },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '800', marginBottom: 20 },
  // Account Summary
  accountSummary: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    padding: 16,
    marginBottom: 24,
  },
  accountRow: { flexDirection: 'row', alignItems: 'center' },
  accountItem: { flex: 1, alignItems: 'center' },
  accountDivider: { width: 1, height: 28, backgroundColor: colors.border },
  accountLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '600', letterSpacing: 0.3, marginBottom: 4 },
  accountValue: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  // Sections
  section: { marginBottom: 24 },
  sectionTitle: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginLeft: 4 },
  sectionCard: { backgroundColor: colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  settingInfo: { flex: 1, marginRight: 12 },
  settingLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: '500' },
  settingDesc: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  settingValueText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  toggleGroup: { flexDirection: 'row', backgroundColor: colors.bgSecondary, borderRadius: 10, padding: 3 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: colors.accentGlow, borderWidth: 1, borderColor: colors.accent },
  toggleText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  toggleTextActive: { color: colors.accent },
  leveragePill: { backgroundColor: colors.accentGlow, borderWidth: 1, borderColor: colors.borderAccent, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  leveragePillText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  themePill: { backgroundColor: colors.bgSecondary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  themePillText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  chevronText: { color: colors.textSecondary, fontSize: 10 },
  // Leaderboard
  leaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 12 },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeTop: { backgroundColor: colors.accentGlow, borderWidth: 1, borderColor: colors.borderAccent },
  rankText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  rankTextTop: { color: colors.accent },
  leaderInfo: { flex: 1 },
  leaderName: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  leaderMeta: { color: colors.textSecondary, fontSize: 10, marginTop: 2, fontVariant: ['tabular-nums'] },
  leaderPnl: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  // About
  aboutSection: { alignItems: 'center', paddingVertical: 32, gap: 4 },
  aboutLogo: { color: colors.accent, fontSize: 24, fontWeight: '800', letterSpacing: 2, marginTop: 8 },
  aboutVersion: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  aboutTagline: { color: colors.textMuted, fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  aboutCredit: { color: colors.textMuted, fontSize: 10, marginTop: 8 },
});

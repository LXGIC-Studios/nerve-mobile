import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Switch,
  Pressable,
  Platform,
} from 'react-native';
import { colors } from '../../src/theme/colors';

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
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

export default function SettingsScreen() {
  const [marginMode, setMarginMode] = useState<'cross' | 'isolated'>('cross');
  const [notifications, setNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [liquidationAlerts, setLiquidationAlerts] = useState(true);
  const [haptics, setHaptics] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

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
                <Text style={[styles.toggleText, marginMode === 'cross' && styles.toggleTextActive]}>
                  Cross
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMarginMode('isolated')}
                style={[styles.toggleBtn, marginMode === 'isolated' && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleText, marginMode === 'isolated' && styles.toggleTextActive]}>
                  Isolated
                </Text>
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
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.bgElevated, true: colors.accentDim }}
              thumbColor={notifications ? colors.accent : colors.textSecondary}
            />
          </SettingRow>

          <View style={styles.divider} />

          <SettingRow label="Price Alerts">
            <Switch
              value={priceAlerts}
              onValueChange={setPriceAlerts}
              trackColor={{ false: colors.bgElevated, true: colors.accentDim }}
              thumbColor={priceAlerts ? colors.accent : colors.textSecondary}
            />
          </SettingRow>

          <View style={styles.divider} />

          <SettingRow label="Liquidation Warnings">
            <Switch
              value={liquidationAlerts}
              onValueChange={setLiquidationAlerts}
              trackColor={{ false: colors.bgElevated, true: colors.accentDim }}
              thumbColor={liquidationAlerts ? colors.accent : colors.textSecondary}
            />
          </SettingRow>
        </SettingSection>

        {/* Preferences */}
        <SettingSection title="Preferences">
          <SettingRow label="Haptic Feedback" description="Vibrate on order placement">
            <Switch
              value={haptics}
              onValueChange={setHaptics}
              trackColor={{ false: colors.bgElevated, true: colors.accentDim }}
              thumbColor={haptics ? colors.accent : colors.textSecondary}
            />
          </SettingRow>

          <View style={styles.divider} />

          <SettingRow label="Theme">
            <View style={styles.themePill}>
              <Text style={styles.themePillText}>Dark</Text>
            </View>
          </SettingRow>

          <View style={styles.divider} />

          <SettingRow label="Currency">
            <Text style={styles.settingValueText}>USD</Text>
          </SettingRow>
        </SettingSection>

        {/* Account */}
        <SettingSection title="Account">
          <Pressable style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Connected Wallet</Text>
              <Text style={styles.walletAddr}>0x7a3F...8b2E</Text>
            </View>
            <View style={styles.connectedDot} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.settingRow}>
            <Text style={styles.settingLabel}>Export Trade History</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.settingRow}>
            <Text style={styles.settingLabel}>Referral Program</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </SettingSection>

        {/* About */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutLogo}>⚡ NERVE</Text>
          <Text style={styles.aboutVersion}>v1.0.0 (Testnet)</Text>
          <Text style={styles.aboutTagline}>Trade with your brain, not your gut.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    padding: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  settingDesc: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },
  settingValueText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.accent,
  },
  leveragePill: {
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  leveragePillText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  themePill: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  themePillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  walletAddr: {
    color: colors.accent,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    marginTop: 3,
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.profit,
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: '300',
  },
  aboutSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  aboutLogo: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
  },
  aboutVersion: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },
  aboutTagline: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

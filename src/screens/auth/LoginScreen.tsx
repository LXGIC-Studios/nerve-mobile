import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const { signIn, signInWithApple, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setError(''); setLoading(true);
    try {
      const { error: authError } = await signIn(email, password);
      if (authError) { setError(authError.message); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); }
      else { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    } catch { setError('Something went wrong. Try again.'); }
    finally { setLoading(false); }
  };

  const handleAppleSignIn = async () => {
    setError(''); setAppleLoading(true);
    try {
      const { error: appleError } = await signInWithApple();
      if (appleError) { setError(appleError.message); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); }
      else { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    } catch { setError('Apple Sign In failed.'); }
    finally { setAppleLoading(false); }
  };

  const handleGuest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    continueAsGuest();
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Text style={s.logo}>NERVE</Text>
          <Text style={s.subtitle}>Paper trading, real skills</Text>
        </View>

        <View style={s.form}>
          {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com"
              placeholderTextColor={colors.textTertiary} keyboardType="email-address" autoCapitalize="none"
              autoCorrect={false} autoComplete="email" editable={!loading} />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="••••••••"
              placeholderTextColor={colors.textTertiary} secureTextEntry autoComplete="password" editable={!loading} />
          </View>

          <Pressable onPress={() => router.push('/auth/forgot-password' as any)} style={s.forgotBtn}>
            <Text style={s.forgotText}>Forgot password?</Text>
          </Pressable>

          <Pressable style={[s.primaryBtn, loading && s.disabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#07080A" /> : <Text style={s.primaryBtnText}>Sign In</Text>}
          </Pressable>

          {Platform.OS === 'ios' && (
            <Pressable style={[s.appleBtn, appleLoading && s.disabled]} onPress={handleAppleSignIn} disabled={appleLoading}>
              {appleLoading ? <ActivityIndicator color="#FFF" /> : <Text style={s.appleBtnText}> Sign in with Apple</Text>}
            </Pressable>
          )}

          <View style={s.divider}>
            <View style={s.dividerLine} /><Text style={s.dividerText}>or</Text><View style={s.dividerLine} />
          </View>

          <Pressable style={s.ghostBtn} onPress={handleGuest}>
            <Text style={s.ghostBtnText}>Continue as Guest</Text>
          </Pressable>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => router.push('/auth/signup' as any)}>
            <Text style={s.footerLink}>Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 36, fontWeight: '800', color: colors.accent, letterSpacing: 6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 8 },
  form: { gap: 16 },
  errorBox: { backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)' },
  errorText: { color: '#FF3B30', fontSize: 13, textAlign: 'center' },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.3 },
  input: { backgroundColor: colors.bgSecondary, borderRadius: 12, padding: 16, fontSize: 16, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { color: colors.accent, fontSize: 13, fontWeight: '500' },
  primaryBtn: { backgroundColor: colors.accent, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#07080A', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  appleBtn: { backgroundColor: '#000', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  appleBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  dividerText: { color: colors.textTertiary, fontSize: 13, marginHorizontal: 16 },
  ghostBtn: { borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  ghostBtnText: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: colors.textSecondary, fontSize: 14 },
  footerLink: { color: colors.accent, fontSize: 14, fontWeight: '600' },
});

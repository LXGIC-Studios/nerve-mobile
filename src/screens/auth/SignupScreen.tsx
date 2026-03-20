import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';

export default function SignupScreen() {
  const { signUp, signInWithApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = (): string | null => {
    if (!email || !password || !confirmPassword) return 'Please fill in all fields';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password !== confirmPassword) return "Passwords don't match";
    return null;
  };

  const handleSignup = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setLoading(true);
    try {
      const { error: authError } = await signUp(email, password);
      if (authError) { setError(authError.message); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); }
      else { setSuccess(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    } catch { setError('Something went wrong.'); }
    finally { setLoading(false); }
  };

  const handleAppleSignIn = async () => {
    setError(''); setAppleLoading(true);
    try {
      const { error: e } = await signInWithApple();
      if (e) setError(e.message);
    } catch { setError('Apple Sign In failed.'); }
    finally { setAppleLoading(false); }
  };

  if (success) {
    return (
      <View style={s.container}>
        <View style={s.center}>
          <Text style={{ fontSize: 48, color: colors.accent, marginBottom: 12 }}>✓</Text>
          <Text style={s.title}>Check your email</Text>
          <Text style={s.desc}>We sent a confirmation link to {email}.</Text>
          <Pressable style={s.primaryBtn} onPress={() => router.back()}>
            <Text style={s.primaryBtnText}>Back to Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '500' }}>← Back</Text>
        </Pressable>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={s.title}>Create Account</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8 }}>Start building your trading skills</Text>
        </View>
        <View style={s.form}>
          {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}
          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com"
              placeholderTextColor={colors.textTertiary} keyboardType="email-address" autoCapitalize="none" autoComplete="email" editable={!loading} />
          </View>
          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="Min. 8 characters"
              placeholderTextColor={colors.textTertiary} secureTextEntry autoComplete="new-password" editable={!loading} />
          </View>
          <View style={s.field}>
            <Text style={s.label}>Confirm Password</Text>
            <TextInput style={s.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter password"
              placeholderTextColor={colors.textTertiary} secureTextEntry autoComplete="new-password" editable={!loading} />
          </View>
          <Pressable style={[s.primaryBtn, loading && s.disabled]} onPress={handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator color="#07080A" /> : <Text style={s.primaryBtnText}>Create Account</Text>}
          </Pressable>
          {Platform.OS === 'ios' && (
            <Pressable style={[s.appleBtn, appleLoading && s.disabled]} onPress={handleAppleSignIn} disabled={appleLoading}>
              {appleLoading ? <ActivityIndicator color="#FFF" /> : <Text style={s.appleBtnText}>{'\uF8FF'} Sign up with Apple</Text>}
            </Pressable>
          )}
        </View>
        <View style={s.footer}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Already have an account? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '600' }}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  desc: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  form: { gap: 16 },
  errorBox: { backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)' },
  errorText: { color: '#FF3B30', fontSize: 13, textAlign: 'center' },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.3 },
  input: { backgroundColor: colors.bgSecondary, borderRadius: 12, padding: 16, fontSize: 16, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  primaryBtn: { backgroundColor: colors.accent, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#07080A', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  appleBtn: { backgroundColor: '#000', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  appleBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
});

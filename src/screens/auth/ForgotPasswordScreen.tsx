import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) { setError('Please enter your email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return; }
    setError(''); setLoading(true);
    try {
      const { error: e } = await resetPassword(email);
      if (e) { setError(e.message); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); }
      else { setSent(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }
    } catch { setError('Something went wrong.'); }
    finally { setLoading(false); }
  };

  if (sent) {
    return (
      <View style={s.container}>
        <View style={s.center}>
          <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 8 }}>📧</Text>
          <Text style={s.title}>Email Sent</Text>
          <Text style={s.desc}>If an account exists with {email}, you will get a reset link.</Text>
          <Pressable style={s.primaryBtn} onPress={() => router.back()}>
            <Text style={s.primaryBtnText}>Back to Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.center}>
        <Pressable onPress={() => router.back()} style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
          <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '500' }}>← Back</Text>
        </Pressable>
        <Text style={s.title}>Reset Password</Text>
        <Text style={s.desc}>Enter your email and we will send you a reset link.</Text>
        {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}
        <View style={s.field}>
          <Text style={s.label}>Email</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com"
            placeholderTextColor={colors.textTertiary} keyboardType="email-address" autoCapitalize="none" autoComplete="email" editable={!loading} />
        </View>
        <Pressable style={[s.primaryBtn, loading && s.disabled]} onPress={handleReset} disabled={loading}>
          {loading ? <ActivityIndicator color="#07080A" /> : <Text style={s.primaryBtnText}>Send Reset Link</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  desc: { fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: 8 },
  errorBox: { backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)' },
  errorText: { color: '#FF3B30', fontSize: 13, textAlign: 'center' },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.3 },
  input: { backgroundColor: colors.bgSecondary, borderRadius: 12, padding: 16, fontSize: 16, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  primaryBtn: { backgroundColor: colors.accent, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: '#07080A', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});

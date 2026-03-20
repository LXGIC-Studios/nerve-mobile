import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';

export function GuestBanner() {
  const { isGuest, upgradeFromGuest } = useAuth();
  if (!isGuest) return null;
  return (
    <View style={s.banner}>
      <Text style={s.text}>Your data is stored locally only.</Text>
      <Pressable onPress={upgradeFromGuest} style={s.btn}>
        <Text style={s.btnText}>Sign up to save</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  banner: { backgroundColor: 'rgba(0,229,255,0.08)', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,229,255,0.2)', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  text: { color: colors.textSecondary, fontSize: 12, flex: 1 },
  btn: { backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginLeft: 12 },
  btnText: { color: '#07080A', fontSize: 12, fontWeight: '700' },
});

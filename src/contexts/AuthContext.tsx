import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase/client';
import { cloudSync } from '../lib/supabase/cloudSync';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

interface AuthState { user: User | null; session: Session | null; isLoading: boolean; isGuest: boolean; }
interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithApple: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  continueAsGuest: () => void;
  upgradeFromGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, session: null, isLoading: true, isGuest: false });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setState({ user: session.user, session, isLoading: false, isGuest: false }); cloudSync.enable(session.user.id); }
      else { setState(p => ({ ...p, isLoading: false })); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      if (session) { setState({ user: session.user, session, isLoading: false, isGuest: false }); cloudSync.enable(session.user.id); }
      else { setState({ user: null, session: null, isLoading: false, isGuest: false }); cloudSync.disable(); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password });
    return { error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    return { error };
  }, []);

  const signInWithApple = useCallback(async () => {
    try {
      if (Platform.OS !== 'ios') return { error: new Error('Apple Sign In only on iOS') };
      const rawNonce = Math.random().toString(36).substring(2, 34);
      const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
      const cred = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
        nonce: hashedNonce,
      });
      if (!cred.identityToken) return { error: new Error('No identity token from Apple') };
      const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: cred.identityToken, nonce: rawNonce });
      if (error) return { error };
      if (cred.fullName) {
        const name = [cred.fullName.givenName, cred.fullName.familyName].filter(Boolean).join(' ');
        if (name) { const { data: { user } } = await supabase.auth.getUser(); if (user) await supabase.from('profiles').update({ display_name: name }).eq('id', user.id); }
      }
      return { error: null };
    } catch (e: any) { if (e.code === 'ERR_REQUEST_CANCELED') return { error: null }; return { error: e }; }
  }, []);

  const signOut = useCallback(async () => { cloudSync.disable(); await supabase.auth.signOut(); }, []);
  const resetPassword = useCallback(async (email: string) => { const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase()); return { error }; }, []);
  const continueAsGuest = useCallback(() => { setState({ user: null, session: null, isLoading: false, isGuest: true }); cloudSync.disable(); }, []);
  const upgradeFromGuest = useCallback(() => { setState(p => ({ ...p, isGuest: false })); }, []);

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signInWithApple, signOut, resetPassword, continueAsGuest, upgradeFromGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

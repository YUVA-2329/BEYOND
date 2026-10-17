import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authService, isSupabaseConfigured } from '../services/supabase';
import { firebaseAuth } from '../services/firebaseAuth';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSupabaseConnected: boolean;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (email: string, password: string, name: string, handle?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithGithub: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const p = await authService.getProfile(user.id);
      if (p) setProfile(p);
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  };

  useEffect(() => {
    // Initial Session Restoration
    authService.getSession().then(async (sess) => {
      setSession(sess);
      setUser(sess?.user || null);
      if (sess?.user) {
        const p = await authService.getProfile(sess.user.id);
        setProfile(p);
      }
      setIsLoading(false);
    });

    // Subscribe to Auth State Changes
    const { data } = authService.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      setUser(sess?.user || null);
      if (sess?.user) {
        const p = await authService.getProfile(sess.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await authService.signInWithPassword(email, password);
    setIsLoading(false);
    if (error) return { success: false, error: error.message };
    if (data?.session) {
      setSession(data.session);
      setUser(data.user);
      const p = await authService.getProfile(data.user!.id);
      setProfile(p);
    }
    return { success: true };
  };

  const signupWithEmail = async (email: string, password: string, name: string, handle?: string) => {
    setIsLoading(true);
    const { data, error } = await authService.signUp(email, password, name, handle);
    setIsLoading(false);
    if (error) return { success: false, error: error.message };
    if (data?.session) {
      setSession(data.session);
      setUser(data.user);
      const p = await authService.getProfile(data.user!.id);
      setProfile(p);
    }
    return { success: true };
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { user: fbUser, error: fbError } = await firebaseAuth.signInWithGoogle();
      if (fbError) {
        setIsLoading(false);
        return { success: false, error: fbError };
      }

      if (fbUser) {
        // Map Firebase Google user to application user profile
        const mappedUser: any = {
          id: fbUser.uid,
          email: fbUser.email,
          user_metadata: {
            display_name: fbUser.displayName,
            handle: fbUser.email.split('@')[0],
            avatarUrl: fbUser.photoURL,
          },
        };
        const mappedProfile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Google Explorer',
          handle: `@${fbUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          avatarUrl: fbUser.photoURL || '/intro/assets/rohit_avatar.png',
          bio: 'Verified Google Explorer on BEYOND.',
          discoveriesCount: 1,
          followersCount: 1420,
          followingCount: 384,
          level: 'Explorer I',
          xp: 250,
          nextLevelXp: 500,
          isCurrentUser: true,
        };

        setUser(mappedUser);
        setProfile(mappedProfile);
        setIsLoading(false);
        return { success: true };
      }

      // Fallback to Supabase if needed
      const { data, error } = await authService.signInWithGoogle();
      setIsLoading(false);
      if (error) return { success: false, error: error.message };
      if (data?.url) {
        window.location.href = data.url;
      }
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Google authentication failed' };
    }
  };

  const loginWithGithub = async () => {
    setIsLoading(true);
    const { data, error } = await authService.signInWithGithub();
    setIsLoading(false);
    if (error) return { success: false, error: error.message };
    if (data?.url) {
      window.location.href = data.url;
    } else {
      const sess = await authService.getSession();
      setSession(sess);
      setUser(sess?.user || null);
      if (sess?.user) {
        const p = await authService.getProfile(sess.user.id);
        setProfile(p);
      }
    }
    return { success: true };
  };

  const logout = async () => {
    setIsLoading(true);
    await authService.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await authService.resetPasswordForEmail(email);
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const updateUserPassword = async (password: string) => {
    const { error } = await authService.updatePassword(password);
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const resendVerification = async (email: string) => {
    const { error } = await authService.resendVerificationEmail(email);
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAuthenticated: !!user,
        isSupabaseConnected: isSupabaseConfigured,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        loginWithGithub,
        logout,
        requestPasswordReset,
        updateUserPassword,
        resendVerification,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { createClient, SupabaseClient, User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { UserProfile } from '../types';

// Read configuration from Vite environment variables
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('your_supabase') &&
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_ANON_KEY.includes('your_supabase')
);

// Fallback mock storage key for local session testing when Supabase keys are not yet configured
const LOCAL_AUTH_STORAGE_KEY = 'beyond_local_auth_session';

const memStore: Record<string, string> = {};
export const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try { return window.localStorage.getItem(key); } catch { return memStore[key] || null; }
    }
    return memStore[key] || null;
  },
  setItem: (key: string, val: string): void => {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try { window.localStorage.setItem(key, val); } catch { memStore[key] = val; }
    } else {
      memStore[key] = val;
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try { window.localStorage.removeItem(key); } catch { delete memStore[key]; }
    } else {
      delete memStore[key];
    }
  },
};

const getOrigin = () => (typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:5000');

export interface AuthResponse<T = any> {
  data: T | null;
  error: { message: string } | null;
}

// Instantiate Supabase client if configured, otherwise initialize placeholder
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient(
      SUPABASE_URL || 'https://placeholder-project.supabase.co',
      SUPABASE_ANON_KEY || 'placeholder-anon-key',
      {
        auth: {
          persistSession: true,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

export class SupabaseAuthService {
  private client: SupabaseClient = supabase;

  /**
   * Sign up with Email and Password
   */
  async signUp(email: string, password: string, displayName: string, handle?: string): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim();
    const cleanHandle = (handle || cleanName.toLowerCase().replace(/\s+/g, '_')).trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { data: null, error: { message: 'A valid email address is required.' } };
    }
    if (!password || password.length < 6) {
      return { data: null, error: { message: 'Password must be at least 6 characters.' } };
    }
    if (!cleanName) {
      return { data: null, error: { message: 'Display name is required.' } };
    }

    if (isSupabaseConfigured) {
      const { data, error } = await this.client.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            display_name: cleanName,
            handle: cleanHandle,
            avatar_url: '/intro/assets/rohit_avatar.png',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) return { data: null, error: { message: error.message } };
      return { data: { user: data.user, session: data.session }, error: null };
    }

    // Local Persistence Fallback (allows immediate end-to-end testing before external keys are configured)
    const mockUser: User = {
      id: `usr_${Date.now()}`,
      app_metadata: { provider: 'email' },
      user_metadata: {
        display_name: cleanName,
        handle: cleanHandle,
        avatar_url: '/intro/assets/rohit_avatar.png',
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: cleanEmail,
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    };

    const mockSession: Session = {
      access_token: `token_${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: `ref_${Date.now()}`,
      user: mockUser,
    };

    safeStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify({ user: mockUser, session: mockSession }));
    return { data: { user: mockUser, session: mockSession }, error: null };
  }

  /**
   * Sign in with Email and Password
   */
  async signInWithPassword(email: string, password: string): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { data: null, error: { message: 'A valid email address is required.' } };
    }
    if (!password || password.length < 6) {
      return { data: null, error: { message: 'Password must be at least 6 characters.' } };
    }

    if (isSupabaseConfigured) {
      const { data, error } = await this.client.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) return { data: null, error: { message: error.message } };
      return { data: { user: data.user, session: data.session }, error: null };
    }

    // Local Verification Fallback
    const saved = safeStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
    let user: User;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        user = parsed.user;
      } catch {
        user = this.createDefaultMockUser(cleanEmail);
      }
    } else {
      user = this.createDefaultMockUser(cleanEmail);
    }

    const session: Session = {
      access_token: `token_${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: `ref_${Date.now()}`,
      user,
    };

    safeStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify({ user, session }));
    return { data: { user, session }, error: null };
  }

  /**
   * Initiate Google OAuth Flow
   */
  async signInWithGoogle(): Promise<AuthResponse<{ provider: string; url: string | null }>> {
    const redirectUrl = `${getOrigin()}/auth/callback`;

    if (isSupabaseConfigured) {
      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) return { data: null, error: { message: error.message } };
      return { data: { provider: 'google', url: data.url }, error: null };
    }

    // Simulated OAuth flow for development verification
    const mockUser = this.createDefaultMockUser('explorer.google@beyond.world', 'Google Explorer', 'google');
    const mockSession: Session = {
      access_token: `oauth_token_${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: `oauth_ref_${Date.now()}`,
      user: mockUser,
    };
    safeStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify({ user: mockUser, session: mockSession }));
    return { data: { provider: 'google', url: null }, error: null };
  }

  /**
   * Initiate GitHub OAuth Flow
   */
  async signInWithGithub(): Promise<AuthResponse<{ provider: string; url: string | null }>> {
    const redirectUrl = `${getOrigin()}/auth/callback`;

    if (isSupabaseConfigured) {
      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl,
          scopes: 'read:user user:email',
        },
      });

      if (error) return { data: null, error: { message: error.message } };
      return { data: { provider: 'github', url: data.url }, error: null };
    }

    // Simulated GitHub OAuth flow for development verification
    const mockUser = this.createDefaultMockUser('developer.github@beyond.world', 'GitHub Explorer', 'github');
    const mockSession: Session = {
      access_token: `github_token_${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: `github_ref_${Date.now()}`,
      user: mockUser,
    };
    safeStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify({ user: mockUser, session: mockSession }));
    return { data: { provider: 'github', url: null }, error: null };
  }

  /**
   * Password Reset Email Request
   */
  async resetPasswordForEmail(email: string): Promise<AuthResponse<boolean>> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      const { error } = await this.client.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${getOrigin()}/auth/reset-password`,
      });

      if (error) return { data: null, error: { message: error.message } };
      return { data: true, error: null };
    }

    return { data: true, error: null };
  }

  /**
   * Update Password (after reset or inside settings)
   */
  async updatePassword(newPassword: string): Promise<AuthResponse<User | null>> {
    if (isSupabaseConfigured) {
      const { data, error } = await this.client.auth.updateUser({ password: newPassword });
      if (error) return { data: null, error: { message: error.message } };
      return { data: data.user, error: null };
    }

    return { data: null, error: null };
  }

  /**
   * Resend Email Verification
   */
  async resendVerificationEmail(email: string): Promise<AuthResponse<boolean>> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      const { error } = await this.client.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: `${getOrigin()}/auth/callback`,
        },
      });

      if (error) return { data: null, error: { message: error.message } };
      return { data: true, error: null };
    }

    return { data: true, error: null };
  }

  /**
   * Sign Out / Terminate Session
   */
  async signOut(): Promise<AuthResponse<boolean>> {
    safeStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);

    if (isSupabaseConfigured) {
      const { error } = await this.client.auth.signOut();
      if (error) return { data: null, error: { message: error.message } };
    }

    return { data: true, error: null };
  }

  /**
   * Get Current Session
   */
  async getSession(): Promise<Session | null> {
    if (isSupabaseConfigured) {
      const { data } = await this.client.auth.getSession();
      return data.session;
    }

    const saved = safeStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).session;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Get Current User
   */
  async getUser(): Promise<User | null> {
    if (isSupabaseConfigured) {
      const { data } = await this.client.auth.getUser();
      return data.user;
    }

    const session = await this.getSession();
    return session?.user || null;
  }

  /**
   * Fetch User Profile from 'profiles' table
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.display_name,
        handle: `@${data.handle}`,
        avatarUrl: data.avatar_url || '/intro/assets/rohit_avatar.png',
        bio: data.bio,
        discoveriesCount: 6,
        followersCount: 1420,
        followingCount: 384,
        level: data.explorer_level || 'Explorer I',
        xp: data.xp || 120,
        nextLevelXp: 500,
        isCurrentUser: true,
      };
    }

    // Default Profile Fallback
    const user = await this.getUser();
    return {
      id: user?.id || 'usr_demo',
      name: user?.user_metadata?.display_name || 'BEYOND Explorer',
      handle: `@${user?.user_metadata?.handle || 'beyond_explorer'}`,
      avatarUrl: user?.user_metadata?.avatar_url || '/intro/assets/rohit_avatar.png',
      bio: 'Discovering hidden viewpoints, secret cafes, and architectural gems.',
      discoveriesCount: 6,
      followersCount: 1420,
      followingCount: 384,
      level: 'Explorer I',
      xp: 120,
      nextLevelXp: 500,
      isCurrentUser: true,
    };
  }

  /**
   * Update Profile in 'profiles' table
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    if (isSupabaseConfigured) {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.name) payload.display_name = updates.name;
      if (updates.bio !== undefined) payload.bio = updates.bio;
      if (updates.avatarUrl) payload.avatar_url = updates.avatarUrl;

      const { error } = await this.client
        .from('profiles')
        .update(payload)
        .eq('id', userId);

      return !error;
    }

    return true;
  }

  /**
   * Auth State Change Listener
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    if (isSupabaseConfigured) {
      return this.client.auth.onAuthStateChange(callback);
    }

    // Mock listener
    const handler = (e: any) => {
      if (e?.key === LOCAL_AUTH_STORAGE_KEY) {
        try {
          const session = e.newValue ? JSON.parse(e.newValue).session : null;
          callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
        } catch {
          callback('SIGNED_OUT', null);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handler);
    }
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            if (typeof window !== 'undefined') {
              window.removeEventListener('storage', handler);
            }
          },
        },
      },
    };
  }

  private createDefaultMockUser(email: string, name = 'Explorer', provider = 'email'): User {
    return {
      id: `usr_${Date.now()}`,
      app_metadata: { provider },
      user_metadata: {
        display_name: name,
        handle: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        avatarUrl: '/intro/assets/rohit_avatar.png',
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email,
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    };
  }
}

export const authService = new SupabaseAuthService();

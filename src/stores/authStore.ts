import { create } from 'zustand';
import { produce } from 'immer';
import { supabase } from '../lib/supabase';
import { AuthService } from '../services/authService';
import { AuthState, AuthUser, UserProfile, LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthStore extends AuthState {
  // Actions
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true, error: null });

      // Get initial session
      const { session } = await AuthService.getCurrentSession();
      
      if (session?.user) {
        const user = session.user as AuthUser;
        
        // Get user profile
        const { data: profile } = await AuthService.getUserProfile(user.id);
        
        set({ user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user as AuthUser;
          const { data: profile } = await AuthService.getUserProfile(user.id);
          set({ user, profile, loading: false, error: null });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, profile: null, loading: false, error: null });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const user = session.user as AuthUser;
          set(produce((state) => {
            state.user = user;
          }));
        }
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await AuthService.login(credentials);
      
      if (error) {
        set({ error, loading: false });
        return { success: false, error };
      }

      if (data.user) {
        const user = data.user as AuthUser;
        const { data: profile } = await AuthService.getUserProfile(user.id);
        set({ user, profile, loading: false, error: null });
      }

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  register: async (credentials) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await AuthService.register(credentials);
      
      if (error) {
        set({ error, loading: false });
        return { success: false, error };
      }

      set({ loading: false });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      await AuthService.logout();
      set({ user: null, profile: null, loading: false, error: null });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  resetPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await AuthService.resetPassword({ email });
      
      if (error) {
        set({ error, loading: false });
        return { success: false, error };
      }

      set({ loading: false });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Password reset failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  updatePassword: async (password, confirmPassword) => {
    try {
      if (password !== confirmPassword) {
        const error = 'Passwords do not match';
        set({ error });
        return { success: false, error };
      }

      set({ loading: true, error: null });
      
      const { error } = await AuthService.updatePassword({ password, confirmPassword });
      
      if (error) {
        set({ error, loading: false });
        return { success: false, error };
      }

      set({ loading: false });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Password update failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading) => set({ loading }),
}));
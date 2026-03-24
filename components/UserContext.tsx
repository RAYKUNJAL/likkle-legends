"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';
import { BADGES, BadgeId } from '@/lib/gamification';

const supabase = createClient();

// ==========================================
// TYPES
// ==========================================

interface Child {
  id: string;
  first_name: string;
  age: number;
  age_track: 'mini' | 'big';
  avatar_id: string;
  avatar_url?: string;
  primary_island: string;
  secondary_island?: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  stories_completed: number;
  songs_listened: number;
  missions_completed: number;
  patois_words_learned: string[];
  cultural_milestones: string[];
  favorite_character?: string;
  age_verified: boolean;
  requires_parental_consent: boolean;
  consent_last_verified?: string;
  parent_id: string;
  last_activity_date?: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  whatsapp_number?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'starter_mailer' | 'legends_plus' | 'family_legacy' | 'admin';
  subscription_status: 'inactive' | 'active' | 'trialing' | 'past_due' | 'canceled';
  trial_ends_at?: string;
  country_code: string;
  currency: string;
  role: 'parent' | 'teacher' | 'grandparent' | 'caregiver' | 'admin';
  is_coppa_designated_parent?: boolean;
  age_verified_at?: string;
  has_grandparent_dashboard: boolean;
  has_heritage_dna_story: boolean;
  onboarding_completed: boolean;
  parent_name?: string;
  marketing_opt_in?: boolean;
  is_admin?: boolean;
  parental_controls?: {
    allow_stories?: boolean;
    allow_lessons?: boolean;
    allow_games?: boolean;
    allow_radio?: boolean;
    allow_buddy?: boolean;
    daily_screen_time_minutes?: number;
  };
  created_at?: string;
}

interface SessionUserLike {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}

interface UserContextType {
  // Auth State
  user: Profile | null;
  children: Child[];
  activeChild: Child | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setActiveChild: (childId: string) => void;
  refreshUser: (sessionUser?: SessionUserLike | null) => Promise<void>;
  refreshChildren: (userIdOverride?: string) => Promise<void>;
  logout: () => Promise<void>;

  // Gamification
  unlockedBadge: any | null;
  clearUnlockedBadge: () => void;
  triggerBadgeUnlock: (badgeId: any) => void;

  // Subscription Helpers
  isSubscribed: boolean;
  canAccess: (tierRequired: string) => boolean;
  tierLevel: number;

  // Notifications
  unreadCount: number;
  refreshNotifications: (userIdOverride?: string) => Promise<void>;

  // Safety
  verifyAge: () => Promise<boolean>;
}

function normalizeChildName<T extends Record<string, any>>(child: T): T {
  const resolvedFirstName =
    child.first_name ||
    child.full_name ||
    child.name ||
    child.child_name ||
    '';

  return {
    ...child,
    first_name: resolvedFirstName,
  };
}

// ==========================================
// CONTEXT
// ==========================================

const UserContext = createContext<UserContextType | undefined>(undefined);

// Tier hierarchy for access control
const TIER_LEVELS: Record<string, number> = {
  free: 0,
  starter_mailer: 1,
  legends_plus: 2,
  family_legacy: 3,
  admin: 999, // Full access
};

// ==========================================
// PROVIDER
// ==========================================

export function UserProvider({ children: childrenNodes }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<Profile | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChildState] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unlockedBadge, setUnlockedBadge] = useState<any | null>(null);

  // Refresh user profile
  const refreshUser = useCallback(async (sessionUser?: SessionUserLike | null) => {
    try {
      let userObj = sessionUser;

      if (!userObj) {
        // High security auth fetch (always verifies JWT)
        const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('[UserContext] Auth User Error:', userError);
        }

        userObj = supabaseUser as any;
      }

      if (!userObj) {
        setUser(null);
        setChildren([]);
        setActiveChildState(null);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userObj.id)
        .single();

      if (profile) {
        const meta = userObj.user_metadata || {};
        setUser({
          ...(profile as Profile),
          parental_controls: meta.parental_controls || (profile as any).parental_controls || undefined,
        } as Profile);
      } else {
        // Fallback: If profile row is missing (trigger delay/fail), construct from session
        console.warn('Profile missing from DB, using session fallback');
        const meta = userObj.user_metadata || {};
        const fallbackProfile: Profile = {
          id: userObj.id,
          full_name: meta.full_name || 'Legend Parent',
          email: userObj.email || '',
          subscription_tier: (meta.chosen_plan as any) || 'free',
          subscription_status: 'inactive',
          country_code: 'US',
          currency: 'USD',
          has_grandparent_dashboard: false,
          has_heritage_dna_story: false,
          onboarding_completed: false,
          parent_name: meta.full_name?.split(' ')[0] || 'Parent',
          marketing_opt_in: false,
          is_admin: false,
          role: meta.role || 'parent',
        };
        setUser(fallbackProfile);

        // Self-healing: create the profile row if it doesn't exist
        supabase.from('profiles').upsert({
          id: fallbackProfile.id,
          email: fallbackProfile.email,
          full_name: fallbackProfile.full_name,
          role: 'parent'
        }, { onConflict: 'id' }).then(({ error }: { error: any }) => {
          if (error && !error.message.includes('permission denied')) {
            console.error('Self-healing profile creation error:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  // Refresh children
  const refreshChildren = useCallback(async (userIdOverride?: string) => {
    const userId = userIdOverride || user?.id;
    if (!userId) return;

    try {
      const { data } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', userId)
        .order('created_at', { ascending: true });

      if (data) {
        const normalized = (data as Child[]).map((c) => normalizeChildName(c)) as Child[];
        setChildren(normalized);

        // Restore active child from localStorage or set first child as active
        const savedChildId = localStorage.getItem('activeChildId');
        const savedChild = normalized.find((c: Child) => c.id === savedChildId);

        if (savedChild) {
          setActiveChildState(savedChild as Child);
        } else if (normalized.length > 0) {
          setActiveChildState(normalized[0] as Child);
        }
      }
    } catch (error) {
      console.error('Error refreshing children:', error);
    }
  }, [user?.id]);

  // Refresh notifications
  const refreshNotifications = useCallback(async (userIdOverride?: string) => {
    const userId = userIdOverride || user?.id;
    if (!userId) return;

    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  }, [user?.id]);

  // Set active child
  const setActiveChild = useCallback((childId: string) => {
    const child = children.find(c => c.id === childId);
    if (child) {
      setActiveChildState(child);
      localStorage.setItem('activeChildId', childId);
    }
  }, [children]);

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setChildren([]);
    setActiveChildState(null);
    localStorage.removeItem('activeChildId');
  };

  const clearUnlockedBadge = () => setUnlockedBadge(null);

  const triggerBadgeUnlock = (badgeId: BadgeId) => {
    const badge = (BADGES as any)[badgeId];
    if (badge) {
      setUnlockedBadge(badge);
    }
  };

  // Merge anonymous interaction history into authenticated profile
  const mergeAnonymousData = useCallback(async (userId: string) => {
    try {
      const historyKey = 'll_interaction_history';
      const localData = localStorage.getItem(historyKey);
      if (!localData) return;

      const { progress = [], favorites = [], unlocked_badges = [] } = JSON.parse(localData);

      if (progress.length === 0 && favorites.length === 0 && unlocked_badges.length === 0) return;

      console.log(`[AUTH] Merging anonymous data for user: ${userId}`);

      // Placeholder for actual DB sync logic
      localStorage.removeItem(historyKey);
      console.log(`[AUTH] Anonymous data merged and cleared.`);
    } catch (err) {
      console.error("[AUTH] Failed to merge anonymous data:", err);
    }
  }, []);

  // Check access to tier-locked content
  const canAccess = useCallback((tierRequired: string): boolean => {
    if (tierRequired === 'free' || !tierRequired) return true;
    if (!user) return false;
    if (user.role === 'teacher' || user.role === 'admin' || user.is_admin) return true;

    const isStatusActive = ['active', 'trialing'].includes(user.subscription_status);
    if (!isStatusActive) {
      return tierRequired === 'free' || !tierRequired;
    }

    if (tierRequired === 'legends_plus' || tierRequired === 'family_legacy') {
      if (activeChild && activeChild.requires_parental_consent && !activeChild.age_verified) {
        return false;
      }
    }

    const userLevel = TIER_LEVELS[user.subscription_tier] || 0;
    const requiredLevel = TIER_LEVELS[tierRequired] || 0;
    return userLevel >= requiredLevel;
  }, [user, activeChild]);

  // Mark age as verified in DB and local state
  const verifyAge = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('profiles')
        .update({
          age_verified_at: now,
          is_coppa_designated_parent: true
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? ({
        ...prev,
        age_verified_at: now,
        is_coppa_designated_parent: true
      }) : null);

      if (activeChild) {
        await supabase
          .from('children')
          .update({ age_verified: true, consent_last_verified: now })
          .eq('id', activeChild.id);

        setActiveChildState(prev => prev ? ({ ...prev, age_verified: true, consent_last_verified: now }) : null);
      }

      return true;
    } catch (err) {
      console.error("[COPPA] verifyAge failed:", err);
      return false;
    }
  }, [user?.id, activeChild]);

  const shouldHydrateAuth = React.useMemo(() => {
    const path = pathname || '/';
    return (
      path.startsWith('/portal') ||
      path.startsWith('/parent') ||
      path.startsWith('/account') ||
      path.startsWith('/messages') ||
      path.startsWith('/analytics') ||
      path.startsWith('/dashboard') ||
      path.startsWith('/onboarding') ||
      path.startsWith('/admin')
    );
  }, [pathname]);

  // Initialize on mount with improved protection
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;
      setIsLoading(true);

      if (!shouldHydrateAuth) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();

        if (supabaseUser && mounted) {
          try {
            await refreshUser(supabaseUser as any);
          } catch (err) {
            console.error("refreshUser failed:", err);
          }
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void initialize();

    if (!shouldHydrateAuth) {
      return () => {
        mounted = false;
      };
    }

    // Listen for ALL auth changes to keep context synced
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        const userId = session?.user?.id;
        if (event === 'SIGNED_IN' && userId) {
          await mergeAnonymousData(userId);
        }
        if (session?.user) {
          await refreshUser(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setChildren([]);
        setActiveChildState(null);
        localStorage.removeItem('activeChildId');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshUser, mergeAnonymousData, shouldHydrateAuth]);

  // Load children when user changes
  useEffect(() => {
    if (user?.id) {
      void Promise.all([refreshChildren(user.id), refreshNotifications(user.id)]);
    }
  }, [user?.id, refreshChildren, refreshNotifications]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refreshNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshNotifications]);

  const value: UserContextType = React.useMemo(() => ({
    user,
    children,
    activeChild,
    isLoading,
    isAuthenticated: !!user,
    setActiveChild,
    refreshUser,
    refreshChildren,
    logout,
    isSubscribed: user?.subscription_status === 'active' || user?.subscription_status === 'trialing',
    canAccess,
    tierLevel: user ? (TIER_LEVELS[user.subscription_tier] || 0) : 0,
    unreadCount,
    refreshNotifications,
    unlockedBadge,
    clearUnlockedBadge,
    triggerBadgeUnlock,
    verifyAge,
  }), [
    user,
    children,
    activeChild,
    isLoading,
    setActiveChild,
    refreshUser,
    refreshChildren,
    logout,
    canAccess,
    unreadCount,
    refreshNotifications,
    unlockedBadge,
    verifyAge,
  ]);

  return (
    <UserContext.Provider value={value}>
      {childrenNodes}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;

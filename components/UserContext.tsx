"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
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
  earned_badges: string[];
  favorite_character?: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'starter_mailer' | 'legends_plus' | 'family_legacy';
  subscription_status: 'inactive' | 'active' | 'trialing' | 'past_due' | 'canceled';
  trial_ends_at?: string;
  country_code: string;
  currency: string;
  has_grandparent_dashboard: boolean;
  has_heritage_dna_story: boolean;
  onboarding_completed: boolean;
  parent_name?: string;
  marketing_opt_in?: boolean;
  is_admin?: boolean;
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
  refreshUser: () => Promise<void>;
  refreshChildren: () => Promise<void>;
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
  refreshNotifications: () => Promise<void>;
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
};

// ==========================================
// PROVIDER
// ==========================================

export function UserProvider({ children: childrenNodes }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChildState] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unlockedBadge, setUnlockedBadge] = useState<any | null>(null);

  // Refresh user profile
  const refreshUser = useCallback(async () => {
    try {
      // Use getUser() for higher security but keep getSession() for speed
      // In SSR/Next.js, we need to be careful with session staleness
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
      }

      if (!session?.user) {
        setUser(null);
        setChildren([]);
        setActiveChildState(null);
        return;
      }

      // If we have a session, ensure we have the most up-to-date user object
      const userObj = session.user;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userObj.id)
        .single();

      if (profile) {
        setUser(profile as Profile);
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
          is_admin: false
        };
        setUser(fallbackProfile);

        // Self-healing: create the profile row if it doesn't exist
        // Use service role via API if possible, but here we try user-side upsert
        supabase.from('profiles').upsert({
          id: fallbackProfile.id,
          email: fallbackProfile.email,
          full_name: fallbackProfile.full_name,
          role: 'parent'
        }, { onConflict: 'id' }).then(({ error }) => {
          if (error && !error.message.includes('permission denied')) {
            console.error('Self-healing profile creation error:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  // ... (refreshChildren and others unchanged) ...

  // Refresh children
  const refreshChildren = useCallback(async () => {
    // We check user from the current state (inside the closure)
    // but we need to be careful with stale state. 
    // Usually it's better to pass the userId or get it from Supabase session.
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      const { data } = await supabase
        .from('children')
        .select('*')
        .eq('primary_user_id', userId)
        .order('created_at', { ascending: true });

      if (data) {
        setChildren(data as Child[]);

        // Restore active child from localStorage or set first child as active
        const savedChildId = localStorage.getItem('activeChildId');
        const savedChild = data.find(c => c.id === savedChildId);

        if (savedChild) {
          setActiveChildState(savedChild as Child);
        } else if (data.length > 0) {
          setActiveChildState(data[0] as Child);
        }
      }
    } catch (error) {
      console.error('Error refreshing children:', error);
    }
  }, []);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
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
  }, []);

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

  // Check access to tier-locked content
  const canAccess = useCallback((tierRequired: string): boolean => {
    // Free content is accessible to everyone (even guests)
    if (tierRequired === 'free' || !tierRequired) return true;

    // Anything else requires a logged-in user and active status
    if (!user) return false;

    // Status protection: past_due and canceled users get dropped to 'free' access level
    const isStatusActive = ['active', 'trialing'].includes(user.subscription_status);
    if (!isStatusActive) {
      return tierRequired === 'free' || !tierRequired;
    }

    const userLevel = TIER_LEVELS[user.subscription_tier] || 0;
    const requiredLevel = TIER_LEVELS[tierRequired] || 0;
    return userLevel >= requiredLevel;
  }, [user]);

  // Initialize on mount with improved protection
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;
      setIsLoading(true);

      try {
        // Increased timeout to 10s for slow island connections
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 10000));

        // Wait for profile and initial children check
        await Promise.race([
          refreshUser(),
          timeoutPromise
        ]);

        if (mounted) {
          // If we have a user, try to load children before showing the UI
          // This prevents the "no kids" redirect loop
          await refreshChildren();
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initialize();

    // Listen for ALL auth changes to keep context synced
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AUTH] Event: ${event}`);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        await refreshUser();
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
  }, [refreshUser, refreshChildren]);

  // Load children when user changes
  useEffect(() => {
    if (user?.id) {
      refreshChildren();
      refreshNotifications();

      // Child state is handled inside refreshChildren
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
    unlockedBadge
  ]);

  return (
    <UserContext.Provider value={value}>
      {childrenNodes}
    </UserContext.Provider>
  );
}

// ==========================================
// HOOK
// ==========================================

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
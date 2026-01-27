"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

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

  // Refresh user profile
  const refreshUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        setChildren([]);
        setActiveChildState(null);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUser(profile as Profile);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  // Refresh children
  const refreshChildren = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true });

      if (data) {
        setChildren(data as Child[]);

        // Set first child as active if none selected
        if (!activeChild && data.length > 0) {
          setActiveChildState(data[0] as Child);
        }
      }
    } catch (error) {
      console.error('Error refreshing children:', error);
    }
  }, [user?.id]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
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
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setChildren([]);
    setActiveChildState(null);
    localStorage.removeItem('activeChildId');
  }, []);

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

  // Initialize on mount with timeout protection
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;
      setIsLoading(true);

      // Timeout to prevent infinite loading state
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000));

      try {
        await Promise.race([
          refreshUser(),
          timeoutPromise
        ]);
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initialize();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        await refreshUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setChildren([]);
        setActiveChildState(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshUser]);

  // Load children when user changes
  useEffect(() => {
    if (user?.id) {
      refreshChildren();
      refreshNotifications();

      // Restore active child from localStorage
      const savedChildId = localStorage.getItem('activeChildId');
      if (savedChildId) {
        // We handle setting active child inside refreshChildren usually,
        // or we can do it here if children are already loaded.
        // But since refreshChildren is async, we should probably do it after it's done or within it.
      }
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
    refreshNotifications
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
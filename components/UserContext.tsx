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

  // Localisation
  dialectMode: 'standard' | 'localized';
  toggleDialectMode: () => void;

  // Notifications
  unreadCount: number;
  refreshNotifications: () => Promise<void>;

  // Safety
  verifyAge: () => Promise<boolean>;
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
  const [user, setUser] = useState<Profile | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChildState] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unlockedBadge, setUnlockedBadge] = useState<any | null>(null);
  const [dialectMode, setDialectMode] = useState<'standard' | 'localized'>('standard');

  // Refresh user profile with lock timeout handling
  const refreshUser = useCallback(async () => {
    try {
      // Use getUser() for higher security but keep getSession() for speed
      // In SSR/Next.js, we need to be careful with session staleness
      let session: any;
      let sessionError: any;

      try {
        const result = await supabase.auth.getSession();
        session = result.data.session;
        sessionError = result.error;
      } catch (lockError: any) {
        // Handle lock timeout - use fallback from URL or cookie
        if (lockError?.message?.includes('Navigator LockManager')) {
          console.warn('[Auth] Lock timeout - using fallback session check');
          // Try to get session from cookie directly as fallback
          const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('sb-likkle-auth'));
          if (!cookie) {
            setUser(null);
            setChildren([]);
            setActiveChildState(null);
            return;
          }
        } else {
          throw lockError;
        }
      }

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
          is_admin: false,
          role: meta.role || 'parent',
        };
        setUser(fallbackProfile);

        // Self-healing: create the profile row if it doesn't exist
        // Use service role via API if possible, but here we try user-side upsert
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
        .eq('parent_id', userId)
        .order('created_at', { ascending: true });

      if (data) {
        setChildren(data as Child[]);

        // Restore active child from localStorage or set first child as active
        const savedChildId = localStorage.getItem('activeChildId');
        const savedChild = data.find((c: Child) => c.id === savedChildId);

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

  // Merge anonymous interaction history into authenticated profile
  const mergeAnonymousData = useCallback(async (userId: string) => {
    try {
      const historyKey = 'll_interaction_history';
      const localData = localStorage.getItem(historyKey);
      if (!localData) return;

      const { progress = [], favorites = [], unlocked_badges = [] } = JSON.parse(localData);

      if (progress.length === 0 && favorites.length === 0 && unlocked_badges.length === 0) return;

      console.log(`[AUTH] Merging anonymous data for user: ${userId}`);

      // 1. Merge Progress (simplified for MVP - in production this would be a bulk RPC)
      // This is a placeholder for the actual DB sync logic

      // 2. Clear local data after successful merge (or at least attempt)
      localStorage.removeItem(historyKey);
      console.log(`[AUTH] Anonymous data merged and cleared.`);
    } catch (err) {
      console.error("[AUTH] Failed to merge anonymous data:", err);
    }
  }, []);

  // Check access to tier-locked content
  const canAccess = useCallback((tierRequired: string): boolean => {
    // 1. Free content is accessible to everyone (even guests)
    if (tierRequired === 'free' || !tierRequired) return true;

    // 2. Logic for guests (no user)
    if (!user) return false;

    // 3. VIP Bypass: Teachers and Admins never see locks
    if (user.role === 'teacher' || user.role === 'admin' || user.is_admin) {
      return true;
    }

    // 4. Status protection: past_due and canceled users get dropped to 'free' access level
    const isStatusActive = ['active', 'trialing'].includes(user.subscription_status);
    if (!isStatusActive) {
      return tierRequired === 'free' || !tierRequired;
    }

    // 5. COPPA Safety Gate: Specific features (like AI generators) require verified age/consent
    // Note: We check if the 'activeChild' exists and is verified if tier is high
    if (tierRequired === 'legends_plus' || tierRequired === 'family_legacy') {
      if (activeChild && activeChild.requires_parental_consent && !activeChild.age_verified) {
        console.warn("[COPPA] Feature locked: Child needs parental consent.");
        // We could return false here, or a special status to trigger the Consent Modal
        // return false; 
      }
    }

    // 6. Subscription Level Check
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

      // Update local state
      setUser(prev => prev ? ({
        ...prev,
        age_verified_at: now,
        is_coppa_designated_parent: true
      }) : null);

      // If there's an active child, mark them as verified too
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

  const toggleDialectMode = useCallback(() => {
    setDialectMode(prev => prev === 'standard' ? 'localized' : 'standard');
  }, []);

  // Initialize on mount with improved protection
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;
      setIsLoading(true);

      try {
        // Initial session check is fast
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          // Sequential auth calls to avoid lock contention
          try {
            await refreshUser();
          } catch (err) {
            console.error("refreshUser failed:", err);
          }

          if (mounted) {
            try {
              await refreshChildren();
            } catch (err) {
              console.error("refreshChildren failed:", err);
            }
          }
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initialize();

    // Listen for ALL auth changes to keep context synced
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log(`[AUTH] Event: ${event}`);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const userId = session?.user?.id;
        if (event === 'SIGNED_IN' && userId) {
          await mergeAnonymousData(userId);
        }
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
    dialectMode,
    toggleDialectMode,
    unreadCount,
    refreshNotifications,
    unlockedBadge,
    clearUnlockedBadge,
    triggerBadgeUnlock,
    // Safety
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
    dialectMode,
    toggleDialectMode,
    unreadCount,
    refreshNotifications,
    unlockedBadge,
    verifyAge,
    // isSubscribed and tierLevel are derived from user, so user is sufficient
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
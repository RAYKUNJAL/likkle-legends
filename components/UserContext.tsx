import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Tier = 'free' | 'mail_club' | 'legends_plus';
export type AgeGroup = 'mini' | 'big';

interface UserState {
  tier: Tier;
  ageGroup: AgeGroup;
  name: string;
  sessionsUsed: number; // Track AI usage
}

interface UserContextType {
  user: UserState;
  upgradeTier: (tier: Tier) => void;
  setAgeGroup: (age: AgeGroup) => void;
  incrementUsage: () => void;
  isLocked: (featureTier: Tier) => boolean;
  canUseAI: () => boolean;
}

const defaultUser: UserState = {
  tier: 'mail_club',
  ageGroup: 'mini',
  name: 'Leo',
  sessionsUsed: 0
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserState>(defaultUser);

  const upgradeTier = (tier: Tier) => {
    setUser(prev => ({ ...prev, tier, sessionsUsed: 0 })); // Reset usage on upgrade
  };

  const setAgeGroup = (age: AgeGroup) => {
    setUser(prev => ({ ...prev, ageGroup: age }));
  };

  const incrementUsage = () => {
    setUser(prev => ({ ...prev, sessionsUsed: prev.sessionsUsed + 1 }));
  };

  const isLocked = (featureTier: Tier): boolean => {
    if (user.tier === 'legends_plus') return false;
    if (user.tier === 'mail_club' && featureTier === 'legends_plus') return true;
    if (user.tier === 'free') return true;
    return false;
  };

  // Logic: Mail Club gets 1 session per month. Legends Plus is unlimited.
  const canUseAI = (): boolean => {
    if (user.tier === 'legends_plus') return true;
    if (user.tier === 'mail_club' && user.sessionsUsed < 1) return true;
    return false;
  };

  return (
    <UserContext.Provider value={{ user, upgradeTier, setAgeGroup, incrementUsage, isLocked, canUseAI }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
import React from 'react';
import { CalmModeProvider } from '@/components/island-helpers/CalmModeProvider';

export const metadata = {
  title: 'Island Helpers · Likkle Legends',
  description: 'Adventure supports for how your likkle one communicates and reads.',
};

export default function IslandHelpersLayout({ children }: { children: React.ReactNode }) {
  return <CalmModeProvider>{children}</CalmModeProvider>;
}

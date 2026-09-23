"use client";

import React from 'react';
import { IH_ETHICS_DISCLAIMER, IH_PRODUCT_NAME } from '@/lib/island-helpers/copy';

export function EthicsDisclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      id="ih-ethics"
      className={`rounded-2xl border border-blue-100 bg-blue-50/80 text-blue-900 ${
        compact ? 'p-3 text-xs' : 'p-4 text-sm'
      }`}
      aria-label={`${IH_PRODUCT_NAME} parent note`}
    >
      <p className="font-black mb-1">For parents & caregivers</p>
      <p className="font-semibold leading-relaxed opacity-90">{IH_ETHICS_DISCLAIMER}</p>
    </aside>
  );
}

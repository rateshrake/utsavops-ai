// =============================================================================
// UtsavAI — Loading Skeletons
// Elegant pulsing skeletons in warm light mode preventing UI freezes during AI synthesis.
// =============================================================================

import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingSkeletonProps {
  label: string;
  subLabel?: string;
  cardCount?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  label,
  subLabel,
  cardCount = 3,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="p-6 bg-white border border-indigo-100 rounded-3xl space-y-5 animate-pulse shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200/60 shadow-xs">
          <Sparkles size={18} className="animate-spin text-indigo-600" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-bold text-slate-900">{label}</p>
          {subLabel && <p className="text-[11px] text-slate-500">{subLabel}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3"
          >
            <div className="h-4 bg-slate-200 rounded-md w-3/4" />
            <div className="h-3 bg-slate-200/70 rounded-md w-full" />
            <div className="h-3 bg-slate-200/70 rounded-md w-5/6" />
            <div className="pt-2 flex gap-2">
              <div className="h-6 bg-slate-200 rounded-lg w-16" />
              <div className="h-6 bg-slate-200 rounded-lg w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

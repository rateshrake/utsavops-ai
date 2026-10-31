// =============================================================================
// UtsavAI — Header & Navigation Component
// Clean, warm light-mode top nav, 4-step pill navigation with numbered badges,
// real-time summary pills, and subtle API key status.
// =============================================================================

import React from 'react';
import { Key, ChevronRight } from 'lucide-react';

export type TabId = 'discovery' | 'budget' | 'timeline' | 'vendor';

export interface TabItem {
  id: TabId;
  label: string;
  stepNumber?: number;
  emoji?: string;
  ariaLabel: string;
}

interface HeaderNavProps {
  tabs: TabItem[];
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  totalBudget: number;
  guestCount: number;
  daysLeft: number;
  hasApiKey: boolean;
  onOpenApiModal: () => void;
  activeModel?: string;
}

const fmt = (n: number): string =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;

export const HeaderNav: React.FC<HeaderNavProps> = React.memo(({
  tabs,
  activeTab,
  onTabChange,
  totalBudget,
  guestCount,
  daysLeft,
  hasApiKey,
  onOpenApiModal,
  activeModel,
}) => {
  const handleTabKeyDown = (e: React.KeyboardEvent, currentIdx: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (currentIdx + 1) % tabs.length;
      const nextTab = tabs[nextIdx];
      if (nextTab) onTabChange(nextTab.id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (currentIdx - 1 + tabs.length) % tabs.length;
      const prevTab = tabs[prevIdx];
      if (prevTab) onTabChange(prevTab.id);
    }
  };
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          {/* Left: Clean Brand Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img
              src="/logo.png"
              alt="UtsavAI Logo"
              className="w-9 h-9 rounded-xl object-contain shadow-xs bg-white border border-slate-100"
            />
            <span className="shrink-0 font-bold text-lg tracking-tight text-slate-900">
              Utsav<span className="text-indigo-600">AI</span>
            </span>
          </div>

          {/* Center: 4-Step Pill Navigation with Numbered Badges (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center">
            <nav
              className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs"
              aria-label="Event planning flow steps"
              role="tablist"
            >
              {tabs.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                const stepNum = tab.stepNumber || idx + 1;
                return (
                  <React.Fragment key={tab.id}>
                    <button
                      type="button"
                      onClick={() => onTabChange(tab.id)}
                      onKeyDown={(e) => handleTabKeyDown(e, idx)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-white text-indigo-900 border border-indigo-200/80 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                      }`}
                      aria-label={tab.ariaLabel}
                      aria-selected={isActive}
                      role="tab"
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {stepNum}
                      </span>
                      <span>{tab.label}</span>
                    </button>
                    {idx < tabs.length - 1 && (
                      <ChevronRight size={13} className="text-slate-300 hidden lg:block shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Right: Combined Summary Pill & Subtle API Key Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Combined Single Summary Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-full text-xs font-semibold text-slate-700 shadow-2xs">
              <span className="text-emerald-700 font-bold">{fmt(totalBudget)}</span>
              <span className="text-slate-300">•</span>
              <span>{guestCount} Guests</span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-700">{daysLeft}d</span>
            </div>

            {/* Subtle API Key Button */}
            <button
              type="button"
              onClick={onOpenApiModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-colors cursor-pointer shrink-0"
              title={`Configured: ${hasApiKey ? 'AI active' : 'Smart Demo mode'} • Active: ${activeModel || 'OpenRouter • openrouter/free'}`}
              aria-label="API key and model settings modal"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  hasApiKey ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-amber-400 ring-2 ring-amber-100'
                }`}
              />
              <span className="hidden sm:inline font-medium">
                {activeModel || 'OpenRouter • openrouter/free'}
              </span>
              <Key size={13} className="text-slate-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Row */}
        <nav
          className="flex md:hidden gap-1 pb-2.5 overflow-x-auto no-scrollbar border-t border-slate-100 pt-2"
          aria-label="Mobile event planning tabs"
          role="tablist"
        >
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const stepNum = tab.stepNumber || idx + 1;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                aria-label={tab.ariaLabel}
                aria-selected={isActive}
                role="tab"
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {stepNum}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
});
HeaderNav.displayName = 'HeaderNav';

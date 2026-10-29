// =============================================================================
// UtsavAI — Priority Ranker Component
// Clean, interactive priority list ("What matters most to you?") with simple up/down
// arrows, selection toggling (click to deselect/re-select), and clear #1-#5 numbers.
// #1 is explicitly protected during cuts.
// =============================================================================

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ShieldCheck, Check, Plus } from 'lucide-react';

interface PriorityRankerProps {
  priorities?: string[];
  selectedPriorities?: string[];
  allPriorities?: string[];
  onMovePriority: (item: string, direction: 'up' | 'down') => void;
  onTogglePriority?: (item: string) => void;
}

export const PriorityRanker: React.FC<PriorityRankerProps> = ({
  priorities,
  selectedPriorities: propSelected,
  allPriorities: propAll,
  onMovePriority,
  onTogglePriority,
}) => {
  const activeSelected = propSelected ?? priorities ?? [];
  const allList = propAll ?? activeSelected;
  const deselectedPriorities = allList.filter((item) => !activeSelected.includes(item));
  const [minWarning, setMinWarning] = useState<string | null>(null);

  const handleToggle = (item: string) => {
    if (!onTogglePriority) return;
    if (activeSelected.includes(item) && activeSelected.length <= 1) {
      setMinWarning('At least 1 priority must remain selected to protect your budget.');
      setTimeout(() => setMinWarning(null), 3000);
      return;
    }
    setMinWarning(null);
    onTogglePriority(item);
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            What matters most to you?
          </label>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {activeSelected.length} of {allList.length} selected
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Order your non-negotiables. Rank #1 will be shielded from major budget reductions. Click any section (like Music) to deselect or re-select.
        </p>
      </div>

      {minWarning && (
        <div
          role="alert"
          className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-center justify-between"
        >
          <span>⚠️ {minWarning}</span>
          <button
            type="button"
            onClick={() => setMinWarning(null)}
            className="text-amber-600 hover:text-amber-800 font-bold ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Active / Selected Ranked Priorities */}
      <div className="space-y-2">
        {activeSelected.map((item, idx) => {
          const isTopPriority = idx === 0;
          return (
            <div
              key={item}
              role="checkbox"
              aria-checked={true}
              tabIndex={0}
              onClick={() => handleToggle(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggle(item);
                }
              }}
              title="Click to deselect (or use arrows to re-rank)"
              className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                isTopPriority
                  ? 'bg-indigo-50/70 hover:bg-indigo-50 border-indigo-200/90 shadow-xs'
                  : 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Active Checkbox */}
                <div
                  className="w-5 h-5 rounded-md bg-indigo-600 group-hover:bg-indigo-700 text-white flex items-center justify-center flex-shrink-0 shadow-2xs transition-colors"
                  title="Selected — click to deselect"
                >
                  <Check size={12} strokeWidth={3} />
                </div>

                {/* Rank Badge */}
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isTopPriority
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  #{idx + 1}
                </span>

                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    {item}
                  </p>
                  {isTopPriority ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 font-medium">
                      <ShieldCheck size={11} className="text-indigo-600" />
                      <span>★ Protected Priority</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 transition-colors">
                      Click to deselect
                    </span>
                  )}
                </div>
              </div>

              {/* Keep the Arrows for ranking */}
              <div
                className="flex items-center gap-1 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMovePriority(item, 'up');
                  }}
                  className="p-1.5 rounded-lg bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 cursor-pointer transition-colors shadow-2xs"
                  aria-label={`Move ${item} up in priority`}
                  title={`Move ${item} up`}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={idx === activeSelected.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMovePriority(item, 'down');
                  }}
                  className="p-1.5 rounded-lg bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 cursor-pointer transition-colors shadow-2xs"
                  aria-label={`Move ${item} down in priority`}
                  title={`Move ${item} down`}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Deselected Priorities (Click again to select, keep arrows) */}
      {deselectedPriorities.length > 0 && (
        <div className="pt-3 border-t border-slate-200/80 space-y-2 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Deselected ({deselectedPriorities.length})
            </span>
            <span className="text-[11px] text-indigo-600 font-medium">
              Click any section to select
            </span>
          </div>

          <div className="space-y-2">
            {deselectedPriorities.map((item) => (
              <div
                key={item}
                role="checkbox"
                aria-checked={false}
                tabIndex={0}
                onClick={() => handleToggle(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle(item);
                  }
                }}
                title={`Click to select ${item}`}
                className="group flex items-center justify-between p-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 hover:bg-indigo-50/40 hover:border-indigo-300 transition-all cursor-pointer select-none opacity-80 hover:opacity-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Empty Checkbox with Plus icon on hover */}
                  <div
                    className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white group-hover:border-indigo-600 group-hover:bg-indigo-50 flex items-center justify-center flex-shrink-0 transition-colors"
                    title="Deselected — click to select"
                  >
                    <Plus size={12} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Placeholder Rank */}
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 bg-slate-100 text-slate-400 border border-slate-200">
                    —
                  </span>

                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-xs sm:text-sm font-medium text-slate-500 group-hover:text-slate-900 leading-snug">
                      {item}
                    </p>
                    <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors">
                      Deselected • Click to select
                    </span>
                  </div>
                </div>

                {/* Keep the arrows visible and clickable to select */}
                <div
                  className="flex items-center gap-1 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(item);
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(item);
                    }}
                    className="p-1.5 rounded-lg bg-white/80 text-slate-400 group-hover:text-indigo-600 group-hover:bg-white border border-slate-200 cursor-pointer transition-colors shadow-2xs"
                    aria-label={`Select ${item}`}
                    title="Click to select"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(item);
                    }}
                    className="p-1.5 rounded-lg bg-white/80 text-slate-400 group-hover:text-indigo-600 group-hover:bg-white border border-slate-200 cursor-pointer transition-colors shadow-2xs"
                    aria-label={`Select ${item}`}
                    title="Click to select"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

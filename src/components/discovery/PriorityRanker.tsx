// =============================================================================
// UtsavAI — Priority Ranker Component
// Clean, compact priority list ("What matters most to you?") with simple up/down
// arrows and clear #1-#5 numbers. #1 is explicitly protected during cuts.
// =============================================================================

import React from 'react';
import { ChevronUp, ChevronDown, ShieldCheck } from 'lucide-react';

interface PriorityRankerProps {
  priorities: string[];
  onMovePriority: (item: string, direction: 'up' | 'down') => void;
}

export const PriorityRanker: React.FC<PriorityRankerProps> = ({
  priorities,
  onMovePriority,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-1.5">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            What matters most to you?
          </label>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Order your non-negotiables. Rank #1 will be shielded from major budget reductions.
        </p>
      </div>

      <div className="space-y-2">
        {priorities.map((item, idx) => {
          const isTopPriority = idx === 0;
          return (
            <div
              key={item}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                isTopPriority
                  ? 'bg-indigo-50/70 border-indigo-200/90 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isTopPriority
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  #{idx + 1}
                </span>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    {item}
                  </p>
                  {isTopPriority && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-indigo-700 font-medium">
                      <ShieldCheck size={11} className="text-indigo-600" />
                      <span>★ Protected Priority</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => onMovePriority(item, 'up')}
                  className="p-1.5 rounded-lg bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 cursor-pointer transition-colors"
                  aria-label={`Move ${item} up in priority`}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={idx === priorities.length - 1}
                  onClick={() => onMovePriority(item, 'down')}
                  className="p-1.5 rounded-lg bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 cursor-pointer transition-colors"
                  aria-label={`Move ${item} down in priority`}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

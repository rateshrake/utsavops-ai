// =============================================================================
// UtsavAI — What-If Interactive Bar Component
// Sleek, friendly banner: "🔄 Plans changed? Test a 'What-If' change without losing your progress"
// 3 natural 1-click scenario chips + chat-style input box + "Ask AI for Options" button.
// =============================================================================

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Users,
  TrendingUp,
  Calendar,
} from 'lucide-react';

interface ConstraintShockPanelProps {
  onSimulateShock: (description: string) => Promise<void>;
  isSimulating: boolean;
  priorityRanked?: string[];
}

const NATURAL_SCENARIOS = [
  {
    id: 'extra-guests',
    label: '👥 +50 extra guests',
    description: '+50 extra guests added to the celebration. Recalculate catering, seating, and venue capacity without exceeding overall budget limits.',
    icon: <Users size={13} className="text-indigo-600" />,
  },
  {
    id: 'cut-budget',
    label: '📉 Cut budget by 10%',
    description: 'Cut total budget by 10% due to unexpected financial constraints. Protect top priority while trimming non-essential envelopes.',
    icon: <TrendingUp size={13} className="text-rose-600" />,
  },
  {
    id: 'moved-earlier',
    label: '⏳ Event moved 2 weeks earlier',
    description: 'Event moved 2 weeks earlier due to family calendar constraints. Need compressed vendor timelines and rush risk mitigation.',
    icon: <Calendar size={13} className="text-amber-600" />,
  },
];

export const ConstraintShockPanel: React.FC<ConstraintShockPanelProps> = ({
  onSimulateShock,
  isSimulating,
}) => {
  const [customInput, setCustomInput] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInput.trim().slice(0, 300);
    if (!clean || isSimulating) return;
    onSimulateShock(clean);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50/70 via-white to-emerald-50/50 border border-indigo-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Friendly Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔄</span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Need to adjust your plan? (What-If Assistant)
            </h3>
            <p className="text-xs text-slate-500">
              Test real-world scenarios or budget changes without losing your current progress.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2.5 py-1 rounded-full border border-indigo-200/80 shadow-2xs self-start sm:self-auto">
          AI Smart Balancer
        </span>
      </div>

      {/* 3 Natural 1-Click Scenario Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-1">
          Quick test:
        </span>
        {NATURAL_SCENARIOS.map((scen) => (
          <button
            key={scen.id}
            type="button"
            disabled={isSimulating}
            onClick={() => onSimulateShock(scen.description)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs font-medium text-slate-800 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            aria-label={`Test scenario: ${scen.label}`}
          >
            {scen.icon}
            <span>{scen.label}</span>
          </button>
        ))}
      </div>

      {/* Chat-Style Input Box */}
      <form onSubmit={handleCustomSubmit} className="pt-1">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            disabled={isSimulating}
            maxLength={300}
            placeholder="Tell AI what changed, e.g., Spend ₹50k more on photography..."
            className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
            aria-label="Custom what-if change"
          />
          <button
            type="submit"
            disabled={isSimulating || !customInput.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-xs cursor-pointer flex-shrink-0"
          >
            {isSimulating ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span className="hidden sm:inline">Balancing...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-white" />
                <span>Ask AI for Options</span>
                <Send size={12} className="hidden sm:inline text-white/80" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

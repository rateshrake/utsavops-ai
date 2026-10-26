// =============================================================================
// UtsavAI — Backup Plans for Common Last-Minute Surprises
// Clean, collapsible accordion / compact view for pre-mortem contingencies
// =============================================================================

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { CrisisScenario } from '../../types/event';

interface CrisisRiskTableProps {
  scenarios: CrisisScenario[];
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const CrisisRiskTable: React.FC<CrisisRiskTableProps> = ({ scenarios }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (scenarios.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header with Accordion Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <span>Backup Plans for Common Last-Minute Surprises</span>
          </h3>
          <p className="text-xs text-slate-500">
            Proactive safeguards and quick fallbacks for weather, vendor delays, and guest surges.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse backup plans' : 'Expand all backup plans'}
        >
          <span>{isOpen ? 'Collapse ▴' : `View All ${scenarios.length} Backup Plans ▾`}</span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Collapsed Compact Preview (3-card quick summary) */}
      {!isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {scenarios.slice(0, 3).map((scen, idx) => (
            <div
              key={idx}
              onClick={() => setIsOpen(true)}
              className="p-3 bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 rounded-2xl cursor-pointer transition-all space-y-1.5 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                  Scenario #{idx + 1}
                </span>
                <span className="text-[11px] font-mono font-bold text-rose-600">
                  {fmt(scen.financialImpact)}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                {scen.scenario}
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {scen.actionPlan[0] || 'Contingency plan defined'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Expanded Full Accordion View */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {scenarios.map((scen, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 hover:border-slate-300 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {scen.scenario}
                </h4>
                <span className="text-[11px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60 shrink-0">
                  {fmt(scen.financialImpact)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-500 font-medium">Risk Probability:</span>
                <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${scen.probability * 10}%` }}
                  />
                </div>
                <span className="font-mono text-slate-700 font-bold">{scen.probability}/10</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Recommended Safeguards:
                </span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {scen.actionPlan.slice(0, 3).map((act, aIdx) => (
                    <li key={aIdx} className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span className="leading-snug">{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CrisisRiskTable;

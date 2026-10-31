// =============================================================================
// UtsavAI — Trade-Off Strategy Cards Component
// Clean Segmented Tab Switcher with ZERO nested scrollbars:
// - Option 1: Protect Food (Recommended) | Option 2: ... | Option 3: ...
// - 1-sentence plain-English summary
// - Only categories that actually changed as clean pill badges (Decor: ₹75k → ₹40k (-₹35k))
// - 3 practical bullet tips
// - Prominent "Apply This Plan" button
// =============================================================================

import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import type { TradeOffStrategy } from '../../types/event';

interface TradeOffStrategyCardsProps {
  strategies: TradeOffStrategy[];
  activeShockTitle: string;
  onApplyStrategy: (strategy: TradeOffStrategy) => void;
  appliedStrategyId?: string | null;
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmtShort = (n: number) =>
  Math.abs(n) >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;

export const TradeOffStrategyCards: React.FC<TradeOffStrategyCardsProps> = React.memo(({
  strategies,
  activeShockTitle,
  onApplyStrategy,
  appliedStrategyId,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [justAppliedId, setJustAppliedId] = useState<string | null>(null);

  if (!strategies || strategies.length === 0) return null;

  const activeStrategy = strategies[selectedIdx] || strategies[0];
  const isCurrentlyApplied =
    (appliedStrategyId && appliedStrategyId === activeStrategy.id) ||
    justAppliedId === activeStrategy.id;
  const changedCategories = activeStrategy.categoryAdjustments.filter((adj) => adj.delta !== 0);

  const handleApplyClick = () => {
    setJustAppliedId(activeStrategy.id);
    onApplyStrategy(activeStrategy);
    setTimeout(() => {
      setJustAppliedId(null);
    }, 4000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
            AI Trade-Off Strategies ({strategies.length} options)
          </span>
          <p className="text-xs text-slate-500">
            Current scenario: <strong className="text-slate-800">"{activeShockTitle}"</strong>
          </p>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Pick a strategy to preview and apply
        </span>
      </div>

      {/* Clean Segmented Tab Switcher */}
      <div className="flex p-1 bg-slate-100 rounded-2xl gap-1.5 overflow-x-auto">
        {strategies.map((strat, idx) => {
          const isSelected = selectedIdx === idx;
          const isRecommended = idx === 0;
          const isAppliedTab =
            (appliedStrategyId && appliedStrategyId === strat.id) ||
            justAppliedId === strat.id;
          return (
            <button
              key={strat.id || idx}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                isSelected
                  ? 'bg-white text-indigo-900 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>Option {idx + 1}: {strat.title.split('—')[0].replace('Strategy', '').trim()}</span>
              {isAppliedTab ? (
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                  ✓ Active
                </span>
              ) : (
                isRecommended && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-full font-bold hidden md:inline">
                    Recommended
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Strategy Card (Full Width, Zero Nested Scrollbars) */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Option {selectedIdx + 1} of {strategies.length}
              </span>
              {selectedIdx === 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Sparkles size={11} />
                  <span>Balanced Recommendation</span>
                </span>
              )}
              {isCurrentlyApplied && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 size={12} className="text-emerald-700" />
                  <span>✓ Currently Active Plan</span>
                </span>
              )}
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900">
              {activeStrategy.title}
            </h4>
          </div>

          {activeStrategy.newTotalBudget && (
            <div className="text-left sm:text-right flex-shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Recalculated Fund
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-700">
                {fmt(activeStrategy.newTotalBudget)}
              </span>
            </div>
          )}
        </div>

        {/* 1-sentence plain-English summary */}
        <p className="text-xs sm:text-sm text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed shadow-2xs">
          {activeStrategy.philosophy}
        </p>

        {/* Categories that actually changed with clear arithmetic reconciliation */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Modified Budget Envelopes ({changedCategories.length}):
            </span>
            {activeStrategy.newTotalBudget && (
              <span className="text-[11px] text-slate-500">
                Absorbing <strong className="text-emerald-700 font-mono">{changedCategories.reduce((acc, c) => acc + c.delta, 0) < 0 ? fmt(changedCategories.reduce((acc, c) => acc + c.delta, 0)) : `+${fmt(changedCategories.reduce((acc, c) => acc + c.delta, 0))}`}</strong> in adjustments
              </span>
            )}
          </div>

          {/* Friendly explainer for the user */}
          {activeStrategy.newTotalBudget && changedCategories.length > 0 && (
            <div className="text-[11px] text-slate-600 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100/80 leading-relaxed">
              💡 <strong>How the math adds up to {fmt(activeStrategy.newTotalBudget)}:</strong> These {changedCategories.length} adjusted envelopes equal <strong>{fmt(changedCategories.reduce((acc, c) => acc + c.newAmount, 0))}</strong>. The remaining <strong>{fmt(Math.max(0, activeStrategy.newTotalBudget - changedCategories.reduce((acc, c) => acc + c.newAmount, 0)))}</strong> stays in your protected categories.
            </div>
          )}

          {changedCategories.length === 0 ? (
            <p className="text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-slate-200">
              All category allocations remain steady within existing buffers.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {changedCategories.map((adj) => {
                const isCut = adj.delta < 0;
                return (
                  <div
                    key={adj.categoryId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs"
                  >
                    <span className="font-semibold text-slate-800">{adj.categoryName}:</span>
                    <span className="text-slate-400 line-through text-[11px]">{fmtShort(adj.oldAmount)}</span>
                    <ArrowRight size={11} className="text-slate-400" />
                    <span className="font-bold text-slate-900">{fmtShort(adj.newAmount)}</span>
                    <span
                      className={`font-bold font-mono text-[11px] px-1.5 py-0.5 rounded-md flex items-center ${
                        isCut
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isCut ? (
                        <>
                          <ArrowDownRight size={11} />
                          {fmtShort(adj.delta)}
                        </>
                      ) : (
                        <>
                          <ArrowUpRight size={11} />
                          +{fmtShort(adj.delta)}
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3 short bullet points of practical tips */}
        {activeStrategy.actionableCompromises.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb size={13} className="text-amber-500" />
              <span>Practical Compromises & Execution Tips:</span>
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200">
              {activeStrategy.actionableCompromises.slice(0, 3).map((tip, tIdx) => (
                <li key={tIdx} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span className="leading-snug">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prominent "Apply This Plan" Button & Inline Confirmation */}
        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200/80 mt-2">
          {isCurrentlyApplied ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 animate-pulse" />
              <span>
                <strong>Plan Applied!</strong> Envelopes re-balanced to {fmt(activeStrategy.newTotalBudget || 0)} for {activeStrategy.newGuestCount || 'all'} guests.
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Clicking apply re-distributes your budget envelopes and updates event totals.
            </p>
          )}

          <button
            type="button"
            onClick={handleApplyClick}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
              isCurrentlyApplied
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white ring-2 ring-emerald-400/60 shadow-md'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
            }`}
            aria-label={`Apply strategy: ${activeStrategy.title}`}
          >
            <CheckCircle2 size={16} className={isCurrentlyApplied ? 'text-emerald-200' : 'text-white'} />
            <span>{isCurrentlyApplied ? '✓ Plan Applied (Click to Re-apply)' : 'Apply This Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
});
TradeOffStrategyCards.displayName = 'TradeOffStrategyCards';

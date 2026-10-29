// =============================================================================
// UtsavAI — Delay Simulation Modal Component
// Evaluates domino effects of milestone bottlenecks with Gemini 3.8 Flash.
// Clean, warm light mode styling.
// =============================================================================

import React from 'react';
import {
  X,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  FastForward,
} from 'lucide-react';
import type { DelayImpactAnalysis, TimelineTask } from '../../types/event';

interface DelaySimulationModalProps {
  task: TimelineTask;
  delayDays: number;
  setDelayDays: (days: number) => void;
  isSimulatingDelay: boolean;
  delayAnalysis: DelayImpactAnalysis | null;
  simError: string | null;
  onRunSimulation: () => Promise<void>;
  onApplyScheduleAdjustments: () => void;
  onClose: () => void;
}

const fmt = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const DelaySimulationModal: React.FC<DelaySimulationModalProps> = ({
  task,
  delayDays,
  setDelayDays,
  isSimulatingDelay,
  delayAnalysis,
  simError,
  onRunSimulation,
  onApplyScheduleAdjustments,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delay-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100"
          aria-label="Close delay simulation modal"
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80 uppercase tracking-wider">
            <ShieldAlert size={13} className="text-amber-600" />
            <span>Bottleneck & Delay Assistant</span>
          </div>
          <h3 id="delay-modal-title" className="text-lg sm:text-xl font-bold text-slate-900">
            Simulate Delay: "{task.title}"
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Determine cascading impacts on downstream dependencies and formulate a recovery plan.
          </p>
        </div>

        {/* Delay Configuration */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <label htmlFor="delay-duration-selector" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Delay Duration:
          </label>
          <div id="delay-duration-selector" className="flex gap-2">
            {[3, 7, 14].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDelayDays(d)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  delayDays === d
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                +{d} Days Late
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onRunSimulation}
            disabled={isSimulatingDelay}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSimulatingDelay ? (
              <>
                <RefreshCw size={15} className="animate-spin text-white" />
                <span>Analyzing Domino Effects with OpenRouter...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} className="text-white" />
                <span>Analyze Impact & Formulate Recovery Plan</span>
              </>
            )}
          </button>
        </div>

        {simError && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
            <span>{simError}</span>
          </div>
        )}

        {/* Simulation Results */}
        {delayAnalysis && (
          <div className="space-y-4 pt-2 border-t border-slate-200">
            {/* Severity & Cascade Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cascading Ripple Impact
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    delayAnalysis.impactSeverity === 'High'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {delayAnalysis.impactSeverity} Severity
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {delayAnalysis.cascadeSummary}
              </p>
            </div>

            {/* Downstream Shifts */}
            {delayAnalysis.suggestedScheduleAdjustments.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Impacted Downstream Milestones ({delayAnalysis.suggestedScheduleAdjustments.length}):
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {delayAnalysis.suggestedScheduleAdjustments.map((adj) => (
                    <div
                      key={adj.taskId}
                      className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <span className="text-slate-800 font-semibold truncate">
                        {adj.taskTitle}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 flex-shrink-0">
                        {fmt(adj.originalDueDate)} <ArrowRight size={10} className="text-slate-400" />{' '}
                        <strong className="text-rose-600">{fmt(adj.newDueDate)}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recovery Action Plan */}
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sparkles size={13} className="text-emerald-600" />
                <span>AI Recovery Action Plan</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200/80">
                {delayAnalysis.recoveryActionPlan.map((step, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold flex-shrink-0">✓</span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Apply Schedule Adjustments Button */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onApplyScheduleAdjustments}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <FastForward size={15} />
                <span>Apply Schedule Adjustments & Recovery</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

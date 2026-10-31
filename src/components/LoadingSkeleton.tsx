// =============================================================================
// UtsavAI — Loading Skeleton & Live AI Progress Bar
// Features animated progress bar (0-100%), elapsed time counter, dynamic multi-phase
// status messages, and pulsing skeletons preventing UI freezes during LLM synthesis.
// =============================================================================

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle2, Cpu } from 'lucide-react';
import { LOADING_PROGRESS } from '../constants/budgetWeights';

interface LoadingSkeletonProps {
  label: string;
  subLabel?: string;
  cardCount?: number;
  steps?: string[];
  estimatedDurationSeconds?: number;
}

const DEFAULT_PLAN_STEPS = [
  'Connecting to LangChain (openrouter/free) & parsing constraints',
  'Synthesizing priority-weighted budget allocations',
  'Sequencing chronological dependency timeline & milestones',
  'Auditing operational contingencies & pre-mortem playbooks',
  'Finalizing synchronized celebration master plan',
];

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = React.memo(({
  label,
  subLabel,
  cardCount = 3,
  steps,
  estimatedDurationSeconds = 10,
}) => {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const activeSteps = steps && steps.length > 0 ? steps : DEFAULT_PLAN_STEPS;
  const elapsedSec = (elapsedMs / 1000).toFixed(1);

  // Smooth asymptotic progression curve: advances quickly at first, then gently approaches max % while waiting for LLM
  const duration = Math.max(5, estimatedDurationSeconds);
  const progressRatio = 1 - Math.exp(-(elapsedMs / 1000) / (duration * LOADING_PROGRESS.CURVE_FACTOR));
  const progress = Math.min(
    LOADING_PROGRESS.MAX_PROGRESS_PCT,
    Math.max(LOADING_PROGRESS.MIN_PROGRESS_PCT, Math.round(progressRatio * 100))
  );

  // Calculate active step index based on progress percentage
  const stepIndex = Math.min(
    activeSteps.length - 1,
    Math.floor((progress / 95) * activeSteps.length)
  );

  return (
    <div
      role="status"
      aria-live="polite"
      className="p-5 sm:p-7 bg-white border border-indigo-200/90 rounded-3xl space-y-6 shadow-sm animate-fadeIn"
    >
      {/* 1. Header with Glowing AI Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-200/80 shadow-xs flex-shrink-0">
            <Sparkles size={20} className="animate-spin text-indigo-600" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">{label}</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                <Cpu size={10} />
                <span>AI Live</span>
              </span>
            </div>
            {subLabel && (
              <p className="text-xs text-slate-500 mt-0.5">{subLabel}</p>
            )}
          </div>
        </div>

        {/* Live Elapsed Timer */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <Loader2 size={13} className="animate-spin text-indigo-600 shrink-0" />
          <span className="text-xs font-mono font-bold text-slate-700">
            Elapsed: {elapsedSec}s
          </span>
        </div>
      </div>

      {/* 2. Live Animated Progress Bar */}
      <div className="space-y-2 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
        <div className="flex items-center justify-between text-xs gap-2">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping inline-block shrink-0" />
            <span className="text-indigo-700 font-bold">Step {stepIndex + 1} of {activeSteps.length}:</span>
            <span className="text-slate-700 truncate">{activeSteps[stepIndex]}</span>
          </span>
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60 shrink-0">
            {progress}%
          </span>
        </div>

        {/* Progress Track */}
        <div className="h-3 w-full bg-slate-200/70 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 transition-all duration-300 ease-out relative overflow-hidden shadow-2xs"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Step Progression Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          {activeSteps.map((stepText, idx) => {
            const isDone = idx < stepIndex;
            const isCurrent = idx === stepIndex;
            return (
              <div
                key={idx}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all ${
                  isDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold'
                    : isCurrent
                    ? 'bg-indigo-100/80 text-indigo-900 border border-indigo-300 font-bold ring-1 ring-indigo-400/30'
                    : 'bg-white text-slate-400 border border-slate-200'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 size={11} className="text-indigo-600 animate-spin shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className="truncate max-w-[160px] sm:max-w-none">{stepText}</span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
          <span>💡</span>
          <span>LangChain balances high-speed free inference engines (openrouter/free). Typically takes 3–10 seconds to receive the complete response.</span>
        </p>
      </div>

      {/* 3. Pulsing Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3 animate-pulse"
          >
            <div className="h-4 bg-slate-200/80 rounded-md w-3/4" />
            <div className="h-3 bg-slate-200/60 rounded-md w-full" />
            <div className="h-3 bg-slate-200/60 rounded-md w-5/6" />
            <div className="pt-2 flex gap-2">
              <div className="h-6 bg-slate-200/80 rounded-lg w-16" />
              <div className="h-6 bg-slate-200/80 rounded-lg w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
LoadingSkeleton.displayName = 'LoadingSkeleton';

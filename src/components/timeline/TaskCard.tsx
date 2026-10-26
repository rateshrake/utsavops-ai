// =============================================================================
// UtsavAI — Task Card Component (Notion / Linear Style)
// Clean to-do row:
// - Left: Large satisfying clickable checkbox circle + Bold Title + subtle category tag
// - Subtext: Due date + ONLY show soft amber lock pill if blocked
// - Right: Subtle ghost button "Running Late?" expanding clean inline AI recovery tip box
// =============================================================================

import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Lock,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  FastForward,
  Loader2,
} from 'lucide-react';
import type { TimelineTask, DelayImpactAnalysis, EventProfile } from '../../types/event';
import { isTaskBlocked } from '../../utils/budgetLogic';
import { simulateDelayImpact } from '../../services/geminiService';

interface TaskCardProps {
  task: TimelineTask;
  taskMap: Record<string, TimelineTask>;
  profile: EventProfile;
  allTasks: TimelineTask[];
  onToggleComplete: (task: TimelineTask) => void;
  onApplyScheduleShift: (delayedTaskId: string, days: number, adjustments: Array<{ taskId: string; newDueDate: string }>) => void;
}

const fmt = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  taskMap,
  profile,
  allTasks,
  onToggleComplete,
  onApplyScheduleShift,
}) => {
  const [isLateExpanded, setIsLateExpanded] = useState(false);
  const [delayDays, setDelayDays] = useState<number>(7);
  const [isSimulating, setIsSimulating] = useState(false);
  const [analysis, setAnalysis] = useState<DelayImpactAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isBlocked, unresolvedParentTitles } = isTaskBlocked(task, taskMap);
  const isCompleted = task.status === 'completed';

  const handleToggleLate = async () => {
    const nextState = !isLateExpanded;
    setIsLateExpanded(nextState);
    if (nextState && !analysis) {
      await runAnalysis(delayDays);
    }
  };

  const runAnalysis = async (days: number) => {
    setIsSimulating(true);
    setError(null);
    try {
      const res = await simulateDelayImpact(profile, allTasks, task.id, days);
      setAnalysis(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not simulate delay.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDurationChange = async (days: number) => {
    setDelayDays(days);
    await runAnalysis(days);
  };

  const handleApply = () => {
    if (!analysis) return;
    const adjustments = analysis.suggestedScheduleAdjustments.map((adj) => ({
      taskId: adj.taskId,
      newDueDate: adj.newDueDate,
    }));
    onApplyScheduleShift(task.id, delayDays, adjustments);
    setIsLateExpanded(false);
  };

  return (
    <div
      role="listitem"
      className={`bg-white border border-slate-200 rounded-2xl transition-all shadow-2xs hover:border-slate-300 ${
        isCompleted ? 'bg-slate-50/50' : ''
      }`}
      aria-label={`Task: ${task.title}, Status: ${task.status}`}
    >
      {/* Main Task Row */}
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Checkbox + Title + Category Tag */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Large Satisfying Clickable Checkbox */}
          <button
            type="button"
            onClick={() => onToggleComplete(task)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'border-slate-300 hover:border-indigo-600 bg-white hover:bg-indigo-50/60'
            }`}
            title={isCompleted ? 'Mark task pending' : 'Mark task complete'}
            aria-label={`Toggle task ${task.title}`}
          >
            {isCompleted && <Check size={14} strokeWidth={3} />}
          </button>

          {/* Title & Category Tag */}
          <div className="min-w-0 flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-bold truncate leading-tight ${
                isCompleted ? 'line-through text-slate-400 font-normal' : 'text-slate-900'
              }`}
            >
              {task.title}
            </span>
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex-shrink-0">
              {task.category}
            </span>
          </div>
        </div>

        {/* Middle / Subtext: Due Date + ONLY soft amber lock pill if blocked */}
        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
            <Calendar size={12} className="text-slate-400" />
            <span>{fmt(task.dueDate)}</span>
          </span>

          {/* ONLY show a soft amber lock pill if task is actually blocked */}
          {isBlocked && !isCompleted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
              <Lock size={11} className="text-amber-600" />
              <span>Finish "{unresolvedParentTitles[0] || 'Prerequisite'}" first</span>
            </span>
          )}

          {/* Right: Subtle Ghost Button "Running Late?" */}
          {!isCompleted && (
            <button
              type="button"
              onClick={handleToggleLate}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
                isLateExpanded
                  ? 'bg-amber-100/70 text-amber-900 border-amber-300'
                  : 'text-slate-500 hover:text-amber-800 hover:bg-amber-50 border-transparent hover:border-amber-200'
              }`}
              aria-label="Running late options"
            >
              <Clock size={12} />
              <span>Running Late?</span>
              {isLateExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Inline AI Tip Box */}
      {isLateExpanded && (
        <div className="mx-3.5 mb-3.5 sm:mx-4 sm:mb-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-slate-800 space-y-3.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs sm:text-sm">
              <Sparkles size={14} className="text-amber-600" />
              <span>AI Recovery Assistant — Milestone Delay</span>
            </div>
            {/* Delay presets */}
            <div className="flex gap-1">
              {[3, 7, 14].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDurationChange(d)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                    delayDays === d
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  +{d}d
                </button>
              ))}
            </div>
          </div>

          {isSimulating && (
            <div className="flex items-center gap-2 text-slate-600 py-2">
              <Loader2 size={14} className="animate-spin text-amber-600" />
              <span>Analyzing domino effects and recovery actions...</span>
            </div>
          )}

          {error && (
            <p className="text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          {analysis && !isSimulating && (
            <div className="space-y-3">
              {/* Impact statement */}
              <p className="text-slate-700 leading-relaxed font-sans bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                {analysis.cascadeSummary}
              </p>

              {/* Affected downstream tasks */}
              {analysis.suggestedScheduleAdjustments.length > 0 && (
                <div>
                  <span className="font-bold text-amber-900 block mb-1 text-[11px] uppercase tracking-wider">
                    Downstream Milestones Pushed ({analysis.suggestedScheduleAdjustments.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.suggestedScheduleAdjustments.map((adj) => (
                      <span
                        key={adj.taskId}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-slate-800 text-[11px]"
                      >
                        <span className="font-semibold">{adj.taskTitle}</span>
                        <ArrowRight size={10} className="text-slate-400" />
                        <span className="font-mono font-bold text-amber-700">{fmt(adj.newDueDate)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical tips */}
              <div>
                <span className="font-bold text-amber-900 block mb-1 text-[11px] uppercase tracking-wider">
                  Recommended Recovery Steps:
                </span>
                <ul className="space-y-1 text-slate-700">
                  {analysis.recoveryActionPlan.slice(0, 2).map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsLateExpanded(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FastForward size={12} />
                  <span>Shift Schedule by {delayDays} Days</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

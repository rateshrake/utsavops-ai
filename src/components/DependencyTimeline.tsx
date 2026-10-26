// =============================================================================
// UtsavAI — Tab 3 ("3. Checklist")
// Clean Notion/Linear style checklist:
// - Clean progress bar: "11% Complete — 2 of 18 tasks done"
// - Simplified task rows with zero badge clutter
// - Large satisfying checkbox, bold title, category tag, due date
// - Soft lock pill ONLY when blocked
// - Subtle "Running Late?" ghost button with inline AI tip box
// =============================================================================

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import type {
  TimelineTask,
  TaskStatus,
  TaskPriority,
  EventProfile,
} from '../types/event';
import { isTaskOverdue, calculateCompletionPercentage } from '../utils/budgetLogic';
import { TimelineToolbar } from './timeline/TimelineToolbar';
import { TaskCard } from './timeline/TaskCard';
import { ErrorBoundary } from './ErrorBoundary';

interface DependencyTimelineProps {
  profile: EventProfile;
  tasks: TimelineTask[];
  onTaskUpdate: (tasks: TimelineTask[]) => void;
}

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export const DependencyTimeline: React.FC<DependencyTimelineProps> = ({
  profile,
  tasks,
  onTaskUpdate,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | TaskStatus>('all');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState<'all' | TaskPriority>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority'>('deadline');
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const taskMap = useMemo(() => {
    const m: Record<string, TimelineTask> = {};
    tasks.forEach((t) => {
      m[t.id] = t;
    });
    return m;
  }, [tasks]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      delayed: tasks.filter((t) => t.status === 'delayed' || isTaskOverdue(t.dueDate, t.status)).length,
      pending: tasks.filter((t) => t.status === 'pending').length,
    }),
    [tasks]
  );

  const completionPct = calculateCompletionPercentage(tasks);

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => filterStatus === 'all' || t.status === filterStatus)
      .filter((t) => filterCategory === 'All' || t.category === filterCategory)
      .filter((t) => filterPriority === 'all' || t.priority === filterPriority)
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const pDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
          if (pDiff !== 0) return pDiff;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        const dDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (dDiff !== 0) return dDiff;
        return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      });
  }, [tasks, filterStatus, filterCategory, filterPriority, sortBy]);

  const handleToggleComplete = (task: TimelineTask) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    onTaskUpdate(tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    if (nextStatus === 'completed') {
      setActionSuccessToast(`✓ Completed: "${task.title}"`);
      setTimeout(() => setActionSuccessToast(null), 3000);
    }
  };

  const handleApplyScheduleShift = (
    delayedTaskId: string,
    days: number,
    adjustments: Array<{ taskId: string; newDueDate: string }>
  ) => {
    const adjMap: Record<string, string> = {};
    adjustments.forEach((a) => {
      adjMap[a.taskId] = a.newDueDate;
    });

    const updated = tasks.map((t) => {
      if (t.id === delayedTaskId) {
        const origTime = new Date(t.dueDate).getTime();
        const shifted = new Date(origTime + days * 86400000).toISOString().split('T')[0];
        return { ...t, dueDate: shifted, status: 'delayed' as TaskStatus };
      }
      if (adjMap[t.id]) {
        return { ...t, dueDate: adjMap[t.id] };
      }
      return t;
    });

    onTaskUpdate(updated);
    setActionSuccessToast(`Schedule adjusted: shifted by ${days} days.`);
    setTimeout(() => setActionSuccessToast(null), 3500);
  };

  return (
    <ErrorBoundary fallbackTitle="Error loading Checklist">
      <section aria-label="Event Checklist" className="space-y-6">
        {/* Top Progress Bar & Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 border border-indigo-200/80 rounded-full text-xs font-semibold text-indigo-700 mb-1">
                <Calendar size={12} className="text-indigo-600" />
                <span>Step 3 of 4 • Planning Checklist</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Checklist & Timeline Milestones
              </h2>
            </div>

            {/* Clean Progress Indicator Pill */}
            <div className="text-right">
              <span className="text-sm font-bold text-slate-800 font-mono">
                {completionPct}% Complete
              </span>
              <span className="text-xs text-slate-500 block">
                {stats.completed} of {stats.total} tasks done
              </span>
            </div>
          </div>

          {/* Clean Progress Bar */}
          <div
            className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200"
            role="progressbar"
            aria-valuenow={stats.completed}
            aria-valuemax={stats.total}
            aria-label="Planning progress"
          >
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Success Toast */}
        {actionSuccessToast && (
          <div
            role="status"
            className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold shadow-sm animate-pulse"
          >
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span>{actionSuccessToast}</span>
          </div>
        )}

        {/* Interactive Dependency Magic Tip Banner */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center gap-3 text-xs text-amber-900 shadow-2xs">
          <span className="text-base shrink-0">💡</span>
          <p className="leading-relaxed">
            <strong>Tip:</strong> Check off <em>"Book Venue & Pay Token Advance"</em> to automatically unlock dependent vendor tasks!
          </p>
        </div>

        {/* Filter and Sort Toolbar */}
        <TimelineToolbar
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalCount={stats.total}
          pendingCount={stats.pending}
          completedCount={stats.completed}
          delayedCount={stats.delayed}
        />

        {/* Task List Grouped by 3 Timeline Phases */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
            <Calendar size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold">No tasks match the active filters.</p>
          </div>
        ) : (
          <div className="space-y-6" role="list" aria-label="Checklist tasks grouped by phases">
            {[
              {
                id: 'phase-1',
                title: 'Phase 1: Foundation & Venue (First 30 Days)',
                desc: 'Securing the core date, budget approval, and primary venue booking.',
                badge: 'Phase 1',
                badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                tasks: filtered.filter((t) => {
                  const eventTime = new Date(profile.date).getTime();
                  const taskTime = new Date(t.dueDate).getTime();
                  const daysBefore = Math.round((eventTime - taskTime) / 86400000);
                  return daysBefore > 75;
                }),
              },
              {
                id: 'phase-2',
                title: 'Phase 2: Vendors, Catering & Invites (2–3 Months Out)',
                desc: 'Locking caterers, photography, music, decor vendors, and dispatching invites.',
                badge: 'Phase 2',
                badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
                tasks: filtered.filter((t) => {
                  const eventTime = new Date(profile.date).getTime();
                  const taskTime = new Date(t.dueDate).getTime();
                  const daysBefore = Math.round((eventTime - taskTime) / 86400000);
                  return daysBefore > 30 && daysBefore <= 75;
                }),
              },
              {
                id: 'phase-3',
                title: 'Phase 3: Final Touches & Guest Logistics (Final Month)',
                desc: 'Final headcount lock-in, vendor reconfirmations, and day-of celebration run-through.',
                badge: 'Phase 3',
                badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
                tasks: filtered.filter((t) => {
                  const eventTime = new Date(profile.date).getTime();
                  const taskTime = new Date(t.dueDate).getTime();
                  const daysBefore = Math.round((eventTime - taskTime) / 86400000);
                  return daysBefore <= 30;
                }),
              },
            ]
              .filter((p) => p.tasks.length > 0)
              .map((p) => {
                const doneInPhase = p.tasks.filter((t) => t.status === 'completed').length;
                return (
                  <div key={p.id} className="space-y-3">
                    {/* Phase Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                          {p.badge}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                          {p.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        {doneInPhase} of {p.tasks.length} tasks completed
                      </span>
                    </div>

                    {/* Task Cards in this Phase */}
                    <div className="space-y-2.5">
                      {p.tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          taskMap={taskMap}
                          profile={profile}
                          allTasks={tasks}
                          onToggleComplete={handleToggleComplete}
                          onApplyScheduleShift={handleApplyScheduleShift}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>
    </ErrorBoundary>
  );
};

export default DependencyTimeline;

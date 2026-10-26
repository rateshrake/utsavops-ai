// =============================================================================
// UtsavAI — Timeline Toolbar Component
// Filtering and sorting controls for event milestones and critical path tasks.
// Clean, warm light mode styling.
// =============================================================================

import React from 'react';
import { Filter } from 'lucide-react';
import type { TaskStatus, TaskPriority } from '../../types/event';

interface TimelineToolbarProps {
  filterStatus: 'all' | TaskStatus;
  setFilterStatus: (val: 'all' | TaskStatus) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterPriority: 'all' | TaskPriority;
  setFilterPriority: (val: 'all' | TaskPriority) => void;
  sortBy: 'deadline' | 'priority';
  setSortBy: (val: 'deadline' | 'priority') => void;
  totalCount: number;
  pendingCount: number;
  completedCount: number;
  delayedCount: number;
}

const CATEGORIES = [
  'All',
  'Venue',
  'Catering',
  'Photography',
  'Decor',
  'Entertainment',
  'Invitations',
  'Transportation',
  'Accommodation',
  'Legal',
  'Misc',
];

export const TimelineToolbar: React.FC<TimelineToolbarProps> = ({
  filterStatus,
  setFilterStatus,
  filterCategory,
  setFilterCategory,
  filterPriority,
  setFilterPriority,
  sortBy,
  setSortBy,
  totalCount,
  pendingCount,
  completedCount,
  delayedCount,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
          <Filter size={13} className="text-slate-400" />
          <span>Filters:</span>
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | TaskStatus)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
          aria-label="Filter tasks by status"
        >
          <option value="all">All Statuses ({totalCount})</option>
          <option value="pending">Pending ({pendingCount})</option>
          <option value="completed">Completed ({completedCount})</option>
          <option value="delayed">Delayed / Due ({delayedCount})</option>
        </select>

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
          aria-label="Filter tasks by category"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              Category: {c}
            </option>
          ))}
        </select>

        {/* Priority filter */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as 'all' | TaskPriority)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
          aria-label="Filter tasks by priority"
        >
          <option value="all">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>
      </div>

      {/* Sort By Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">Sort by:</span>
        <div className="flex gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setSortBy('deadline')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
              sortBy === 'deadline'
                ? 'bg-white text-indigo-900 border border-slate-200/80 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-label="Sort by deadline date"
          >
            Deadline Date
          </button>
          <button
            type="button"
            onClick={() => setSortBy('priority')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
              sortBy === 'priority'
                ? 'bg-white text-indigo-900 border border-slate-200/80 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-label="Sort by priority first"
          >
            Priority First
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// UtsavOps AI — Unit Tests for Budget & Dependency Logic
// Verified with Vitest
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  calculateTotalAllocated,
  calculateTotalActual,
  calculatePerGuestCost,
  calculateBudgetVariance,
  isTaskBlocked,
  isTaskOverdue,
  calculateCompletionPercentage,
  applyCategoryAdjustments,
} from '../utils/budgetLogic';
import type { BudgetCategory, TimelineTask } from '../types/event';

describe('Budget Financial Calculations', () => {
  const sampleCategories: BudgetCategory[] = [
    {
      id: 'venue',
      name: 'Venue & Hall',
      allocatedAmount: 180000,
      actualCost: 175000,
      isVerifiedQuote: true,
      notes: 'Banquet hall deposit paid',
    },
    {
      id: 'catering',
      name: 'Catering & Food',
      allocatedAmount: 240000,
      actualCost: 230000,
      isVerifiedQuote: true,
      notes: 'Royal Rasoi per plate',
    },
    {
      id: 'decor',
      name: 'Decor & Floral',
      allocatedAmount: 75000,
      actualCost: 0,
      isVerifiedQuote: false,
      notes: 'Estimate unverified',
    },
  ];

  it('calculates total allocated budget correctly', () => {
    const total = calculateTotalAllocated(sampleCategories);
    expect(total).toBe(495000);
  });

  it('calculates total actual incurred cost correctly', () => {
    const total = calculateTotalActual(sampleCategories);
    expect(total).toBe(405000);
  });

  it('calculates per-guest cost with correct rounding', () => {
    expect(calculatePerGuestCost(495000, 200)).toBe(2475);
    expect(calculatePerGuestCost(800000, 250)).toBe(3200);
  });

  it('handles 0 or negative guest count gracefully without crashing or returning NaN', () => {
    expect(calculatePerGuestCost(500000, 0)).toBe(0);
    expect(calculatePerGuestCost(500000, -10)).toBe(0);
  });

  it('calculates budget variance accurately', () => {
    // Within budget
    const under = calculateBudgetVariance(800000, 750000);
    expect(under.diff).toBe(-50000);
    expect(under.isOver).toBe(false);
    expect(under.percent).toBe(-6.2);

    // Over budget
    const over = calculateBudgetVariance(800000, 880000);
    expect(over.diff).toBe(80000);
    expect(over.isOver).toBe(true);
    expect(over.percent).toBe(10);
  });

  it('applies category delta adjustments without wiping existing categories', () => {
    const adjusted = applyCategoryAdjustments(sampleCategories, [
      {
        categoryId: 'catering',
        categoryName: 'Catering & Food',
        oldAmount: 240000,
        newAmount: 220000,
        delta: -20000,
      },
      {
        categoryId: 'decor',
        categoryName: 'Decor & Floral',
        oldAmount: 75000,
        newAmount: 50000,
        delta: -25000,
      },
    ]);

    expect(adjusted.find((c) => c.id === 'catering')?.allocatedAmount).toBe(220000);
    expect(adjusted.find((c) => c.id === 'decor')?.allocatedAmount).toBe(50000);
    // Unchanged category remains intact
    expect(adjusted.find((c) => c.id === 'venue')?.allocatedAmount).toBe(180000);
  });
});

describe('Timeline & Dependency Logic', () => {
  const taskA: TimelineTask = {
    id: 'task-a',
    title: 'Book Venue & Lock Date',
    category: 'Venue',
    dueDate: '2026-11-15',
    status: 'pending',
    dependsOnTaskIds: [],
    priority: 'High',
  };

  const taskB: TimelineTask = {
    id: 'task-b',
    title: 'Finalize Catering Menu & Headcount',
    category: 'Catering',
    dueDate: '2026-12-10',
    status: 'pending',
    dependsOnTaskIds: ['task-a'],
    priority: 'High',
  };

  it('marks task as blocked when parent task is pending', () => {
    const taskMap: Record<string, TimelineTask> = {
      'task-a': taskA,
      'task-b': taskB,
    };

    const result = isTaskBlocked(taskB, taskMap);
    expect(result.isBlocked).toBe(true);
    expect(result.unresolvedParentTitles).toContain('Book Venue & Lock Date');
  });

  it('clears blocked status when parent task is completed', () => {
    const completedA: TimelineTask = { ...taskA, status: 'completed' };
    const taskMap: Record<string, TimelineTask> = {
      'task-a': completedA,
      'task-b': taskB,
    };

    const result = isTaskBlocked(taskB, taskMap);
    expect(result.isBlocked).toBe(false);
    expect(result.unresolvedParentTitles.length).toBe(0);
  });

  it('treats a completed task as unblocked regardless of parent statuses', () => {
    const completedB: TimelineTask = { ...taskB, status: 'completed' };
    const taskMap: Record<string, TimelineTask> = {
      'task-a': taskA, // task A is still pending
      'task-b': completedB,
    };

    const result = isTaskBlocked(completedB, taskMap);
    expect(result.isBlocked).toBe(false);
  });

  it('detects overdue tasks accurately against reference date', () => {
    const refDate = new Date('2026-11-20');
    // task-a dueDate is 2026-11-15 -> overdue
    expect(isTaskOverdue(taskA.dueDate, taskA.status, refDate)).toBe(true);
    // completed task is never overdue
    expect(isTaskOverdue(taskA.dueDate, 'completed', refDate)).toBe(false);
    // task-b dueDate is 2026-12-10 -> not overdue yet
    expect(isTaskOverdue(taskB.dueDate, taskB.status, refDate)).toBe(false);
  });

  it('calculates completion velocity percentage correctly', () => {
    const tasks: TimelineTask[] = [
      { ...taskA, status: 'completed' },
      { ...taskB, status: 'pending' },
      { ...taskA, id: 'task-c', status: 'delayed' },
      { ...taskB, id: 'task-d', status: 'completed' },
    ];
    // 2 out of 4 completed = 50%
    expect(calculateCompletionPercentage(tasks)).toBe(50);
    expect(calculateCompletionPercentage([])).toBe(0);
  });
});

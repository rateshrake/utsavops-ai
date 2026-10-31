// =============================================================================
// UtsavOps AI — Pure Budget & Dependency Domain Logic
// Extracted pure functions for deterministic financial & scheduling math.
// =============================================================================

import type {
  BudgetCategory,
  TimelineTask,
  TaskStatus,
  CategoryAdjustment,
} from '../types/event';

/**
 * Sums allocated amounts across all budget categories.
 *
 * @param categories - Array of budget categories with allocated amounts.
 * @returns Total allocated amount in INR.
 */
export function calculateTotalAllocated(categories: BudgetCategory[]): number {
  return categories.reduce((sum, c) => sum + (c.allocatedAmount || 0), 0);
}

/**
 * Sums actual incurred costs across all budget categories.
 *
 * @param categories - Array of budget categories with actual costs.
 * @returns Total actual incurred cost in INR.
 */
export function calculateTotalActual(categories: BudgetCategory[]): number {
  return categories.reduce((sum, c) => sum + (c.actualCost || 0), 0);
}

/**
 * Computes per-guest cost with safe zero-division handling.
 *
 * @param totalAmount - Total budget or actual spend in INR.
 * @param guestCount - Number of guests attending.
 * @returns Per-head cost rounded to the nearest integer.
 */
export function calculatePerGuestCost(totalAmount: number, guestCount: number): number {
  if (guestCount <= 0) return 0;
  return Math.round(totalAmount / guestCount);
}

/**
 * Computes budget variance and over/under status.
 *
 * @param totalBudget - Cap total budget.
 * @param allocatedAmount - Total currently allocated.
 * @returns Object with diff amount, percentage variance, and boolean isOver status.
 */
export function calculateBudgetVariance(
  totalBudget: number,
  allocatedAmount: number
): { diff: number; percent: number; isOver: boolean } {
  const diff = allocatedAmount - totalBudget;
  const percent = totalBudget > 0 ? (diff / totalBudget) * 100 : 0;
  return {
    diff,
    percent: Math.round(percent * 10) / 10,
    isOver: diff > 0,
  };
}

/**
 * Determines if a task is blocked by unfinished parent dependencies in the acyclic graph.
 *
 * @param task - Timeline task being evaluated.
 * @param taskMap - Lookup map of taskId to TimelineTask object.
 * @returns Object with boolean isBlocked flag and array of unresolved parent task titles.
 */
export function isTaskBlocked(
  task: TimelineTask,
  taskMap: Record<string, TimelineTask>
): { isBlocked: boolean; unresolvedParentTitles: string[] } {
  if (task.status === 'completed') {
    return { isBlocked: false, unresolvedParentTitles: [] };
  }

  const unresolvedIds = task.dependsOnTaskIds.filter((pId) => {
    const parent = taskMap[pId];
    return parent && parent.status !== 'completed';
  });

  const unresolvedParentTitles = unresolvedIds
    .map((pId) => taskMap[pId]?.title || pId)
    .filter(Boolean);

  return {
    isBlocked: unresolvedIds.length > 0,
    unresolvedParentTitles,
  };
}

/**
 * Determines if a task is overdue relative to a reference date.
 *
 * @param dueDate - ISO due date string (YYYY-MM-DD).
 * @param status - Current status of the task.
 * @param referenceDate - Optional reference date to compare against (defaults to today).
 * @returns True if the task is pending/delayed and its dueDate is past the reference date.
 */
export function isTaskOverdue(
  dueDate: string,
  status: TaskStatus,
  referenceDate: Date = new Date()
): boolean {
  if (status === 'completed') return false;
  return new Date(dueDate) < referenceDate;
}

/**
 * Computes timeline task completion velocity percentage.
 *
 * @param tasks - Array of timeline tasks.
 * @returns Completion percentage between 0 and 100.
 */
export function calculateCompletionPercentage(tasks: TimelineTask[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

/**
 * Applies category delta adjustments to an existing category list without wiping unadjusted items.
 *
 * @param originalCategories - Baseline budget categories.
 * @param adjustments - Category adjustments to apply.
 * @returns New array of categories with revised amounts.
 */
export function applyCategoryAdjustments(
  originalCategories: BudgetCategory[],
  adjustments: CategoryAdjustment[]
): BudgetCategory[] {
  const adjMap = new Map(adjustments.map((a) => [a.categoryId, a.newAmount]));

  return originalCategories.map((cat) => {
    const adjustedAmount = adjMap.get(cat.id);
    if (adjustedAmount !== undefined) {
      return {
        ...cat,
        allocatedAmount: adjustedAmount,
      };
    }
    return cat;
  });
}

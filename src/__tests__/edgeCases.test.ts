// =============================================================================
// UtsavOps AI — Boundary & Edge Case Resilience Tests
// Validates stability against extreme inputs (zero guests, 0 budget, invalid dates).
// =============================================================================

import { describe, it, expect } from 'vitest';
import { generateSmartDemoPlan } from '../services/smartDemoService';
import { calculatePerGuestCost, calculateBudgetVariance } from '../utils/budgetLogic';
import type { EventProfile } from '../types/event';

describe('Boundary and Edge Case Resilience', () => {
  const baseProfile: EventProfile = {
    occasion: 'Birthday Party',
    title: 'Minimal Birthday',
    date: '2027-05-10',
    totalBudget: 50000,
    guestCount: 25,
    atmosphere: 'Intimate',
    ageGroupMix: 'Young Adults',
    prioritiesRanked: ['Food & Catering'],
    mustHaves: [],
  };

  it('safely handles guestCount = 0 without divide-by-zero crashes', () => {
    const zeroGuestProfile = { ...baseProfile, guestCount: 0 };
    const plan = generateSmartDemoPlan(zeroGuestProfile);

    expect(plan.budgetCategories.length).toBeGreaterThan(0);
    expect(plan.budgetCategories.every((c) => isFinite(c.allocatedAmount))).toBe(true);

    const perHead = calculatePerGuestCost(50000, 0);
    expect(perHead).toBe(0);
  });

  it('safely handles totalBudget = 0 by enforcing a realistic floor', () => {
    const zeroBudgetProfile = { ...baseProfile, totalBudget: 0 };
    const plan = generateSmartDemoPlan(zeroBudgetProfile);

    expect(plan.budgetCategories.length).toBeGreaterThan(0);
    const sum = plan.budgetCategories.reduce((a, b) => a + b.allocatedAmount, 0);
    expect(sum).toBeGreaterThanOrEqual(10000);
  });

  it('handles empty prioritiesRanked array by using balanced fallback envelopes', () => {
    const emptyPriorityProfile = { ...baseProfile, prioritiesRanked: [] };
    const plan = generateSmartDemoPlan(emptyPriorityProfile);

    expect(plan.budgetCategories.length).toBeGreaterThan(0);
    const sum = plan.budgetCategories.reduce((a, b) => a + b.allocatedAmount, 0);
    expect(sum).toBe(50000);
  });

  it('handles invalid date strings gracefully with forward scheduling fallback', () => {
    const invalidDateProfile = { ...baseProfile, date: 'invalid-date-string' };
    const plan = generateSmartDemoPlan(invalidDateProfile);

    expect(plan.timelineTasks.length).toBeGreaterThan(0);
    for (const task of plan.timelineTasks) {
      expect(task.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('calculates budget variance correctly for exact, under, and over scenarios', () => {
    const exact = calculateBudgetVariance(100000, 100000);
    expect(exact.diff).toBe(0);
    expect(exact.percent).toBe(0);
    expect(exact.isOver).toBe(false);

    const over = calculateBudgetVariance(100000, 120000);
    expect(over.diff).toBe(20000);
    expect(over.percent).toBe(20);
    expect(over.isOver).toBe(true);

    const under = calculateBudgetVariance(100000, 85000);
    expect(under.diff).toBe(-15000);
    expect(under.percent).toBe(-15);
    expect(under.isOver).toBe(false);
  });
});

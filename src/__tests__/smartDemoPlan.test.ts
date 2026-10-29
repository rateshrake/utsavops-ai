// =============================================================================
// UtsavOps AI — Unit Tests for Smart Demo Plan Generation
// =============================================================================

import { describe, it, expect } from 'vitest';
import { generateSmartDemoPlan } from '../services/planService';
import { DEFAULT_PROFILE } from '../data/defaults';
import type { EventProfile } from '../types/event';

describe('generateSmartDemoPlan', () => {
  it('enforces exact mathematical budget balance (sum === totalBudget)', () => {
    const profile: EventProfile = {
      ...DEFAULT_PROFILE,
      totalBudget: 1500000,
      guestCount: 250,
    };

    const plan = generateSmartDemoPlan(profile);
    const sum = plan.budgetCategories.reduce((acc, cat) => acc + cat.allocatedAmount, 0);

    expect(sum).toBe(1500000);
    expect(plan.budgetCategories.length).toBeGreaterThan(5);
  });

  it('adapts when budget is small or large with zero arithmetic errors', () => {
    for (const testBudget of [150000, 800000, 3500000, 10000000]) {
      const plan = generateSmartDemoPlan({
        ...DEFAULT_PROFILE,
        totalBudget: testBudget,
      });
      const sum = plan.budgetCategories.reduce((acc, cat) => acc + cat.allocatedAmount, 0);
      expect(sum).toBe(testBudget);
    }
  });

  it('honors priority ranking by giving higher weight to #1 ranked priority', () => {
    // When Catering is #1
    const planCateringFirst = generateSmartDemoPlan({
      ...DEFAULT_PROFILE,
      totalBudget: 1000000,
      prioritiesRanked: [
        'Food & Catering',
        'Venue & Hospitality',
        'Decor & Ambience',
        'Photography & Memories',
      ],
    });

    // When Photography is #1
    const planPhotoFirst = generateSmartDemoPlan({
      ...DEFAULT_PROFILE,
      totalBudget: 1000000,
      prioritiesRanked: [
        'Photography & Memories',
        'Food & Catering',
        'Venue & Hospitality',
        'Decor & Ambience',
      ],
    });

    const photoUnderCat = planCateringFirst.budgetCategories.find((c) => c.id === 'photography')!;
    const photoFirst = planPhotoFirst.budgetCategories.find((c) => c.id === 'photography')!;

    expect(photoFirst.allocatedAmount).toBeGreaterThan(photoUnderCat.allocatedAmount);
  });

  it('excludes deselected categories and redistributes budget to active envelopes', () => {
    // Profile with Entertainment & Music excluded
    const planWithoutMusic = generateSmartDemoPlan({
      ...DEFAULT_PROFILE,
      totalBudget: 1000000,
      prioritiesRanked: [
        'Food & Catering',
        'Venue & Hospitality',
        'Decor & Ambience',
        'Photography & Memories',
      ],
    });

    const musicCat = planWithoutMusic.budgetCategories.find((c) => c.id === 'entertainment');
    expect(musicCat).toBeUndefined();

    // Sum is still exact
    const sum = planWithoutMusic.budgetCategories.reduce((acc, cat) => acc + cat.allocatedAmount, 0);
    expect(sum).toBe(1000000);

    // Timeline also excludes music task
    const musicTask = planWithoutMusic.timelineTasks.find((t) => t.id === 'book-dj');
    expect(musicTask).toBeUndefined();
  });

  it('schedules timeline tasks backward from event date with no future leaks', () => {
    const eventDateStr = '2026-12-15';
    const plan = generateSmartDemoPlan({
      ...DEFAULT_PROFILE,
      date: eventDateStr,
    });

    expect(plan.timelineTasks.length).toBeGreaterThan(10);

    // Final day-of execution task must be on the event date
    const finalTask = plan.timelineTasks.find((t) => t.id === 'execution-day');
    expect(finalTask).toBeDefined();
    expect(finalTask?.dueDate).toBe(eventDateStr);

    // Every other task must have dueDate <= eventDate
    for (const task of plan.timelineTasks) {
      expect(task.dueDate <= eventDateStr).toBe(true);
    }
  });

  it('calibrates crisis scenario financial impacts dynamically to total budget', () => {
    const planLow = generateSmartDemoPlan({
      ...DEFAULT_PROFILE,
      totalBudget: 500000,
      guestCount: 100,
    });

    const planHigh = generateSmartDemoPlan({
      ...DEFAULT_PROFILE,
      totalBudget: 5000000,
      guestCount: 500,
    });

    const venueCrisisLow = planLow.crisisScenarios[0];
    const venueCrisisHigh = planHigh.crisisScenarios[0];

    // Negative impacts, so Math.abs of high should be larger
    expect(Math.abs(venueCrisisHigh.financialImpact)).toBeGreaterThan(
      Math.abs(venueCrisisLow.financialImpact)
    );
  });

  it('includes answers from smart clarifying questions into the plan summary', () => {
    const plan = generateSmartDemoPlan({
      ...DEFAULT_PROFILE,
      smartQuestions: [
        {
          id: 'q1',
          question: 'Weather backup?',
          contextWhyAsked: 'Monsoon risk',
          userAnswer: 'Covered AC hall booked',
        },
      ],
    });

    expect(plan.planSummary).toContain('Covered AC hall booked');
  });
});

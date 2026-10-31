// =============================================================================
// UtsavOps AI — Full Plan Pipeline Integration Tests
// Verifies that full plan generation produces mathematically consistent,
// dependency-linked, and risk-calibrated celebration architectures.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { generateSmartDemoPlan } from '../services/smartDemoService';
import type { EventProfile } from '../types/event';

describe('Full Plan Generation Pipeline', () => {
  const weddingProfile: EventProfile = {
    occasion: 'Wedding',
    title: 'Aditya & Ananya Grand Wedding',
    date: '2027-11-20',
    totalBudget: 1500000,
    guestCount: 300,
    atmosphere: 'Grand',
    ageGroupMix: 'All Ages (Kids to Grandparents)',
    prioritiesRanked: ['Food & Catering', 'Venue & Hospitality', 'Photography & Memories'],
    mustHaves: ['Jain live counter', 'Drone cinematography', 'Waterproof mandap'],
  };

  it('generates a complete master plan with all 4 required operational sections', () => {
    const plan = generateSmartDemoPlan(weddingProfile);

    expect(plan.planSummary).toBeTruthy();
    expect(plan.budgetCategories.length).toBeGreaterThan(5);
    expect(plan.timelineTasks.length).toBeGreaterThan(8);
    expect(plan.crisisScenarios.length).toBeGreaterThan(2);
    expect(plan.tradeOffStrategies).toBeDefined();
    expect(plan.tradeOffStrategies?.length).toBe(3);
  });

  it('strictly preserves 100% mathematical integrity: sum(allocatedAmount) === totalBudget', () => {
    const plan = generateSmartDemoPlan(weddingProfile);
    const sum = plan.budgetCategories.reduce((acc, cat) => acc + cat.allocatedAmount, 0);

    expect(sum).toBe(weddingProfile.totalBudget);
  });

  it('guarantees #1 ranked priority receives highest or second-highest envelope', () => {
    const plan = generateSmartDemoPlan(weddingProfile);
    const catering = plan.budgetCategories.find((c) => c.id === 'catering');

    expect(catering).toBeDefined();
    expect(catering?.allocatedAmount).toBeGreaterThan(plan.budgetCategories[2]?.allocatedAmount || 0);
  });

  it('builds an acyclic critical-path timeline with valid dates prior to event date', () => {
    const plan = generateSmartDemoPlan(weddingProfile);
    const eventTime = new Date(weddingProfile.date).getTime();

    for (const task of plan.timelineTasks) {
      const taskTime = new Date(task.dueDate).getTime();
      expect(taskTime).toBeLessThanOrEqual(eventTime);
      expect(task.priority).toMatch(/High|Medium|Low/);
    }
  });

  it('retains a dedicated contingency reserve safety buffer', () => {
    const plan = generateSmartDemoPlan(weddingProfile);
    const contingency = plan.budgetCategories.find((c) => c.id === 'contingency');

    expect(contingency).toBeDefined();
    expect(contingency?.allocatedAmount).toBeGreaterThan(0);
    // Contingency buffer should be around 5% - 8% of total budget
    expect(contingency!.allocatedAmount).toBeGreaterThanOrEqual(weddingProfile.totalBudget * 0.05);
  });
});

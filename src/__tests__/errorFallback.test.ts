// =============================================================================
// UtsavOps AI — Error Fallback Pipeline Tests
// Verifies graceful degradation and zero-crash user experience when AI services fail.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { generateSmartQuestions } from '../services/smartQuestionsService';
import { generateSmartDemoPlan } from '../services/smartDemoService';
import type { EventProfile } from '../types/event';

describe('Error Fallback Pipelines', () => {
  const profile: EventProfile = {
    occasion: 'Anniversary',
    title: 'Silver Jubilee Gala',
    date: '2027-08-15',
    totalBudget: 400000,
    guestCount: 80,
    atmosphere: 'Balanced',
    ageGroupMix: 'Family & Friends',
    prioritiesRanked: ['Venue & Hospitality', 'Food & Catering'],
    mustHaves: ['Photobooth'],
  };

  it('generateSmartQuestions returns curated fallback defaults without throwing when API is unavailable', async () => {
    // When no API key is available, generateSmartQuestions catches the error and returns defaults
    const questions = await generateSmartQuestions(profile);

    expect(questions).toBeDefined();
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0]?.question).toBeTruthy();
    expect(questions[0]?.contextWhyAsked).toBeTruthy();
  });

  it('generateSmartDemoPlan acts as a fully self-contained offline fallback engine', () => {
    const fallbackPlan = generateSmartDemoPlan(profile);

    expect(fallbackPlan.planSummary).toContain('Silver Jubilee Gala');
    expect(fallbackPlan.budgetCategories.length).toBeGreaterThan(0);

    const sum = fallbackPlan.budgetCategories.reduce((acc, cat) => acc + cat.allocatedAmount, 0);
    expect(sum).toBe(profile.totalBudget);
  });
});

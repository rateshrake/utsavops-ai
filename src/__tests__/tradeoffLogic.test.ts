// =============================================================================
// UtsavOps AI — Unit Tests for Dynamic Trade-Off & Shock Simulation Math
// =============================================================================

import { describe, it, expect } from 'vitest';
import { calculateSmartTradeOffStrategies } from '../utils/tradeoffLogic';
import type { EventProfile, BudgetCategory } from '../types/event';

describe('calculateSmartTradeOffStrategies', () => {
  const profile10k: EventProfile = {
    occasion: 'Birthday Party',
    title: 'Aarav 10th Birthday',
    totalBudget: 10000,
    guestCount: 16,
    date: '2027-04-15',
    atmosphere: 'Intimate',
    ageGroupMix: 'Kids & Families',
    prioritiesRanked: ['Food & Catering', 'Photography & Memories', 'Decor & Floral'],
    mustHaves: ['Cake', 'Photos'],
  };

  const categories10k: BudgetCategory[] = [
    {
      id: 'catering',
      name: 'Catering & Food',
      allocatedAmount: 5000,
      actualCost: 5000,
      isVerifiedQuote: true,
      notes: 'Food and cake for 16 pax',
    },
    {
      id: 'photography',
      name: 'Photography & Video',
      allocatedAmount: 3000,
      actualCost: 3000,
      isVerifiedQuote: true,
      notes: 'Photo coverage',
    },
    {
      id: 'decor',
      name: 'Decor & Floral',
      allocatedAmount: 1000,
      actualCost: 0,
      isVerifiedQuote: false,
      notes: 'Balloons and banners',
    },
    {
      id: 'contingency',
      name: 'Contingency Buffer',
      allocatedAmount: 1000,
      actualCost: 0,
      isVerifiedQuote: false,
      notes: 'Reserve buffer',
    },
  ];

  it('accurately calculates Recalculated Fund as 9,000 for a 10k budget with 10% cut (NEVER 720,000)', () => {
    const strategies = calculateSmartTradeOffStrategies(
      profile10k,
      categories10k,
      '+50 Guests Added & Budget Cut by 10%'
    );

    expect(strategies).toHaveLength(3);

    for (const strat of strategies) {
      // Must NOT be 720,000!
      expect(strat.newTotalBudget).toBe(9000);
      expect(strat.newTotalBudget).not.toBe(720000);
      expect(strat.philosophy).not.toContain('7,20,000');
      expect(strat.philosophy).not.toContain('₹2.4L');
      expect(strat.revisedSummary).toContain('9,000');
    }
  });

  it('Strategy 1 strictly shields the #1 priority (Food at 5,000) at 100%', () => {
    const strategies = calculateSmartTradeOffStrategies(
      profile10k,
      categories10k,
      '+50 Guests Added & Budget Cut by 10%'
    );

    const s1 = strategies[0];
    expect(s1.id).toBe('strat-priority-shield');

    const foodAdj = s1.categoryAdjustments.find((a) => a.categoryId === 'catering');
    expect(foodAdj).toBeDefined();
    // 100% protected: oldAmount === 5000, newAmount === 5000, delta === 0
    expect(foodAdj?.oldAmount).toBe(5000);
    expect(foodAdj?.newAmount).toBe(5000);
    expect(foodAdj?.delta).toBe(0);

    // Sum of all category adjustments newAmount must exactly equal newTotalBudget (9000)
    const totalNew = s1.categoryAdjustments.reduce((sum, a) => sum + a.newAmount, 0);
    expect(totalNew).toBe(9000);
  });

  it('scales guest surge appropriately for small 16-person event without unrealistic inflation', () => {
    const strategies = calculateSmartTradeOffStrategies(
      profile10k,
      categories10k,
      '+50 Guests Added & Budget Cut by 10%'
    );

    // For a 16-person event, guest surge is calibrated (16 + 5 = 21 pax), not +50 pax (which would be 66 pax)
    expect(strategies[0].newGuestCount).toBe(21);
    expect(strategies[0].revisedSummary).toContain('21 guests');
  });

  it('scales correctly for large 800k wedding budget', () => {
    const profile800k: EventProfile = {
      ...profile10k,
      totalBudget: 800000,
      guestCount: 250,
    };

    const categories800k: BudgetCategory[] = [
      { id: 'catering', name: 'Catering & Food', allocatedAmount: 240000, actualCost: 0, isVerifiedQuote: false, notes: '' },
      { id: 'venue', name: 'Venue & Hall', allocatedAmount: 180000, actualCost: 0, isVerifiedQuote: false, notes: '' },
      { id: 'photography', name: 'Photography & Video', allocatedAmount: 120000, actualCost: 0, isVerifiedQuote: false, notes: '' },
      { id: 'decor', name: 'Decor & Floral', allocatedAmount: 160000, actualCost: 0, isVerifiedQuote: false, notes: '' },
      { id: 'contingency', name: 'Contingency Buffer', allocatedAmount: 100000, actualCost: 0, isVerifiedQuote: false, notes: '' },
    ];

    const strategies = calculateSmartTradeOffStrategies(
      profile800k,
      categories800k,
      'Cut total budget by 10%'
    );

    expect(strategies[0].newTotalBudget).toBe(720000);
    expect(strategies[0].newGuestCount).toBe(250);
    expect(strategies[0].categoryAdjustments.reduce((sum, a) => sum + a.newAmount, 0)).toBe(720000);
  });
});

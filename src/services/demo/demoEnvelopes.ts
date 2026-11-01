// =============================================================================
// UtsavOps AI — Demo Budget Envelope Synthesis
// Builds priority-weighted, mathematically exact budget envelopes.
// =============================================================================

import type { BudgetCategory } from '../../types/event';
import { BUDGET_WEIGHTS, PRIORITY_BOOSTS } from '../../constants/budgetWeights';

interface EnvelopeDef {
  id: string;
  name: string;
  baseWeight: number;
  isSelected: boolean;
  getNotes: (amount: number) => string;
}

/**
 * Synthesizes priority-weighted, mathematically exact budget categories for demo mode.
 *
 * @param totalBudget - Budget cap in INR.
 * @param guestCount - Number of celebration guests.
 * @param occasion - Type of event (e.g. Wedding, Birthday).
 * @param atmosphere - Theme vibe (e.g. Grand, Intimate).
 * @param selectedPriorities - Ordered client priorities.
 * @returns Array of budget categories strictly summing to totalBudget.
 */
export function buildDemoEnvelopes(
  totalBudget: number,
  guestCount: number,
  occasion: string,
  atmosphere: string,
  selectedPriorities: string[]
): BudgetCategory[] {
  const hasPriority = (substring: string): boolean =>
    selectedPriorities.some((p) => p.toLowerCase().includes(substring.toLowerCase()));

  const isCateringSelected =
    hasPriority('food') || hasPriority('cater') || selectedPriorities.length < 3;
  const isVenueSelected =
    hasPriority('venue') || hasPriority('hospitality') || selectedPriorities.length < 3;
  const isDecorSelected = hasPriority('decor') || hasPriority('ambience');
  const isPhotoSelected = hasPriority('photo') || hasPriority('memories');
  const isMusicSelected =
    hasPriority('music') || hasPriority('dj') || hasPriority('entertainment');

  const envelopes: EnvelopeDef[] = [
    {
      id: 'catering',
      name: 'Catering & Food',
      baseWeight: BUDGET_WEIGHTS.CATERING,
      isSelected: isCateringSelected,
      getNotes: (amount) =>
        `₹${Math.round(amount / guestCount).toLocaleString('en-IN')}/head multi-course buffet for ${guestCount} guests, including welcome mocktails, live counters & dessert spread`,
    },
    {
      id: 'venue',
      name: 'Venue & Hospitality',
      baseWeight: BUDGET_WEIGHTS.VENUE,
      isSelected: isVenueSelected,
      getNotes: () =>
        `AC banquet/lawn capacity for ${guestCount}+ guests with separate ceremony pavilions and green rooms`,
    },
    {
      id: 'decor',
      name: 'Decor & Floral',
      baseWeight: BUDGET_WEIGHTS.DECOR,
      isSelected: isDecorSelected,
      getNotes: () =>
        `${atmosphere} theme styling, mandap/stage floral architecture, ambient fairy illumination`,
    },
    {
      id: 'photography',
      name: 'Photography & Video',
      baseWeight: BUDGET_WEIGHTS.PHOTOGRAPHY,
      isSelected: isPhotoSelected,
      getNotes: () =>
        `Candid photography & cinematic 4K video coverage, pre-event portrait shoot & drone highlights`,
    },
    {
      id: 'entertainment',
      name: 'Entertainment & Music',
      baseWeight: BUDGET_WEIGHTS.ENTERTAINMENT,
      isSelected: isMusicSelected,
      getNotes: () =>
        `Professional sound system, DJ music curation, live dhol artists & guest playlist coordination`,
    },
    {
      id: 'invitations',
      name: 'Invitations & Gifts',
      baseWeight: BUDGET_WEIGHTS.INVITATIONS,
      isSelected: true,
      getNotes: () =>
        `Interactive digital invitations, WhatsApp RSVP tracking & bespoke boxed guest favors`,
    },
    {
      id: 'beauty',
      name: 'Bridal Beauty & Styling',
      baseWeight: BUDGET_WEIGHTS.BEAUTY,
      isSelected:
        occasion.toLowerCase().includes('wedding') ||
        occasion.toLowerCase().includes('engagement') ||
        occasion.toLowerCase().includes('reception'),
      getNotes: () =>
        `Complete bridal makeup artistry, hair styling trial, sari draping & bridal mehendi package`,
    },
    {
      id: 'transport',
      name: 'Logistics & Transportation',
      baseWeight: BUDGET_WEIGHTS.TRANSPORT,
      isSelected: true,
      getNotes: () =>
        `Decorated bridal transfer car, outstation guest transit shuttles & valet parking management`,
    },
    {
      id: 'stationery',
      name: 'Stationery & Day Coordination',
      baseWeight: BUDGET_WEIGHTS.STATIONERY,
      isSelected: true,
      getNotes: () =>
        `Welcome signage, printed ceremony schedules, place markers & day-of floor assistant`,
    },
    {
      id: 'accommodation',
      name: 'Guest Accommodation',
      baseWeight: BUDGET_WEIGHTS.ACCOMMODATION,
      isSelected: true,
      getNotes: () =>
        `Subsidized room reservations & welcome check-in kits for key outstation guests`,
    },
    {
      id: 'contingency',
      name: 'Contingency Reserve',
      baseWeight: BUDGET_WEIGHTS.CONTINGENCY,
      isSelected: true,
      getNotes: (amount) =>
        `${((amount / totalBudget) * 100).toFixed(1)}% reserve safety buffer strictly locked for last-minute headcount surges or price variances`,
    },
  ];

  const activeEnvelopes = envelopes.filter((e) => e.isSelected);
  const topPriorityStr = selectedPriorities[0]?.toLowerCase() ?? '';
  const secondPriorityStr = selectedPriorities[1]?.toLowerCase() ?? '';

  const weightedEnvelopes = activeEnvelopes.map((env) => {
    let weight = env.baseWeight;
    const nameLower = env.name.toLowerCase();
    if (topPriorityStr && nameLower.includes(topPriorityStr.slice(0, 4))) {
      weight += PRIORITY_BOOSTS.TOP_PRIORITY_BOOST;
    } else if (secondPriorityStr && nameLower.includes(secondPriorityStr.slice(0, 4))) {
      weight += PRIORITY_BOOSTS.SECOND_PRIORITY_BOOST;
    }
    return { ...env, weight };
  });

  const totalWeight = weightedEnvelopes.reduce((acc, e) => acc + e.weight, 0);

  let runningSum = 0;
  return weightedEnvelopes.map((env, idx) => {
    let amount = Math.round((env.weight / totalWeight) * totalBudget);
    if (idx === weightedEnvelopes.length - 1) {
      amount = totalBudget - runningSum;
    } else {
      runningSum += amount;
    }
    return {
      id: env.id,
      name: env.name,
      allocatedAmount: amount,
      actualCost: 0,
      isVerifiedQuote: false,
      notes: env.getNotes(amount),
    };
  });
}

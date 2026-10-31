// =============================================================================
// UtsavOps AI — Budget Plan Generation Service
// Synthesizes priority-weighted budget allocations with mathematical integrity.
// =============================================================================

import type { EventProfile, BudgetCategory } from '../types/event';
import { callLangChain } from './langchainClient';

export const budgetSchema = {
  type: 'object',
  properties: {
    budgetCategories: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          allocatedAmount: { type: 'number' },
          actualCost: { type: 'number' },
          isVerifiedQuote: { type: 'boolean' },
          notes: { type: 'string' },
        },
        required: ['id', 'name', 'allocatedAmount', 'actualCost', 'isVerifiedQuote', 'notes'],
      },
    },
    planSummary: { type: 'string' },
  },
  required: ['budgetCategories', 'planSummary'],
};

/**
 * Calls AI LLM via LangChain to generate an Indian celebration budget breakdown.
 *
 * @param profile - The client celebration profile with budget, guests, and priorities.
 * @returns Object containing the array of budget envelopes and an executive plan summary.
 * @throws Error if the LLM call fails or returns non-conforming JSON.
 */
export async function generateBudgetPlan(
  profile: EventProfile
): Promise<{ budgetCategories: BudgetCategory[]; planSummary: string }> {
  const systemInstruction = `You are an elite Indian celebration director and senior financial planner with 15+ years managing luxury and mid-scale Indian weddings, community celebrations, and corporate galas.
You enforce strict mathematical integrity: the sum of 'allocatedAmount' across all categories must EXACTLY equal the client's total budget.
You protect the client's #1 ranked priority with the highest or second-highest proportional allocation, maintain standard Indian celebration envelopes (Food, Venue, Decor, Photography, Entertainment, Invites, Beauty, Logistics, Contingency 5-7.5%), and provide granular per-unit cost notes.`;

  const prompt = `Generate a realistic, mathematically balanced budget breakdown tailored to the following client brief:
- Occasion: ${profile.occasion}
- Event Title: "${profile.title}"
- Event Date: ${profile.date}
- Total Budget: ₹${profile.totalBudget.toLocaleString('en-IN')}
- Expected Guest Count: ${profile.guestCount} (Target Per-Head Budget: ₹${Math.round(profile.totalBudget / Math.max(1, profile.guestCount)).toLocaleString('en-IN')})
- Atmosphere / Vibe: ${profile.atmosphere}
- Age Group Mix: ${profile.ageGroupMix}
- Non-Negotiable Priority Ranking (Highest to Lowest): ${profile.prioritiesRanked.join(' > ')}
- Specific Must-Haves: ${profile.mustHaves.length > 0 ? profile.mustHaves.join(', ') : 'None specified'}

FINANCIAL & OPERATIONAL RULES:
1. MATHEMATICAL INTEGRITY (STRICT): The sum of 'allocatedAmount' across ALL budget categories must EXACTLY equal ₹${profile.totalBudget.toLocaleString('en-IN')}. Verify the arithmetic before returning.
2. PRIORITY-WEIGHTED ENVELOPES: The #1 ranked priority ("${profile.prioritiesRanked[0] ?? 'Catering & Food'}") must receive the highest or second-highest proportional allocation. Low-ranked categories should be lean.
3. REALISTIC INDIAN EVENT CATEGORIES: Include standard envelopes: Catering & Food, Venue & Banquet Hall, Decor & Floral, Photography & Videography, Entertainment & Music, Invitations & Gifts, Bridal Beauty & Trousseau, Logistics & Transportation, and a dedicated Contingency Buffer (5%–7.5%).
4. INSIGHTFUL NOTES: In each category's 'notes', provide realistic unit-level context (e.g. ₹X/plate for food, hours of coverage for photography, square footage/fabric styling for decor).
5. EXECUTIVE PLAN SUMMARY: Write a sharp 2-3 sentence strategic rationale explaining how this allocation protects the client's vision while safeguarding against price overruns.`;

  const raw = await callLangChain(prompt, budgetSchema, systemInstruction);
  return JSON.parse(raw) as { budgetCategories: BudgetCategory[]; planSummary: string };
}

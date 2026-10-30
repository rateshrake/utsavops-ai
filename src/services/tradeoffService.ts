// =============================================================================
// UtsavOps AI — Trade-Off & Crisis Simulator Service
// Generates 3 distinct AI trade-off strategies honoring priority rankings.
// =============================================================================

import type {
  EventProfile,
  BudgetCategory,
  TradeOffStrategy,
} from '../types/event';
import { callGemini } from './geminiClient';
import { calculateSmartTradeOffStrategies } from '../utils/tradeoffLogic';

export { calculateSmartTradeOffStrategies };

const tradeOffSchema = {
  type: 'object',
  properties: {
    strategies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          philosophy: { type: 'string' },
          revisedSummary: { type: 'string' },
          newTotalBudget: { type: 'number' },
          newGuestCount: { type: 'number' },
          newDate: { type: 'string' },
          actionableCompromises: {
            type: 'array',
            items: { type: 'string' },
          },
          categoryAdjustments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                categoryId: { type: 'string' },
                categoryName: { type: 'string' },
                oldAmount: { type: 'number' },
                newAmount: { type: 'number' },
                delta: { type: 'number' },
                notes: { type: 'string' },
              },
              required: [
                'categoryId',
                'categoryName',
                'oldAmount',
                'newAmount',
                'delta',
                'notes',
              ],
            },
          },
        },
        required: [
          'id',
          'title',
          'philosophy',
          'revisedSummary',
          'actionableCompromises',
          'categoryAdjustments',
        ],
      },
    },
  },
  required: ['strategies'],
};

export async function simulateTradeOffs(
  profile: EventProfile,
  currentCategories: BudgetCategory[],
  shockDescription: string
): Promise<TradeOffStrategy[]> {
  const currentCategoryLines = currentCategories
    .map(
      (c) =>
        `- Category ID: "${c.id}" | Name: "${c.name}" | Allocated: ₹${c.allocatedAmount.toLocaleString(
          'en-IN'
        )} (Actual: ₹${c.actualCost.toLocaleString('en-IN')})`
    )
    .join('\n');

  const topPriority = profile.prioritiesRanked[0] || 'Catering & Food';
  const perHeadBudget = Math.round(profile.totalBudget / Math.max(1, profile.guestCount));

  const systemInstruction = `You are an elite Indian celebration director, procurement arbitrator, and financial crisis strategist with 15+ years managing luxury and mid-scale Indian weddings, community celebrations, and corporate galas.
When an event plan encounters a sudden constraint shock (e.g., guest headcount surges, surprise budget cuts, date changes, vendor price hikes), you never panic or wipe the plan.
Instead, you perform precise financial re-engineering rooted in real-world Indian celebration mechanics:
- Per-plate buffet economics, live counters (chaat/kulfi/halwai), and separate prep for Jain/dietary requirements.
- Venue timing, hall exclusivity, generator fuel charges, and local 10 PM sound curfew rules.
- Flower economics (swapping expensive imported Dutch orchids/lilies for opulent local marigold, rajnigandha, and fairy lighting).
- Photo/video candid vs traditional crews, album rightsizing, and electronic WhatsApp invitations.
You demand mathematical precision: every adjustment delta must equal (newAmount - oldAmount), and category adjustments must balance realistically.`;

  // Sanitize and limit shock description to prevent prompt injection and token overflow
  const sanitizedShock = shockDescription
    .replace(/[^\w\s.,!?:;%₹+\-–—/()'"“”]/gi, '')
    .trim()
    .slice(0, 300);

  const prompt = `A sudden constraint shock has occurred for the following celebration plan:

CELEBRATION PROFILE:
- Occasion: ${profile.occasion} ("${profile.title}")
- Event Date: ${profile.date}
- Current Guests: ${profile.guestCount} (Per-Head Budget: ₹${perHeadBudget.toLocaleString('en-IN')})
- Total Budget: ₹${profile.totalBudget.toLocaleString('en-IN')}
- CLIENT PRIORITY HIERARCHY (Strict Rank Order): ${profile.prioritiesRanked.join(' > ')}
- NON-NEGOTIABLE MUST-HAVES: ${profile.mustHaves.length > 0 ? profile.mustHaves.join(', ') : 'None specified'}

CURRENT ACTIVE BUDGET ALLOCATIONS (Use exact Category IDs):
${currentCategoryLines}

SUDDEN CONSTRAINT SHOCK / EVENT:
"""${sanitizedShock}"""

RE-ENGINEERING DIRECTIVES:
1. DO NOT restart from scratch or wipe existing categories. Adapt the existing plan dynamically.
2. Generate exactly 3 distinct Trade-Off Strategies to give the client clear choices:
   - Strategy 1 ("Priority-Shielding / The VIP Fortress"):
     * STRICT MANDATE: Protect the user's #1 ranked priority ("${topPriority}") at all costs. The #1 priority must NEVER be reduced (delta >= 0).
     * Absorb the shock by making targeted surgical cuts to lowest-ranked priorities, paper invitations (switch to animated e-invites), luxury favors, and non-structural decor props.
   - Strategy 2 ("Value Engineering & Unit Optimization"):
     * Keep 100% of the guest list and core grandeur, but re-engineer unit-rate economics.
     * Restructure buffet menus (e.g. trim 6 live counters to 4 crowd-pleasers), switch imported florals for lavish seasonal Indian blooms, book daytime muhurat decor setup to eliminate midnight crew overtime.
   - Strategy 3 ("Harmonious Proportional Sharing"):
     * Distribute lean 4%–8% micro-optimizations across all secondary and non-critical envelopes proportionally.
     * Prevents any single vendor relationship from being strained while quietly absorbing the shock.

3. FOR EACH OF THE 3 STRATEGIES:
   - id: Unique clean slug (e.g., 'strat-priority-shield', 'strat-unit-optimize', 'strat-proportional').
   - title: Crisp, compelling Indian celebration strategy title.
   - philosophy: 2 sentences explaining the strategic rationale and why it protects client peace of mind.
   - categoryAdjustments: Array of affected categories.
     * categoryId: MUST match the exact Category ID from the list above (e.g. "${currentCategories[0]?.id || 'cat-food'}").
     * categoryName: Name of the category.
     * oldAmount: Current allocated amount in INR.
     * newAmount: Revised allocated amount in INR.
     * delta: Exactly (newAmount - oldAmount). Negative for savings/cuts, positive for increases.
     * notes: Actionable, realistic operational note explaining the specific Indian celebration compromise.
   - actionableCompromises: 3–4 practical bullet points outlining steps to take immediately.
   - newTotalBudget: Revised total budget in INR (reflecting any new budget if changed, or same as ₹${profile.totalBudget}).
   - newGuestCount: Revised guest count if altered by the shock, or ${profile.guestCount}.
   - newDate: Revised date in YYYY-MM-DD if altered by the shock, or "${profile.date}".
   - revisedSummary: 2-3 sentence executive summary explaining net operational impact.`;

  try {
    const raw = await callGemini(prompt, tradeOffSchema, systemInstruction);
    const parsed = JSON.parse(raw) as { strategies: TradeOffStrategy[] };
    return parsed.strategies;
  } catch (err) {
    console.warn('[UtsavOps AI] Live trade-off simulation failed, falling back to smart calibrated strategies:', err);
    return calculateSmartTradeOffStrategies(profile, currentCategories, sanitizedShock);
  }
}

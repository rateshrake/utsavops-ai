// =============================================================================
// UtsavOps AI — Pure Trade-Off & Shock Simulation Domain Logic
// Generates mathematically calibrated trade-off strategies matching the user's
// actual budget (whether ₹10,000, ₹80,000, or ₹80,00,000), guest count, and priorities.
// =============================================================================

import type {
  EventProfile,
  BudgetCategory,
  TradeOffStrategy,
  CategoryAdjustment,
} from '../types/event';
import { TRADEOFF_CUT_RATES, CRISIS_SCALING } from '../constants/budgetWeights';

const fmtINR = (n: number): string => `₹${n.toLocaleString('en-IN')}`;

/**
 * Checks if a category name matches a priority keyword (case-insensitive).
 *
 * @param categoryName - The name of the budget category to inspect (e.g. "Catering & Food").
 * @param priorityName - The client's ranked priority name (e.g. "Food & Catering").
 * @returns True if the category matches the priority domain keywords.
 */
function matchPriority(categoryName: string, priorityName?: string): boolean {
  if (!priorityName) return false;
  const p = priorityName.toLowerCase();
  const c = categoryName.toLowerCase();
  if (p.includes('cater') || p.includes('food')) return c.includes('cater') || c.includes('food');
  if (p.includes('venue') || p.includes('hall')) return c.includes('venue') || c.includes('hospitality');
  if (p.includes('photo') || p.includes('video')) return c.includes('photo') || c.includes('video');
  if (p.includes('decor') || p.includes('flower')) return c.includes('decor') || c.includes('floral');
  if (p.includes('music') || p.includes('dj') || p.includes('entertain'))
    return c.includes('music') || c.includes('dj') || c.includes('entertain');
  return c.includes(p.slice(0, 4));
}

/**
 * Dynamically computes 3 trade-off strategies scaled to the user's REAL event parameters.
 * Guarantees mathematical budget integrity where sum(newAmount) strictly equals newTotalBudget.
 *
 * @param profile - Event profile containing budget cap, headcount, occasion, and ranked priorities.
 * @param categories - Current allocated budget categories to adjust.
 * @param shockDescription - Description of the constraint shock (e.g. "+50 Guests Added & Budget Cut by 10%").
 * @returns Array of 3 distinct, mathematically balanced TradeOffStrategy objects.
 */
export function calculateSmartTradeOffStrategies(
  profile: EventProfile,
  categories: BudgetCategory[],
  shockDescription?: string
): TradeOffStrategy[] {
  const currentTotal =
    categories.length > 0
      ? categories.reduce((sum, c) => sum + (c.allocatedAmount || 0), 0)
      : profile.totalBudget || 10000;

  const baseBudget = profile.totalBudget > 0 ? profile.totalBudget : currentTotal;
  const guestCount = Math.max(1, profile.guestCount || 1);
  const desc = (shockDescription || '').toLowerCase();

  // 1. Determine shock impact on total budget
  const hasBudgetCut =
    desc.includes('cut') ||
    desc.includes('10%') ||
    desc.includes('reduce') ||
    desc.includes('constraint') ||
    desc.includes('shrink');

  const newTotalBudget = hasBudgetCut
    ? Math.round(baseBudget * (1 - TRADEOFF_CUT_RATES.BUDGET_SHOCK_PCT))
    : baseBudget;

  // 2. Determine shock impact on guest count
  const hasGuestSurge =
    desc.includes('extra guest') ||
    desc.includes('+50') ||
    desc.includes('guests added') ||
    desc.includes('attendance surge');

  const surgeAmount =
    guestCount <= 30
      ? Math.max(5, Math.round(guestCount * CRISIS_SCALING.GUEST_SURGE_SMALL_EVENT_PCT))
      : 50;
  const newGuestCount = hasGuestSurge ? guestCount + surgeAmount : guestCount;

  // 3. Determine shock impact on event date
  let newDate = profile.date;
  if (desc.includes('earlier') || desc.includes('2 weeks')) {
    const d = new Date(profile.date);
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() - 14);
      newDate = d.toISOString().split('T')[0];
    }
  }

  // Work with active categories or synthetic defaults if categories array is empty
  const workingCats =
    categories.length > 0
      ? categories
      : [
          {
            id: 'catering',
            name: 'Catering & Food',
            allocatedAmount: Math.round(baseBudget * 0.35),
            actualCost: 0,
            isVerifiedQuote: false,
            notes: 'Catering baseline',
          },
          {
            id: 'venue',
            name: 'Venue & Hall',
            allocatedAmount: Math.round(baseBudget * 0.25),
            actualCost: 0,
            isVerifiedQuote: false,
            notes: 'Venue baseline',
          },
          {
            id: 'photography',
            name: 'Photography & Video',
            allocatedAmount: Math.round(baseBudget * 0.15),
            actualCost: 0,
            isVerifiedQuote: false,
            notes: 'Photography baseline',
          },
          {
            id: 'decor',
            name: 'Decor & Floral',
            allocatedAmount: Math.round(baseBudget * 0.15),
            actualCost: 0,
            isVerifiedQuote: false,
            notes: 'Decor baseline',
          },
          {
            id: 'contingency',
            name: 'Contingency Buffer',
            allocatedAmount: Math.round(baseBudget * 0.1),
            actualCost: 0,
            isVerifiedQuote: false,
            notes: 'Contingency baseline',
          },
        ];

  const topPriorityName = profile.prioritiesRanked?.[0] || 'Food & Catering';
  const topCatIndex = workingCats.findIndex((c) => matchPriority(c.name, topPriorityName));
  const topCat = topCatIndex !== -1 ? workingCats[topCatIndex] : workingCats[0];

  /**
   * Reconciles envelope allocations so their arithmetic sum exactly matches targetTotal.
   * Offsets any rounding drift against the contingency envelope or last non-primary category.
   *
   * @param amounts - Array of allocated amounts across envelopes.
   * @param targetTotal - Target total budget to match exactly.
   * @returns Adjusted amounts strictly summing to targetTotal.
   */
  const reconcileEnvelopes = (amounts: number[], targetTotal: number): number[] => {
    const currentSum = amounts.reduce((a, b) => a + b, 0);
    const diff = targetTotal - currentSum;
    if (diff === 0) return amounts;

    // Apply diff to contingency if exists, otherwise to last non-top category
    const res = [...amounts];
    const contingencyIdx = workingCats.findIndex((c) => c.id.includes('contingency'));
    const targetIdx =
      contingencyIdx !== -1 && contingencyIdx !== topCatIndex
        ? contingencyIdx
        : workingCats.length - 1;

    res[targetIdx] = Math.max(0, res[targetIdx] + diff);
    return res;
  };

  // =========================================================================
  // STRATEGY 1: Priority-Shielding / The Fortress ⭐
  // Strictly protects the #1 ranked priority at 100% allocation.
  // Other categories absorb the entire delta.
  // =========================================================================
  const s1Amounts: number[] = workingCats.map((cat, idx) => {
    if (idx === (topCatIndex !== -1 ? topCatIndex : 0)) {
      return cat.allocatedAmount; // Protected 100%
    }
    const otherTotal = workingCats
      .filter((_, i) => i !== (topCatIndex !== -1 ? topCatIndex : 0))
      .reduce((s, c) => s + c.allocatedAmount, 0);

    const remainingBudget = Math.max(0, newTotalBudget - topCat.allocatedAmount);
    if (otherTotal <= 0) return 0;
    const ratio = remainingBudget / otherTotal;
    return Math.round(cat.allocatedAmount * ratio);
  });

  const s1Reconciled = reconcileEnvelopes(s1Amounts, newTotalBudget);

  const s1Adjustments: CategoryAdjustment[] = workingCats.map((cat, idx) => ({
    categoryId: cat.id,
    categoryName: cat.name,
    oldAmount: cat.allocatedAmount,
    newAmount: s1Reconciled[idx],
    delta: s1Reconciled[idx] - cat.allocatedAmount,
    notes:
      idx === (topCatIndex !== -1 ? topCatIndex : 0)
        ? `Protected 100% as client's #1 non-negotiable priority (${fmtINR(cat.allocatedAmount)})`
        : `Streamlined to absorb constraint shock while preserving primary priority`,
  }));

  const perHeadS1 = Math.round(newTotalBudget / newGuestCount);
  const strategy1: TradeOffStrategy = {
    id: 'strat-priority-shield',
    title: `Protect ${topCat.name} & Rationalize Secondary Envelopes ⭐`,
    philosophy: `Honors ${topCat.name} as your #1 non-negotiable priority by protecting its full ${fmtINR(
      topCat.allocatedAmount
    )} allocation. The ${
      hasBudgetCut ? `${fmtINR(baseBudget - newTotalBudget)} budget adjustment` : 'shock'
    } is absorbed by fine-tuning secondary envelopes and utilizing contingency reserves.`,
    newTotalBudget,
    newGuestCount,
    newDate,
    categoryAdjustments: s1Adjustments,
    actionableCompromises: [
      `Preserve 100% of ${topCat.name} quality for all ${newGuestCount} guests without compromises.`,
      `Shift paper invitation suites to animated WhatsApp digital invitations with online RSVP tracking.`,
      `Consolidate non-structural decor props and utilize venue atmospheric lighting.`,
      `Maintain contingency reserve envelope calibrated to revised headcount.`,
    ],
    revisedSummary: `Budget revised to ${fmtINR(newTotalBudget)} for ${newGuestCount} guests (~${fmtINR(
      perHeadS1
    )}/head). Core ${topCat.name} fully preserved at ${fmtINR(topCat.allocatedAmount)}.`,
  };

  // =========================================================================
  // STRATEGY 2: Value Engineering & Unit Optimization
  // Modest optimization across core services with live counters.
  // =========================================================================
  const s2Amounts: number[] = workingCats.map((cat, idx) => {
    const isTop = idx === (topCatIndex !== -1 ? topCatIndex : 0);
    // Top category takes a tiny haircut, others take a proportional cut
    const cutRate = isTop ? TRADEOFF_CUT_RATES.TOP_CAT_HAIRCUT : TRADEOFF_CUT_RATES.OTHER_CAT_HAIRCUT;
    return Math.max(0, Math.round(cat.allocatedAmount * (1 - cutRate)));
  });

  const s2Reconciled = reconcileEnvelopes(s2Amounts, newTotalBudget);

  const s2Adjustments: CategoryAdjustment[] = workingCats.map((cat, idx) => ({
    categoryId: cat.id,
    categoryName: cat.name,
    oldAmount: cat.allocatedAmount,
    newAmount: s2Reconciled[idx],
    delta: s2Reconciled[idx] - cat.allocatedAmount,
    notes:
      idx === (topCatIndex !== -1 ? topCatIndex : 0)
        ? `Optimized unit pricing & streamlined menu structure for ${newGuestCount} pax`
        : `Calibrated contract scope to balance overall budget`,
  }));

  const perHeadS2 = Math.round(newTotalBudget / newGuestCount);
  const strategy2: TradeOffStrategy = {
    id: 'strat-unit-optimize',
    title: 'Unit Optimization & Per-Plate Rationalization',
    philosophy: `Restructures per-unit service rates and menu items to absorb constraints while keeping all ${newGuestCount} guests comfortably accommodated with minimal visible impact.`,
    newTotalBudget,
    newGuestCount,
    newDate,
    categoryAdjustments: s2Adjustments,
    actionableCompromises: [
      `Replace heavy multi-course buffer items with high-energy live specialist counters.`,
      `Negotiate package discount with venue and core vendors for daytime timing slots.`,
      `Rightsizing photography and event hours to maximize peak ceremony coverage.`,
      `Streamline stationery and favor items into digital ceremony guides.`,
    ],
    revisedSummary: `Budget optimized to ${fmtINR(newTotalBudget)} for ${newGuestCount} guests (~${fmtINR(
      perHeadS2
    )}/head) through unit-level value engineering.`,
  };

  // =========================================================================
  // STRATEGY 3: Balanced Proportional Sharing (Hybrid Harmony)
  // Distributes adjustments symmetrically across all categories.
  // =========================================================================
  const ratio = currentTotal > 0 ? newTotalBudget / currentTotal : TRADEOFF_CUT_RATES.DEFAULT_FALLBACK_RATIO;
  const s3Amounts: number[] = workingCats.map((cat) =>
    Math.round(cat.allocatedAmount * ratio)
  );

  const s3Reconciled = reconcileEnvelopes(s3Amounts, newTotalBudget);

  const s3Adjustments: CategoryAdjustment[] = workingCats.map((cat, idx) => ({
    categoryId: cat.id,
    categoryName: cat.name,
    oldAmount: cat.allocatedAmount,
    newAmount: s3Reconciled[idx],
    delta: s3Reconciled[idx] - cat.allocatedAmount,
    notes: `Proportional ${Math.round((1 - ratio) * 100)}% fine-tuning across active budget envelope`,
  }));

  const perHeadS3 = Math.round(newTotalBudget / newGuestCount);
  const strategy3: TradeOffStrategy = {
    id: 'strat-proportional-harmony',
    title: 'Harmonious Proportional Sharing (Hybrid Harmony)',
    philosophy: `Distributes adjustments symmetrically across all envelopes without straining any single vendor relationship, preserving holistic celebration harmony.`,
    newTotalBudget,
    newGuestCount,
    newDate,
    categoryAdjustments: s3Adjustments,
    actionableCompromises: [
      `Even 5%–10% micro-optimizations across all vendors so no single experience suffers.`,
      `Blended fresh and fabric decoration arrangements.`,
      `Coordinated group transportation and consolidated vendor delivery routes.`,
      `Refined guest communication with electronic RSVPs.`,
    ],
    revisedSummary: `Balanced revision to ${fmtINR(newTotalBudget)} for ${newGuestCount} guests (~${fmtINR(
      perHeadS3
    )}/head) with proportional sharing across all line items.`,
  };

  return [strategy1, strategy2, strategy3];
}

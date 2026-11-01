// =============================================================================
// UtsavOps AI — Demo Pre-Mortem Contingency Scenarios
// Calibrates pre-mortem crisis scenarios to actual budget & headcount.
// =============================================================================

import type { CrisisScenario } from '../../types/event';
import { CRISIS_SCALING } from '../../constants/budgetWeights';

/**
 * Builds realistic pre-mortem crisis scenarios dynamically scaled to user's event scope.
 *
 * @param totalBudget - Budget cap in INR.
 * @param guestCount - Number of guests attending.
 * @param occasion - Celebration occasion.
 * @returns Array of CrisisScenario objects with financial impact and actionable playbooks.
 */
export function buildDemoCrisisScenarios(
  totalBudget: number,
  guestCount: number,
  occasion: string
): CrisisScenario[] {
  const perPlateEstimate = Math.max(
    CRISIS_SCALING.MIN_PLATE_PRICE_INR,
    Math.round((totalBudget * CRISIS_SCALING.CATERING_BASE_WEIGHT_RATIO) / guestCount)
  );
  const surgePax = Math.max(15, Math.round(guestCount * CRISIS_SCALING.GUEST_SURGE_PCT));

  return [
    {
      scenario: `Venue availability or monsoon weather contingency at ${occasion} site`,
      financialImpact: -Math.round(totalBudget * CRISIS_SCALING.VENUE_IMPACT_PCT),
      probability: 3,
      actionPlan: [
        'Enforce contract cancellation policy and retrieve 100% advance deposit',
        'Activate pre-screened indoor AC banquet standby option within 24 hours',
        'Direct decorator to install waterproof structural canopies over the mandap/stage',
        'Send broadcast update to all confirmed guests with updated map coordinates',
      ],
      alternatives: [
        `Grand Regency Ballroom – ₹${Math.round(totalBudget * CRISIS_SCALING.VENUE_FALLBACK_PRIMARY_PCT).toLocaleString('en-IN')}, ${guestCount + 50} pax capacity`,
        `Club Pavilion Hall – ₹${Math.round(totalBudget * CRISIS_SCALING.VENUE_FALLBACK_SECONDARY_PCT).toLocaleString('en-IN')}, ${guestCount} pax capacity`,
      ],
    },
    {
      scenario: `Guest attendance surges by +${surgePax} unexpected people (+20%)`,
      financialImpact: -Math.round(surgePax * perPlateEstimate),
      probability: 6,
      actionPlan: [
        `Activate caterer's contractual +15% live buffet buffer (${Math.round(guestCount * 0.15)} pax ready reserve)`,
        'Instruct floor captain to add 3 high-speed live chaat & pasta rolling stations',
        'Utilize contingency reserve envelope to cover additional plate expenses',
        'Deploy 2 additional floor runners to avoid buffet queue bottlenecking',
      ],
      alternatives: [
        `Express live food counters – ₹${Math.round(perPlateEstimate * 0.65).toLocaleString('en-IN')}/head rapid expansion`,
        'Self-service dessert & mocktail booster bar',
      ],
    },
    {
      scenario: 'Lead photographer or key vendor falls ill 10 days before event',
      financialImpact: -Math.round(totalBudget * 0.08),
      probability: 4,
      actionPlan: [
        'Invoke lead vendor contract replacement clause requiring verified associate deployment',
        'Contact pre-vetted backup photography studios on standby roster',
        'Prioritize 4K video recording and ceremony rituals coverage if stills team is lean',
        'Audit replacement portfolio and run 30-minute creative alignment briefing',
      ],
      alternatives: [
        `PixelCraft Studio – Standby 3-person team, ₹${Math.round(totalBudget * 0.075).toLocaleString('en-IN')}`,
        `Candid Frames – Available freelance cinematographer, ₹${Math.round(totalBudget * 0.06).toLocaleString('en-IN')}`,
      ],
    },
    {
      scenario: 'Late-night sound curfew (10 PM) or power transformer disruption',
      financialImpact: -Math.round(totalBudget * 0.035),
      probability: 5,
      actionPlan: [
        'Confirm venue provides dual-generator automatic phase changeover standby',
        'Shift high-energy music indoors by 9:45 PM to comply with municipal noise curfew',
        'Switch outdoor lawn to acoustic instrumental music and ambient lounge lighting',
        'Keep venue electrical engineer and DG set operator on immediate radio standby',
      ],
      alternatives: [
        'Mobile 125 kVA Silent DG set rental – ₹18,000 for 8 hours standby',
        'Wireless silent disco headset setup for indoor late-night dance party',
      ],
    },
    {
      scenario: 'Catering price surge / sudden ingredient inflation 3 weeks before event',
      financialImpact: -Math.round(totalBudget * 0.06),
      probability: 5,
      actionPlan: [
        'Enforce signed token agreement locking per-plate baseline pricing',
        'Swap out-of-season imported fruits/produce for local premium seasonal varieties',
        'Streamline menu by consolidating duplicate dessert and starter items',
        'Offset marginal difference using the allocated Contingency Reserve buffer',
      ],
      alternatives: [
        'Value-engineered premium menu preserving all signature items',
        'Regional live specialist counter substitution',
      ],
    },
  ];
}

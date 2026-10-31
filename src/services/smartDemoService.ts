// =============================================================================
// UtsavOps AI — Smart Demo Plan Generation Service
// Generates an intelligent, fully synchronized offline master plan honoring:
// - Exact budget math (sum strictly equals totalBudget)
// - Priority rankings and deselections (unselected categories are removed and funds redistributed)
// - Timeline tasks backward-scheduled from the user's specific event date
// - Pre-mortem crisis scenarios scaled to the budget and headcount
// - Personalized executive summary incorporating answered smart questions
// =============================================================================

import type {
  EventProfile,
  BudgetCategory,
  TimelineTask,
  CrisisScenario,
  GeneratedPlan,
} from '../types/event';
import { calculateSmartTradeOffStrategies } from '../utils/tradeoffLogic';
import {
  BUDGET_WEIGHTS,
  PRIORITY_BOOSTS,
  CRISIS_SCALING,
} from '../constants/budgetWeights';

/**
 * Generates an intelligent, fully synchronized offline demo plan honoring all client inputs.
 *
 * @param profile - Complete client celebration brief.
 * @returns Fully formed GeneratedPlan with budget math integrity, timeline, and pre-mortems.
 */
export function generateSmartDemoPlan(profile: EventProfile): GeneratedPlan {
  const totalBudget = Math.max(10000, profile.totalBudget || 800000);
  const guestCount = Math.max(1, profile.guestCount || 100);
  const perHeadBudget = Math.round(totalBudget / guestCount);
  const atmosphere = profile.atmosphere || 'Celebratory';
  const occasion = profile.occasion || 'Celebration';

  // Check priority presence / selection
  const selectedPriorities =
    profile.prioritiesRanked && profile.prioritiesRanked.length > 0
      ? profile.prioritiesRanked
      : ['Food & Catering', 'Venue & Hospitality', 'Decor & Ambience', 'Photography & Memories'];

  const hasPriority = (substring: string): boolean =>
    selectedPriorities.some((p) => p.toLowerCase().includes(substring.toLowerCase()));

  // Base envelopes with standard weights
  interface EnvelopeDef {
    id: string;
    name: string;
    baseWeight: number;
    isSelected: boolean;
    getNotes: (amount: number) => string;
  }

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
      isSelected: true, // Non-negotiable safety buffer
      getNotes: (amount) =>
        `${((amount / totalBudget) * 100).toFixed(1)}% reserve safety buffer strictly locked for last-minute headcount surges or price variances`,
    },
  ];

  // Filter to active categories
  const activeEnvelopes = envelopes.filter((e) => e.isSelected);

  // Apply priority ranking boost
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

  // Compute allocated amounts ensuring exact mathematical equality
  let runningSum = 0;
  const budgetCategories: BudgetCategory[] = weightedEnvelopes.map((env, idx) => {
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

  // Calculate timeline tasks backward-scheduled from profile.date
  let eventDate = new Date(profile.date);
  if (isNaN(eventDate.getTime())) {
    eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 90);
  }
  const today = new Date();
  const timeSpanMs = Math.max(14 * 86400000, eventDate.getTime() - today.getTime());

  const getTaskDateStr = (percentage: number): string => {
    const taskMs = today.getTime() + timeSpanMs * percentage;
    const boundedMs = Math.min(eventDate.getTime(), Math.max(today.getTime(), taskMs));
    return new Date(boundedMs).toISOString().split('T')[0] ?? '';
  };

  const rawTasks: Array<
    Omit<TimelineTask, 'dueDate'> & { schedulePct: number; isVisible: boolean }
  > = [
    {
      id: 'finalise-date',
      title: `Finalise Auspicious Date & Venue Scope`,
      category: 'Legal',
      status: 'completed',
      dependsOnTaskIds: [],
      priority: 'High',
      schedulePct: 0.05,
      isVisible: true,
    },
    {
      id: 'set-budget',
      title: 'Approve Total Budget & Category Envelopes',
      category: 'Misc',
      status: 'completed',
      dependsOnTaskIds: ['finalise-date'],
      priority: 'High',
      schedulePct: 0.12,
      isVisible: true,
    },
    {
      id: 'book-venue',
      title: `Contract ${occasion} Venue & Pay Advance Token`,
      category: 'Venue',
      status: 'pending',
      dependsOnTaskIds: ['set-budget'],
      priority: 'High',
      schedulePct: 0.22,
      isVisible: isVenueSelected,
    },
    {
      id: 'shortlist-caterers',
      title: `Shortlist Caterers & Schedule Tasting for ${guestCount} Pax`,
      category: 'Catering',
      status: 'pending',
      dependsOnTaskIds: ['book-venue'],
      priority: 'High',
      schedulePct: 0.32,
      isVisible: isCateringSelected,
    },
    {
      id: 'book-photographer',
      title: 'Lock Lead Photographer & Cinematography Crew',
      category: 'Photography',
      status: 'pending',
      dependsOnTaskIds: ['finalise-date'],
      priority: 'High',
      schedulePct: 0.4,
      isVisible: isPhotoSelected,
    },
    {
      id: 'book-decor',
      title: `Approve ${atmosphere} Mandap & Floral Decor Architecture`,
      category: 'Decor',
      status: 'pending',
      dependsOnTaskIds: ['book-venue'],
      priority: 'High',
      schedulePct: 0.48,
      isVisible: isDecorSelected,
    },
    {
      id: 'finalise-catering',
      title: `Finalise Multi-Cuisine Menu & Locked Plate Pricing`,
      category: 'Catering',
      status: 'pending',
      dependsOnTaskIds: ['shortlist-caterers'],
      priority: 'High',
      schedulePct: 0.58,
      isVisible: isCateringSelected,
    },
    {
      id: 'send-invites',
      title: 'Dispatch Digital & Printed Invitations with RSVP Link',
      category: 'Invitations',
      status: 'pending',
      dependsOnTaskIds: ['book-venue'],
      priority: 'Medium',
      schedulePct: 0.65,
      isVisible: true,
    },
    {
      id: 'book-dj',
      title: 'Lock DJ, Sound & Cultural Music Program',
      category: 'Entertainment',
      status: 'pending',
      dependsOnTaskIds: [],
      priority: 'Medium',
      schedulePct: 0.72,
      isVisible: isMusicSelected,
    },
    {
      id: 'bridal-shopping',
      title: 'Attire, Styling & Trousseau Delivery',
      category: 'Misc',
      status: 'pending',
      dependsOnTaskIds: ['set-budget'],
      priority: 'Medium',
      schedulePct: 0.78,
      isVisible: true,
    },
    {
      id: 'guest-accommodation',
      title: 'Lock Hotel Rooms for Outstation Guests',
      category: 'Accommodation',
      status: 'pending',
      dependsOnTaskIds: ['send-invites'],
      priority: 'Medium',
      schedulePct: 0.83,
      isVisible: true,
    },
    {
      id: 'transport-plan',
      title: 'Finalise Guest Shuttles & Arrival Transport Route',
      category: 'Transportation',
      status: 'pending',
      dependsOnTaskIds: ['book-venue'],
      priority: 'Medium',
      schedulePct: 0.88,
      isVisible: true,
    },
    {
      id: 'pre-wedding-shoot',
      title: 'Pre-Event Shoot & Video Highlight Teaser',
      category: 'Photography',
      status: 'pending',
      dependsOnTaskIds: ['book-photographer'],
      priority: 'Low',
      schedulePct: 0.92,
      isVisible: isPhotoSelected,
    },
    {
      id: 'vendor-confirmations',
      title: 'Conduct Final Briefing with All Vendors & Review Run-Sheet',
      category: 'Misc',
      status: 'pending',
      dependsOnTaskIds: ['finalise-catering', 'book-venue'],
      priority: 'High',
      schedulePct: 0.95,
      isVisible: true,
    },
    {
      id: 'final-headcount',
      title: `Lock Final Headcount (${guestCount} pax) with Caterer`,
      category: 'Catering',
      status: 'pending',
      dependsOnTaskIds: ['vendor-confirmations'],
      priority: 'High',
      schedulePct: 0.98,
      isVisible: isCateringSelected,
    },
    {
      id: 'execution-day',
      title: `🎉 ${occasion} Day Execution & Floor Management`,
      category: 'Misc',
      status: 'pending',
      dependsOnTaskIds: ['vendor-confirmations', 'final-headcount'],
      priority: 'High',
      schedulePct: 1.0,
      isVisible: true,
    },
  ];

  const activeTaskIds = new Set(rawTasks.filter((t) => t.isVisible).map((t) => t.id));

  const timelineTasks: TimelineTask[] = rawTasks
    .filter((t) => t.isVisible)
    .map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      dueDate: getTaskDateStr(t.schedulePct),
      status: t.status,
      dependsOnTaskIds: t.dependsOnTaskIds.filter((depId) => activeTaskIds.has(depId)),
      priority: t.priority,
    }));

  // Calibrate pre-mortem crisis scenarios to actual budget & headcount
  const perPlateEstimate = Math.max(
    CRISIS_SCALING.MIN_PLATE_PRICE_INR,
    Math.round((totalBudget * CRISIS_SCALING.CATERING_BASE_WEIGHT_RATIO) / guestCount)
  );
  const surgePax = Math.max(15, Math.round(guestCount * CRISIS_SCALING.GUEST_SURGE_PCT));

  const crisisScenarios: CrisisScenario[] = [
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
      scenario: `Lead photographer or key vendor falls ill 10 days before event`,
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

  // Synthesize answers from smart questions if provided
  const answeredQuestions = (profile.smartQuestions || [])
    .filter(
      (q): q is typeof q & { userAnswer: string } =>
        typeof q.userAnswer === 'string' && q.userAnswer.trim().length > 0
    )
    .map((q) => q.userAnswer.trim());

  const clarificationNote =
    answeredQuestions.length > 0
      ? ` Incorporates client clarifications regarding ${answeredQuestions.join(', ')}.`
      : '';

  const contingencyAmt =
    budgetCategories.find((c) => c.id === 'contingency')?.allocatedAmount || 0;
  const contingencyPct = ((contingencyAmt / totalBudget) * 100).toFixed(1);

  const planSummary =
    `Comprehensive Smart Master Plan for ${occasion} ("${profile.title}"). ` +
    `Total budget of ₹${totalBudget.toLocaleString('en-IN')} optimized across ${budgetCategories.length} categories for ${guestCount} guests (target ~₹${perHeadBudget.toLocaleString('en-IN')}/head). ` +
    `Prioritizes ${selectedPriorities[0] || 'Food & Catering'} as non-negotiable core, with a ${contingencyPct}% contingency buffer for complete financial peace of mind. ` +
    `All ${timelineTasks.length} critical-path timeline milestones and pre-mortem contingency protocols are synchronized to ${profile.date}.${clarificationNote}`;

  const tradeOffStrategies = calculateSmartTradeOffStrategies(
    profile,
    budgetCategories,
    '+50 Guests Added & Budget Cut by 10%'
  );

  return {
    planSummary,
    budgetCategories,
    timelineTasks,
    crisisScenarios,
    tradeOffStrategies,
  };
}

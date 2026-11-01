// =============================================================================
// UtsavOps AI — Smart Demo Plan Generation Service
// Generates an intelligent, fully synchronized offline master plan honoring:
// - Exact budget math (sum strictly equals totalBudget)
// - Priority rankings and deselections (unselected categories are removed and funds redistributed)
// - Timeline tasks backward-scheduled from the user's specific event date
// - Pre-mortem crisis scenarios scaled to the budget and headcount
// - Personalized executive summary incorporating answered smart questions
// =============================================================================

import type { EventProfile, GeneratedPlan } from '../types/event';
import { calculateSmartTradeOffStrategies } from '../utils/tradeoffLogic';
import { buildDemoEnvelopes } from './demo/demoEnvelopes';
import { buildDemoTimeline } from './demo/demoTimeline';
import { buildDemoCrisisScenarios } from './demo/demoCrisis';

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

  // 1. Build balanced budget envelopes
  const budgetCategories = buildDemoEnvelopes(
    totalBudget,
    guestCount,
    occasion,
    atmosphere,
    selectedPriorities
  );

  // 2. Build acyclic milestone timeline
  const timelineTasks = buildDemoTimeline(
    profile.date,
    guestCount,
    occasion,
    atmosphere,
    selectedPriorities
  );

  // 3. Build scaled pre-mortem crisis scenarios
  const crisisScenarios = buildDemoCrisisScenarios(totalBudget, guestCount, occasion);

  // 4. Synthesize answers from smart questions if provided
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

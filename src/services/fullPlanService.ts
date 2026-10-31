// =============================================================================
// UtsavOps AI — Master Event Full Plan Orchestration Service
// Synchronizes budget allocations, acyclic timeline tasks, and pre-mortem contingencies.
// =============================================================================

import type {
  EventProfile,
  BudgetCategory,
  TimelineTask,
  CrisisScenario,
  GeneratedPlan,
} from '../types/event';
import { callLangChain } from './langchainClient';
import { budgetSchema } from './budgetPlanService';
import { timelineSchema } from './timelineService';
import { crisisSchema } from './crisisService';
import { generateSmartDemoPlan } from './smartDemoService';

export const fullPlanSchema = {
  type: 'object',
  properties: {
    planSummary: { type: 'string' },
    budgetCategories: budgetSchema.properties.budgetCategories,
    timelineTasks: timelineSchema.properties.timelineTasks,
    crisisScenarios: crisisSchema.properties.crisisScenarios,
  },
  required: ['planSummary', 'budgetCategories', 'timelineTasks', 'crisisScenarios'],
};

/**
 * Orchestrates a synchronized master event execution plan.
 * Connects to LangChain multi-provider backend and parses structured JSON output.
 * If JSON parsing fails, performs relaxed regex boundary repair before falling back to smart demo plan.
 *
 * @param profile - Client celebration profile with constraints, priorities, and clarifications.
 * @returns Synchronized GeneratedPlan guaranteeing mathematical budget integrity.
 */
export async function generateFullPlan(profile: EventProfile): Promise<GeneratedPlan> {
  const systemInstruction = `You are an elite Indian celebration director and master event producer inspired by top luxury event planners.
You orchestrate an end-to-end, synchronized master event plan encompassing a mathematically exact budget (sum equals totalBudget), an acyclic critical-path timeline, and pre-mortem contingency protocols.
You weave the client's answers to smart clarifying questions directly into the operational plan.`;

  const clarificationsText =
    profile.smartQuestions && profile.smartQuestions.length > 0
      ? `\nCLIENT-SPECIFIC OPERATIONAL CLARIFICATIONS:\n` +
        profile.smartQuestions
          .filter((q) => q.userAnswer && q.userAnswer.trim().length > 0)
          .map((q) => `• [Q: ${q.question}] -> Answer: "${q.userAnswer}" (Why asked: ${q.contextWhyAsked})`)
          .join('\n')
      : '';

  const prompt = `Build a comprehensive, flawlessly synchronized master event execution plan for the following celebration:

CLIENT PROFILE & PARAMETERS:
- Occasion: ${profile.occasion}
- Event Title: "${profile.title}"
- Event Date: ${profile.date}
- Total Budget: ₹${profile.totalBudget.toLocaleString('en-IN')}
- Expected Guests: ${profile.guestCount} (Target Per-Head Budget: ₹${Math.round(profile.totalBudget / Math.max(1, profile.guestCount)).toLocaleString('en-IN')})
- Atmosphere / Mood: ${profile.atmosphere}
- Age Demographics: ${profile.ageGroupMix}
- Priority Hierarchy (Ranked #1 down): ${profile.prioritiesRanked.join(' > ')}
- Non-Negotiable Must-Haves: ${profile.mustHaves.length > 0 ? profile.mustHaves.join(', ') : 'Standard celebration requirements'}
${clarificationsText}

CORE PLANNING DIRECTIVES:
1. BUDGET ALLOCATION INTEGRITY (MANDATORY):
   - The sum of 'allocatedAmount' across all categories MUST strictly equal exactly ₹${profile.totalBudget}.
   - The #1 ranked priority ("${profile.prioritiesRanked[0] ?? 'Catering & Food'}") must receive the strongest financial shielding.
   - Include standard envelopes: Catering & Food, Venue & Banquet Hall, Decor & Floral, Photography & Video, Entertainment & Music, Invitations & Gifts, Bridal Beauty, Transportation/Logistics, and a Contingency Reserve (5%-7.5%).
   - Each envelope must have actionable notes detailing expected scope and per-unit pricing.

2. TIMELINE CRITICAL PATH & DEPENDENCIES:
   - Provide 8–12 essential chronological tasks leading up to ${profile.date}.
   - Use clean, distinct slug IDs for each task (e.g. t-1, t-2).
   - Link real prerequisites via 'dependsOnTaskIds' in a clean acyclic dependency chain.

3. PRE-MORTEM CONTINGENCIES:
   - Identify 3 vital vulnerabilities (weather downpour, 20% guest overflow, vendor no-show/power cut).
   - Provide realistic INR financial impacts, probability (1-10), and actionable 3-step mitigation playbooks.

4. EXECUTIVE PLAN SUMMARY:
   - A compelling 2-sentence executive brief summarizing how the plan achieves the ${profile.atmosphere} vibe while respecting the ₹${profile.totalBudget.toLocaleString('en-IN')} budget cap.

IMPORTANT: Be direct, concise, and return strictly valid JSON starting with { and ending with }. Avoid markdown commentary or <think> reasoning tags.`;

  const raw = await callLangChain(prompt, fullPlanSchema, systemInstruction);

  let parsed: Partial<GeneratedPlan> = {};
  try {
    parsed = JSON.parse(raw) as Partial<GeneratedPlan>;
  } catch (parseErr) {
    console.warn('[UtsavOps AI] Primary JSON parse failed, attempting relaxed repair...', parseErr);
    try {
      // Relaxed repair: strip think tags and markdown
      const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      const firstB = cleaned.indexOf('{');
      const lastB = cleaned.lastIndexOf('}');
      if (firstB !== -1 && lastB !== -1 && lastB > firstB) {
        const sub = cleaned.substring(firstB, lastB + 1).replace(/,\s*([}\]])/g, '$1');
        parsed = JSON.parse(sub) as Partial<GeneratedPlan>;
      } else {
        throw new Error('No valid JSON object bounds found in raw response');
      }
    } catch (secondErr) {
      console.warn('[UtsavOps AI] JSON parse failed, synthesizing smart plan honoring user parameters:', secondErr);
      const smartFallback = generateSmartDemoPlan(profile);
      return {
        ...smartFallback,
        planSummary: `Master celebration plan for ${profile.occasion} ("${profile.title}") synchronized for ${profile.guestCount} guests with ₹${profile.totalBudget.toLocaleString('en-IN')} budget cap.`,
      };
    }
  }

  // Ensure planSummary is always a clean string even if the LLM returned a structured object
  let planSummaryStr = '';
  if (typeof parsed.planSummary === 'string' && parsed.planSummary.trim().length > 0) {
    planSummaryStr = parsed.planSummary.trim();
  } else if (typeof parsed.planSummary === 'object' && parsed.planSummary !== null) {
    planSummaryStr = Object.entries(parsed.planSummary as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
      .join('. ');
  } else {
    planSummaryStr = `Master celebration plan for ${profile.occasion} ("${profile.title}") with ₹${profile.totalBudget.toLocaleString('en-IN')} budget cap.`;
  }

  // Build budget categories, falling back to smart calibrated envelopes if array is empty
  let budgetCategories: BudgetCategory[] = [];
  if (Array.isArray(parsed.budgetCategories) && parsed.budgetCategories.length > 0) {
    budgetCategories = parsed.budgetCategories.map((c, i) => ({
      id: c.id || `cat-${i}`,
      name: c.name || `Category ${i + 1}`,
      allocatedAmount: Number(c.allocatedAmount) || 0,
      actualCost: Number(c.actualCost) || 0,
      isVerifiedQuote: Boolean(c.isVerifiedQuote),
      notes: typeof c.notes === 'string' ? c.notes : String(c.notes || ''),
    }));

    // Reconcile budget total: ensure sum(allocatedAmount) equals profile.totalBudget
    const currentSum = budgetCategories.reduce((sum, c) => sum + c.allocatedAmount, 0);
    const diff = profile.totalBudget - currentSum;
    if (diff !== 0 && budgetCategories.length > 0) {
      const contingency =
        budgetCategories.find((c) => c.id.toLowerCase().includes('contingency') || c.name.toLowerCase().includes('contingency')) ??
        budgetCategories[0];
      if (contingency) {
        contingency.allocatedAmount = Math.max(0, contingency.allocatedAmount + diff);
      }
    }
  } else {
    const smart = generateSmartDemoPlan(profile);
    budgetCategories = smart.budgetCategories;
  }

  // Build timeline tasks, falling back to smart tasks if missing
  let timelineTasks: TimelineTask[] = [];
  if (Array.isArray(parsed.timelineTasks) && parsed.timelineTasks.length > 0) {
    timelineTasks = parsed.timelineTasks.map((t, i) => ({
      id: t.id || `task-${i}`,
      title: t.title || `Milestone ${i + 1}`,
      category: t.category || 'Misc',
      dueDate: t.dueDate || profile.date,
      status: (['pending', 'completed', 'delayed'].includes(t.status) ? t.status : 'pending') as
        | 'pending'
        | 'completed'
        | 'delayed',
      dependsOnTaskIds: Array.isArray(t.dependsOnTaskIds) ? t.dependsOnTaskIds : [],
      priority: (['High', 'Medium', 'Low'].includes(t.priority) ? t.priority : 'Medium') as
        | 'High'
        | 'Medium'
        | 'Low',
    }));
  } else {
    const smart = generateSmartDemoPlan(profile);
    timelineTasks = smart.timelineTasks;
  }

  // Build crisis scenarios, falling back to smart scenarios if missing
  let crisisScenarios: CrisisScenario[] = [];
  if (Array.isArray(parsed.crisisScenarios) && parsed.crisisScenarios.length > 0) {
    crisisScenarios = parsed.crisisScenarios.map((s) => ({
      scenario: s.scenario || 'Operational Risk Contingency',
      financialImpact: Number(s.financialImpact) || -Math.round(profile.totalBudget * 0.05),
      probability: Number(s.probability) || 5,
      actionPlan: Array.isArray(s.actionPlan) ? s.actionPlan : [],
      alternatives: Array.isArray(s.alternatives) ? s.alternatives : [],
    }));
  } else {
    const smart = generateSmartDemoPlan(profile);
    crisisScenarios = smart.crisisScenarios;
  }

  return {
    planSummary: planSummaryStr,
    budgetCategories,
    timelineTasks,
    crisisScenarios,
  };
}

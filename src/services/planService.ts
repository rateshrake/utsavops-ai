// =============================================================================
// UtsavOps AI — Event Plan Generation Services
// Generates full execution plans, budgets, timelines, and smart clarifying questions.
// =============================================================================

import type {
  EventProfile,
  BudgetCategory,
  TimelineTask,
  CrisisScenario,
  GeneratedPlan,
  ClarifyingQuestion,
} from '../types/event';
import { callGemini } from './geminiClient';
import { DEFAULT_PROFILE } from '../data/defaults';
import { calculateSmartTradeOffStrategies } from '../utils/tradeoffLogic';

const budgetSchema = {
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
2. PRIORITY-WEIGHTED ENVELOPES: The #1 ranked priority ("${profile.prioritiesRanked[0] || 'Catering & Food'}") must receive the highest or second-highest proportional allocation. Low-ranked categories should be lean.
3. REALISTIC INDIAN EVENT CATEGORIES: Include standard envelopes: Catering & Food, Venue & Banquet Hall, Decor & Floral, Photography & Videography, Entertainment & Music, Invitations & Gifts, Bridal Beauty & Trousseau, Logistics & Transportation, and a dedicated Contingency Buffer (5%–7.5%).
4. INSIGHTFUL NOTES: In each category's 'notes', provide realistic unit-level context (e.g. ₹X/plate for food, hours of coverage for photography, square footage/fabric styling for decor).
5. EXECUTIVE PLAN SUMMARY: Write a sharp 2-3 sentence strategic rationale explaining how this allocation protects the client's vision while safeguarding against price overruns.`;

  const raw = await callGemini(prompt, budgetSchema, systemInstruction);
  return JSON.parse(raw) as { budgetCategories: BudgetCategory[]; planSummary: string };
}

const timelineSchema = {
  type: 'object',
  properties: {
    timelineTasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          category: { type: 'string' },
          dueDate: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'completed', 'delayed'] },
          dependsOnTaskIds: { type: 'array', items: { type: 'string' } },
          priority: { type: 'string', enum: ['High', 'Medium', 'Low'] },
        },
        required: ['id', 'title', 'category', 'dueDate', 'status', 'dependsOnTaskIds', 'priority'],
      },
    },
  },
  required: ['timelineTasks'],
};

export async function generateTimelineTasks(profile: EventProfile): Promise<TimelineTask[]> {
  const systemInstruction = `You are a master Indian wedding planner and operations coordinator.
You construct a rigorous, dependency-linked critical path execution timeline.
You organize milestones into 3 natural chronological phases: Phase 1 (Foundation), Phase 2 (Contracting & Invites), and Phase 3 (Final Month & Week-Of).
Every task must have a clean slug ID, must strictly link prerequisites using 'dependsOnTaskIds' without circular dependencies, and must have a realistic dueDate on or before the event date.`;

  const prompt = `Build a chronological, dependency-linked critical path execution timeline for:
- Occasion: ${profile.occasion}
- Title: "${profile.title}"
- Target Event Date: ${profile.date}
- Planning Start Date: ${new Date().toISOString().split('T')[0]}
- Total Budget: ₹${profile.totalBudget.toLocaleString('en-IN')}
- Guest Count: ${profile.guestCount}
- Top Priorities: ${profile.prioritiesRanked.join(', ')}

OPERATIONAL RULES:
1. MILESTONE CADENCE: Generate 14–18 structured milestones distributed chronologically across 3 natural phases:
   - Phase 1 (Foundation): Date finalization, budget approval, venue token advance, primary vendor shortlists.
   - Phase 2 (Vendor Contracting & Invites): Tasting sessions, contract lock-ins, decor & mandap designs, invitations dispatch, outstation travel/hotel blocks.
   - Phase 3 (Final Month & Week-Of): Final headcount lock with caterer, makeup trials, vendor reconfirmations, day-of run sheet rehearsal.
2. STRICT DEPENDENCY GRAPH:
   - Use meaningful, clean slug IDs (e.g. 'book-venue', 'caterer-menu-tasting', 'dispatch-invitations').
   - 'dependsOnTaskIds' must only reference IDs of earlier tasks that logically must precede them (e.g., caterer finalization depends on venue booking; invitation dispatch depends on venue lock). Avoid circular dependencies.
3. REALISTIC DATES: Every task's 'dueDate' must be in YYYY-MM-DD format and occur before or on the event date (${profile.date}).
4. STATUS & PRIORITY: Set status to "pending" (or "completed" for the very first planning task like date setting). Assign realistic "High", "Medium", or "Low" priorities.`;

  const raw = await callGemini(prompt, timelineSchema, systemInstruction);
  const parsed = JSON.parse(raw) as { timelineTasks: TimelineTask[] };
  return parsed.timelineTasks;
}

const crisisSchema = {
  type: 'object',
  properties: {
    crisisScenarios: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          scenario: { type: 'string' },
          financialImpact: { type: 'number' },
          probability: { type: 'number' },
          actionPlan: { type: 'array', items: { type: 'string' } },
          alternatives: { type: 'array', items: { type: 'string' } },
        },
        required: ['scenario', 'financialImpact', 'probability', 'actionPlan', 'alternatives'],
      },
    },
  },
  required: ['crisisScenarios'],
};

export async function generateCrisisScenarios(profile: EventProfile): Promise<CrisisScenario[]> {
  const systemInstruction = `You are a crisis risk consultant and veteran event producer specializing in high-stakes Indian celebrations.
You identify realistic operational surprises (unseasonal monsoon weather, sudden 20% guest surges, generator or HVAC failure during muhurat/reception, key vendor cancellation, and police 10 PM sound curfew).
You provide realistic financial recovery estimates in INR and immediate 3-step actionable playbooks.`;

  const prompt = `Analyze the following celebration brief and uncover 5 realistic, high-impact operational surprises that could derail execution:
- Occasion: ${profile.occasion} ("${profile.title}")
- Event Date: ${profile.date} (consider seasonal weather factors: monsoon rain, winter fog/dew, summer heat)
- Budget: ₹${profile.totalBudget.toLocaleString('en-IN')}
- Guest Headcount: ${profile.guestCount}
- Priority Ranking: ${profile.prioritiesRanked.join(' > ')}
- Atmosphere: ${profile.atmosphere}
- Must-Haves: ${profile.mustHaves.join(', ')}

REALISTIC RISK DOMAINS TO AUDIT:
1. Unseasonal weather or monsoon downpour swamping outdoor lawn/mandap setups.
2. Guest headcount surge (+20% unconfirmed relatives arriving) threatening catering shortages.
3. Key vendor no-show or last-minute cancellation (decorator, dhol/DJ, makeup artist, caterer staff strike).
4. Power generator / banquet HVAC failure during prime reception or muhurat hours.
5. Sound curfew (10 PM police deadline) or licensing shutdown (PPL/IPRS/excise).

FOR EACH SCENARIO:
- scenario: Descriptive title highlighting the exact operational failure.
- financialImpact: Realistic financial damage or rush recovery cost in INR (₹10,000 to ₹1,50,000).
- probability: Realistic risk score from 1 (unlikely) to 10 (very common in Indian events).
- actionPlan: 3 concrete, immediate response protocols to resolve the crisis on the spot.
- alternatives: 2 pre-contracted backup vendor or material alternatives.`;

  const raw = await callGemini(prompt, crisisSchema, systemInstruction);
  const parsed = JSON.parse(raw) as { crisisScenarios: CrisisScenario[] };
  return parsed.crisisScenarios;
}

const fullPlanSchema = {
  type: 'object',
  properties: {
    planSummary: { type: 'string' },
    budgetCategories: budgetSchema.properties.budgetCategories,
    timelineTasks: timelineSchema.properties.timelineTasks,
    crisisScenarios: crisisSchema.properties.crisisScenarios,
  },
  required: ['planSummary', 'budgetCategories', 'timelineTasks', 'crisisScenarios'],
};

export async function generateFullPlan(profile: EventProfile): Promise<GeneratedPlan> {
  const systemInstruction = `You are an elite Indian celebration director and master event producer inspired by top luxury event planners.
You orchestrate an end-to-end, synchronized master event plan encompassing a mathematically exact budget (sum equals totalBudget), an acyclic critical-path timeline, and pre-mortem contingency protocols.
You weave the client's answers to smart clarifying questions directly into the operational plan.`;

  const clarificationsText = profile.smartQuestions && profile.smartQuestions.length > 0
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
   - The #1 ranked priority ("${profile.prioritiesRanked[0] || 'Catering & Food'}") must receive the strongest financial shielding.
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

  const raw = await callGemini(prompt, fullPlanSchema, systemInstruction);
  
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
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
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
        budgetCategories.find((c) => c.id.toLowerCase().includes('contingency') || c.name.toLowerCase().includes('contingency')) ||
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

const questionsSchema = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          question: { type: 'string' },
          contextWhyAsked: { type: 'string' },
        },
        required: ['id', 'question', 'contextWhyAsked'],
      },
    },
  },
  required: ['questions'],
};

export async function generateSmartQuestions(profile: EventProfile): Promise<ClarifyingQuestion[]> {
  const systemInstruction = `You are a veteran Indian wedding director interviewing a client before finalizing their master event contract.
Your mission is to ask 3 high-value, probing questions that prevent expensive surprises in Weather/Venue logistics, Food/Dietary preparation, and Legal/Curfew/Accessibility constraints.
Never ask for information already supplied by the user (do not ask budget, date, guest count, or occasion).`;

  const prompt = `Formulate exactly 3 hyper-targeted, high-value clarifying questions that uncover unstated operational risks and hidden cost drivers for the following celebration:

CLIENT BRIEF:
- Budget: ₹${profile.totalBudget.toLocaleString('en-IN')}
- Headcount: ${profile.guestCount} guests (₹${Math.round(profile.totalBudget / Math.max(1, profile.guestCount)).toLocaleString('en-IN')}/person)
- Event Date: ${profile.date}
- Atmosphere: ${profile.atmosphere}
- Priorities: ${profile.prioritiesRanked.join(' > ')}
- Must-Haves: ${profile.mustHaves.join(', ')}

RULES FOR QUESTIONS:
1. DO NOT ask for basic information already provided (do NOT ask budget, date, guest count, or occasion).
2. Question 1 must address Weather & Venue contingencies based on the season and setting (e.g. monsoon/indoor backup, banquet AC capacity, mandap rainproofing, generator backups).
3. Question 2 must address Food & Hospitality nuances (e.g. Jain/Swaminarayan meal ratios, live counters vs sit-down dining, regional specialties, alcohol & mocktail arrangements).
4. Question 3 must address Logistics, Accessibility & Cultural flow (e.g. wheelchair/elderly ramp access, sound curfew past 10 PM, kid entertainment, guest accommodation & baraat routing).
5. For each question, provide a concise 'contextWhyAsked' explaining the exact financial or timeline impact so the client understands why answering is critical.`;

  try {
    const raw = await callGemini(prompt, questionsSchema, systemInstruction);
    const parsed = JSON.parse(raw) as { questions: Array<Omit<ClarifyingQuestion, 'userAnswer'>> };
    return parsed.questions.map((q) => ({ ...q, userAnswer: '' }));
  } catch (err) {
    console.warn('[UtsavOps AI] Live smart questions failed, falling back to curated defaults:', err);
    return (DEFAULT_PROFILE.smartQuestions || []).map((q) => ({ ...q, userAnswer: '' }));
  }
}

/**
 * Generates an intelligent, fully synchronized offline demo plan honoring all client inputs:
 * - Exact budget math (sum strictly equals totalBudget)
 * - Priority rankings and deselections (excluded items are omitted and budget redistributed)
 * - Timeline tasks backward-scheduled from the user's specific event date
 * - Pre-mortem crisis scenarios scaled to the budget and headcount
 * - Personalized executive summary incorporating answered smart questions
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

  const hasPriority = (substring: string) =>
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
      baseWeight: 30,
      isSelected: isCateringSelected,
      getNotes: (amount) =>
        `₹${Math.round(amount / guestCount).toLocaleString('en-IN')}/head multi-course buffet for ${guestCount} guests, including welcome mocktails, live counters & dessert spread`,
    },
    {
      id: 'venue',
      name: 'Venue & Hospitality',
      baseWeight: 22.5,
      isSelected: isVenueSelected,
      getNotes: () =>
        `AC banquet/lawn capacity for ${guestCount}+ guests with separate ceremony pavilions and green rooms`,
    },
    {
      id: 'decor',
      name: 'Decor & Floral',
      baseWeight: 12,
      isSelected: isDecorSelected,
      getNotes: () =>
        `${atmosphere} theme styling, mandap/stage floral architecture, ambient fairy illumination`,
    },
    {
      id: 'photography',
      name: 'Photography & Video',
      baseWeight: 10,
      isSelected: isPhotoSelected,
      getNotes: () =>
        `Candid photography & cinematic 4K video coverage, pre-event portrait shoot & drone highlights`,
    },
    {
      id: 'entertainment',
      name: 'Entertainment & Music',
      baseWeight: 5,
      isSelected: isMusicSelected,
      getNotes: () =>
        `Professional sound system, DJ music curation, live dhol artists & guest playlist coordination`,
    },
    {
      id: 'invitations',
      name: 'Invitations & Gifts',
      baseWeight: 3,
      isSelected: true,
      getNotes: () =>
        `Interactive digital invitations, WhatsApp RSVP tracking & bespoke boxed guest favors`,
    },
    {
      id: 'beauty',
      name: 'Bridal Beauty & Styling',
      baseWeight: 5,
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
      baseWeight: 3.5,
      isSelected: true,
      getNotes: () =>
        `Decorated bridal transfer car, outstation guest transit shuttles & valet parking management`,
    },
    {
      id: 'stationery',
      name: 'Stationery & Day Coordination',
      baseWeight: 2,
      isSelected: true,
      getNotes: () =>
        `Welcome signage, printed ceremony schedules, place markers & day-of floor assistant`,
    },
    {
      id: 'accommodation',
      name: 'Guest Accommodation',
      baseWeight: 3,
      isSelected: true,
      getNotes: () =>
        `Subsidized room reservations & welcome check-in kits for key outstation guests`,
    },
    {
      id: 'contingency',
      name: 'Contingency Reserve',
      baseWeight: 6.5,
      isSelected: true, // Non-negotiable safety buffer
      getNotes: (amount) =>
        `${((amount / totalBudget) * 100).toFixed(1)}% reserve safety buffer strictly locked for last-minute headcount surges or price variances`,
    },
  ];

  // Filter to active categories
  const activeEnvelopes = envelopes.filter((e) => e.isSelected);

  // Apply priority ranking boost
  const topPriorityStr = selectedPriorities[0]?.toLowerCase() || '';
  const secondPriorityStr = selectedPriorities[1]?.toLowerCase() || '';

  const weightedEnvelopes = activeEnvelopes.map((env) => {
    let weight = env.baseWeight;
    const nameLower = env.name.toLowerCase();
    if (topPriorityStr && nameLower.includes(topPriorityStr.slice(0, 4))) {
      weight += 7; // Strong boost to #1 priority
    } else if (secondPriorityStr && nameLower.includes(secondPriorityStr.slice(0, 4))) {
      weight += 3; // Boost to #2 priority
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
    return new Date(boundedMs).toISOString().split('T')[0];
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
  const perPlateEstimate = Math.max(500, Math.round((totalBudget * 0.3) / guestCount));
  const surgePax = Math.max(15, Math.round(guestCount * 0.2));

  const crisisScenarios: CrisisScenario[] = [
    {
      scenario: `Venue availability or monsoon weather contingency at ${occasion} site`,
      financialImpact: -Math.round(totalBudget * 0.2),
      probability: 3,
      actionPlan: [
        'Enforce contract cancellation policy and retrieve 100% advance deposit',
        'Activate pre-screened indoor AC banquet standby option within 24 hours',
        'Direct decorator to install waterproof structural canopies over the mandap/stage',
        'Send broadcast update to all confirmed guests with updated map coordinates',
      ],
      alternatives: [
        `Grand Regency Ballroom – ₹${Math.round(totalBudget * 0.22).toLocaleString('en-IN')}, ${guestCount + 50} pax capacity`,
        `Club Pavilion Hall – ₹${Math.round(totalBudget * 0.17).toLocaleString('en-IN')}, ${guestCount} pax capacity`,
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

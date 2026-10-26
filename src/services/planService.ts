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
   - Provide 14–18 structured chronological tasks leading up to ${profile.date}.
   - Use clean, distinct slug IDs for each task.
   - Every task must link its real prerequisites via 'dependsOnTaskIds' (e.g., caterer tasting depends on venue lock; print invites depends on venue lock). Ensure a clean acyclic dependency chain.

3. PRE-MORTEM CONTINGENCIES:
   - Identify 5 realistic vulnerabilities (weather contingency, 20% guest overflow, power/generator cut, vendor cancellation, licensing curfew).
   - Provide realistic INR financial impacts, probability (1-10), and actionable 3-step mitigation playbooks.

4. EXECUTIVE PLAN SUMMARY:
   - A compelling 2-3 sentence executive brief summarizing how the plan achieves the ${profile.atmosphere} vibe while respecting the ₹${profile.totalBudget.toLocaleString('en-IN')} budget cap.`;

  const raw = await callGemini(prompt, fullPlanSchema, systemInstruction);
  return JSON.parse(raw) as GeneratedPlan;
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

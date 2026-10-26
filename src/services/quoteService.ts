// =============================================================================
// UtsavOps AI — Delay Bottleneck & Vendor Quote Analyzer Services
// Traces cascading critical path impacts and audits messy multi-vendor quotations.
// =============================================================================

import type {
  EventProfile,
  TimelineTask,
  DelayImpactAnalysis,
  QuoteComparisonResult,
  AnalyzedQuoteComparison,
} from '../types/event';
import { callGemini } from './geminiClient';

const delayImpactSchema = {
  type: 'object',
  properties: {
    impactedTaskIds: {
      type: 'array',
      items: { type: 'string' },
    },
    impactSeverity: {
      type: 'string',
      enum: ['High', 'Medium', 'Low'],
    },
    cascadeSummary: { type: 'string' },
    recoveryActionPlan: {
      type: 'array',
      items: { type: 'string' },
    },
    suggestedScheduleAdjustments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          taskId: { type: 'string' },
          taskTitle: { type: 'string' },
          originalDueDate: { type: 'string' },
          newDueDate: { type: 'string' },
        },
        required: ['taskId', 'taskTitle', 'originalDueDate', 'newDueDate'],
      },
    },
  },
  required: [
    'impactedTaskIds',
    'impactSeverity',
    'cascadeSummary',
    'recoveryActionPlan',
    'suggestedScheduleAdjustments',
  ],
};

export async function simulateDelayImpact(
  profile: EventProfile,
  tasks: TimelineTask[],
  delayedTaskId: string,
  delayDays: number
): Promise<DelayImpactAnalysis> {
  const delayedTask = tasks.find((t) => t.id === delayedTaskId);
  const delayedTitle = delayedTask ? delayedTask.title : delayedTaskId;

  const downstreamMap = new Set<string>();
  function findDependents(parentIds: string[]) {
    let added = false;
    for (const task of tasks) {
      if (!downstreamMap.has(task.id)) {
        if (task.dependsOnTaskIds.some((pId) => parentIds.includes(pId))) {
          downstreamMap.add(task.id);
          added = true;
        }
      }
    }
    if (added) {
      findDependents(Array.from(downstreamMap));
    }
  }
  findDependents([delayedTaskId]);

  const downstreamTasks = tasks.filter((t) => downstreamMap.has(t.id));

  const systemInstruction = `You are a master Indian event operations coordinator and critical path scheduling director.
In Indian celebration production, milestones are tightly coupled with auspicious dates (muhurats), weekend banquet venue availability, and seasonal vendor shortages.
When a task slips, you analyze the cascading domino effect with deep operational realism:
- Distinguish between flexible tasks (e.g., photo album layout) and rigid bottleneck tasks (e.g., venue token advance, lagna patrika printing, caterer menu freeze).
- Formulate practical, fast-track recovery actions: concurrent workstreams, WhatsApp video site inspections, digital agreements, and standby retainers.
- Recalculate schedule dates ensuring NO downstream task slips past the hard celebration date.`;

  const prompt = `A critical planning milestone has encountered a delay for the celebration:

CELEBRATION DETAILS:
- Occasion: ${profile.occasion} ("${profile.title}")
- Hard Event Date: ${profile.date}
- DELAYED MILESTONE: "${delayedTitle}" (ID: "${delayedTaskId}")
- REPORTED DELAY: ${delayDays} days late
- DOWNSTREAM DEPENDENT TASKS (Total: ${downstreamTasks.length}):
${downstreamTasks.length > 0
  ? downstreamTasks
      .map(
        (t) =>
          `- [${t.id}] "${t.title}" | Due: ${t.dueDate} | Status: ${t.status} | Priority: ${t.priority}`
      )
      .join('\n')
  : 'None explicitly linked in dependency graph.'}

CRITICAL PATH ANALYSIS DIRECTIVES:
1. impactSeverity: Assign 'High', 'Medium', or 'Low' based on priority, delay duration, and proximity to the event date (${profile.date}).
2. cascadeSummary: 2-3 sentences explaining the exact domino effect across vendors, family approvals, and guest communication.
3. recoveryActionPlan: Exactly 4-5 concrete, high-leverage recovery steps to compress timelines (e.g., running tasting concurrent with venue walkthrough, waiving physical proofing in favor of WhatsApp approval, paying vendor rush fees, booking secondary standby vendors).
4. suggestedScheduleAdjustments: List shifted due dates for the delayed task and all downstream tasks. Ensure every newDueDate is logically shifted and strictly occurs ON OR BEFORE the event date (${profile.date}).`;

  try {
    const raw = await callGemini(prompt, delayImpactSchema, systemInstruction);
    const parsed = JSON.parse(raw) as Omit<
      DelayImpactAnalysis,
      'delayedTaskId' | 'delayedTaskTitle' | 'delayDays'
    >;
    return {
      delayedTaskId,
      delayedTaskTitle: delayedTitle,
      delayDays,
      ...parsed,
    };
  } catch {
    const shifted = downstreamTasks.map((t) => {
      const orig = new Date(t.dueDate).getTime();
      const nextDate = new Date(orig + delayDays * 86400000).toISOString().split('T')[0];
      return {
        taskId: t.id,
        taskTitle: t.title,
        originalDueDate: t.dueDate,
        newDueDate: nextDate,
      };
    });

    return {
      delayedTaskId,
      delayedTaskTitle: delayedTitle,
      delayDays,
      impactedTaskIds: Array.from(downstreamMap),
      impactSeverity: delayDays >= 7 ? 'High' : 'Medium',
      cascadeSummary: `Delaying "${delayedTitle}" by ${delayDays} days pushes ${downstreamTasks.length} downstream milestones into a high-risk compression window right before ${profile.date}. Immediate fast-track coordination is required.`,
      recoveryActionPlan: [
        `Fast-track vendor sign-off for "${delayedTitle}" by scheduling an urgent in-person or WhatsApp video walkthrough.`,
        'Authorize electronic contract approvals and waive physical draft revisions.',
        'Alert catering and decor partners to reserve their team shifts on standby without waiting for sequential confirmations.',
        'Prepare buffer payments or nominal rush fees to protect promised delivery dates.',
      ],
      suggestedScheduleAdjustments: shifted,
    };
  }
}

const quoteComparisonSchema = {
  type: 'object',
  properties: {
    recommendation: { type: 'string' },
    quotes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          vendorName: { type: 'string' },
          category: { type: 'string' },
          baseCost: { type: 'number' },
          perUnitCost: { type: 'number' },
          unitLabel: { type: 'string' },
          guestsCovered: { type: 'number' },
          hiddenCharges: {
            type: 'array',
            items: { type: 'string' },
          },
          exclusions: {
            type: 'array',
            items: { type: 'string' },
          },
          budgetAlignment: {
            type: 'object',
            properties: {
              allocatedBudget: { type: 'number' },
              difference: { type: 'number' },
              status: {
                type: 'string',
                enum: ['within-budget', 'over-budget', 'exact'],
              },
              summary: { type: 'string' },
            },
            required: ['allocatedBudget', 'difference', 'status', 'summary'],
          },
          whatsappQuestions: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: [
          'id',
          'vendorName',
          'category',
          'baseCost',
          'perUnitCost',
          'unitLabel',
          'guestsCovered',
          'hiddenCharges',
          'exclusions',
          'budgetAlignment',
          'whatsappQuestions',
        ],
      },
    },
  },
  required: ['recommendation', 'quotes'],
};

export async function compareVendorQuotes(
  category: string,
  allocatedBudget: number,
  guestCount: number,
  rawQuotes: Array<{ id: string; vendorName: string; rawText: string }>
): Promise<QuoteComparisonResult> {
  const quoteBlocks = rawQuotes
    .map(
      (q, idx) =>
        `### QUOTE #${idx + 1} [ID: "${q.id}"] - Proposed Vendor: "${q.vendorName}":\n"""\n${q.rawText}\n"""`
    )
    .join('\n\n');

  const systemInstruction = `You are a forensic Indian event procurement auditor and senior commercial negotiator with extensive knowledge of vendor billing in Delhi NCR, Mumbai, Bengaluru, Hyderabad, and tier-2 Indian celebration hubs.
Indian event quotations routinely conceal substantial surcharges:
- GST (18%) added at final invoice stage without prior verbal warning.
- Diesel generator (genset) fuel and power load setup charges.
- Corkage fees, liquor permit handling, and glassware breakage deposits.
- Cutlery washing, chafing dish cleaning, and venue garbage cartage fees.
- Midnight / sound curfew overtime penalties (₹15,000–₹35,000/hour).
- Mandatory crew meals charged at full guest plate rates.
- Missing basics: No complimentary family tasting, no Jain/Swaminarayan counters, no staging truss certification.
Your mission is to perform a forensic line-item audit, calculate accurate budget variances, formulate 4 WhatsApp-ready negotiation questions to pin down vendors in writing, and recommend the best value choice.`;

  const targetPerHead = Math.round(allocatedBudget / Math.max(1, guestCount));

  const prompt = `Perform a forensic procurement audit and negotiation assessment for the "${category}" category:

BENCHMARK PARAMETERS:
- Allocated Budget Envelope: ₹${allocatedBudget.toLocaleString('en-IN')}
- Guest Headcount: ${guestCount} guests (Target Per-Head Budget: ₹${targetPerHead.toLocaleString('en-IN')})
- Category: ${category}

SUBMITTED VENDOR QUOTATIONS (${rawQuotes.length}):
${quoteBlocks}

FORENSIC AUDIT DIRECTIVES:
1. BASE & UNIT METRICS: Extract accurate baseCost (all-in estimate), perUnitCost, unitLabel (e.g., 'per plate', 'per day', 'flat package'), and guestsCovered for each vendor.
2. HIDDEN CHARGES DETECTOR: Detect all unmentioned or fine-print costs common in Indian events (e.g., 18% GST, diesel fuel charges, corkage, cutlery washing, overtime past midnight, mandatory crew food).
3. EXCLUSIONS & RISKS: Identify missing deliverables standard for a high-quality celebration (e.g., complimentary food tasting, Jain prep vessels, service staff ratio, backup equipment).
4. BUDGET ALIGNMENT:
   - allocatedBudget: Exactly ₹${allocatedBudget}.
   - difference: Exactly (baseCost - allocatedBudget).
   - status: 'within-budget' if difference <= 0, 'over-budget' if difference > 0, 'exact' if difference === 0.
   - summary: Sharp 1-sentence risk assessment comparing quote vs allocated budget.
5. WHATSAPP NEGOTIATION QUESTIONS: Exactly 4 polite, assertive, culturally savvy WhatsApp questions per vendor ready to send directly to demand written commitments, fee waivers, or packaged inclusions.
6. EXECUTIVE RECOMMENDATION: A decisive 2-3 sentence verdict analyzing risk vs reward, identifying the true winner, and explaining the winning procurement strategy.`;

  try {
    const raw = await callGemini(prompt, quoteComparisonSchema, systemInstruction);
    const parsed = JSON.parse(raw) as {
      recommendation: string;
      quotes: Array<Omit<AnalyzedQuoteComparison, 'rawText'>>;
    };

    const enrichedQuotes: AnalyzedQuoteComparison[] = parsed.quotes.map((q, idx) => {
      const original =
        rawQuotes.find((rq) => rq.id === q.id) ||
        rawQuotes.find(
          (rq) => rq.vendorName.toLowerCase().trim() === q.vendorName.toLowerCase().trim()
        ) ||
        rawQuotes[idx] ||
        rawQuotes[0];
      return {
        ...q,
        id: original ? original.id : q.id,
        vendorName: q.vendorName || original?.vendorName || `Vendor #${idx + 1}`,
        rawText: original ? original.rawText : '',
      };
    });

    return {
      category,
      allocatedBudget,
      recommendation: parsed.recommendation,
      quotes: enrichedQuotes,
    };
  } catch (err) {
    console.warn('[UtsavOps AI] Live quote comparison call failed, running heuristic analyzer fallback:', err);
    return analyzeQuotesOffline(category, allocatedBudget, guestCount, rawQuotes);
  }
}

/** Heuristic offline analyzer when API key is unavailable or offline mode is desired. */
export function analyzeQuotesOffline(
  category: string,
  allocatedBudget: number,
  guestCount: number,
  rawQuotes: Array<{ id: string; vendorName: string; rawText: string }>
): QuoteComparisonResult {
  const targetPerHead = Math.round(allocatedBudget / Math.max(1, guestCount));

  const quotes: AnalyzedQuoteComparison[] = rawQuotes.map((q, idx) => {
    const text = q.rawText.toLowerCase();

    // 1. Extract per-unit or plate rate if mentioned
    let perUnitCost = targetPerHead;
    const perPlateMatch = q.rawText.match(
      /(?:₹|rs\.?|inr)?\s*([0-9]{1,2},[0-9]{3}|[0-9]{3,4})\s*(?:\/|\s*per|\s*a)?\s*(?:plate|head|pax|person)/i
    );
    if (perPlateMatch && perPlateMatch[1]) {
      perUnitCost = parseInt(perPlateMatch[1].replace(/,/g, ''), 10);
    } else {
      perUnitCost = idx === 0 ? Math.round(targetPerHead * 0.96) : Math.round(targetPerHead * 1.04);
    }

    // 2. Base cost calculation
    let baseCost = perUnitCost * guestCount;
    const lumpSumMatch = q.rawText.match(
      /(?:total|package|cost|final|advance)?\s*(?:₹|rs\.?|inr)?\s*([0-9]{1,2},[0-9]{2},[0-9]{3}|[0-9]{1,2},[0-9]{3}|[0-9]{5,7})/i
    );
    if (lumpSumMatch && lumpSumMatch[1]) {
      const parsedLump = parseInt(lumpSumMatch[1].replace(/,/g, ''), 10);
      if (parsedLump > 20000) {
        baseCost = parsedLump;
      }
    }

    // 3. Detect hidden charges from raw text
    const hiddenCharges: string[] = [];
    if (text.includes('gst') || text.includes('18%') || text.includes('tax')) {
      hiddenCharges.push(
        `GST 18% billed separately on final settlement (+₹${Math.round(baseCost * 0.18).toLocaleString('en-IN')})`
      );
    }
    if (text.includes('diesel') || text.includes('generator') || text.includes('fuel')) {
      hiddenCharges.push('Diesel genset fuel billed at actuals (approx ₹1,000–₹1,500/hr)');
    }
    if (text.includes('corkage') || text.includes('liquor') || text.includes('alcohol')) {
      hiddenCharges.push('Corkage fee & 1-day liquor excise permit handling surcharge');
    }
    if (text.includes('cutlery') || text.includes('wash') || text.includes('cleaning')) {
      hiddenCharges.push('Chafing dish cleaning & chinaware breakage deposit');
    }
    if (text.includes('overtime') || text.includes('midnight') || text.includes('10 pm')) {
      hiddenCharges.push('Late night overtime surcharge past 11:00 PM (₹15,000/hr)');
    }
    if (hiddenCharges.length === 0) {
      hiddenCharges.push('GST 18% not clearly declared on base quote (+₹' + Math.round(baseCost * 0.18).toLocaleString('en-IN') + ')');
      hiddenCharges.push('Generator & live cooking fuel expenses billed as extra actuals');
    }

    // 4. Detect exclusions / missing deliverables
    const exclusions: string[] = [];
    if (!text.includes('tasting')) {
      exclusions.push('Complimentary food tasting for 4 family members not confirmed in writing');
    }
    if (!text.includes('jain') && !text.includes('dietary')) {
      exclusions.push('Separate cooking vessels and dedicated counters for Jain meals unconfirmed');
    }
    if (!text.includes('staff') && !text.includes('server') && !text.includes('waiter')) {
      exclusions.push('Uniformed staff-to-guest serving ratio (standard 1:25) not locked');
    }
    if (exclusions.length === 0) {
      exclusions.push('Mineral water jars & soft drink ice cubes billed as extra actuals');
    }

    // 5. Budget alignment
    const diff = baseCost - allocatedBudget;
    const status: 'within-budget' | 'over-budget' | 'exact' =
      diff < 0 ? 'within-budget' : diff > 0 ? 'over-budget' : 'exact';
    const summary =
      diff < 0
        ? `₹${Math.abs(diff).toLocaleString('en-IN')} within allocated ${category} envelope, leaving a healthy safety cushion.`
        : diff > 0
        ? `Exceeds current allocated ${category} envelope by ₹${diff.toLocaleString('en-IN')}. Needs tactical price concession.`
        : `Matches your allocated ₹${allocatedBudget.toLocaleString('en-IN')} envelope exactly.`;

    // 6. WhatsApp negotiation questions
    const whatsappQuestions = [
      `Hi ${q.vendorName}, could you please clarify if your quote of ₹${baseCost.toLocaleString('en-IN')} is strictly all-inclusive of 18% GST and staff service charges?`,
      `Do you offer a complimentary menu tasting for 4 family members before we pay the token advance?`,
      `Are fuel for live burners and backup generator power included, or billed on actual meter usage?`,
      `What is the exact ratio of uniformed service staff to guests, and does service run without overtime penalties up to 12:30 AM?`,
    ];

    return {
      id: q.id,
      vendorName: q.vendorName,
      category,
      baseCost,
      perUnitCost,
      unitLabel: 'per plate',
      guestsCovered: guestCount,
      hiddenCharges,
      exclusions,
      budgetAlignment: {
        allocatedBudget,
        difference: diff,
        status,
        summary,
      },
      whatsappQuestions,
      rawText: q.rawText,
    };
  });

  const bestVal = quotes.reduce(
    (best, curr) => (curr.baseCost < best.baseCost ? curr : best),
    quotes[0]
  );

  const recommendation = `${bestVal.vendorName} emerges as the recommended choice for ${category}. At ₹${bestVal.baseCost.toLocaleString('en-IN')} covering ${guestCount} guests, it offers the lowest baseline cost risk against your ₹${allocatedBudget.toLocaleString('en-IN')} allocation. Be sure to confirm the 4 WhatsApp questions regarding 18% GST and overtime before paying your token advance.`;

  return {
    category,
    allocatedBudget,
    recommendation,
    quotes,
  };
}

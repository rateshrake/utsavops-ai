// =============================================================================
// UtsavOps AI — Smart Clarifying Questions Service
// Formulates targeted, high-value questions uncovering unstated operational risks.
// =============================================================================

import type { EventProfile, ClarifyingQuestion } from '../types/event';
import { callLangChain } from './langchainClient';
import { DEFAULT_PROFILE } from '../data/defaults';

export const questionsSchema = {
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

/**
 * Formulates 3 targeted clarifying questions before plan synthesis.
 * Never asks for information already supplied by the user.
 *
 * @param profile - Celebration parameters to analyze for operational blind spots.
 * @returns Array of ClarifyingQuestion objects with user response placeholders.
 */
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
    const raw = await callLangChain(prompt, questionsSchema, systemInstruction);
    const parsed = JSON.parse(raw) as { questions: Array<Omit<ClarifyingQuestion, 'userAnswer'>> };
    return parsed.questions.map((q) => ({ ...q, userAnswer: '' }));
  } catch (err) {
    console.warn('[UtsavOps AI] Live smart questions failed, falling back to curated defaults:', err);
    return (DEFAULT_PROFILE.smartQuestions || []).map((q) => ({ ...q, userAnswer: '' }));
  }
}

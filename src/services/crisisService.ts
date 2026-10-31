// =============================================================================
// UtsavOps AI — Crisis Scenarios Generation Service
// Synthesizes high-impact operational surprises and mitigation playbooks.
// =============================================================================

import type { EventProfile, CrisisScenario } from '../types/event';
import { callLangChain } from './langchainClient';

export const crisisSchema = {
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

/**
 * Generates 5 realistic, high-impact operational surprises and recovery action plans.
 *
 * @param profile - Event parameters including atmosphere, weather vulnerability, and budget.
 * @returns Array of CrisisScenario objects with financial impact in INR and action playbooks.
 * @throws Error if LLM API call fails.
 */
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

  const raw = await callLangChain(prompt, crisisSchema, systemInstruction);
  const parsed = JSON.parse(raw) as { crisisScenarios: CrisisScenario[] };
  return parsed.crisisScenarios;
}

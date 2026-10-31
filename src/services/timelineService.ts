// =============================================================================
// UtsavOps AI — Timeline Tasks Generation Service
// Builds chronological, dependency-linked critical path execution milestones.
// =============================================================================

import type { EventProfile, TimelineTask } from '../types/event';
import { callLangChain } from './langchainClient';

export const timelineSchema = {
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

/**
 * Generates an acyclic critical-path timeline with milestone dependencies.
 *
 * @param profile - Celebration brief including target date and planning scope.
 * @returns Array of TimelineTask milestones backward-scheduled to the event date.
 * @throws Error if the LLM generation or parsing fails.
 */
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

  const raw = await callLangChain(prompt, timelineSchema, systemInstruction);
  const parsed = JSON.parse(raw) as { timelineTasks: TimelineTask[] };
  return parsed.timelineTasks;
}

// =============================================================================
// UtsavOps AI — Demo Timeline Milestone Synthesis
// Backward-schedules chronological tasks with clean acyclic dependencies.
// =============================================================================

import type { TimelineTask } from '../../types/event';

interface RawTaskDef extends Omit<TimelineTask, 'dueDate'> {
  schedulePct: number;
  isVisible: boolean;
}

/**
 * Synthesizes backward-scheduled chronological timeline tasks leading up to event date.
 *
 * @param eventDateStr - ISO date string of target event.
 * @param guestCount - Number of celebration guests.
 * @param occasion - Type of event.
 * @param atmosphere - Theme vibe.
 * @param selectedPriorities - Ordered client priorities.
 * @returns Array of TimelineTask objects with acyclic dependency IDs.
 */
export function buildDemoTimeline(
  eventDateStr: string,
  guestCount: number,
  occasion: string,
  atmosphere: string,
  selectedPriorities: string[]
): TimelineTask[] {
  const hasPriority = (substring: string): boolean =>
    selectedPriorities.some((p) => p.toLowerCase().includes(substring.toLowerCase()));

  const isCateringSelected =
    hasPriority('food') || hasPriority('cater') || selectedPriorities.length < 3;
  const isVenueSelected =
    hasPriority('venue') || hasPriority('hospitality') || selectedPriorities.length < 3;
  const isDecorSelected = hasPriority('decor') || hasPriority('ambience');
  const isPhotoSelected = hasPriority('photo') || hasPriority('memories');
  const isMusicSelected =
    hasPriority('music') || hasPriority('dj') || hasPriority('entertainment');

  let eventDate = new Date(eventDateStr);
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

  const rawTasks: RawTaskDef[] = [
    {
      id: 'finalise-date',
      title: 'Finalise Auspicious Date & Venue Scope',
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
      title: 'Finalise Multi-Cuisine Menu & Locked Plate Pricing',
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

  return rawTasks
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
}

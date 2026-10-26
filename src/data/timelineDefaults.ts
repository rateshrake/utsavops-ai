// =============================================================================
// UtsavOps AI — Timeline Tasks Defaults
// =============================================================================

import type { TimelineTask } from '../types/event';

export const DEFAULT_TIMELINE_TASKS: TimelineTask[] = [
  { id: 'finalise-date',       title: 'Finalise Wedding Date & Muhurat',      category: 'Legal',          dueDate: '2026-11-01', status: 'completed', dependsOnTaskIds: [],                                          priority: 'High'   },
  { id: 'set-budget',          title: 'Set & Approve Total Budget',            category: 'Misc',           dueDate: '2026-11-05', status: 'completed', dependsOnTaskIds: ['finalise-date'],                            priority: 'High'   },
  { id: 'book-venue',          title: 'Book Venue & Pay Token Advance',        category: 'Venue',          dueDate: '2026-11-15', status: 'pending',   dependsOnTaskIds: ['set-budget'],                               priority: 'High'   },
  { id: 'shortlist-caterers',  title: 'Shortlist & Meet Caterers',             category: 'Catering',       dueDate: '2026-11-20', status: 'pending',   dependsOnTaskIds: ['book-venue'],                               priority: 'High'   },
  { id: 'book-photographer',   title: 'Book Photographer & Videographer',      category: 'Photography',    dueDate: '2026-11-25', status: 'pending',   dependsOnTaskIds: ['finalise-date'],                            priority: 'High'   },
  { id: 'send-invites',        title: 'Design & Send Wedding Invitations',     category: 'Invitations',    dueDate: '2026-12-01', status: 'pending',   dependsOnTaskIds: ['finalise-date'],                            priority: 'Medium' },
  { id: 'finalise-catering',   title: 'Finalise Catering Menu & Contract',     category: 'Catering',       dueDate: '2026-12-10', status: 'pending',   dependsOnTaskIds: ['shortlist-caterers'],                       priority: 'High'   },
  { id: 'book-decor',          title: 'Book Decor Vendor & Mandap Design',     category: 'Decor',          dueDate: '2026-12-15', status: 'pending',   dependsOnTaskIds: ['book-venue'],                               priority: 'High'   },
  { id: 'book-dj',             title: 'Book DJ & Dhol Player',                 category: 'Entertainment',  dueDate: '2026-12-20', status: 'pending',   dependsOnTaskIds: [],                                           priority: 'Medium' },
  { id: 'bridal-shopping',     title: 'Bridal Trousseau Shopping',             category: 'Misc',           dueDate: '2027-01-05', status: 'pending',   dependsOnTaskIds: ['set-budget'],                               priority: 'Medium' },
  { id: 'book-mehendi',        title: 'Book Mehendi Artist',                   category: 'Misc',           dueDate: '2027-01-10', status: 'pending',   dependsOnTaskIds: [],                                           priority: 'Medium' },
  { id: 'guest-accommodation', title: 'Arrange Outstation Guest Rooms',        category: 'Accommodation',  dueDate: '2027-01-15', status: 'pending',   dependsOnTaskIds: ['send-invites'],                             priority: 'Medium' },
  { id: 'transport-plan',      title: 'Finalise Transport & Baraat Route',     category: 'Transportation', dueDate: '2027-01-20', status: 'pending',   dependsOnTaskIds: ['book-venue'],                               priority: 'Medium' },
  { id: 'pre-wedding-shoot',   title: 'Pre-Wedding Photoshoot',                category: 'Photography',    dueDate: '2027-01-25', status: 'pending',   dependsOnTaskIds: ['book-photographer'],                        priority: 'Low'    },
  { id: 'vendor-confirmations',title: 'Reconfirm All Vendors',                 category: 'Misc',           dueDate: '2027-02-14', status: 'pending',   dependsOnTaskIds: ['finalise-catering','book-decor','book-dj'],  priority: 'High'   },
  { id: 'final-headcount',     title: 'Finalise Guest Headcount with Caterer', category: 'Catering',       dueDate: '2027-02-18', status: 'pending',   dependsOnTaskIds: ['vendor-confirmations'],                     priority: 'High'   },
  { id: 'bridal-makeup-trial', title: 'Bridal Makeup Trial Session',           category: 'Misc',           dueDate: '2027-02-20', status: 'pending',   dependsOnTaskIds: [],                                           priority: 'Low'    },
  { id: 'wedding-day',         title: '🎉 Wedding Day — Execution',            category: 'Misc',           dueDate: '2027-02-28', status: 'pending',   dependsOnTaskIds: ['vendor-confirmations','final-headcount'],  priority: 'High'   },
];

// =============================================================================
// UtsavOps AI — Event Profile & Budget Category Defaults
// =============================================================================

import type { EventProfile, BudgetCategory } from '../types/event';

export const DEFAULT_PROFILE: EventProfile = {
  occasion: 'Wedding',
  title: 'Sharma–Mehta Grand Wedding Celebration',
  date: '2027-02-28',
  totalBudget: 800000,
  guestCount: 200,
  ageGroupMix: '20% Senior Citizens, 50% Working Adults, 15% Youth, 15% Kids',
  atmosphere: 'Grand',
  prioritiesRanked: [
    'Food & Catering',
    'Venue & Hospitality',
    'Decor & Ambience',
    'Photography & Memories',
    'Entertainment & Music',
  ],
  mustHaves: [
    'Pure vegetarian multi-cuisine buffet with live Chaat counter',
    'Wheelchair accessibility for elderly grandparents',
    'Traditional Mandap with marigold + floral canopy',
    'Candid photographer + Drone video coverage',
  ],
  smartQuestions: [
    {
      id: 'q1',
      question: 'Do you have an outdoor monsoon backup plan or weather contingency for the pheras?',
      contextWhyAsked: 'February weather can vary; open lawn mandaps require waterproof covered canopies or indoor hall lock-in.',
      userAnswer: 'Yes, booking includes both AC indoor banquet and open lawn with waterproof canopy option.',
    },
    {
      id: 'q2',
      question: 'Are there strict dietary constraints (e.g., Pure Veg / Jain counters / Halal / Alcohol licensing)?',
      contextWhyAsked: 'Separate pure-veg/Jain live counters and alcohol corkage fees directly shift the per-plate catering expenditure.',
      userAnswer: 'Pure Vegetarian multi-cuisine with dedicated Jain live counter and dessert spread.',
    },
    {
      id: 'q3',
      question: 'Do you need dedicated wheelchair accessibility and child-care relaxation rooms for elderly and kid guests?',
      contextWhyAsked: 'Guest mix has 20% senior citizens and 15% kids; ramp access and quiet green rooms prevent emergency logistical bottlenecks.',
      userAnswer: 'Yes, ground floor banquet access with wheelchair ramps and 2 rest green rooms.',
    },
  ],
};

export const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: 'venue',         name: 'Venue & Hall',          allocatedAmount: 180000, actualCost: 0, isVerifiedQuote: false, notes: 'AC banquet hall for 200–250 pax including mandap area' },
  { id: 'catering',      name: 'Catering & Food',        allocatedAmount: 240000, actualCost: 0, isVerifiedQuote: false, notes: '₹1,200/head for multi-cuisine buffet — highest priority item' },
  { id: 'photography',   name: 'Photography & Video',    allocatedAmount: 80000,  actualCost: 0, isVerifiedQuote: false, notes: '2-day package: pre-wedding shoot + wedding day coverage' },
  { id: 'decor',         name: 'Decor & Floral',         allocatedAmount: 75000,  actualCost: 0, isVerifiedQuote: false, notes: 'Phera mandap, stage backdrop, floral arrangements, fairy lights' },
  { id: 'entertainment', name: 'Entertainment & Music',  allocatedAmount: 35000,  actualCost: 0, isVerifiedQuote: false, notes: 'Dhol player (baraat), DJ for reception, background music' },
  { id: 'invitations',   name: 'Invitations & Gifts',    allocatedAmount: 20000,  actualCost: 0, isVerifiedQuote: false, notes: 'Printed cards (150), WhatsApp digital card, return gifts' },
  { id: 'beauty',        name: 'Bridal Beauty & Trousseau', allocatedAmount: 45000, actualCost: 0, isVerifiedQuote: false, notes: 'Bridal makeup, hair styling, mehendi artist' },
  { id: 'transport',     name: 'Transportation',         allocatedAmount: 25000,  actualCost: 0, isVerifiedQuote: false, notes: 'Decorated bridal car, shuttle buses for outstation guests' },
  { id: 'pandit',        name: 'Pandit & Rituals',       allocatedAmount: 15000,  actualCost: 0, isVerifiedQuote: false, notes: 'Qualified pandit, pooja samagri, fire rituals' },
  { id: 'contingency',   name: 'Contingency Buffer',     allocatedAmount: 50000,  actualCost: 0, isVerifiedQuote: false, notes: '6.25% safety buffer for last-minute expenses' },
  { id: 'stationery',    name: 'Stationery & Misc',      allocatedAmount: 15000,  actualCost: 0, isVerifiedQuote: false, notes: 'Place cards, menu cards, welcome signage, day-of coordinator' },
  { id: 'accommodation', name: 'Guest Accommodation',    allocatedAmount: 20000,  actualCost: 0, isVerifiedQuote: false, notes: 'Subsidised rooms for 10–15 outstation VIP guests' },
];

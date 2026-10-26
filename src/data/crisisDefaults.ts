// =============================================================================
// UtsavOps AI — Crisis Scenarios & Trade-Off Strategy Defaults
// =============================================================================

import type { CrisisScenario, TradeOffStrategy } from '../types/event';

export const DEFAULT_CRISIS_SCENARIOS: CrisisScenario[] = [
  {
    scenario: 'Venue cancels booking 3 weeks before wedding',
    financialImpact: -180000,
    probability: 3,
    actionPlan: [
      'Contact venue immediately and demand full refund per contract clause',
      'Activate backup venue shortlist within 24 hours',
      'Notify caterer and decor vendor about potential venue change',
      'Check if wedding insurance covers venue cancellation',
      'Contact all guests about potential date/venue change',
    ],
    alternatives: [
      'Hotel Grand Ballroom – ₹2.2L, 250 pax capacity',
      'Community Club Hall – ₹1.4L, 300 pax capacity',
      'Farm House Venue – ₹1.8L with outdoor mandap',
    ],
  },
  {
    scenario: 'Catering vendor increases per-plate cost by 30% last minute',
    financialImpact: -72000,
    probability: 5,
    actionPlan: [
      'Review catering contract for price-lock clause',
      'Negotiate partial increase — accept ₹200/head max increase',
      'Reduce menu items to offset increased per-plate cost',
      'Get competing quotes from 2 backup caterers immediately',
      'Consider self-catering for 1–2 menu items to reduce volume',
    ],
    alternatives: [
      'Caterer B – ₹1,100/head (slightly fewer dishes)',
      'Dhaba-style catering – ₹900/head rustic authentic option',
    ],
  },
  {
    scenario: 'Lead photographer falls ill the week of the wedding',
    financialImpact: -80000,
    probability: 4,
    actionPlan: [
      'Confirm photographer has a backup associate in their contract',
      'Immediately contact 3 freelance photographers with your shortlist',
      'Check photography studio if they can assign a replacement team',
      'Prioritise video coverage if stills cannot be fully replaced',
      'Document all losses for potential dispute/refund claims',
    ],
    alternatives: [
      'Studio Pixels – available freelancer, ₹60,000 for the day',
      'Rahul Mehta Photography – 2-person team, ₹55,000',
    ],
  },
  {
    scenario: 'Guest count inflates by 50 additional people',
    financialImpact: -62500,
    probability: 7,
    actionPlan: [
      'Immediately inform caterer about revised headcount',
      'Notify venue to check seating capacity extension options',
      'Review contingency budget — ₹50,000 buffer available',
      'Reduce return gift cost per head to compensate',
      'Adjust table arrangements and stationery orders',
    ],
    alternatives: [
      'Adjust menu to cocktail-style with fewer hot dishes to reduce cost',
      'Use contingency fund (₹50,000) + personal contribution',
    ],
  },
  {
    scenario: 'Decor vendor delivers substandard mandap decoration',
    financialImpact: -30000,
    probability: 5,
    actionPlan: [
      'Inspect decor setup 1 day before and flag issues immediately',
      'Request immediate corrections or call backup florist',
      'Withhold final payment until corrections are made',
      'Document discrepancies vs contract with photos/video',
      'Escalate to vendor manager or owner for quick resolution',
    ],
    alternatives: [
      'Emergency florist on standby – ₹15,000 for partial replacement',
      'Use hired plants + fairy lights as simple fallback decor',
    ],
  },
];

export const DEFAULT_TRADE_OFF_STRATEGIES: TradeOffStrategy[] = [
  {
    id: 'strat-1-shield-food',
    title: 'Protect Food & Simplify Decor ⭐',
    philosophy: 'Honors Food & Catering as your #1 non-negotiable priority by protecting its full ₹2.4L allocation. The 10% budget cut and 50 extra guests are absorbed by shifting from imported floral decor to reusable fabric drapes, digital invitations, and trimming the contingency buffer.',
    newTotalBudget: 720000,
    newGuestCount: 250,
    newDate: '2027-02-28',
    categoryAdjustments: [
      { categoryId: 'catering', categoryName: 'Catering & Food', oldAmount: 240000, newAmount: 240000, delta: 0, notes: 'Protected 100% — bulk menu pricing renegotiated for 250 pax' },
      { categoryId: 'decor', categoryName: 'Decor & Floral', oldAmount: 75000, newAmount: 40000, delta: -35000, notes: 'Replaced fresh orchid arches with fairy-light drapes & marigolds' },
      { categoryId: 'contingency', categoryName: 'Contingency Buffer', oldAmount: 50000, newAmount: 30000, delta: -20000, notes: 'Reduced buffer to 4.2% to cover primary guest catering' },
      { categoryId: 'entertainment', categoryName: 'Entertainment & Music', oldAmount: 35000, newAmount: 25000, delta: -10000, notes: 'Single high-energy dhol troupe instead of separate DJ equipment' },
      { categoryId: 'invitations', categoryName: 'Invitations & Gifts', oldAmount: 20000, newAmount: 10000, delta: -10000, notes: 'Transitioned to luxury animated WhatsApp invites & web RSVP' },
      { categoryId: 'stationery', categoryName: 'Stationery & Misc', oldAmount: 15000, newAmount: 10000, delta: -5000, notes: 'Digital welcome screens instead of printed signage boards' },
    ],
    actionableCompromises: [
      'Switch mandap styling from imported fresh flowers to elegant fabric drapery, brass diyas, and local seasonal marigold strings.',
      'Transition all physical paper invitation suites to animated WhatsApp digital invitations with online RSVP tracking.',
      'Maintain food quality for all 250 guests by opting for a single signature dessert counter instead of an extensive multi-tier pastry spread.',
      'Limit printed stationery by using QR-code digital itinerary displays at the welcome lobby.',
    ],
    revisedSummary: 'Budget revised to ₹7,20,000 for 250 guests (₹2,880/head). Core catering preserved at ₹2,40,000 while decor, entertainment, and invitations were streamlined.',
  },
  {
    id: 'strat-2-per-plate',
    title: 'Per-Plate Rationalization & Live Counters (Unit Optimization)',
    philosophy: 'Restructures catering per-head cost from ₹1,200 to ₹880 by replacing expensive buffet chafers with interactive live chaat and dosa stations. Keeps decor and photography intact while accommodating the 50 extra guests.',
    newTotalBudget: 720000,
    newGuestCount: 250,
    newDate: '2027-02-28',
    categoryAdjustments: [
      { categoryId: 'catering', categoryName: 'Catering & Food', oldAmount: 240000, newAmount: 220000, delta: -20000, notes: 'Live street-food stations & optimized 4-course menu for 250 pax' },
      { categoryId: 'decor', categoryName: 'Decor & Floral', oldAmount: 75000, newAmount: 60000, delta: -15000, notes: 'Optimized stage backdrop dimensions' },
      { categoryId: 'venue', categoryName: 'Venue & Hall', oldAmount: 180000, newAmount: 165000, delta: -15000, notes: 'Negotiated daytime discount with venue manager' },
      { categoryId: 'contingency', categoryName: 'Contingency Buffer', oldAmount: 50000, newAmount: 35000, delta: -15000, notes: 'Calibrated buffer for fixed vendor contracts' },
      { categoryId: 'photography', categoryName: 'Photography & Video', oldAmount: 80000, newAmount: 70000, delta: -10000, notes: 'Single-lead candid photographer with assistant shooter' },
    ],
    actionableCompromises: [
      'Replace 4 heavy buffet gravies with 3 high-energy live culinary stations (Pav Bhaji, Dosa bar, Live Chaat) that guests love.',
      'Negotiate venue discount by agreeing to an earlier morning muhurat timing window.',
      'Package photography coverage into 1 dedicated 10-hour wedding marathon shoot rather than 2 multi-day visits.',
    ],
    revisedSummary: 'Budget rationalized to ₹7,20,000 for 250 guests (₹2,880/head). Per-plate food strategy re-engineered with live counters to save ₹20,000.',
  },
  {
    id: 'strat-3-hybrid-harmony',
    title: 'Balanced Proportional Reallocation (Hybrid Harmony)',
    philosophy: 'Distributes the 10% budget reduction symmetrically across all non-critical line items without gutting any single vendor. Maintains harmony across venue, decor, beauty, and photography.',
    newTotalBudget: 720000,
    newGuestCount: 250,
    newDate: '2027-02-28',
    categoryAdjustments: [
      { categoryId: 'catering', categoryName: 'Catering & Food', oldAmount: 240000, newAmount: 228000, delta: -12000, notes: 'Modest 5% menu trim on specialty appetizers' },
      { categoryId: 'venue', categoryName: 'Venue & Hall', oldAmount: 180000, newAmount: 168000, delta: -12000, notes: 'Waived extra lawn lighting surcharge' },
      { categoryId: 'photography', categoryName: 'Photography & Video', oldAmount: 80000, newAmount: 72000, delta: -8000, notes: 'Digital photo album delivery + 1 printed coffee table book' },
      { categoryId: 'decor', categoryName: 'Decor & Floral', oldAmount: 75000, newAmount: 62000, delta: -13000, notes: 'Blended artificial and fresh botanical centerpieces' },
      { categoryId: 'contingency', categoryName: 'Contingency Buffer', oldAmount: 50000, newAmount: 35000, delta: -15000, notes: 'Adjusted buffer for tighter scope control' },
      { categoryId: 'beauty', categoryName: 'Bridal Beauty & Trousseau', oldAmount: 45000, newAmount: 38000, delta: -7000, notes: 'Family styling package consolidated' },
      { categoryId: 'entertainment', categoryName: 'Entertainment & Music', oldAmount: 35000, newAmount: 28000, delta: -7000, notes: 'Pre-mixed curated DJ set with live dhol player' },
      { categoryId: 'transport', categoryName: 'Transportation', oldAmount: 25000, newAmount: 19000, delta: -6000, notes: 'Two coordinated group vans instead of individual sedans' },
    ],
    actionableCompromises: [
      'Blend 60% fresh fragrant florals at eye level (mandap & entrance) with 40% high-quality silk greens on high ceiling trusses.',
      'Consolidate bridal and family mehendi artists into a single team booking for group volume discount.',
      'Coordinate two scheduled 24-seater executive minibuses between hotel and banquet hall.',
    ],
    revisedSummary: 'Balanced revision to ₹7,20,000 for 250 guests. Smooth 5-15% adjustments across all categories to preserve holistic event quality.',
  },
];

// =============================================================================
// UtsavOps AI — Budget Domain Constants & Mathematical Weights
// Eliminates magic numbers across budget allocation, trade-off shocks, and crisis modeling.
// =============================================================================

/**
 * Standard Indian celebration base category weights (proportional distribution).
 */
export const BUDGET_WEIGHTS = {
  CATERING: 30,
  VENUE: 22.5,
  DECOR: 12,
  PHOTOGRAPHY: 10,
  ENTERTAINMENT: 5,
  INVITATIONS: 3,
  BEAUTY: 5,
  TRANSPORT: 3.5,
  STATIONERY: 2,
  ACCOMMODATION: 3,
  CONTINGENCY: 6.5,
} as const;

/**
 * Priority boost weights applied when user ranks non-negotiables #1 or #2.
 */
export const PRIORITY_BOOSTS = {
  TOP_PRIORITY_BOOST: 7,
  SECOND_PRIORITY_BOOST: 3,
} as const;

/**
 * Constraints and cut rates used in dynamic trade-off / shock simulation.
 */
export const TRADEOFF_CUT_RATES = {
  BUDGET_SHOCK_PCT: 0.1,        // 10% budget reduction
  TOP_CAT_HAIRCUT: 0.04,        // 4% haircut for #1 priority under value engineering
  OTHER_CAT_HAIRCUT: 0.12,      // 12% haircut for secondary envelopes
  DEFAULT_FALLBACK_RATIO: 0.9,  // 90% proportional retention fallback
} as const;

/**
 * Pre-mortem crisis scenario financial scaling factors.
 */
export const CRISIS_SCALING = {
  MIN_PLATE_PRICE_INR: 500,
  CATERING_BASE_WEIGHT_RATIO: 0.3,
  GUEST_SURGE_PCT: 0.2,           // 20% unexpected guest surge
  GUEST_SURGE_SMALL_EVENT_PCT: 0.3,
  VENUE_IMPACT_PCT: 0.2,          // 20% budget impact for venue crisis
  VENUE_FALLBACK_PRIMARY_PCT: 0.22,
  VENUE_FALLBACK_SECONDARY_PCT: 0.17,
  CONTINGENCY_MIN_PCT: 0.05,      // 5% minimum contingency
  CONTINGENCY_MAX_PCT: 0.075,     // 7.5% maximum contingency
} as const;

/**
 * UI loading animation curve factors.
 */
export const LOADING_PROGRESS = {
  CURVE_FACTOR: 0.42,
  MAX_PROGRESS_PCT: 94,
  MIN_PROGRESS_PCT: 8,
  DEFAULT_DURATION_SEC: 10,
} as const;

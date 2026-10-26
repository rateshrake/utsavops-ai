// =============================================================================
// UtsavOps AI — Gemini Service Barrel
// Re-exports all Gemini AI services cleanly for modularity and backward compatibility.
// =============================================================================

export {
  getApiKey,
  saveApiKeyToSession,
  clearSessionApiKey,
  isApiKeyAvailable,
  callGemini,
} from './geminiClient';

export {
  generateBudgetPlan,
  generateTimelineTasks,
  generateCrisisScenarios,
  generateFullPlan,
  generateSmartQuestions,
} from './planService';

export {
  simulateTradeOffs,
} from './tradeoffService';

export {
  simulateDelayImpact,
  compareVendorQuotes,
  analyzeQuotesOffline,
} from './quoteService';

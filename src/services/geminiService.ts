// =============================================================================
// UtsavOps AI — AI Service Barrel
// Re-exports all AI and OpenRouter/BYOK services cleanly for modularity.
// =============================================================================

export {
  type ProviderId,
  type ModelOption,
  type ProviderDefinition,
  PROVIDERS,
  DEFAULT_PROVIDER,
  DEFAULT_OPENROUTER_KEY,
  OPENROUTER_BASE_URL,
  OPENROUTER_MODELS,
  DEFAULT_MODEL,
  FLASH_MODELS,
  GEMINI_MODELS,
  getActiveProvider,
  setActiveProvider,
  validateProviderKey,
  getProviderApiKey,
  saveProviderApiKey,
  clearProviderApiKey,
  getProviderModel,
  saveProviderModel,
  getCustomBaseUrl,
  saveCustomBaseUrl,
  getActiveBaseUrl,
  isValidOpenRouterKey,
  resolveActiveModel,
  getSelectedModel,
  saveSelectedModel,
  getModelDisplayName,
  getApiKey,
  isCustomApiKey,
  saveApiKeyToSession,
  clearSessionApiKey,
  isApiKeyAvailable,
  extractJsonFromResponse,
  testProviderConnection,
  callLangChain,
  callGemini,
  callOpenRouter,
} from './geminiClient';

export {
  generateBudgetPlan,
  generateTimelineTasks,
  generateCrisisScenarios,
  generateFullPlan,
  generateSmartQuestions,
  generateSmartDemoPlan,
} from './planService';

export {
  simulateTradeOffs,
} from './tradeoffService';

export {
  simulateDelayImpact,
  compareVendorQuotes,
  analyzeQuotesOffline,
} from './quoteService';

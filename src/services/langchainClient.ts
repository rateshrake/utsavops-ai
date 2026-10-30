// =============================================================================
// UtsavOps AI — LangChain Multi-Provider & BYOK Engine
// Supports "Bring Your Own Key" (BYOK) across:
// 1. OpenRouter (openrouter.ai)
// 2. Groq (api.groq.com)
// 3. Google Gemini (generativelanguage.googleapis.com)
// 4. OpenAI (api.openai.com)
// 5. xAI Grok (api.x.ai)
// 6. Custom OpenAI-compatible endpoints (Ollama, Together, vLLM, etc.)
// Powered by LangChain (@langchain/openai & @langchain/core).
// =============================================================================

import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

export type ProviderId = 'openrouter' | 'groq' | 'gemini' | 'openai' | 'xai' | 'custom';

export interface ModelOption {
  id: string;
  name: string;
}

export interface ProviderDefinition {
  id: ProviderId;
  name: string;
  shortName: string;
  baseUrl: string;
  defaultModel: string;
  modelPlaceholder: string;
  keyPrefix?: string;
  keyPlaceholder: string;
  keyDocUrl: string;
}

export const PROVIDERS: Record<ProviderId, ProviderDefinition> = {
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    shortName: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openrouter/free',
    modelPlaceholder: 'e.g. openrouter/free, deepseek/deepseek-chat',
    keyPrefix: 'sk-or-',
    keyPlaceholder: 'sk-or-v1-...',
    keyDocUrl: 'https://openrouter.ai/keys',
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    shortName: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    modelPlaceholder: 'e.g. llama-3.3-70b-versatile, openai/gpt-oss-120b',
    keyPrefix: 'gsk_',
    keyPlaceholder: 'gsk_...',
    keyDocUrl: 'https://console.groq.com/keys',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    shortName: 'Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    defaultModel: 'gemini-2.5-flash',
    modelPlaceholder: 'e.g. gemini-2.5-flash, gemini-2.0-flash',
    keyPrefix: 'AIza',
    keyPlaceholder: 'AIzaSy...',
    keyDocUrl: 'https://aistudio.google.com/app/apikey',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    shortName: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    modelPlaceholder: 'e.g. gpt-4o-mini, gpt-4o',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-proj-...',
    keyDocUrl: 'https://platform.openai.com/api-keys',
  },
  xai: {
    id: 'xai',
    name: 'xAI (Grok)',
    shortName: 'Grok',
    baseUrl: 'https://api.x.ai/v1',
    defaultModel: 'grok-2-latest',
    modelPlaceholder: 'e.g. grok-2-latest, grok-beta',
    keyPrefix: 'xai-',
    keyPlaceholder: 'xai-...',
    keyDocUrl: 'https://console.x.ai',
  },
  custom: {
    id: 'custom',
    name: 'Custom (OpenAI Compatible)',
    shortName: 'Custom',
    baseUrl: 'https://api.together.xyz/v1',
    defaultModel: '',
    modelPlaceholder: 'e.g. meta-llama/Llama-3-70b-chat-hf',
    keyPlaceholder: 'Enter custom API key...',
    keyDocUrl: 'https://platform.openai.com',
  },
};

export const DEFAULT_PROVIDER: ProviderId = 'openrouter';
export const DEFAULT_OPENROUTER_KEY = (import.meta.env?.VITE_OPENROUTER_API_KEY as string) || '';
export const OPENROUTER_BASE_URL = PROVIDERS.openrouter.baseUrl;

// Backward-compatible exports
export const OPENROUTER_MODELS = ['openrouter/free'];
export const DEFAULT_MODEL = 'openrouter/free';
export const FLASH_MODELS = OPENROUTER_MODELS;
export const GEMINI_MODELS = ['gemini-2.5-flash'];
export type OpenRouterModelId = string;
export type FlashModelId = string;

// Storage Keys
const STORAGE_ACTIVE_PROVIDER = 'utsavops_active_provider';
const STORAGE_CUSTOM_BASE_URL = 'utsavops_custom_base_url';

const getProviderKeyStorageName = (p: ProviderId) => `utsavops_key_${p}`;
const getProviderModelStorageName = (p: ProviderId) => `utsavops_model_${p}`;

/**
 * Retrieves the currently active provider.
 */
export function getActiveProvider(): ProviderId {
  if (typeof window !== 'undefined') {
    const saved = sessionStorage.getItem(STORAGE_ACTIVE_PROVIDER) as ProviderId | null;
    if (saved && PROVIDERS[saved]) {
      return saved;
    }
  }
  return DEFAULT_PROVIDER;
}

/**
 * Sets the active provider and persists to sessionStorage.
 */
export function setActiveProvider(provider: ProviderId): void {
  if (typeof window !== 'undefined') {
    if (PROVIDERS[provider]) {
      sessionStorage.setItem(STORAGE_ACTIVE_PROVIDER, provider);
    }
  }
}

/**
 * Validates key format based on provider rules.
 */
export function validateProviderKey(provider: ProviderId, key?: string | null): { valid: boolean; message?: string } {
  if (!key || key.trim().length === 0) {
    return { valid: false, message: `Please enter an API key for ${PROVIDERS[provider]?.name || provider}.` };
  }

  const trimmed = key.trim();
  switch (provider) {
    case 'openrouter':
      if (!trimmed.startsWith('sk-or-') || trimmed.length < 25) {
        return { valid: false, message: 'OpenRouter keys must start with "sk-or-" and be at least 25 characters.' };
      }
      return { valid: true };
    case 'openai':
      if (!trimmed.startsWith('sk-') || trimmed.length < 20) {
        return { valid: false, message: 'OpenAI keys must start with "sk-" and be at least 20 characters.' };
      }
      return { valid: true };
    case 'groq':
      if (trimmed.length < 15) {
        return { valid: false, message: 'Groq API keys should be at least 15 characters (starts with gsk_).' };
      }
      return { valid: true };
    case 'xai':
      if (trimmed.length < 15) {
        return { valid: false, message: 'xAI API keys should be at least 15 characters (starts with xai-).' };
      }
      return { valid: true };
    case 'gemini':
      if (trimmed.length < 15) {
        return { valid: false, message: 'Google Gemini keys should be at least 15 characters long.' };
      }
      return { valid: true };
    case 'custom':
      if (trimmed.length < 3) {
        return { valid: false, message: 'Please enter a valid API key for your custom endpoint.' };
      }
      return { valid: true };
    default:
      return { valid: true };
  }
}

/** Legacy OpenRouter validator alias */
export function isValidOpenRouterKey(key?: string | null): boolean {
  return validateProviderKey('openrouter', key).valid;
}

/**
 * Retrieves the API key for a specific provider.
 */
export function getProviderApiKey(provider: ProviderId): string {
  if (typeof window !== 'undefined') {
    const sessionKey = sessionStorage.getItem(getProviderKeyStorageName(provider));
    if (sessionKey && sessionKey.trim().length > 0) {
      return sessionKey.trim();
    }

    if (provider === 'openrouter') {
      const legacyOr = sessionStorage.getItem('utsavops_openrouter_key');
      if (legacyOr && isValidOpenRouterKey(legacyOr)) {
        return legacyOr.trim();
      }
    }
  }

  if (provider === 'openrouter') {
    const envKey = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
    if (envKey && isValidOpenRouterKey(envKey)) return envKey.trim();
  }
  if (provider === 'gemini') {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (envKey && envKey.trim().length > 0) return envKey.trim();
  }
  if (provider === 'openai') {
    const envKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
    if (envKey && envKey.trim().length > 0) return envKey.trim();
  }
  if (provider === 'groq') {
    const envKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
    if (envKey && envKey.trim().length > 0) return envKey.trim();
  }
  if (provider === 'xai') {
    const envKey = import.meta.env.VITE_XAI_API_KEY as string | undefined;
    if (envKey && envKey.trim().length > 0) return envKey.trim();
  }

  return '';
}

/**
 * Saves a provider-specific API key into sessionStorage.
 */
export function saveProviderApiKey(provider: ProviderId, key: string): void {
  if (typeof window !== 'undefined') {
    const trimmed = key.trim();
    if (trimmed.length > 0) {
      sessionStorage.setItem(getProviderKeyStorageName(provider), trimmed);
      if (provider === 'openrouter') {
        sessionStorage.setItem('utsavops_openrouter_key', trimmed);
      }
    } else {
      sessionStorage.removeItem(getProviderKeyStorageName(provider));
      if (provider === 'openrouter') {
        sessionStorage.removeItem('utsavops_openrouter_key');
      }
    }
  }
}

/**
 * Clears the API key for a specific provider.
 */
export function clearProviderApiKey(provider: ProviderId): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(getProviderKeyStorageName(provider));
    if (provider === 'openrouter') {
      sessionStorage.removeItem('utsavops_openrouter_key');
      sessionStorage.removeItem('utsavops_gemini_key');
    }
  }
}

/**
 * Retrieves the active model for a provider.
 */
export function getProviderModel(provider: ProviderId): string {
  if (typeof window !== 'undefined') {
    const saved = sessionStorage.getItem(getProviderModelStorageName(provider));
    if (saved && saved.trim().length > 0) {
      return saved.trim();
    }
  }
  return PROVIDERS[provider]?.defaultModel || '';
}

/**
 * Saves the active model for a provider.
 */
export function saveProviderModel(provider: ProviderId, model: string): void {
  if (typeof window !== 'undefined') {
    const trimmed = model.trim();
    sessionStorage.setItem(getProviderModelStorageName(provider), trimmed);
    if (provider === 'openrouter') {
      sessionStorage.setItem('utsavops_openrouter_model', trimmed);
    }
  }
}

/**
 * Retrieves custom base URL if configured.
 */
export function getCustomBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = sessionStorage.getItem(STORAGE_CUSTOM_BASE_URL);
    if (saved && saved.trim().length > 0) return saved.trim();
  }
  return PROVIDERS.custom.baseUrl;
}

/**
 * Saves a custom base URL.
 */
export function saveCustomBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_CUSTOM_BASE_URL, url.trim());
  }
}

/**
 * Active base URL resolver for current provider.
 */
export function getActiveBaseUrl(): string {
  const provider = getActiveProvider();
  if (provider === 'custom') {
    return getCustomBaseUrl();
  }
  return PROVIDERS[provider]?.baseUrl || PROVIDERS.openrouter.baseUrl;
}

/**
 * Resolves active API key for current provider.
 */
export function getApiKey(): string {
  const provider = getActiveProvider();
  const key = getProviderApiKey(provider);
  return key ? key.trim() : '';
}

/**
 * Returns true if a key is currently configured for the active provider.
 */
export function isApiKeyAvailable(): boolean {
  const provider = getActiveProvider();
  const key = getApiKey();
  if (!key || key.trim().length === 0) {
    return false;
  }
  return validateProviderKey(provider, key).valid;
}

/**
 * Returns true if a custom key is saved in session for current provider.
 */
export function isCustomApiKey(): boolean {
  if (typeof window !== 'undefined') {
    const provider = getActiveProvider();
    const key = sessionStorage.getItem(getProviderKeyStorageName(provider));
    return Boolean(key && key.trim().length > 0);
  }
  return false;
}

/** Legacy aliases preserved for backward compatibility */
export function saveApiKeyToSession(key: string): void {
  saveProviderApiKey(getActiveProvider(), key);
}

export function clearSessionApiKey(): void {
  clearProviderApiKey(getActiveProvider());
}

export function getSelectedModel(): string {
  return getProviderModel(getActiveProvider());
}

export function saveSelectedModel(model: string): void {
  saveProviderModel(getActiveProvider(), model);
}

export function resolveActiveModel(modelId?: string): string {
  if (!modelId) return getSelectedModel();
  return modelId;
}

/**
 * Formats model ID to human-readable display string showing provider and model.
 */
export function getModelDisplayName(modelId?: string): string {
  const providerId = getActiveProvider();
  const provider = PROVIDERS[providerId] || PROVIDERS.openrouter;
  const model = modelId || getSelectedModel();
  if (!model) {
    return `${provider.shortName} (No Model Set)`;
  }
  return `${provider.shortName} • ${model}`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extracts clean JSON string by:
 * 1. Stripping <think>...</think> reasoning blocks
 * 2. Stripping markdown code fences (```json ... ```)
 * 3. Extracting outermost { ... }
 * 4. Cleaning trailing commas that break standard JSON.parse
 */
export function extractJsonFromResponse(raw: string): string {
  if (!raw || typeof raw !== 'string') return '{}';

  let cleaned = raw.trim();

  // 1. Strip reasoning/think blocks
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Remove markdown code blocks if the entire content is wrapped
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  // 3. Or extract markdown code fence from anywhere in the text if present
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  // 4. Find outermost JSON object { ... }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // 5. Clean trailing commas in JSON
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  return cleaned.trim();
}

/**
 * Live test function to verify an API key and user-typed model without committing changes.
 */
export async function testProviderConnection(
  provider: ProviderId,
  key: string,
  model: string,
  customBaseUrl?: string
): Promise<{ success: boolean; message: string; elapsedSeconds: number }> {
  const start = Date.now();
  const apiKey = key.trim();

  if (!apiKey) {
    return { success: false, message: `Please enter an API key for ${PROVIDERS[provider].name}.`, elapsedSeconds: 0 };
  }

  const modelName = model.trim() || PROVIDERS[provider].defaultModel;
  if (!modelName) {
    return { success: false, message: `Please type a model name to test.`, elapsedSeconds: 0 };
  }

  const baseUrl = provider === 'custom' ? (customBaseUrl || getCustomBaseUrl()) : PROVIDERS[provider].baseUrl;
  const headers: Record<string, string> = {};

  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    headers['X-Title'] = 'UtsavOps AI';
  }

  try {
    const llm = new ChatOpenAI({
      model: modelName,
      apiKey: apiKey,
      configuration: {
        baseURL: baseUrl,
        defaultHeaders: headers,
        dangerouslyAllowBrowser: true,
      },
      temperature: 0.1,
      timeout: 25000,
    });

    const res = await llm.invoke([
      new SystemMessage('Return strictly valid JSON.'),
      new HumanMessage('Return JSON: {"ping": "pong", "status": "ok"}')
    ]);

    const elapsed = Number(((Date.now() - start) / 1000).toFixed(1));
    const text = typeof res.content === 'string' ? res.content : JSON.stringify(res.content);

    if (text && text.includes('pong')) {
      return { success: true, message: `Connected to ${modelName} in ${elapsed}s!`, elapsedSeconds: elapsed };
    }
    return { success: true, message: `Connected to ${modelName} in ${elapsed}s!`, elapsedSeconds: elapsed };
  } catch (err: unknown) {
    const elapsed = Number(((Date.now() - start) / 1000).toFixed(1));
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: msg, elapsedSeconds: elapsed };
  }
}

/**
 * Executes an LLM call via LangChain ChatOpenAI targeting the selected provider and model.
 */
export async function callLangChain(
  prompt: string,
  responseSchema?: object,
  systemInstruction?: string
): Promise<string> {
  const provider = getActiveProvider();
  const providerDef = PROVIDERS[provider] || PROVIDERS.openrouter;
  const key = getApiKey();

  if (!key || key.trim().length === 0) {
    throw new Error(`API key not configured for ${providerDef.name}. Please open settings to configure.`);
  }

  const modelName = getSelectedModel() || providerDef.defaultModel;
  const baseUrl = getActiveBaseUrl();

  const enrichedPrompt = responseSchema
    ? `${prompt}\n\nCRITICAL INSTRUCTION: Return ONLY a valid JSON object matching the required schema below (with exact keys, no markdown codeblocks, no reasoning/think tags, no commentary):\n${JSON.stringify(responseSchema, null, 2)}`
    : prompt;

  const messages = [];
  if (systemInstruction && systemInstruction.trim().length > 0) {
    messages.push(
      new SystemMessage(
        `${systemInstruction}\nYou MUST output strictly valid, well-formed JSON. Do NOT wrap in markdown or include conversational text or <think> tags.`
      )
    );
  }
  messages.push(new HumanMessage(enrichedPrompt));

  const headers: Record<string, string> = {};
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    headers['X-Title'] = 'UtsavOps AI (LangChain)';
  }

  let lastError = `Unknown ${providerDef.name} API error`;

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) {
      console.log(`[LangChain ${providerDef.shortName}] Retrying request (attempt ${attempt + 1})...`);
      await sleep(1500 * attempt);
    }

    try {
      console.log(`[LangChain ${providerDef.shortName}] Calling model "${modelName}" at ${baseUrl}...`);
      const startTime = Date.now();

      const llm = new ChatOpenAI({
        model: modelName,
        apiKey: key,
        configuration: {
          baseURL: baseUrl,
          defaultHeaders: headers,
          dangerouslyAllowBrowser: true,
        },
        temperature: 0.2,
        timeout: 180000,
      });

      const result = await llm.invoke(messages);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[LangChain ${providerDef.shortName}] Response received in ${elapsed}s.`);

      const text = typeof result.content === 'string' ? result.content : JSON.stringify(result.content);

      if (text && text.trim().length > 0) {
        return extractJsonFromResponse(text);
      }
      throw new Error(`Empty response received from ${providerDef.name} model.`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[LangChain ${providerDef.shortName}] Request attempt ${attempt + 1} error:`, errorMsg);
      let message = errorMsg;

      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Authentication')) {
        message = `${providerDef.name} authentication failed (HTTP 401). Please check that your API key is valid.`;
        lastError = message;
        break;
      } else if (errorMsg.includes('429')) {
        message = `${providerDef.name} rate limit reached (HTTP 429). Please wait a few moments or switch models.`;
      } else if (errorMsg.includes('500') || errorMsg.includes('502') || errorMsg.includes('503')) {
        message = `${providerDef.name} server busy. Retrying often succeeds.`;
      } else if (errorMsg.includes('timeout') || errorMsg.includes('timed out') || errorMsg.includes('AbortError')) {
        message = `${providerDef.name} request timed out after 180 seconds.`;
      }

      lastError = message;
    }
  }

  throw new Error(lastError);
}

/**
 * Backward compatibility aliases
 */
export const callOpenRouter = callLangChain;
export const callGemini = callLangChain;

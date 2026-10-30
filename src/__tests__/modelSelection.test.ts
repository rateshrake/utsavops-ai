// =============================================================================
// UtsavOps AI — Unit Tests for Multi-Provider BYOK & Model Selection
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';

const mockStorage: Record<string, string> = {};
const mockSessionStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = val;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

// Polyfill window and sessionStorage for Node/Vitest test runner
(globalThis as unknown as { window: unknown }).window = {
  sessionStorage: mockSessionStorage,
  location: { origin: 'http://localhost:5173' },
};
(globalThis as unknown as { sessionStorage: unknown }).sessionStorage = mockSessionStorage;

import {
  PROVIDERS,
  DEFAULT_PROVIDER,
  DEFAULT_MODEL,
  DEFAULT_OPENROUTER_KEY,
  getActiveProvider,
  setActiveProvider,
  saveProviderApiKey,
  getProviderModel,
  saveProviderModel,
  getSelectedModel,
  getModelDisplayName,
  getApiKey,
  saveApiKeyToSession,
  clearSessionApiKey,
  isCustomApiKey,
  isValidOpenRouterKey,
  validateProviderKey,
} from '../services/geminiClient';

describe('Multi-Provider BYOK & Model Selection', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
  });

  it('configures OpenRouter as the default out-of-the-box provider', () => {
    expect(DEFAULT_PROVIDER).toBe('openrouter');
    expect(getActiveProvider()).toBe('openrouter');
    expect(DEFAULT_MODEL).toBe('openrouter/free');
    expect(getSelectedModel()).toBe('openrouter/free');
  });

  it('detects when no API key is configured by default', () => {
    // When no env key is provided, key defaults to empty and isApiKeyAvailable returns false
    expect(isCustomApiKey()).toBe(false);
    expect(typeof DEFAULT_OPENROUTER_KEY).toBe('string');
  });

  it('formats model display name with provider prefix', () => {
    expect(getModelDisplayName()).toBe('OpenRouter • openrouter/free');
    expect(getModelDisplayName('google/gemini-2.0-flash-exp:free')).toBe('OpenRouter • google/gemini-2.0-flash-exp:free');
  });

  it('validates provider key formats properly', () => {
    // OpenRouter
    expect(isValidOpenRouterKey('sk-or-v1-mock-valid-openrouter-key-1234567890')).toBe(true);
    expect(isValidOpenRouterKey('invalid-key')).toBe(false);

    // Gemini
    expect(validateProviderKey('gemini', 'AIzaSyD-valid-length-key-here').valid).toBe(true);
    expect(validateProviderKey('gemini', 'short').valid).toBe(false);

    // OpenAI
    expect(validateProviderKey('openai', 'sk-proj-valid-openai-key-sample-12345').valid).toBe(true);
    expect(validateProviderKey('openai', 'invalid-no-sk').valid).toBe(false);

    // Groq
    expect(validateProviderKey('groq', 'gsk_valid_groq_key_sample_12345').valid).toBe(true);
    expect(validateProviderKey('groq', 'invalid-groq').valid).toBe(false);
  });

  it('supports BYOK: user can select Google Gemini, paste their key, and choose gemini-2.5-flash', () => {
    setActiveProvider('gemini');
    expect(getActiveProvider()).toBe('gemini');

    const geminiKey = 'AIzaSyD-user-gemini-custom-key-12345';
    saveProviderApiKey('gemini', geminiKey);
    saveProviderModel('gemini', 'gemini-2.5-flash');

    expect(getApiKey()).toBe(geminiKey);
    expect(getSelectedModel()).toBe('gemini-2.5-flash');
    expect(getModelDisplayName()).toBe('Gemini • gemini-2.5-flash');
    expect(isCustomApiKey()).toBe(true);
  });

  it('supports BYOK: user can select OpenAI and use gpt-4o-mini', () => {
    setActiveProvider('openai');
    expect(getActiveProvider()).toBe('openai');

    const openaiKey = 'sk-proj-my-custom-openai-key-sample-999';
    saveProviderApiKey('openai', openaiKey);
    saveProviderModel('openai', 'gpt-4o-mini');

    expect(getApiKey()).toBe(openaiKey);
    expect(getSelectedModel()).toBe('gpt-4o-mini');
    expect(getModelDisplayName()).toBe('OpenAI • gpt-4o-mini');
  });

  it('allows user to customize OpenRouter with their own key and revert back to default', () => {
    setActiveProvider('openrouter');
    const customKey = 'sk-or-v1-custom-user-key-999888777111222333';
    saveApiKeyToSession(customKey);

    expect(isCustomApiKey()).toBe(true);
    expect(getApiKey()).toBe(customKey);

    // Revert to default OpenRouter key
    clearSessionApiKey();
    expect(isCustomApiKey()).toBe(false);
    expect(getApiKey()).toBe(DEFAULT_OPENROUTER_KEY);
  });

  it('persists and restores custom model identifiers per provider', () => {
    saveProviderModel('openrouter', 'deepseek/deepseek-chat');
    expect(getProviderModel('openrouter')).toBe('deepseek/deepseek-chat');

    saveProviderModel('gemini', 'gemini-2.0-flash');
    expect(getProviderModel('gemini')).toBe('gemini-2.0-flash');
  });

  it('supports all major provider endpoints including Groq and xAI Grok', () => {
    expect(PROVIDERS).toHaveProperty('openrouter');
    expect(PROVIDERS).toHaveProperty('gemini');
    expect(PROVIDERS).toHaveProperty('openai');
    expect(PROVIDERS).toHaveProperty('groq');
    expect(PROVIDERS).toHaveProperty('xai');
    expect(PROVIDERS).toHaveProperty('custom');
  });

  it('allows user to enter custom model for groq or xai provider', () => {
    setActiveProvider('groq');
    expect(getActiveProvider()).toBe('groq');
    saveProviderModel('groq', 'llama-3.3-70b-versatile');
    expect(getProviderModel('groq')).toBe('llama-3.3-70b-versatile');

    setActiveProvider('xai');
    expect(getActiveProvider()).toBe('xai');
    saveProviderModel('xai', 'grok-2-latest');
    expect(getProviderModel('xai')).toBe('grok-2-latest');
  });
});

// =============================================================================
// UtsavOps AI — Provider Key Validation Unit Tests
// Tests regex and format enforcement across all 6 AI providers.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { validateProviderKey, type ProviderId } from '../services/langchainClient';

describe('validateProviderKey', () => {
  it('rejects empty or whitespace keys across all providers', () => {
    const providers: ProviderId[] = ['openrouter', 'groq', 'gemini', 'openai', 'xai', 'custom'];
    for (const p of providers) {
      expect(validateProviderKey(p, '').valid).toBe(false);
      expect(validateProviderKey(p, '   ').valid).toBe(false);
      expect(validateProviderKey(p, null).valid).toBe(false);
      expect(validateProviderKey(p, undefined).valid).toBe(false);
    }
  });

  describe('OpenRouter validation', () => {
    it('accepts valid OpenRouter keys starting with sk-or-', () => {
      const validKey = 'sk-or-v1-abcdefghijklmnopqrstuvwxyz123456';
      expect(validateProviderKey('openrouter', validKey).valid).toBe(true);
    });

    it('rejects keys without sk-or- prefix', () => {
      const invalidKey = 'gsk_abcdefghijklmnopqrstuvwxyz123456';
      const res = validateProviderKey('openrouter', invalidKey);
      expect(res.valid).toBe(false);
      expect(res.message).toContain('sk-or-');
    });

    it('rejects keys shorter than 25 characters', () => {
      const shortKey = 'sk-or-short';
      expect(validateProviderKey('openrouter', shortKey).valid).toBe(false);
    });
  });

  describe('OpenAI validation', () => {
    it('accepts valid OpenAI keys starting with sk-', () => {
      const validKey = 'sk-proj-1234567890abcdefghijklmnopqrstuvwxyz';
      expect(validateProviderKey('openai', validKey).valid).toBe(true);
    });

    it('rejects OpenAI keys without sk- prefix', () => {
      const invalidKey = 'AIzaSy1234567890abcdefghijklmnopqrstuvwxyz';
      expect(validateProviderKey('openai', invalidKey).valid).toBe(false);
    });
  });

  describe('Groq validation', () => {
    it('accepts valid Groq keys', () => {
      const validKey = 'gsk_1234567890abcdefghij';
      expect(validateProviderKey('groq', validKey).valid).toBe(true);
    });

    it('rejects Groq keys shorter than 15 characters', () => {
      expect(validateProviderKey('groq', 'gsk_short').valid).toBe(false);
    });
  });

  describe('Gemini validation', () => {
    it('accepts valid Gemini keys', () => {
      const validKey = 'AIzaSy1234567890abcdefghij';
      expect(validateProviderKey('gemini', validKey).valid).toBe(true);
    });

    it('rejects Gemini keys shorter than 15 characters', () => {
      expect(validateProviderKey('gemini', 'short').valid).toBe(false);
    });
  });

  describe('Custom provider validation', () => {
    it('accepts valid custom endpoint API keys', () => {
      expect(validateProviderKey('custom', 'my-api-key').valid).toBe(true);
    });

    it('rejects single or two-character custom keys', () => {
      expect(validateProviderKey('custom', 'ab').valid).toBe(false);
    });
  });
});

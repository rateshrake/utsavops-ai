// =============================================================================
// UtsavOps AI — JSON Extraction & Sanitization Unit Tests
// Tests robustness against non-standard LLM outputs (reasoning tags, markdown fences).
// =============================================================================

import { describe, it, expect } from 'vitest';
import { extractJsonFromResponse } from '../services/langchainClient';

describe('extractJsonFromResponse', () => {
  it('strips <think>...</think> reasoning blocks cleanly', () => {
    const raw = `<think>
I need to allocate 30% to food and 22% to venue. Let me calculate...
</think>
{"planSummary": "Calculated summary", "budget": 800000}`;

    const cleaned = extractJsonFromResponse(raw);
    const parsed = JSON.parse(cleaned);

    expect(parsed).toEqual({
      planSummary: 'Calculated summary',
      budget: 800000,
    });
  });

  it('strips markdown code fences wrapping the entire JSON payload', () => {
    const raw = '```json\n{"status": "ok", "categories": ["Catering", "Venue"]}\n```';
    const cleaned = extractJsonFromResponse(raw);
    const parsed = JSON.parse(cleaned);

    expect(parsed.status).toBe('ok');
    expect(parsed.categories).toEqual(['Catering', 'Venue']);
  });

  it('extracts innermost JSON object from surrounding conversational chatter', () => {
    const raw = `Here is your customized plan:
{"id": "plan-1", "total": 500000}
Hope this helps plan your event!`;

    const cleaned = extractJsonFromResponse(raw);
    const parsed = JSON.parse(cleaned);

    expect(parsed.id).toBe('plan-1');
    expect(parsed.total).toBe(500000);
  });

  it('cleans trailing commas that would otherwise break standard JSON.parse', () => {
    const raw = '{"a": 1, "b": 2, "c": [10, 20,],}';
    const cleaned = extractJsonFromResponse(raw);

    expect(() => JSON.parse(cleaned)).not.toThrow();
    const parsed = JSON.parse(cleaned);
    expect(parsed.a).toBe(1);
    expect(parsed.c).toEqual([10, 20]);
  });

  it('returns empty object string for empty or non-string inputs', () => {
    expect(extractJsonFromResponse('')).toBe('{}');
    // @ts-expect-error Testing runtime boundary
    expect(extractJsonFromResponse(null)).toBe('{}');
    // @ts-expect-error Testing runtime boundary
    expect(extractJsonFromResponse(undefined)).toBe('{}');
  });
});

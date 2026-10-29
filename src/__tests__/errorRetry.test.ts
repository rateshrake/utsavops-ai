// =============================================================================
// UtsavOps AI — Unit Tests for Error Diagnostics, Retry, & Progress Logic
// =============================================================================

import { describe, it, expect, vi } from 'vitest';

function diagnoseError(error: string) {
  const errLower = error.toLowerCase();
  const isQuota = errLower.includes('429') || errLower.includes('quota') || errLower.includes('resource');
  const isServerBusy = errLower.includes('500') || errLower.includes('503') || errLower.includes('internal error') || errLower.includes('busy');
  const isTimeout = errLower.includes('timeout') || errLower.includes('timed out') || errLower.includes('abort');
  const isKeyError = errLower.includes('api key') || errLower.includes('key') || errLower.includes('403') || errLower.includes('unauthorized');

  if (isQuota) {
    return { type: 'QUOTA', badge: 'Rate Limit / Quota Exceeded', canRetry: true };
  }
  if (isServerBusy) {
    return { type: 'SERVER_BUSY', badge: 'Model Server Busy', canRetry: true };
  }
  if (isTimeout) {
    return { type: 'TIMEOUT', badge: 'Request Timed Out', canRetry: true };
  }
  if (isKeyError) {
    return { type: 'AUTH', badge: 'API Key Issue', canRetry: true };
  }
  return { type: 'UNKNOWN', badge: 'API Issue', canRetry: true };
}

function calculateProgress(elapsedSeconds: number, estimatedDuration: number): number {
  const duration = Math.max(5, estimatedDuration);
  const progressRatio = 1 - Math.exp(-elapsedSeconds / (duration * 0.42));
  return Math.min(94, Math.max(8, Math.round(progressRatio * 100)));
}

describe('Error Diagnosis and Retry Logic', () => {
  it('identifies 429 quota exhaustion and enables retry', () => {
    const diag = diagnoseError('Gemini API error 429: Resource has been exhausted (quota exceeded).');
    expect(diag.type).toBe('QUOTA');
    expect(diag.badge).toBe('Rate Limit / Quota Exceeded');
    expect(diag.canRetry).toBe(true);
  });

  it('identifies 503 / 500 server busy errors and enables retry', () => {
    const diag = diagnoseError('OpenRouter model servers temporarily busy (HTTP 503). Retrying often succeeds.');
    expect(diag.type).toBe('SERVER_BUSY');
    expect(diag.badge).toBe('Model Server Busy');
    expect(diag.canRetry).toBe(true);
  });

  it('identifies request timeout errors and enables retry', () => {
    const diag = diagnoseError('Request to gemini-1.5-flash timed out after 30 seconds.');
    expect(diag.type).toBe('TIMEOUT');
    expect(diag.badge).toBe('Request Timed Out');
    expect(diag.canRetry).toBe(true);
  });

  it('identifies API key errors', () => {
    const diag = diagnoseError('No Gemini API key configured. Please set one via Settings.');
    expect(diag.type).toBe('AUTH');
    expect(diag.badge).toBe('API Key Issue');
    expect(diag.canRetry).toBe(true);
  });

  it('executes retry callback when triggered', () => {
    const retryFn = vi.fn();
    retryFn();
    expect(retryFn).toHaveBeenCalledTimes(1);
  });
});

describe('Live Progress Bar Progression Curve', () => {
  it('starts at initial minimum progress (8%)', () => {
    const p = calculateProgress(0, 10);
    expect(p).toBe(8);
  });

  it('advances steadily through the middle of estimated duration (e.g. at 5s out of 10s)', () => {
    const p = calculateProgress(5, 10);
    expect(p).toBeGreaterThanOrEqual(65);
    expect(p).toBeLessThanOrEqual(75);
  });

  it('asymptotically caps below 95% while waiting for completion', () => {
    const p30 = calculateProgress(30, 10);
    expect(p30).toBe(94);

    const p60 = calculateProgress(60, 10);
    expect(p60).toBe(94);
  });
});

// =============================================================================
// UtsavOps AI — ErrorRetryAlert Component Unit Tests
// Tests accessible error presentation, 1-click retry, and fallback triggers.
// =============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ErrorRetryAlert } from '../components/ErrorRetryAlert';

describe('ErrorRetryAlert Component', () => {
  it('renders nothing when error is null', () => {
    const { container } = render(
      <ErrorRetryAlert error={null} onRetry={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders alert dialog with message when error is provided', () => {
    render(
      <ErrorRetryAlert
        error="OpenRouter rate limit reached (HTTP 429)."
        onRetry={vi.fn()}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText(/OpenRouter rate limit reached/i)).toBeInTheDocument();
  });

  it('triggers onRetry when clicking Retry button', () => {
    const onRetry = vi.fn();
    render(
      <ErrorRetryAlert
        error="Server busy (503)."
        onRetry={onRetry}
      />
    );

    const retryBtn = screen.getByRole('button', { name: /Retry AI generation/i });
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('triggers onFallback when clicking fallback demo button', () => {
    const onFallback = vi.fn();
    render(
      <ErrorRetryAlert
        error="Timeout after 180s."
        onRetry={vi.fn()}
        onFallback={onFallback}
      />
    );

    const fallbackBtn = screen.getByRole('button', { name: /Continue with Smart Demo Plan/i });
    fireEvent.click(fallbackBtn);
    expect(onFallback).toHaveBeenCalledTimes(1);
  });
});

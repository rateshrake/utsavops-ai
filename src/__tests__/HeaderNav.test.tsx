// =============================================================================
// UtsavOps AI — HeaderNav Component Unit Tests
// Tests WAI-ARIA tab navigation, keyboard roving focus, and summary pills.
// =============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { HeaderNav, type TabItem } from '../components/HeaderNav';

const MOCK_TABS: TabItem[] = [
  { id: 'discovery', stepNumber: 1, label: 'Event Setup', emoji: '✨', ariaLabel: 'Event Setup tab' },
  { id: 'budget', stepNumber: 2, label: 'Budget & What-If', emoji: '💰', ariaLabel: 'Budget & What-If tab' },
  { id: 'timeline', stepNumber: 3, label: 'Checklist', emoji: '📅', ariaLabel: 'Checklist tab' },
  { id: 'vendor', stepNumber: 4, label: 'Compare Vendors', emoji: '🔍', ariaLabel: 'Compare Vendors tab' },
];

describe('HeaderNav Component', () => {
  it('renders all tab buttons with WAI-ARIA roles', () => {
    const onTabChange = vi.fn();
    const onOpenApiModal = vi.fn();

    render(
      <HeaderNav
        tabs={MOCK_TABS}
        activeTab="discovery"
        onTabChange={onTabChange}
        totalBudget={800000}
        guestCount={200}
        daysLeft={45}
        hasApiKey={true}
        onOpenApiModal={onOpenApiModal}
        activeModel="OpenRouter • openrouter/free"
      />
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(4);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onTabChange when a tab is clicked', () => {
    const onTabChange = vi.fn();
    render(
      <HeaderNav
        tabs={MOCK_TABS}
        activeTab="discovery"
        onTabChange={onTabChange}
        totalBudget={800000}
        guestCount={200}
        daysLeft={45}
        hasApiKey={false}
        onOpenApiModal={vi.fn()}
      />
    );

    const budgetTab = screen.getByRole('tab', { name: 'Budget & What-If tab' });
    fireEvent.click(budgetTab);
    expect(onTabChange).toHaveBeenCalledWith('budget');
  });

  it('navigates with ArrowRight and ArrowLeft keyboard keys', () => {
    const onTabChange = vi.fn();
    render(
      <HeaderNav
        tabs={MOCK_TABS}
        activeTab="discovery"
        onTabChange={onTabChange}
        totalBudget={800000}
        guestCount={200}
        daysLeft={45}
        hasApiKey={true}
        onOpenApiModal={vi.fn()}
      />
    );

    const firstTab = screen.getByRole('tab', { name: 'Event Setup tab' });
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    expect(onTabChange).toHaveBeenCalledWith('budget');

    fireEvent.keyDown(firstTab, { key: 'ArrowLeft' });
    expect(onTabChange).toHaveBeenCalledWith('vendor');
  });

  it('renders summary pills and opens API settings on click', () => {
    const onOpenApiModal = vi.fn();
    render(
      <HeaderNav
        tabs={MOCK_TABS}
        activeTab="discovery"
        onTabChange={vi.fn()}
        totalBudget={1500000}
        guestCount={350}
        daysLeft={60}
        hasApiKey={true}
        onOpenApiModal={onOpenApiModal}
        activeModel="Groq • llama-3.3-70b-versatile"
      />
    );

    expect(screen.getByText('350 Guests')).toBeInTheDocument();
    expect(screen.getByText('60d')).toBeInTheDocument();

    const apiBtn = screen.getByLabelText('API key and model settings modal');
    fireEvent.click(apiBtn);
    expect(onOpenApiModal).toHaveBeenCalledTimes(1);
  });
});

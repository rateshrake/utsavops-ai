// =============================================================================
// UtsavOps AI — CategoryBreakdownTable Component Unit Tests
// Tests tabular budget envelope display, inline edits, and quote verification.
// =============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { CategoryBreakdownTable } from '../components/budget/CategoryBreakdownTable';
import type { BudgetCategory } from '../types/event';

const MOCK_CATEGORIES: BudgetCategory[] = [
  {
    id: 'catering',
    name: 'Catering & Food',
    allocatedAmount: 240000,
    actualCost: 0,
    isVerifiedQuote: true,
    notes: 'Multi-course buffet for 200 guests',
  },
  {
    id: 'venue',
    name: 'Venue & Hospitality',
    allocatedAmount: 180000,
    actualCost: 0,
    isVerifiedQuote: false,
    notes: 'AC Banquet Hall',
  },
  {
    id: 'contingency',
    name: 'Contingency Reserve',
    allocatedAmount: 52000,
    actualCost: 0,
    isVerifiedQuote: false,
    notes: 'Reserve buffer',
  },
];

const MOCK_COLORS = ['#4f46e5', '#10b981', '#f59e0b'];

describe('CategoryBreakdownTable Component', () => {
  it('renders all budget categories and amounts', () => {
    render(
      <CategoryBreakdownTable
        categories={MOCK_CATEGORIES}
        totalBudget={800000}
        guestCount={200}
        chartColors={MOCK_COLORS}
        onSaveCategory={vi.fn()}
        onToggleVerify={vi.fn()}
      />
    );

    expect(screen.getByText('Catering & Food')).toBeInTheDocument();
    expect(screen.getByText('Venue & Hospitality')).toBeInTheDocument();
    expect(screen.getByText('Contingency Reserve')).toBeInTheDocument();
    expect(screen.getByText('₹2,40,000')).toBeInTheDocument();
  });

  it('triggers onToggleVerify when clicking verified quote badge', () => {
    const onToggleVerify = vi.fn();
    render(
      <CategoryBreakdownTable
        categories={MOCK_CATEGORIES}
        totalBudget={800000}
        guestCount={200}
        chartColors={MOCK_COLORS}
        onSaveCategory={vi.fn()}
        onToggleVerify={onToggleVerify}
      />
    );

    const verifyBadges = screen.getAllByTitle(/Click to toggle between AI Estimate and Verified Quote/i);
    expect(verifyBadges.length).toBeGreaterThan(0);
    fireEvent.click(verifyBadges[0]);
    expect(onToggleVerify).toHaveBeenCalledWith(MOCK_CATEGORIES[0]);
  });

  it('enters inline edit mode on clicking Edit button', () => {
    render(
      <CategoryBreakdownTable
        categories={MOCK_CATEGORIES}
        totalBudget={800000}
        guestCount={200}
        chartColors={MOCK_COLORS}
        onSaveCategory={vi.fn()}
        onToggleVerify={vi.fn()}
      />
    );

    const editBtns = screen.getAllByTitle(/Edit allocated amount/i);
    fireEvent.click(editBtns[0]);

    const input = screen.getByRole('spinbutton');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(240000);
  });
});

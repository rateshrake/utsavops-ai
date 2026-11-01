// =============================================================================
// UtsavOps AI — NoApiConfirmModal Component Unit Tests
// Tests accessible dialog behavior, keyboard escape trapping, and modal actions.
// =============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import NoApiConfirmModal from '../components/NoApiConfirmModal';

describe('NoApiConfirmModal Component', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <NoApiConfirmModal
        isOpen={false}
        onConfirmDemo={vi.fn()}
        onOpenSettings={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal dialog when isOpen is true', () => {
    render(
      <NoApiConfirmModal
        isOpen={true}
        onConfirmDemo={vi.fn()}
        onOpenSettings={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Would you like to continue with the demo mode\?/i)).toBeInTheDocument();
  });

  it('calls onConfirmDemo when clicking Yes button', () => {
    const onConfirmDemo = vi.fn();
    render(
      <NoApiConfirmModal
        isOpen={true}
        onConfirmDemo={onConfirmDemo}
        onOpenSettings={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const yesBtn = screen.getByRole('button', { name: /Yes, Continue with Demo/i });
    fireEvent.click(yesBtn);
    expect(onConfirmDemo).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenSettings when clicking Configure API Key button', () => {
    const onOpenSettings = vi.fn();
    render(
      <NoApiConfirmModal
        isOpen={true}
        onConfirmDemo={vi.fn()}
        onOpenSettings={onOpenSettings}
        onClose={vi.fn()}
      />
    );

    const settingsBtn = screen.getByRole('button', { name: /Configure API Key/i });
    fireEvent.click(settingsBtn);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <NoApiConfirmModal
        isOpen={true}
        onConfirmDemo={vi.fn()}
        onOpenSettings={vi.fn()}
        onClose={onClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// UtsavOps AI — Priority Selection & Ranking Tests
// =============================================================================

import { describe, it, expect } from 'vitest';

const CORE_PRIORITIES = [
  'Food & Catering',
  'Venue & Hospitality',
  'Decor & Ambience',
  'Photography & Memories',
  'Entertainment & Music',
];

function movePriority(list: string[], item: string, direction: 'up' | 'down'): string[] {
  const result = [...list];
  const i = result.indexOf(item);
  if (i === -1) return result;
  if (direction === 'up' && i > 0) {
    [result[i - 1], result[i]] = [result[i], result[i - 1]];
  }
  if (direction === 'down' && i < result.length - 1) {
    [result[i + 1], result[i]] = [result[i], result[i + 1]];
  }
  return result;
}

function togglePriority(selected: string[], item: string, minRequired = 1): string[] {
  if (selected.includes(item)) {
    if (selected.length <= minRequired) {
      return selected; // protect minimum selected
    }
    return selected.filter((p) => p !== item);
  }
  return [...selected, item];
}

describe('Priority Selection and Ranking Logic', () => {
  it('allows deselecting a priority item (e.g. Entertainment & Music)', () => {
    const initial = [...CORE_PRIORITIES];
    const updated = togglePriority(initial, 'Entertainment & Music');

    expect(updated).not.toContain('Entertainment & Music');
    expect(updated).toHaveLength(4);
    expect(updated).toEqual([
      'Food & Catering',
      'Venue & Hospitality',
      'Decor & Ambience',
      'Photography & Memories',
    ]);
  });

  it('allows clicking again to re-select the deselected priority', () => {
    let priorities = [...CORE_PRIORITIES];
    // Deselect Entertainment & Music
    priorities = togglePriority(priorities, 'Entertainment & Music');
    expect(priorities).not.toContain('Entertainment & Music');

    // Click again to re-select
    priorities = togglePriority(priorities, 'Entertainment & Music');
    expect(priorities).toContain('Entertainment & Music');
    expect(priorities[priorities.length - 1]).toBe('Entertainment & Music');
  });

  it('keeps the arrows functional: allows moving a re-selected item up in priority', () => {
    let priorities = ['Food & Catering', 'Venue & Hospitality', 'Decor & Ambience', 'Photography & Memories'];
    // Re-select Entertainment & Music (enters at bottom #5)
    priorities = togglePriority(priorities, 'Entertainment & Music');
    expect(priorities[4]).toBe('Entertainment & Music');

    // Move up using Up arrow (from #5 to #4)
    priorities = movePriority(priorities, 'Entertainment & Music', 'up');
    expect(priorities[3]).toBe('Entertainment & Music');
    expect(priorities[4]).toBe('Photography & Memories');

    // Move up again (from #4 to #3)
    priorities = movePriority(priorities, 'Entertainment & Music', 'up');
    expect(priorities[2]).toBe('Entertainment & Music');

    // Move all the way to #1 (protected top priority)
    priorities = movePriority(priorities, 'Entertainment & Music', 'up');
    priorities = movePriority(priorities, 'Entertainment & Music', 'up');
    expect(priorities[0]).toBe('Entertainment & Music');
  });

  it('prevents deselecting when only 1 priority remains selected', () => {
    const single = ['Food & Catering'];
    const result = togglePriority(single, 'Food & Catering', 1);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('Food & Catering');
  });

  it('correctly calculates deselected priorities from all available priorities', () => {
    const activeSelected = ['Food & Catering', 'Venue & Hospitality', 'Photography & Memories'];
    const deselected = CORE_PRIORITIES.filter((item) => !activeSelected.includes(item));

    expect(deselected).toEqual(['Decor & Ambience', 'Entertainment & Music']);
  });
});


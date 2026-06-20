import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlantVisual, STAGE_LABELS, STAGE_DESCRIPTIONS } from '../../src/components/PlantVisual';
import { PlantStage } from '../../src/lib/types';

// Mock framer-motion dynamically to test both motion paths
const mockUseReducedMotion = jest.fn().mockReturnValue(false);

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useReducedMotion: () => mockUseReducedMotion(),
}));

const STAGES: PlantStage[] = ['wilted', 'seedling', 'budding', 'blooming', 'flourishing'];

describe('PlantVisual', () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  it('renders without crashing for each of the 5 stage values', () => {
    for (const stage of STAGES) {
      const { unmount } = render(<PlantVisual stage={stage} />);
      expect(screen.getByTestId('plant-visual')).toBeInTheDocument();
      unmount();
    }
  });

  it('the aria-label includes the stage label', () => {
    render(<PlantVisual stage="blooming" />);
    const el = screen.getByTestId('plant-visual');
    const label = el.querySelector('[aria-label]')?.getAttribute('aria-label') ?? el.getAttribute('aria-label') ?? '';
    expect(label.toLowerCase()).toContain('blooming');
  });

  it('the aria-label updates when the stage prop changes', () => {
    const { rerender } = render(<PlantVisual stage="seedling" />);
    let el = screen.getByTestId('plant-visual');
    let label = el.querySelector('[aria-label]')?.getAttribute('aria-label') ?? '';
    expect(label.toLowerCase()).toContain('seedling');

    rerender(<PlantVisual stage="flourishing" />);
    el = screen.getByTestId('plant-visual');
    label = el.querySelector('[aria-label]')?.getAttribute('aria-label') ?? '';
    expect(label.toLowerCase()).toContain('flourishing');
  });

  it('does not crash when stage transitions from lowest to highest in rapid succession', () => {
    const { rerender } = render(<PlantVisual stage="wilted" />);
    for (const stage of STAGES) {
      rerender(<PlantVisual stage={stage} />);
      expect(screen.getByTestId('plant-visual')).toBeInTheDocument();
    }
  });

  it('exports STAGE_LABELS with 5 entries', () => {
    expect(STAGE_LABELS).toHaveLength(5);
  });

  it('exports STAGE_DESCRIPTIONS with 5 entries', () => {
    expect(STAGE_DESCRIPTIONS).toHaveLength(5);
  });

  it('safely handles reduced motion and invalid/unknown stages', () => {
    mockUseReducedMotion.mockReturnValue(true);
    // Cast to any to test the safety branch when the input stage is invalid
    render(<PlantVisual stage={'nonexistent' as any} />);
    const el = screen.getByTestId('plant-visual');
    const label = el.querySelector('[aria-label]')?.getAttribute('aria-label') ?? '';
    
    // It should safely fallback to index 0 (Wilted stage)
    expect(label.toLowerCase()).toContain('wilted');
    expect(screen.getByTestId('plant-visual')).toBeInTheDocument();
  });
});

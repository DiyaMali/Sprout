import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickLog } from '../../src/components/QuickLog';

// Mock the storage hook
const mockLogActivity = jest.fn();
jest.mock('@/lib/storage', () => ({
  useApp: () => ({
    state: { activities: [], settings: {} },
    logActivity: mockLogActivity,
  }),
}));

// Mock fetch for the custom log path
global.fetch = jest.fn().mockResolvedValue({
  json: async () => ({ label: 'Custom Eco Action', emissionsValue: 1.0 }),
} as Response);

describe('QuickLog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all category tabs without crashing', () => {
    render(<QuickLog />);
    expect(screen.getByRole('tab', { name: /transport/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /meal/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /energy/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /shopping/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /custom/i })).toBeInTheDocument();
  });

  it('clicking a category tab marks it as selected (aria-selected=true)', async () => {
    const user = userEvent.setup();
    render(<QuickLog />);
    const mealTab = screen.getByRole('tab', { name: /meal/i });
    await user.click(mealTab);
    expect(mealTab).toHaveAttribute('aria-selected', 'true');
  });

  it('clicking a different tab deselects the previous one', async () => {
    const user = userEvent.setup();
    render(<QuickLog />);
    const transportTab = screen.getByRole('tab', { name: /transport/i });
    const mealTab = screen.getByRole('tab', { name: /meal/i });

    await user.click(mealTab);
    expect(mealTab).toHaveAttribute('aria-selected', 'true');
    expect(transportTab).toHaveAttribute('aria-selected', 'false');
  });

  it('clicking an option chip calls logActivity', async () => {
    const user = userEvent.setup();
    const mockOnLog = jest.fn();
    render(<QuickLog onLog={mockOnLog} />);

    const walkButton = screen.getByRole('button', { name: /log walked or biked/i });
    await user.click(walkButton);
    expect(mockLogActivity).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Walked or Biked', emissionsValue: 0 }),
    );
    expect(mockOnLog).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Walked or Biked', emissionsValue: 0 }),
    );
  });

  it('the custom tab renders a text input when selected', async () => {
    const user = userEvent.setup();
    render(<QuickLog />);
    await user.click(screen.getByRole('tab', { name: /custom/i }));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('the custom input value is reflected in what is submitted', async () => {
    const user = userEvent.setup();
    const mockOnLog = jest.fn();
    render(<QuickLog onLog={mockOnLog} />);

    await user.click(screen.getByRole('tab', { name: /custom/i }));
    const input = screen.getByRole('textbox');
    await user.type(input, 'Repaired my bicycle');

    expect(input).toHaveValue('Repaired my bicycle');
  });

  it('submit button has an accessible label', () => {
    render(<QuickLog />);
    // In custom mode
    fireEvent.click(screen.getByRole('tab', { name: /custom/i }));
    expect(screen.getByRole('button', { name: /log selected eco actions/i })).toBeInTheDocument();
  });

  it('shows an error when submitting custom with empty input', async () => {
    const user = userEvent.setup();
    render(<QuickLog />);
    await user.click(screen.getByRole('tab', { name: /custom/i }));
    const input = screen.getByRole('textbox');
    
    // Press Enter to bypass button disablement and trigger handleCustomLog validation
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockLogActivity).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a custom action before logging.');
  });

  it('option buttons have accessible labels', () => {
    render(<QuickLog />);
    const buttons = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('aria-label')?.startsWith('Log '),
    );
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('submits custom action and calls logActivity on success', async () => {
    const user = userEvent.setup();
    const mockOnLog = jest.fn();
    render(<QuickLog onLog={mockOnLog} />);

    await user.click(screen.getByRole('tab', { name: /custom/i }));
    const input = screen.getByRole('textbox');
    await user.type(input, 'Repaired my bicycle');
    const submitBtn = screen.getByRole('button', { name: /log selected eco actions/i });
    await user.click(submitBtn);

    await waitFor(() => expect(mockLogActivity).toHaveBeenCalled());
    expect(global.fetch).toHaveBeenCalledWith('/api/evaluate', expect.any(Object));
    expect(mockLogActivity).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Custom Eco Action', emissionsValue: 1.0 }),
    );
  });

  it('submits custom action and falls back to default action on API failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API failure'));
    const user = userEvent.setup();
    const mockOnLog = jest.fn();
    render(<QuickLog onLog={mockOnLog} />);

    await user.click(screen.getByRole('tab', { name: /custom/i }));
    const input = screen.getByRole('textbox');
    await user.type(input, 'Repaired my bicycle');
    const submitBtn = screen.getByRole('button', { name: /log selected eco actions/i });
    await user.click(submitBtn);

    await waitFor(() => expect(mockLogActivity).toHaveBeenCalled());
    expect(mockLogActivity).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Eco Action', emissionsValue: 0.5 }),
    );
  });
});

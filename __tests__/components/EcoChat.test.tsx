import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EcoChat } from '../../src/components/EcoChat';

let mockPrefersReduced = false;

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useReducedMotion: () => mockPrefersReduced,
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock storage with logged-in user
jest.mock('@/lib/storage', () => ({
  useApp: () => ({
    state: {
      user: { name: 'Tester', email: 'test@example.com', avatar: '' },
      activities: [],
      settings: {},
    },
  }),
}));

describe('EcoChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrefersReduced = false;
    mockFetch.mockResolvedValue({
      json: async () => ({ role: 'assistant', content: 'Here is some eco advice!' }),
    } as Response);
  });

  it('renders the toggle button without crashing', () => {
    render(<EcoChat />);
    expect(screen.getByRole('button', { name: /open sprout chat/i })).toBeInTheDocument();
  });

  it('opens the chat panel when toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<EcoChat />);
    await user.click(screen.getByRole('button', { name: /open sprout chat/i }));
    // Chat dialog should now be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('the chat dialog has aria-modal and aria-label', async () => {
    const user = userEvent.setup();
    render(<EcoChat />);
    await user.click(screen.getByRole('button', { name: /open sprout chat/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });

  it('typing in the input updates its value', async () => {
    const user = userEvent.setup();
    render(<EcoChat />);
    await user.click(screen.getByRole('button', { name: /open sprout chat/i }));
    const input = screen.getByRole('textbox', { name: /message sprout/i });
    await user.type(input, 'Hello Sprout');
    expect(input).toHaveValue('Hello Sprout');
  });

  it('submitting an empty message does not call the API', async () => {
    const user = userEvent.setup();
    render(<EcoChat />);
    await user.click(screen.getByRole('button', { name: /open sprout chat/i }));
    const sendButton = screen.getByRole('button', { name: /send message to sprout/i });
    await user.click(sendButton);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('the message history area has role="log" or aria-live="polite"', async () => {
    const user = userEvent.setup();
    render(<EcoChat />);
    await user.click(screen.getByRole('button', { name: /open sprout chat/i }));
    const log = screen.getByRole('log');
    expect(log).toBeInTheDocument();
    expect(log).toHaveAttribute('aria-live', 'polite');
  });

  it('send button has an accessible label', async () => {
    const user = userEvent.setup();
    render(<EcoChat />);
    await user.click(screen.getByRole('button', { name: /open sprout chat/i }));
    expect(screen.getByRole('button', { name: /send message to sprout/i })).toBeInTheDocument();
  });

  it('the input has an associated label', async () => {
    const user = userEvent.setup();
    render(<EcoChat />);
    await user.click(screen.getByRole('button', { name: /open sprout chat/i }));
    expect(screen.getByLabelText(/message sprout/i)).toBeInTheDocument();
  });

  it('sends a message and calls the API when input is filled', async () => {
    const user = userEvent.setup();
    render(<EcoChat />);
    await user.click(screen.getByRole('button', { name: /open sprout chat/i }));
    const input = screen.getByRole('textbox', { name: /message sprout/i });
    await user.type(input, 'How do I reduce my footprint?');
    await user.click(screen.getByRole('button', { name: /send message to sprout/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.any(Object));
    });
  });

  it('renders correctly and falls back gracefully when API call fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const user = userEvent.setup();
    render(<EcoChat />);
    await user.click(screen.getByRole('button', { name: /open sprout chat/i }));
    const input = screen.getByRole('textbox', { name: /message sprout/i });
    await user.type(input, 'Hello Sprout');
    await user.click(screen.getByRole('button', { name: /send message to sprout/i }));

    await waitFor(() => {
      expect(screen.getByText(/snag/i)).toBeInTheDocument();
    });
  });

  it('supports reduced motion mode without crashing', async () => {
    mockPrefersReduced = true;
    render(<EcoChat />);
    expect(screen.getByRole('button', { name: /open sprout chat/i })).toBeInTheDocument();
  });
});

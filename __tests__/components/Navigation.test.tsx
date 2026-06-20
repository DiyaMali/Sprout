import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navigation } from '../../src/components/Navigation';

// Mock Next.js navigation
const mockPathname = jest.fn().mockReturnValue('/');
const mockRouter = { push: jest.fn() };

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => mockRouter,
}));

// Mock the storage hook dynamically
const mockUseApp = jest.fn();
jest.mock('@/lib/storage', () => ({
  useApp: () => mockUseApp(),
}));

describe('Navigation — logged out', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/');
    mockUseApp.mockReturnValue({
      state: { user: null, activities: [], settings: {} },
      logoutUser: jest.fn(),
    });
  });

  it('renders all standard nav links', () => {
    render(<Navigation />);
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /journey/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /insights/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /weekly card/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /gallery/i })).not.toBeInTheDocument();
  });

  it('each nav link has an accessible name', () => {
    render(<Navigation />);
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAccessibleName();
    });
  });

  it('the nav element has aria-label="Main navigation"', () => {
    render(<Navigation />);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('active route link has aria-current="page"', () => {
    mockPathname.mockReturnValue('/journey');
    render(<Navigation />);
    const activeLink = screen.getByRole('link', { name: /journey/i });
    expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  it('non-active links do not have aria-current', () => {
    mockPathname.mockReturnValue('/journey');
    render(<Navigation />);
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).not.toHaveAttribute('aria-current', 'page');
  });

  it('shows Sign In link when user is not logged in', () => {
    render(<Navigation />);
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });
});

describe('Navigation — logged in', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/');
    mockUseApp.mockReturnValue({
      state: {
        user: { name: 'Eco Jane', email: 'jane@sprout.org', avatar: '' },
        activities: [],
        settings: {},
      },
      logoutUser: mockLogout,
    });
  });

  it('renders gallery link for logged-in users', () => {
    render(<Navigation />);
    expect(screen.getByRole('link', { name: /gallery/i })).toBeInTheDocument();
  });

  it('shows user initials if no avatar is provided', () => {
    render(<Navigation />);
    const initialsDiv = screen.getByText('E');
    expect(initialsDiv).toBeInTheDocument();
    expect(initialsDiv).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: /user menu for Eco Jane/i })).toBeInTheDocument();
  });

  it('shows user avatar image if provided', () => {
    mockUseApp.mockReturnValue({
      state: {
        user: { name: 'Eco Jane', email: 'jane@sprout.org', avatar: 'https://example.com/avatar.jpg' },
        activities: [],
        settings: {},
      },
      logoutUser: mockLogout,
    });

    render(<Navigation />);
    const avatarImg = screen.getByAltText('Eco Jane');
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('toggles dropdown menu on click, showing user info and sign out button', async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    const menuButton = screen.getByRole('button', { name: /user menu for Eco Jane/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();

    // Click to open dropdown
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByText('Eco Jane').length).toBeGreaterThan(0);
    expect(screen.getByText('jane@sprout.org')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();

    // Click outside to close dropdown (backdrop click simulation)
    const backdrop = document.querySelector('div.fixed')!;
    await user.click(backdrop);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
  });

  it('logs out and redirects to login when sign out is clicked', async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    const menuButton = screen.getByRole('button', { name: /user menu for Eco Jane/i });
    await user.click(menuButton);

    const signOutBtn = screen.getByRole('button', { name: /sign out/i });
    await user.click(signOutBtn);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });
});

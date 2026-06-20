'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage';
import { useState } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, logoutUser } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    setDropdownOpen(false);
    router.push('/login');
  };

  const user = state.user;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/journey', label: 'Journey' },
    { href: '/insights', label: 'Insights' },
    { href: '/weekly', label: 'Weekly Card' },
    ...(user ? [{ href: '/gallery', label: 'Gallery' }] : []),
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="bg-surface/80 nav-blur border-primary/5 fixed top-0 z-50 w-full border-b"
    >
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex items-center justify-between py-6">
        {/* Brand Logo */}
        <Link
          className="font-display text-primary text-2xl tracking-tight"
          href="/"
        >
          Sprout®
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`font-body text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary border-primary border-b pb-1'
                    : 'text-aethera-gray hover:text-primary'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="relative hidden items-center gap-4 md:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-controls="user-dropdown-menu"
                aria-label={`User menu for ${user.name}`}
                className="text-primary flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-black/5"
              >
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="border-primary/10 h-8 w-8 rounded-full border object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full font-bold"
                  >
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="font-body hidden max-w-[100px] truncate lg:inline">
                  {user.name}
                </span>
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className={`text-secondary transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    id="user-dropdown-menu"
                    className="border-primary/5 animate-fade-rise absolute right-0 z-40 mt-2 w-48 rounded-xl border bg-white/90 p-2 shadow-lg backdrop-blur-md"
                  >
                    <div className="border-primary/5 mb-1 border-b px-3 py-2">
                      <p className="font-body text-primary truncate text-xs font-semibold">
                        {user.name}
                      </p>
                      <p className="font-body text-secondary truncate text-[10px]">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="font-body flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                    >
                      <LogOut size={16} aria-hidden="true" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-primary text-on-primary rounded-full px-6 py-2.5 text-center text-sm font-medium transition-opacity hover:opacity-90"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

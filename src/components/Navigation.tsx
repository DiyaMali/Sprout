"use client";

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

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 nav-blur border-b border-primary/5">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-6 max-w-container-max mx-auto">
        {/* Brand Logo */}
        <Link className="font-display text-2xl tracking-tight text-primary" href="/">
          Sprout®
        </Link>
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link className={`font-body text-sm font-medium transition-colors ${pathname === '/' ? 'text-primary border-b border-primary pb-1' : 'text-aethera-gray hover:text-primary'}`} href="/">Home</Link>
          <Link className={`font-body text-sm font-medium transition-colors ${pathname === '/journey' ? 'text-primary border-b border-primary pb-1' : 'text-aethera-gray hover:text-primary'}`} href="/journey">Journey</Link>
          <Link className={`font-body text-sm font-medium transition-colors ${pathname === '/insights' ? 'text-primary border-b border-primary pb-1' : 'text-aethera-gray hover:text-primary'}`} href="/insights">Insights</Link>
          <Link className={`font-body text-sm font-medium transition-colors ${pathname === '/weekly' ? 'text-primary border-b border-primary pb-1' : 'text-aethera-gray hover:text-primary'}`} href="/weekly">Weekly Card</Link>
          {user && (
            <Link className={`font-body text-sm font-medium transition-colors ${pathname === '/gallery' ? 'text-primary border-b border-primary pb-1' : 'text-aethera-gray hover:text-primary'}`} href="/gallery">Gallery</Link>
          )}
        </div>
        
        <div className="hidden md:flex items-center gap-4 relative">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors text-sm font-medium text-primary"
              >
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full object-cover border border-primary/10"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="font-body hidden lg:inline max-w-[100px] truncate">{user.name}</span>
                <ChevronDown size={14} className={`text-secondary transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md border border-primary/5 rounded-xl shadow-lg p-2 z-40 animate-fade-rise">
                    <div className="px-3 py-2 border-b border-primary/5 mb-1">
                      <p className="font-body text-xs font-semibold text-primary truncate">{user.name}</p>
                      <p className="font-body text-[10px] text-secondary truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-body text-left font-medium"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity text-center">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

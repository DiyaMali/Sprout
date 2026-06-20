"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage';
import { Mail, Lock, User as UserIcon, Sparkles, Loader2 } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export default function Login() {
  const router = useRouter();
  const { state, loginUser } = useApp();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomName, setGoogleCustomName] = useState('');
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [showGoogleCustomInput, setShowGoogleCustomInput] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // If already logged in, redirect to journey
  useEffect(() => {
    if (state.user) {
      router.push('/journey');
    }
  }, [state.user, router]);

  // Sparkle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      opacity: number;
    }
    let particles: Particle[] = [];
    const init = () => {
      particles = [];
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          speedY: Math.random() * 0.2 + 0.05,
          opacity: Math.random() * 0.4 + 0.1
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y -= p.speedY;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
        ctx.fillStyle = `rgba(0, 0, 0, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', init);
    };
  }, []);

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (!isLoginMode && !name.trim()) return;

    setLoading(true);

    setTimeout(() => {
      const formattedName = isLoginMode 
        ? (email.split('@')[0] ?? email).charAt(0).toUpperCase() + (email.split('@')[0] ?? email).slice(1) 
        : name;
      
      const mockAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formattedName)}`;

      loginUser({
        name: formattedName,
        email: email,
        avatar: mockAvatar
      });
      
      setLoading(false);
      router.push('/journey');
    }, 1200);
  };

  const handleGoogleLogin = (selectedName: string, selectedEmail: string) => {
    setLoading(true);
    setShowGoogleModal(false);

    setTimeout(() => {
      const mockAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(selectedName)}`;
      loginUser({
        name: selectedName,
        email: selectedEmail,
        avatar: mockAvatar
      });
      setLoading(false);
      router.push('/journey');
    }, 1000);
  };

  return (
    <div className="relative flex-1 flex items-center justify-center pt-24 pb-20 px-margin-mobile md:px-0 min-h-[85vh] overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 -z-10 pointer-events-none" />

      {/* Styled Ambient Glow */}
      <div className="absolute top-[20%] left-[25%] -translate-x-1/2 w-[500px] h-[500px] bg-green-200/10 rounded-full blur-[120px] pointer-events-none -z-20" />
      <div className="absolute bottom-[20%] right-[25%] translate-x-1/2 w-[500px] h-[500px] bg-emerald-200/10 rounded-full blur-[120px] pointer-events-none -z-20" />

      {/* Auth Card */}
      <div className="w-full max-w-[450px] bg-white/40 backdrop-blur-xl border border-primary/5 rounded-3xl p-8 md:p-10 shadow-xl relative z-10 animate-fade-rise">
        
        {/* Card Header */}
        <div className="text-center mb-8">
          <span className="text-3xl mb-3 block">🌱</span>
          <h1 className="font-display text-4xl text-primary mb-2">Welcome to Sprout</h1>
          <p className="font-body text-sm text-secondary">Nurture your choices. Watch your garden grow.</p>
        </div>

        {/* Google Authentication Button */}
        <button
          onClick={() => setShowGoogleModal(true)}
          className="w-full flex items-center justify-center bg-white hover:bg-neutral-50 border border-primary/10 text-primary py-3.5 px-4 rounded-xl font-body text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-primary/5"></div>
          <span className="mx-4 text-xs uppercase tracking-widest text-secondary font-body font-bold">or use email</span>
          <div className="flex-grow border-t border-primary/5"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLoginMode && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-primary uppercase tracking-wide font-body">Full Name</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-secondary"><UserIcon size={18} /></span>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white/60 border border-primary/5 focus:border-primary/20 rounded-xl py-3 pl-12 pr-4 text-sm font-body text-primary outline-none transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-primary uppercase tracking-wide font-body">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-secondary"><Mail size={18} /></span>
              <input
                type="email"
                placeholder="jane.doe@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/60 border border-primary/5 focus:border-primary/20 rounded-xl py-3 pl-12 pr-4 text-sm font-body text-primary outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-primary uppercase tracking-wide font-body">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-secondary"><Lock size={18} /></span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/60 border border-primary/5 focus:border-primary/20 rounded-xl py-3 pl-12 pr-4 text-sm font-body text-primary outline-none transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-body text-sm font-bold shadow-md hover:opacity-95 transition-opacity active:scale-[0.99] flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Sparkles size={16} />
                {isLoginMode ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="font-body text-xs text-secondary hover:text-primary transition-colors underline underline-offset-4 decoration-secondary/30"
          >
            {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>

      {/* Simulated Google Accounts Chooser Popup Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-[380px] bg-white border border-primary/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-rise">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-primary/5 text-center bg-neutral-50">
              <div className="flex justify-center mb-3">
                <GoogleIcon />
              </div>
              <h3 className="font-body text-base font-semibold text-primary">Sign in with Google</h3>
              <p className="font-body text-xs text-secondary mt-1">to continue to Sprout</p>
            </div>

            {/* List of Mock Accounts */}
            <div className="p-2 space-y-1">
              <button
                onClick={() => handleGoogleLogin('Jane Doe', 'jane.doe@gmail.com')}
                className="w-full flex items-center p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=Jane%20Doe"
                  alt="Jane Doe"
                  className="w-8 h-8 rounded-full border border-primary/5 bg-neutral-100 mr-3"
                />
                <div>
                  <h4 className="font-body text-sm font-semibold text-primary">Jane Doe</h4>
                  <p className="font-body text-xs text-secondary">jane.doe@gmail.com</p>
                </div>
              </button>

              <button
                onClick={() => handleGoogleLogin('Alex Green', 'alex.green@sprout.eco')}
                className="w-full flex items-center p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=Alex%20Green"
                  alt="Alex Green"
                  className="w-8 h-8 rounded-full border border-primary/5 bg-neutral-100 mr-3"
                />
                <div>
                  <h4 className="font-body text-sm font-semibold text-primary">Alex Green</h4>
                  <p className="font-body text-xs text-secondary">alex.green@sprout.eco</p>
                </div>
              </button>

              {showGoogleCustomInput ? (
                <div className="p-3 border-t border-primary/5 mt-2 space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={googleCustomName}
                    onChange={e => setGoogleCustomName(e.target.value)}
                    className="w-full border border-primary/10 rounded-lg px-3 py-2 text-xs font-body outline-none focus:border-primary/30"
                  />
                  <input
                    type="email"
                    placeholder="custom.user@gmail.com"
                    value={googleCustomEmail}
                    onChange={e => setGoogleCustomEmail(e.target.value)}
                    className="w-full border border-primary/10 rounded-lg px-3 py-2 text-xs font-body outline-none focus:border-primary/30"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowGoogleCustomInput(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-body font-semibold hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (googleCustomName.trim() && googleCustomEmail.trim()) {
                          handleGoogleLogin(googleCustomName, googleCustomEmail);
                        }
                      }}
                      className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-body font-semibold"
                    >
                      Log In
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowGoogleCustomInput(true)}
                  className="w-full flex items-center p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left border-t border-primary/5"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-100 border border-primary/5 flex items-center justify-center mr-3 text-secondary text-sm">
                    👤
                  </div>
                  <div>
                    <h4 className="font-body text-sm font-semibold text-secondary">Use another account</h4>
                  </div>
                </button>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-50 border-t border-primary/5 flex justify-between items-center text-[10px] text-secondary font-body">
              <span>English (United States)</span>
              <button 
                onClick={() => setShowGoogleModal(false)}
                className="hover:text-primary font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

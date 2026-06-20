'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage';
import { Mail, Lock, User as UserIcon, Sparkles, Loader2 } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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
          opacity: Math.random() * 0.4 + 0.1,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
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
        ? (email.split('@')[0] ?? email).charAt(0).toUpperCase() +
          (email.split('@')[0] ?? email).slice(1)
        : name;

      const mockAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formattedName)}`;

      loginUser({
        name: formattedName,
        email: email,
        avatar: mockAvatar,
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
        avatar: mockAvatar,
      });
      setLoading(false);
      router.push('/journey');
    }, 1000);
  };

  return (
    <div className="px-margin-mobile relative flex min-h-[85vh] flex-1 items-center justify-center overflow-hidden pt-24 pb-20 md:px-0">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 -z-10"
      />

      {/* Styled Ambient Glow */}
      <div className="pointer-events-none absolute top-[20%] left-[25%] -z-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-green-200/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-[25%] bottom-[20%] -z-20 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-emerald-200/10 blur-[120px]" />

      {/* Auth Card */}
      <div className="border-primary/5 animate-fade-rise relative z-10 w-full max-w-[450px] rounded-3xl border bg-white/40 p-8 shadow-xl backdrop-blur-xl md:p-10">
        {/* Card Header */}
        <div className="mb-8 text-center">
          <span className="mb-3 block text-3xl">🌱</span>
          <h1 className="font-display text-primary mb-2 text-4xl">
            Welcome to Sprout
          </h1>
          <p className="font-body text-secondary text-sm">
            Nurture your choices. Watch your garden grow.
          </p>
        </div>

        {/* Google Authentication Button */}
        <button
          onClick={() => setShowGoogleModal(true)}
          className="border-primary/10 text-primary font-body flex w-full items-center justify-center rounded-xl border bg-white px-4 py-3.5 text-sm font-semibold shadow-sm transition-all hover:bg-neutral-50 active:scale-[0.98]"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="border-primary/5 flex-grow border-t"></div>
          <span className="text-secondary font-body mx-4 text-xs font-bold tracking-widest uppercase">
            or use email
          </span>
          <div className="border-primary/5 flex-grow border-t"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLoginMode && (
            <div className="space-y-1.5">
              <label className="text-primary font-body block text-xs font-semibold tracking-wide uppercase">
                Full Name
              </label>
              <div className="relative">
                <span className="text-secondary absolute top-3.5 left-4">
                  <UserIcon size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-primary/5 focus:border-primary/20 font-body text-primary w-full rounded-xl border bg-white/60 py-3 pr-4 pl-12 text-sm transition-colors outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-primary font-body block text-xs font-semibold tracking-wide uppercase">
              Email Address
            </label>
            <div className="relative">
              <span className="text-secondary absolute top-3.5 left-4">
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="jane.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-primary/5 focus:border-primary/20 font-body text-primary w-full rounded-xl border bg-white/60 py-3 pr-4 pl-12 text-sm transition-colors outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-primary font-body block text-xs font-semibold tracking-wide uppercase">
              Password
            </label>
            <div className="relative">
              <span className="text-secondary absolute top-3.5 left-4">
                <Lock size={18} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-primary/5 focus:border-primary/20 font-body text-primary w-full rounded-xl border bg-white/60 py-3 pr-4 pl-12 text-sm transition-colors outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-on-primary font-body mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-md transition-opacity hover:opacity-95 active:scale-[0.99]"
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
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="font-body text-secondary hover:text-primary decoration-secondary/30 text-xs underline underline-offset-4 transition-colors"
          >
            {isLoginMode
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>

      {/* Simulated Google Accounts Chooser Popup Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="border-primary/10 animate-fade-rise w-full max-w-[380px] overflow-hidden rounded-2xl border bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="border-primary/5 border-b bg-neutral-50 p-6 text-center">
              <div className="mb-3 flex justify-center">
                <GoogleIcon />
              </div>
              <h3 className="font-body text-primary text-base font-semibold">
                Sign in with Google
              </h3>
              <p className="font-body text-secondary mt-1 text-xs">
                to continue to Sprout
              </p>
            </div>

            {/* List of Mock Accounts */}
            <div className="space-y-1 p-2">
              <button
                onClick={() =>
                  handleGoogleLogin('Jane Doe', 'jane.doe@gmail.com')
                }
                className="flex w-full items-center rounded-xl p-3 text-left transition-colors hover:bg-neutral-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=Jane%20Doe"
                  alt="Jane Doe"
                  className="border-primary/5 mr-3 h-8 w-8 rounded-full border bg-neutral-100"
                />
                <div>
                  <h4 className="font-body text-primary text-sm font-semibold">
                    Jane Doe
                  </h4>
                  <p className="font-body text-secondary text-xs">
                    jane.doe@gmail.com
                  </p>
                </div>
              </button>

              <button
                onClick={() =>
                  handleGoogleLogin('Alex Green', 'alex.green@sprout.eco')
                }
                className="flex w-full items-center rounded-xl p-3 text-left transition-colors hover:bg-neutral-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://api.dicebear.com/7.x/adventurer/svg?seed=Alex%20Green"
                  alt="Alex Green"
                  className="border-primary/5 mr-3 h-8 w-8 rounded-full border bg-neutral-100"
                />
                <div>
                  <h4 className="font-body text-primary text-sm font-semibold">
                    Alex Green
                  </h4>
                  <p className="font-body text-secondary text-xs">
                    alex.green@sprout.eco
                  </p>
                </div>
              </button>

              {showGoogleCustomInput ? (
                <div className="border-primary/5 mt-2 space-y-3 border-t p-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={googleCustomName}
                    onChange={(e) => setGoogleCustomName(e.target.value)}
                    className="border-primary/10 font-body focus:border-primary/30 w-full rounded-lg border px-3 py-2 text-xs outline-none"
                  />
                  <input
                    type="email"
                    placeholder="custom.user@gmail.com"
                    value={googleCustomEmail}
                    onChange={(e) => setGoogleCustomEmail(e.target.value)}
                    className="border-primary/10 font-body focus:border-primary/30 w-full rounded-lg border px-3 py-2 text-xs outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowGoogleCustomInput(false)}
                      className="font-body rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (
                          googleCustomName.trim() &&
                          googleCustomEmail.trim()
                        ) {
                          handleGoogleLogin(
                            googleCustomName,
                            googleCustomEmail,
                          );
                        }
                      }}
                      className="bg-primary text-on-primary font-body rounded-lg px-3 py-1.5 text-xs font-semibold"
                    >
                      Log In
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowGoogleCustomInput(true)}
                  className="border-primary/5 flex w-full items-center rounded-xl border-t p-3 text-left transition-colors hover:bg-neutral-50"
                >
                  <div className="border-primary/5 text-secondary mr-3 flex h-8 w-8 items-center justify-center rounded-full border bg-neutral-100 text-sm">
                    👤
                  </div>
                  <div>
                    <h4 className="font-body text-secondary text-sm font-semibold">
                      Use another account
                    </h4>
                  </div>
                </button>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-primary/5 text-secondary font-body flex items-center justify-between border-t bg-neutral-50 p-4 text-[10px]">
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

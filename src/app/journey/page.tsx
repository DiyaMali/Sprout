'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage';
import { usePlantStage } from '@/lib/hooks/usePlantStage';
import { QuickLog } from '@/components/QuickLog';
import { PlantVisual } from '@/components/PlantVisual';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
  Trash2,
  Car,
  Leaf,
  Zap,
  ShoppingBag,
  PenLine,
} from 'lucide-react';

interface Feedback {
  type: 'good' | 'bad';
  praise?: string;
  bonusTips?: string[];
  reality?: string;
  alternatives?: string[];
}

// Metrics thresholds are defined in Constants.

export default function Journey() {
  const { state, removeActivity } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.user) {
      router.push('/login');
    }
  }, [state.user, router]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plantRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  const [loggedAction, setLoggedAction] = useState('');
  const [scoreChange, setScoreChange] = useState<number | null>(null);
  const prevScoreRef = useRef(0);

  const weeklyState = usePlantStage(state.activities);

  const todayActivities = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return state.activities.filter((a) => a.timestamp >= todayStart.getTime());
  }, [state.activities]);

  // Detect score changes and show +/- indicator
  useEffect(() => {
    if (
      state.activities.length > 0 &&
      prevScoreRef.current !== weeklyState.score
    ) {
      const delta = weeklyState.score - prevScoreRef.current;
      if (prevScoreRef.current !== 0 || state.activities.length === 1) {
        setScoreChange(delta);
        plantRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        prevScoreRef.current = weeklyState.score;
        const timer = setTimeout(() => setScoreChange(null), 3000);
        return () => clearTimeout(timer);
      }
    }
    prevScoreRef.current = weeklyState.score;
    return undefined;
  }, [weeklyState.score, state.activities.length]);

  // Particle Canvas Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const PARTICLE_COUNT = 60;

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }

    let particles: Particle[] = [];
    let animationFrameId: number;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          speedX: Math.random() * 0.4 - 0.2,
          speedY: Math.random() * 0.4 - 0.2,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;

        ctx.fillStyle = `rgba(0, 0, 0, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleLog = async (activity: {
    categoryId: string;
    label: string;
    emissionsValue: number;
  }) => {
    setLoggedAction(activity.label);
    setIsFetchingFeedback(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity,
          apiKeyOverride: state.settings.geminiApiKey,
        }),
      });
      const data = await res.json();
      setFeedback(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingFeedback(false);
    }
  };

  if (!state.user) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-x-hidden pt-32 pb-24">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out 2s infinite; }
        .animate-float-slow { animation: float 8s ease-in-out 1s infinite; }
        .glass {
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(40px);
            -webkit-backdrop-filter: blur(40px);
            border: 1px solid rgba(0, 0, 0, 0.05);
        }
      `,
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 -z-10 h-full w-full"
      />

      {/* Hero Content */}
      <div className="max-w-container-max px-margin-mobile md:px-margin-desktop animate-fade-rise mb-16 w-full text-center">
        <span className="font-body text-secondary mb-4 block text-xs font-semibold tracking-widest uppercase">
          Digital Ecosystem
        </span>
        <h1 className="font-display text-primary mb-6 text-5xl leading-none md:text-7xl">
          Your Living Garden
        </h1>
        <p className="font-body text-secondary mx-auto max-w-2xl text-lg italic">
          A reflection of your sustainable choices, visualized through a digital
          organism that breathes and grows with your progress.
        </p>
      </div>

      {/* Central Visualization Area */}
      <div
        ref={plantRef}
        className="animate-fade-rise-delayed relative flex h-[614px] w-full max-w-[1200px] items-center justify-center"
      >
        {/* Score Change Badge */}
        {scoreChange !== null && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`font-body absolute top-[5%] left-1/2 z-30 -translate-x-1/2 animate-bounce rounded-full px-6 py-3 text-lg font-bold shadow-lg ${
              scoreChange > 0
                ? 'border border-green-300 bg-green-100 text-green-800'
                : 'border border-red-300 bg-red-100 text-red-800'
            }`}
          >
            {scoreChange > 0 ? `+${scoreChange}` : scoreChange} points
          </div>
        )}

        {/* Main Plant Visual */}
        <div className="relative z-10 flex h-full w-full items-end justify-center">
          <div
            className="max-w-2xl origin-bottom transition-all duration-[1500ms] ease-out"
            style={{
              transform: `scale(${0.3 + (Math.max(0, weeklyState.score) / 100) * 0.7})`,
              filter: `saturate(${0.2 + (Math.max(0, weeklyState.score) / 100) * 1.3}) brightness(${0.7 + (Math.max(0, weeklyState.score) / 100) * 0.4}) drop-shadow(0 0 ${Math.round(Math.max(0, weeklyState.score) / 3)}px rgba(34, 139, 34, ${Math.max(0, weeklyState.score) / 200}))`,
              opacity: 0.5 + (Math.max(0, weeklyState.score) / 100) * 0.5,
            }}
          >
            <ErrorBoundary>
              <PlantVisual
                stage={weeklyState.plantStage}
                className="h-[320px] w-[320px] object-contain drop-shadow-2xl md:h-[400px] md:w-[400px]"
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* Plant Stage */}
        <div className="animate-float-slow absolute top-[10%] left-[10%] z-20 hidden md:block">
          <div className="glass w-64 rounded-xl p-8 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span
                className="text-primary text-[20px] font-bold"
                aria-hidden="true"
              >
                ✧
              </span>
              <span className="font-body text-secondary text-xs font-semibold tracking-wider uppercase">
                Plant Stage
              </span>
            </div>
            <div className="font-display text-primary mb-2 text-3xl leading-tight capitalize">
              {weeklyState.plantStage.replace('-', ' ')}
            </div>
            <div className="bg-surface-variant h-1 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all duration-1000"
                style={{
                  width: `${Math.max(0, Math.min(100, weeklyState.score))}%`,
                }}
              ></div>
            </div>
            <p className="font-body text-secondary mt-3 text-[14px] italic">
              {weeklyState.stageDescription}
            </p>
          </div>
        </div>

        {/* Eco Score */}
        <div className="animate-float absolute bottom-[15%] left-[5%] z-20 hidden md:block">
          <div className="glass w-72 rounded-xl p-8 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span
                className="text-primary text-[20px] font-bold"
                aria-hidden="true"
              >
                ~
              </span>
              <span className="font-body text-secondary text-xs font-semibold tracking-wider uppercase">
                Eco Score
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <div
                className="font-display text-6xl leading-none transition-colors duration-1000"
                style={{
                  color:
                    weeklyState.score >= 60
                      ? `hsl(${120}, 40%, 30%)`
                      : weeklyState.score >= 30
                        ? `hsl(${40}, 60%, 40%)`
                        : `hsl(${0}, 50%, 40%)`,
                }}
              >
                {Math.round(weeklyState.score)}
              </div>
              <div className="font-display text-secondary text-3xl">/100</div>
            </div>
            <p className="font-body text-secondary mt-4 text-[14px] leading-relaxed">
              {state.activities.length === 0
                ? 'Log your first action to see your score.'
                : weeklyState.score >= 80
                  ? 'Outstanding! Your choices are nurturing the planet.'
                  : weeklyState.score >= 60
                    ? 'Great balance. A few more green choices will push you higher.'
                    : weeklyState.score >= 40
                      ? 'Mixed choices. Try swapping one habit this week.'
                      : weeklyState.score >= 20
                        ? 'Room to grow. Small changes make a big difference.'
                        : 'Your garden needs help. Try a green choice next.'}
            </p>
            <div className="font-body text-secondary/70 mt-3 text-[11px]">
              Based on {state.activities.length} logged{' '}
              {state.activities.length === 1 ? 'action' : 'actions'}
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="animate-float-delayed absolute top-[20%] right-[10%] z-20 hidden md:block">
          <div className="glass flex w-60 flex-col items-center rounded-xl p-8 text-center shadow-sm">
            <div className="font-body text-secondary mb-4 text-xs font-semibold tracking-widest uppercase">
              Current Streak
            </div>
            <div className="relative">
              <svg
                className="h-32 w-32 -rotate-90 transform"
                aria-hidden="true"
              >
                <circle
                  className="text-surface-variant"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="2"
                ></circle>
                <circle
                  className="text-primary transition-all duration-1000"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="56"
                  stroke="currentColor"
                  strokeDasharray="351.8"
                  strokeDashoffset={
                    351.8 -
                    (351.8 * Math.min(weeklyState.streakLength, 30)) / 30
                  }
                  strokeWidth="2"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-primary text-4xl leading-none">
                  {weeklyState.streakLength}
                </span>
                <span className="font-body text-secondary text-[10px] font-semibold uppercase">
                  Days
                </span>
              </div>
            </div>
            <p className="font-body text-secondary mt-4 text-[14px]">
              Uninterrupted growth.
            </p>
          </div>
        </div>
      </div>

      <div className="px-margin-mobile animate-fade-rise-delayed-2 mt-12 w-full max-w-2xl">
        {/* Mobile Metrics Dashboard */}
        <div className="animate-fade-rise mb-10 block md:hidden">
          <div className="glass border-primary/5 grid grid-cols-3 gap-4 rounded-2xl border p-5 text-center">
            <div>
              <div className="font-body text-secondary mb-1 text-[10px] font-semibold tracking-wider uppercase">
                Eco Score
              </div>
              <div className="font-display text-primary text-2xl">
                {Math.round(weeklyState.score)}/100
              </div>
            </div>
            <div>
              <div className="font-body text-secondary mb-1 text-[10px] font-semibold tracking-wider uppercase">
                Stage
              </div>
              <div className="font-display text-primary truncate text-sm capitalize">
                {weeklyState.plantStage.replace('-', ' ')}
              </div>
            </div>
            <div>
              <div className="font-body text-secondary mb-1 text-[10px] font-semibold tracking-wider uppercase">
                Streak
              </div>
              <div className="font-display text-primary text-2xl">
                {weeklyState.streakLength} Days
              </div>
            </div>
          </div>
        </div>

        <h2 className="font-display text-primary mb-6 text-center text-3xl">
          Log an Action
        </h2>
        <QuickLog onLog={handleLog} />

        {/* Instant Feedback Block — aria-live for screen readers */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Eco action feedback"
        >
          {(isFetchingFeedback || feedback) && (
            <div className="animate-fade-rise mt-6 flex w-full flex-col gap-4">
              {loggedAction && (
                <div className="mb-1 text-center">
                  <span className="font-body text-secondary text-xs tracking-widest uppercase">
                    Your action
                  </span>
                  <h3 className="font-display text-primary text-xl italic">
                    &ldquo;{loggedAction}&rdquo;
                  </h3>
                </div>
              )}
              <ErrorBoundary>
                {isFetchingFeedback ? (
                  <div className="text-secondary border-primary/5 flex items-center justify-center gap-3 rounded-2xl border bg-white/60 py-6 backdrop-blur-md">
                    <Loader2
                      size={18}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                    <span className="font-body text-sm">
                      Analyzing &ldquo;{loggedAction}&rdquo;...
                    </span>
                  </div>
                ) : feedback?.type === 'good' ? (
                  <div className="rounded-2xl border border-green-200/60 bg-gradient-to-br from-green-50 to-emerald-50/50 p-6 shadow-sm backdrop-blur-md">
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles
                        size={20}
                        className="text-green-600"
                        aria-hidden="true"
                      />
                      <h4 className="font-body text-xs font-bold tracking-widest text-green-800 uppercase">
                        Great Choice!
                      </h4>
                    </div>
                    <p className="font-body mb-5 text-sm leading-relaxed text-green-900">
                      {feedback.praise}
                    </p>
                    <div className="border-t border-green-200/50 pt-4">
                      <h5 className="font-body mb-3 text-[10px] font-bold tracking-widest text-green-700 uppercase">
                        Bonus Tips to Go Further
                      </h5>
                      <div className="flex flex-col gap-2">
                        {feedback.bonusTips?.map((tip: string, i: number) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <CheckCircle2
                              size={16}
                              className="mt-0.5 flex-shrink-0 text-green-500"
                              aria-hidden="true"
                            />
                            <p className="font-body text-sm text-green-800">
                              {tip}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : feedback?.type === 'bad' ? (
                  <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-red-50/50 p-6 shadow-sm backdrop-blur-md">
                    <div className="mb-4 flex items-center gap-2">
                      <AlertTriangle
                        size={20}
                        className="text-amber-600"
                        aria-hidden="true"
                      />
                      <h4 className="font-body text-xs font-bold tracking-widest text-amber-800 uppercase">
                        Consider This
                      </h4>
                    </div>
                    <p className="font-body mb-5 text-sm leading-relaxed text-amber-900">
                      {feedback.reality}
                    </p>
                    <div className="border-t border-amber-200/50 pt-4">
                      <h5 className="font-body mb-3 text-[10px] font-bold tracking-widest text-amber-700 uppercase">
                        Better Alternatives
                      </h5>
                      <div className="flex flex-col gap-2">
                        {feedback.alternatives?.map(
                          (alt: string, i: number) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <XCircle
                                size={16}
                                className="mt-0.5 flex-shrink-0 text-amber-500"
                                aria-hidden="true"
                              />
                              <p className="font-body text-sm text-amber-800">
                                {alt}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </ErrorBoundary>
            </div>
          )}
        </div>

        {/* Today's Activity Log */}
        <div className="border-primary/5 mt-8 rounded-2xl border bg-white/40 p-6 shadow-sm backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="text-primary text-[20px] font-bold"
                aria-hidden="true"
              >
                🗒
              </span>
              <h2 className="font-display text-primary text-2xl">
                Today&apos;s Choices
              </h2>
            </div>
            <span className="font-body text-secondary bg-surface-variant rounded-full px-3 py-1 text-xs font-semibold">
              {todayActivities.length}{' '}
              {todayActivities.length === 1 ? 'choice' : 'choices'}
            </span>
          </div>

          {todayActivities.length === 0 ? (
            <div className="text-secondary font-body py-8 text-center text-sm italic">
              No choices logged today yet. Start logging above to grow your
              plant!
            </div>
          ) : (
            <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
              {todayActivities.map((act) => {
                const isGood = act.emissionsValue <= 1.5;
                const timeString = new Date(act.timestamp).toLocaleTimeString(
                  [],
                  { hour: '2-digit', minute: '2-digit' },
                );

                let CatIcon = PenLine;
                if (act.categoryId === 'transport') CatIcon = Car;
                else if (act.categoryId === 'meal') CatIcon = Leaf;
                else if (act.categoryId === 'energy') CatIcon = Zap;
                else if (act.categoryId === 'shopping') CatIcon = ShoppingBag;

                return (
                  <div
                    key={act.id}
                    className="border-primary/5 group flex items-center justify-between rounded-xl border bg-white/70 p-4 backdrop-blur-md transition-colors hover:bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2.5 ${isGood ? 'animate-pulse bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}
                        aria-hidden="true"
                      >
                        <CatIcon size={18} />
                      </div>
                      <div>
                        <h3 className="font-body text-primary text-sm font-semibold">
                          {act.label}
                        </h3>
                        <p className="font-body text-secondary/80 text-xs">
                          {act.categoryId.charAt(0).toUpperCase() +
                            act.categoryId.slice(1)}{' '}
                          • {timeString}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`font-body rounded-full px-2.5 py-1 text-xs font-bold ${isGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        aria-label={`${isGood ? 'Plus' : 'Minus'} 10 points`}
                      >
                        {isGood ? '+10' : '-10'} pts
                      </span>
                      <button
                        onClick={() => removeActivity(act.id)}
                        className="text-secondary/40 rounded-lg p-1.5 opacity-0 transition-colors transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 focus:opacity-100"
                        aria-label={`Remove ${act.label} from log`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Insights Section */}
      <div className="max-w-container-max px-margin-mobile md:px-margin-desktop mt-32 grid w-full grid-cols-1 gap-6 md:grid-cols-12">
        <div className="flex flex-col justify-center md:col-span-4">
          <h2 className="font-display text-primary mb-6 text-4xl">
            Nurturing Change
          </h2>
          <p className="font-body text-secondary mb-8 text-lg leading-relaxed">
            Every small action you take—from choosing a reusable cup to opting
            for public transport—infuses your garden with energy.
          </p>
          <div className="border-t border-black/10 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-body text-primary text-xs font-semibold tracking-wider uppercase">
                Soil Health
              </span>
              <span className="font-body text-secondary">
                {weeklyState.soilHealth}
              </span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-body text-primary text-xs font-semibold tracking-wider uppercase">
                Luminosity
              </span>
              <span className="font-body text-secondary">
                {weeklyState.luminosity}
              </span>
            </div>
          </div>
        </div>
        <div className="relative md:col-span-8">
          <div className="glass flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl p-12">
            <div className="relative z-10 flex w-full flex-col items-center text-center">
              <span
                className="text-primary/20 mb-6 text-4xl"
                aria-hidden="true"
              >
                ✧
              </span>
              <blockquote className="font-display text-primary mb-4 text-3xl italic">
                &ldquo;The forest is not a collection of trees, but a network of
                relationships.&rdquo;
              </blockquote>
              <p className="font-body text-secondary max-w-md">
                Continue your journey to unlock the &lsquo;Ancient Grove&rsquo;
                habitat and invite new species to your digital biosphere.
              </p>
            </div>
            <div
              className="absolute inset-0 z-0 opacity-[0.03]"
              aria-hidden="true"
            >
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAoATjE1mTmvNIa65TMsdNiSYQ-i0XkOs-xxSf954A50JMUK9cZLwr8iNYcrSZMJp2L36guVUPbXWrMhUH2P62Ul3WbH9i4w3GW7HEvNJmTz7Hcabf0YQzPmuFGQb_UvmGdvbpdsDt66t5gE1znDHflSR6qkYRXBapEDk_Nff0VuKCLmrH4rMClJKlWOnUD_bE601j0YMIvAZsbRmG4FOsVFtse76R9MKEFZlR1imUOokSEDgbyGoXXuX9Y0ym0yW9ggiLiLvbUV2M'",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

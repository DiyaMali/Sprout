"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage';
import { InsightResponse } from '@/lib/types';
import { computeWeeklyEmissions, computeRollingScore } from '@/lib/logic';
import { Car, Leaf, Zap, ShoppingBag, Award } from 'lucide-react';

export default function Insights() {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.user) {
      router.push('/login');
    }
  }, [state.user, router]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const weeklyEmissions = useMemo(() => computeWeeklyEmissions(state.activities), [state.activities]);
  const score = useMemo(() => computeRollingScore(weeklyEmissions), [weeklyEmissions]);

  // Group emissions by category
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = { transport: 0, meal: 0, energy: 0, shopping: 0 };
    let total = 0;

    state.activities.forEach(act => {
      const value = act.emissionsValue || 0;
      if (categories[act.categoryId] !== undefined) {
        categories[act.categoryId] += value;
        total += value;
      }
    });

    return {
      breakdown: categories,
      total,
      percentages: {
        transport: total > 0 ? Math.round((categories.transport / total) * 100) : 0,
        meal: total > 0 ? Math.round((categories.meal / total) * 100) : 0,
        energy: total > 0 ? Math.round((categories.energy / total) * 100) : 0,
        shopping: total > 0 ? Math.round((categories.shopping / total) * 100) : 0,
      }
    };
  }, [state.activities]);

  // Calculate dynamic equivalency based on total emissions
  const carbonEquivalent = useMemo(() => {
    const total = categoryData.total;
    if (total === 0) return null;
    
    if (total < 1) {
      return {
        value: Math.round(total / 0.1),
        label: "fully charging a smartphone",
        icon: "📱"
      };
    } else if (total < 5) {
      return {
        value: (total / 0.5).toFixed(1),
        label: "hours of running a home AC unit",
        icon: "❄️"
      };
    } else if (total < 25) {
      return {
        value: (total / 2.5).toFixed(1),
        label: "gallons of gasoline burned",
        icon: "⛽"
      };
    } else {
      return {
        value: (total / 5.0).toFixed(1),
        label: "beef burgers consumed",
        icon: "🍔"
      };
    }
  }, [categoryData.total]);

  // Challenges Tracking
  const challengesList = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyActivities = state.activities.filter(a => a.timestamp >= sevenDaysAgo);

    const greenCommuteLogged = weeklyActivities.filter(a => a.categoryId === 'transport' && a.emissionsValue <= 1.2).length;
    const plantBasedLogged = weeklyActivities.filter(a => a.categoryId === 'meal' && a.emissionsValue <= 0.8).length;
    const energySaveLogged = weeklyActivities.filter(a => a.categoryId === 'energy' && a.emissionsValue <= 0.5).length;

    return [
      {
        id: 'commute',
        title: 'Green Commuter',
        description: 'Log 3 clean travel choices (Transit / Walk / Bike) this week.',
        current: Math.min(3, greenCommuteLogged),
        target: 3,
        icon: Car,
        color: 'text-blue-600 bg-blue-50/50 border-blue-100',
        barColor: 'bg-blue-500'
      },
      {
        id: 'meal',
        title: 'Plant-Based Pioneer',
        description: 'Log 3 vegetarian or vegan meals this week.',
        current: Math.min(3, plantBasedLogged),
        target: 3,
        icon: Leaf,
        color: 'text-green-600 bg-green-50/50 border-green-100',
        barColor: 'bg-green-500'
      },
      {
        id: 'energy',
        title: 'Energy Saver',
        description: 'Log 2 eco-friendly energy choices (Eco-Mode / Off) this week.',
        current: Math.min(2, energySaveLogged),
        target: 2,
        icon: Zap,
        color: 'text-amber-600 bg-amber-50/50 border-amber-100',
        barColor: 'bg-amber-500'
      }
    ];
  }, [state.activities]);

  useEffect(() => {
    async function fetchInsight() {
      if (state.activities.length === 0) {
        setInsight({
          insight: "Awaiting your first step. Log an activity to begin your journey of awareness.",
          suggestion: "Visit your Garden and log a sustainable choice to see it grow.",
          title: "First Steps",
          quote: "The journey of a thousand miles begins with a single step."
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity: state.activities[0],
            weeklyEmissions,
            score,
            apiKeyOverride: state.settings.geminiApiKey,
          }),
        });
        const data = await response.json();
        setInsight(data);
      } catch {
        setInsight({
          insight: "The choices you've made are not just ripples, but waves of intent. Your awareness acts as the sunlight that filters through the canopy of your daily routine.",
          suggestion: "Transition your evening routine to a 'Low-Lumen' hour.",
          title: "Deepen the Root",
          quote: "Sustainability is not a destination, but a state of being conscious in every moment."
        });
      } finally {
        setLoading(false);
      }
    }
    fetchInsight();
  }, [state.activities, state.settings.geminiApiKey, weeklyEmissions, score]);

  // Sparkle Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Sparkle {
      x: number = 0; y: number = 0; size: number = 0; alpha: number = 0; speed: number = 0; fade: number = 0;
      constructor() { this.init(); }
      init() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2;
        this.alpha = Math.random();
        this.speed = Math.random() * 0.01 + 0.005;
        this.fade = Math.random() * 0.02 + 0.005;
      }
      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(0, 0, 0, ${this.alpha})`;
        ctx!.fill();
      }
      update() {
        this.alpha -= this.fade;
        if (this.alpha <= 0) this.init();
      }
    }

    const sparkles: Sparkle[] = [];
    for (let i = 0; i < 40; i++) sparkles.push(new Sparkle());

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparkles.forEach(s => { s.update(); s.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!state.user) {
    return null;
  }

  return (
    <div className="flex-grow pt-32 pb-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full animate-fade-rise">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(40px);
            -webkit-backdrop-filter: blur(40px);
            border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .asymmetric-grid {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 64px;
        }
        @media (max-width: 768px) {
            .asymmetric-grid {
                grid-template-columns: 1fr;
                gap: 32px;
            }
        }
      `}} />

      {/* Large Editorial Headline */}
      <header className="mb-20">
        <p className="font-body text-xs font-semibold text-secondary mb-4 uppercase tracking-[0.2em]">Monthly Reflection</p>
        <h1 className="font-display text-6xl md:text-8xl leading-tight max-w-4xl text-primary">
          Growth through <span className="italic">awareness.</span>
        </h1>
      </header>

      <div className="asymmetric-grid">
        {/* Left Column: Featured AI Reflection */}
        <section className="relative group animate-fade-rise-delayed">
          <div className="glass-card p-12 md:p-16 relative overflow-hidden flex flex-col justify-between h-full min-h-[500px] rounded-xl">
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"></canvas>
            <div className="relative z-10">
              <span className="text-primary mb-8 text-4xl block">✧</span>
              <h2 className="font-display text-4xl mb-8 leading-tight text-primary">
                {loading ? 'Consulting the Oracle...' : 'Your digital garden is breathing more deeply this week.'}
              </h2>
              <div className="space-y-6 max-w-xl">
                <p className="font-body text-lg text-on-surface leading-relaxed italic opacity-80">
                  &ldquo;{loading ? '...' : insight?.insight}&rdquo;
                </p>
              </div>
            </div>
            <div className="relative z-10 mt-12 flex items-center gap-4">
              <div className="w-12 h-12 border border-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_fkMad5lxlP7THOT3Qwb1ppTGcV0HL-Yx6NQrcuQkLf2BZxXjTkIQuYx3y2GTeWuipTSkKewbhHlRuHJugWVEOWFvjBrQDt1m5phfPr1ZQaOw0lQd6wMkugMadyDAz6mWTOSoA39oq_WhlsIpIFGgR_86klXG4DgIDRmfBrq_ztZw7VXWUbkdcYSZTzvRLq1zMbVEozp5b9zKNZWf6GoikOdR9NAwDIHHW4Fk1hp415XxqBdb5yjz1Ckx2Rp1_-NjSYrQ9AWEgpM" 
                  alt="Avatar" 
                />
              </div>
              <p className="font-body text-xs font-semibold uppercase text-secondary">CURATED BY AETHERA AI • {new Date().toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}</p>
            </div>
          </div>
        </section>

        {/* Right Column: Secondary Content & Next Step */}
        <aside className="flex flex-col gap-8 animate-fade-rise-delayed-2">
          {/* Carbon Footprint Analytics Widget */}
          <div className="border border-outline-variant p-8 bg-white rounded-xl shadow-sm">
            <p className="font-body text-xs font-semibold text-secondary mb-4 uppercase tracking-wider">Carbon Analytics</p>
            <div className="mb-6">
              <span className="font-display text-4xl text-primary">{categoryData.total.toFixed(1)}</span>
              <span className="font-body text-xs text-secondary ml-1">kg CO2e this week</span>
            </div>

            {categoryData.total === 0 ? (
              <p className="font-body text-sm text-secondary italic">
                No activity logged this week yet. Start logging on your Journey to see your analytics.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Transport bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-body mb-1">
                    <span className="flex items-center gap-1.5 text-primary"><Car size={14} className="text-blue-500" /> Transport</span>
                    <span className="font-semibold text-secondary">{categoryData.percentages.transport}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${categoryData.percentages.transport}%` }}></div>
                  </div>
                </div>

                {/* Meal bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-body mb-1">
                    <span className="flex items-center gap-1.5 text-primary"><Leaf size={14} className="text-green-500" /> Meals</span>
                    <span className="font-semibold text-secondary">{categoryData.percentages.meal}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${categoryData.percentages.meal}%` }}></div>
                  </div>
                </div>

                {/* Energy bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-body mb-1">
                    <span className="flex items-center gap-1.5 text-primary"><Zap size={14} className="text-amber-500" /> Energy</span>
                    <span className="font-semibold text-secondary">{categoryData.percentages.energy}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${categoryData.percentages.energy}%` }}></div>
                  </div>
                </div>

                {/* Shopping bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-body mb-1">
                    <span className="flex items-center gap-1.5 text-primary"><ShoppingBag size={14} className="text-purple-500" /> Shopping</span>
                    <span className="font-semibold text-secondary">{categoryData.percentages.shopping}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${categoryData.percentages.shopping}%` }}></div>
                  </div>
                </div>

                {/* Equivalency Card */}
                {carbonEquivalent && (
                  <div className="mt-6 p-4 bg-surface-variant/50 rounded-xl border border-primary/5 flex items-start gap-3">
                    <span className="text-2xl">{carbonEquivalent.icon}</span>
                    <div>
                      <h4 className="font-body text-xs font-bold text-primary uppercase tracking-wide">Equivalency</h4>
                      <p className="font-body text-xs text-secondary mt-0.5">
                        Equivalent to <span className="font-semibold text-primary">{carbonEquivalent.value}</span> {carbonEquivalent.label}.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Suggested Next Step Card */}
          <div className="border border-outline-variant p-8 flex flex-col items-start bg-white rounded-xl shadow-sm">
            <p className="font-body text-xs font-semibold text-secondary mb-6 uppercase">SUGGESTED NEXT STEP</p>
            <h3 className="font-display text-3xl mb-4 text-primary">
              {loading ? '...' : insight?.title || 'Deepen the Root'}
            </h3>
            <p className="font-body text-secondary mb-6 leading-relaxed text-sm">
              {loading ? '...' : insight?.suggestion}
            </p>
            <button className="group flex items-center gap-2 font-body text-xs font-semibold text-primary border-b border-primary pb-1 hover:gap-4 transition-all duration-300">
              LEARN THE METHODOLOGY
              <span>→</span>
            </button>
          </div>

          {/* Active Eco-Challenges */}
          <div className="border border-outline-variant p-8 bg-white rounded-xl shadow-sm">
            <p className="font-body text-xs font-semibold text-secondary mb-4 uppercase tracking-wider flex items-center gap-1.5">
              <Award size={14} className="text-primary" /> Active Eco-Challenges
            </p>
            
            <div className="space-y-4">
              {challengesList.map(ch => {
                const percent = Math.round((ch.current / ch.target) * 100);
                const Icon = ch.icon;

                return (
                  <div key={ch.id} className="p-4 rounded-xl border border-primary/5 bg-neutral-50 flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${ch.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-body text-sm font-semibold text-primary">{ch.title}</h4>
                        <span className="font-body text-xs font-bold text-secondary">{ch.current}/{ch.target}</span>
                      </div>
                      <p className="font-body text-xs text-secondary/80 mb-2.5 leading-relaxed">{ch.description}</p>
                      <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                        <div className={`h-full ${ch.barColor} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quote Card */}
          <div className="py-8 border-t border-black/5">
            <blockquote className="font-display text-3xl italic text-primary leading-tight">
              &ldquo;{loading ? '...' : insight?.quote || 'Sustainability is not a destination, but a state of being conscious in every moment.'}&rdquo;
            </blockquote>
          </div>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage';
import { computeWeeklyEmissions, computeRollingScore, computePlantStage, computeStreaks, getPlantStageDescription } from '@/lib/logic';
import { QuickLog } from '@/components/QuickLog';
import { PlantVisual } from '@/components/PlantVisual';
import { Loader2, CheckCircle2, XCircle, Sparkles, AlertTriangle, Trash2, Car, Leaf, Zap, ShoppingBag, PenLine } from 'lucide-react';

interface Feedback {
  type: 'good' | 'bad';
  praise?: string;
  bonusTips?: string[];
  reality?: string;
  alternatives?: string[];
}

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
  const weeklyState = useMemo(() => {
    const totalEmissions = computeWeeklyEmissions(state.activities);
    const score = computeRollingScore(state.activities);
    const plantStage = computePlantStage(score);
    const stageDescription = getPlantStageDescription(plantStage, state.activities.length);
    const streakLength = computeStreaks(state.activities);
    
    let soilHealth = "Dry";
    if (streakLength > 10) soilHealth = "Pristine";
    else if (streakLength > 3) soilHealth = "Rich";
    else if (streakLength > 0) soilHealth = "Developing";

    let luminosity = "Low";
    if (score >= 80) luminosity = "Radiant";
    else if (score >= 50) luminosity = "High";
    else if (score >= 20) luminosity = "Moderate";

    return { totalEmissions, score, plantStage, stageDescription, streakLength, soilHealth, luminosity };
  }, [state.activities]);

  const todayActivities = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return state.activities.filter(a => a.timestamp >= todayStart.getTime());
  }, [state.activities]);

  // Detect score changes and show +/- indicator
  useEffect(() => {
    if (state.activities.length > 0 && prevScoreRef.current !== weeklyState.score) {
      const delta = weeklyState.score - prevScoreRef.current;
      if (prevScoreRef.current !== 0 || state.activities.length === 1) {
        setScoreChange(delta);
        // Scroll to plant to watch it grow/shrink
        plantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Clear indicator after 3 seconds
        const timer = setTimeout(() => setScoreChange(null), 3000);
        return () => clearTimeout(timer);
      }
    }
    prevScoreRef.current = weeklyState.score;
  }, [weeklyState.score, state.activities.length]);

  // Particle Canvas Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          speedX: Math.random() * 0.4 - 0.2,
          speedY: Math.random() * 0.4 - 0.2,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
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

  const handleLog = async (activity: {categoryId: string, label: string, emissionsValue: number}) => {
    setLoggedAction(activity.label);
    setIsFetchingFeedback(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity, apiKeyOverride: state.settings.geminiApiKey })
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
    <div className="relative pt-32 pb-24 min-h-screen flex flex-col items-center overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />

      {/* Hero Content */}
      <div className="max-w-container-max w-full px-margin-mobile md:px-margin-desktop text-center mb-16 animate-fade-rise">
        <span className="font-body text-xs text-secondary mb-4 block uppercase tracking-widest font-semibold">Digital Ecosystem</span>
        <h1 className="font-display text-5xl md:text-7xl leading-none mb-6 text-primary">Your Living Garden</h1>
        <p className="font-body text-lg text-secondary max-w-2xl mx-auto italic">
          A reflection of your sustainable choices, visualized through a digital organism that breathes and grows with your progress.
        </p>
      </div>

      {/* Central Visualization Area */}
      <div ref={plantRef} className="relative w-full max-w-[1200px] h-[614px] flex items-center justify-center animate-fade-rise-delayed">
        
        {/* Score Change Badge */}
        {scoreChange !== null && (
          <div className={`absolute top-[5%] left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-full font-body text-lg font-bold shadow-lg animate-bounce
            ${scoreChange > 0 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'}`}
          >
            {scoreChange > 0 ? `+${scoreChange}` : scoreChange} points
          </div>
        )}

        {/* Main Plant Visual — grows/shrinks based on score */}
        <div className="relative z-10 w-full h-full flex items-end justify-center">
          <div 
            className="max-w-2xl transition-all duration-[1500ms] ease-out origin-bottom"
            style={{
              transform: `scale(${0.3 + (weeklyState.score / 100) * 0.7})`,
              filter: `saturate(${0.2 + (weeklyState.score / 100) * 1.3}) brightness(${0.7 + (weeklyState.score / 100) * 0.4}) drop-shadow(0 0 ${Math.round(weeklyState.score / 3)}px rgba(34, 139, 34, ${weeklyState.score / 200}))`,
              opacity: 0.5 + (weeklyState.score / 100) * 0.5,
            }}
          >
            <PlantVisual stage={weeklyState.plantStage} className="w-[320px] h-[320px] md:w-[400px] md:h-[400px] object-contain drop-shadow-2xl" />
          </div>
        </div>

        {/* Plant Stage */}
        <div className="absolute top-[10%] left-[10%] z-20 animate-float-slow hidden md:block">
          <div className="glass p-8 w-64 shadow-sm rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-primary text-[20px] font-bold">✧</span>
              <span className="font-body text-xs text-secondary uppercase tracking-wider font-semibold">Plant Stage</span>
            </div>
            <div className="font-display text-3xl leading-tight mb-2 text-primary capitalize">{weeklyState.plantStage.replace('-', ' ')}</div>
            <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${weeklyState.score}%` }}></div>
            </div>
            <p className="font-body text-[14px] text-secondary mt-3 italic">{weeklyState.stageDescription}</p>
          </div>
        </div>

        {/* Eco Score */}
        <div className="absolute bottom-[15%] left-[5%] z-20 animate-float hidden md:block">
          <div className="glass p-8 w-72 shadow-sm rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-primary text-[20px] font-bold">~</span>
              <span className="font-body text-xs text-secondary uppercase tracking-wider font-semibold">Eco Score</span>
            </div>
            <div className="flex items-baseline gap-2">
              <div 
                className="font-display text-6xl leading-none transition-colors duration-1000"
                style={{ 
                  color: weeklyState.score >= 60 
                    ? `hsl(${120}, 40%, 30%)` 
                    : weeklyState.score >= 30 
                      ? `hsl(${40}, 60%, 40%)` 
                      : `hsl(${0}, 50%, 40%)`
                }}
              >
                {Math.round(weeklyState.score)}
              </div>
              <div className="font-display text-3xl text-secondary">/100</div>
            </div>
            <p className="font-body text-[14px] text-secondary mt-4 leading-relaxed">
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
            <div className="mt-3 font-body text-[11px] text-secondary/70">
              Based on {state.activities.length} logged {state.activities.length === 1 ? 'action' : 'actions'}
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="absolute top-[20%] right-[10%] z-20 animate-float-delayed hidden md:block">
          <div className="glass p-8 w-60 shadow-sm flex flex-col items-center text-center rounded-xl">
            <div className="font-body text-xs text-secondary uppercase tracking-widest mb-4 font-semibold">Current Streak</div>
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle className="text-surface-variant" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" strokeWidth="2"></circle>
                <circle className="text-primary transition-all duration-1000" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * Math.min(weeklyState.streakLength, 30) / 30)} strokeWidth="2"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl leading-none text-primary">{weeklyState.streakLength}</span>
                <span className="font-body text-[10px] uppercase text-secondary font-semibold">Days</span>
              </div>
            </div>
            <p className="font-body text-[14px] text-secondary mt-4">Uninterrupted growth.</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl px-margin-mobile mt-12 animate-fade-rise-delayed-2">
        <h3 className="font-display text-3xl text-primary text-center mb-6">Log an Action</h3>
        <QuickLog onLog={handleLog} />
        
        {/* Instant Feedback Block */}
        {(isFetchingFeedback || feedback) && (
          <div className="mt-6 w-full animate-fade-rise flex flex-col gap-4">
            {loggedAction && (
              <div className="text-center mb-1">
                <span className="font-body text-xs text-secondary uppercase tracking-widest">Your action</span>
                <h4 className="font-display text-xl text-primary italic">&ldquo;{loggedAction}&rdquo;</h4>
              </div>
            )}
            {isFetchingFeedback ? (
              <div className="flex items-center justify-center gap-3 text-secondary py-6 bg-white/60 backdrop-blur-md rounded-2xl border border-primary/5">
                <Loader2 size={18} className="animate-spin" />
                <span className="font-body text-sm">Analyzing &ldquo;{loggedAction}&rdquo;...</span>
              </div>

            ) : feedback?.type === 'good' ? (
              /* ───── GOOD ACTION: Celebration + Bonus Tips ───── */
              <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 backdrop-blur-md rounded-2xl p-6 border border-green-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={20} className="text-green-600" />
                  <h4 className="font-body text-xs font-bold text-green-800 uppercase tracking-widest">Great Choice!</h4>
                </div>
                <p className="font-body text-sm text-green-900 leading-relaxed mb-5">
                  {feedback.praise}
                </p>
                <div className="border-t border-green-200/50 pt-4">
                  <h5 className="font-body text-[10px] font-bold text-green-700 uppercase tracking-widest mb-3">Bonus Tips to Go Further</h5>
                  <div className="flex flex-col gap-2">
                    {feedback.bonusTips?.map((tip: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="font-body text-sm text-green-800">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            ) : feedback?.type === 'bad' ? (
              /* ───── BAD ACTION: Reality Check + Alternatives ───── */
              <div className="bg-gradient-to-br from-amber-50 to-red-50/50 backdrop-blur-md rounded-2xl p-6 border border-amber-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={20} className="text-amber-600" />
                  <h4 className="font-body text-xs font-bold text-amber-800 uppercase tracking-widest">Consider This</h4>
                </div>
                <p className="font-body text-sm text-amber-900 leading-relaxed mb-5">
                  {feedback.reality}
                </p>
                <div className="border-t border-amber-200/50 pt-4">
                  <h5 className="font-body text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-3">Better Alternatives</h5>
                  <div className="flex flex-col gap-2">
                    {feedback.alternatives?.map((alt: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <XCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="font-body text-sm text-amber-800">{alt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Today's Activity Log */}
        <div className="mt-8 bg-white/40 backdrop-blur-md rounded-2xl border border-primary/5 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-primary text-[20px] font-bold">🗒</span>
              <h3 className="font-display text-2xl text-primary">Today&apos;s Choices</h3>
            </div>
            <span className="font-body text-xs text-secondary bg-surface-variant px-3 py-1 rounded-full font-semibold">
              {todayActivities.length} {todayActivities.length === 1 ? 'choice' : 'choices'}
            </span>
          </div>

          {todayActivities.length === 0 ? (
            <div className="text-center py-8 text-secondary font-body text-sm italic">
              No choices logged today yet. Start logging above to grow your plant!
            </div>
          ) : (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {todayActivities.map((act) => {
                const isGood = act.emissionsValue <= 1.5;
                const timeString = new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                // Icon based on category
                let CatIcon = PenLine;
                if (act.categoryId === 'transport') CatIcon = Car;
                else if (act.categoryId === 'meal') CatIcon = Leaf;
                else if (act.categoryId === 'energy') CatIcon = Zap;
                else if (act.categoryId === 'shopping') CatIcon = ShoppingBag;

                return (
                  <div key={act.id} className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-md rounded-xl border border-primary/5 hover:bg-white transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${isGood ? 'bg-green-50 text-green-700 animate-pulse' : 'bg-amber-50 text-amber-700'}`}>
                        <CatIcon size={18} />
                      </div>
                      <div>
                        <h4 className="font-body text-sm font-semibold text-primary">{act.label}</h4>
                        <p className="font-body text-xs text-secondary/80">
                          {act.categoryId.charAt(0).toUpperCase() + act.categoryId.slice(1)} • {timeString}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`font-body text-xs font-bold px-2.5 py-1 rounded-full ${isGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isGood ? '+10' : '-10'} pts
                      </span>
                      <button 
                        onClick={() => removeActivity(act.id)}
                        className="text-secondary/40 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        title="Delete log"
                      >
                        <Trash2 size={16} />
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
      <div className="max-w-container-max w-full px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-12 gap-6 mt-32">
        <div className="md:col-span-4 flex flex-col justify-center">
          <h2 className="font-display text-4xl mb-6 text-primary">Nurturing Change</h2>
          <p className="font-body text-lg text-secondary mb-8 leading-relaxed">
            Every small action you take—from choosing a reusable cup to opting for public transport—infuses your garden with energy.
          </p>
          <div className="border-t border-black/10 pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-primary">Soil Health</span>
              <span className="font-body text-secondary">{weeklyState.soilHealth}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-primary">Luminosity</span>
              <span className="font-body text-secondary">{weeklyState.luminosity}</span>
            </div>
          </div>
        </div>
        <div className="md:col-span-8 relative">
          <div className="aspect-[16/9] w-full glass overflow-hidden flex items-center justify-center p-12 rounded-xl">
            <div className="w-full flex flex-col items-center text-center relative z-10">
              <span className="text-4xl text-primary/20 mb-6">✧</span>
              <h3 className="font-display text-3xl italic mb-4 text-primary">&ldquo;The forest is not a collection of trees, but a network of relationships.&rdquo;</h3>
              <p className="font-body text-secondary max-w-md">Continue your journey to unlock the &lsquo;Ancient Grove&rsquo; habitat and invite new species to your digital biosphere.</p>
            </div>
            <div className="absolute inset-0 z-0 opacity-[0.03]">
              <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAoATjE1mTmvNIa65TMsdNiSYQ-i0XkOs-xxSf954A50JMUK9cZLwr8iNYcrSZMJp2L36guVUPbXWrMhUH2P62Ul3WbH9i4w3GW7HEvNJmTz7Hcabf0YQzPmuFGQb_UvmGdvbpdsDt66t5gE1znDHflSR6qkYRXBapEDk_Nff0VuKCLmrH4rMClJKlWOnUD_bE601j0YMIvAZsbRmG4FOsVFtse76R9MKEFZlR1imUOokSEDgbyGoXXuX9Y0ym0yW9ggiLiLvbUV2M')"}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

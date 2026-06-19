"use client";

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage';
import { computeWeeklyEmissions, computeRollingScore, computeStreaks, computePlantStage } from '@/lib/logic';
import { Share2, Download, Archive } from 'lucide-react';
import { PlantVisual } from '@/components/PlantVisual';

export default function WeeklyCardPage() {
  const { state, saveWeeklyCard } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.user) {
      router.push('/login');
    }
  }, [state.user, router]);
  const [savedToast, setSavedToast] = useState(false);
  const [theme, setTheme] = useState<'ethereal' | 'blueprint'>('ethereal');
  const [showIllustration, setShowIllustration] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const weeklyState = useMemo(() => {
    const totalEmissions = computeWeeklyEmissions(state.activities);
    const score = computeRollingScore(state.activities);
    const plantStage = computePlantStage(score);
    const streakLength = computeStreaks(state.activities);
    return { totalEmissions, score, plantStage, streakLength };
  }, [state.activities]);

  const generateCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 1200;
    canvas.height = 1200;

    // Background
    ctx.fillStyle = theme === 'ethereal' ? '#ffffff' : '#0f172a';
    ctx.fillRect(0, 0, 1200, 1200);

    // Text settings
    ctx.fillStyle = theme === 'ethereal' ? '#000000' : '#ffffff';
    ctx.textAlign = 'center';

    ctx.font = theme === 'blueprint' ? '300 48px monospace' : '300 48px Inter';
    ctx.fillText('Aethera® Sprout', 600, 200);

    if (showIllustration) {
      ctx.font = theme === 'blueprint' ? '100px monospace' : '100px "Instrument Serif"';
      ctx.fillText(weeklyState.plantStage.replace('-', ' '), 600, 450);
    }

    if (showMetrics) {
      ctx.font = theme === 'blueprint' ? '60px monospace' : '60px "Instrument Serif"';
      ctx.fillText(`Score: ${Math.round(weeklyState.score)} / 100`, 600, 600);

      ctx.font = theme === 'blueprint' ? '40px monospace' : '40px Inter';
      ctx.fillText(`Streak: ${weeklyState.streakLength} Days`, 600, 700);
      ctx.fillText(`Footprint: ${weeklyState.totalEmissions.toFixed(1)} kg CO2e`, 600, 800);
    }

    return canvas.toDataURL('image/png');
  };

  const handleDownload = () => {
    const dataUrl = generateCanvasImage();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = 'sprout-weekly.png';
    link.href = dataUrl;
    link.click();
  };

  const handleShare = async () => {
    const dataUrl = generateCanvasImage();
    const isShareSupported = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    if (!dataUrl || !isShareSupported) {
      handleDownload();
      return;
    }
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'sprout-weekly.png', { type: 'image/png' });
      await navigator.share({
        title: 'My Weekly Sprout Garden',
        text: `I grew a ${weeklyState.plantStage.replace('-', ' ')} this week!`,
        files: [file],
      });
    } catch (e) {
      console.log('Share failed', e);
      handleDownload();
    }
  };

  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const formatDate = (d: Date) => d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${formatDate(start)} — ${formatDate(end)}`;
  }, []);

  const handleSaveToGallery = () => {
    saveWeeklyCard({
      score: weeklyState.score,
      plantStage: weeklyState.plantStage,
      streakLength: weeklyState.streakLength,
      totalEmissions: weeklyState.totalEmissions,
      theme,
      showIllustration,
      showMetrics,
      dateRange,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  if (!state.user) {
    return null;
  }

  return (
    <div className="pt-32 pb-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop animate-fade-rise">
      {/* Hidden canvas for actual export */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Hero Title Section */}
      <div className="max-w-3xl mb-16">
        <span className="font-body text-xs font-semibold text-secondary uppercase tracking-widest block mb-4">The Reflection</span>
        <h1 className="font-display text-6xl leading-tight mb-6 text-primary">&ldquo;This week, my choices helped my garden bloom.&rdquo;</h1>
        <p className="font-body text-lg text-secondary max-w-xl">
          A digital keepsake of your environmental impact and botanical growth. Export your weekly progress as a piece of high-fidelity digital art.
        </p>
      </div>

      {/* Main Card Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Card Preview Column */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center animate-fade-rise-delayed">
          <div className={`relative aspect-square w-full max-w-[600px] border shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between overflow-hidden rounded-xl transition-colors duration-500
            ${theme === 'ethereal' ? 'bg-white border-black/5 text-primary' : 'bg-slate-900 border-white/10 text-white font-mono'}
          `}>
            
            {/* Top Branding */}
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className={`text-2xl leading-none mb-1 ${theme === 'ethereal' ? 'font-display' : 'font-mono tracking-tighter'}`}>Aethera®</div>
                <div className={`text-[10px] tracking-[0.2em] uppercase ${theme === 'ethereal' ? 'font-body text-secondary' : 'opacity-70'}`}>Weekly Eco Report</div>
              </div>
              <div className="text-right">
                <div className={theme === 'ethereal' ? 'font-body text-secondary' : 'text-sm opacity-70'}>{dateRange}</div>
                <div className={`text-[10px] tracking-widest mt-1 uppercase ${theme === 'ethereal' ? 'font-body text-secondary' : 'opacity-50'}`}>{new Date().getFullYear()} Edition</div>
              </div>
            </div>

            {/* Visual Centerpiece: The Plant */}
            <div className="relative z-10 flex flex-col items-center text-center">
              {showIllustration && (
                <div className={`transition-opacity duration-500 ${theme === 'blueprint' ? 'filter invert brightness-200 contrast-125' : 'drop-shadow-xl'}`}>
                  <PlantVisual stage={weeklyState.plantStage} className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 mb-3 lg:mb-4" />
                </div>
              )}
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl capitalize ${theme === 'ethereal' ? 'font-display italic' : 'font-mono'}`}>{weeklyState.plantStage.replace('-', ' ')}</h2>
              <p className={`text-[10px] sm:text-xs tracking-widest uppercase mt-1.5 ${theme === 'ethereal' ? 'font-body text-secondary' : 'opacity-70'}`}>Stage: Juvenile Growth</p>
            </div>

            {/* Bottom Achievements */}
            <div className={`relative z-10 grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-4 sm:pt-6 lg:pt-8 border-t transition-opacity duration-500 ${showMetrics ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${theme === 'ethereal' ? 'border-black/10' : 'border-white/20'}`}>
              <div>
                <div className={`text-[9px] sm:text-[10px] uppercase mb-1 ${theme === 'ethereal' ? 'font-body text-secondary' : 'opacity-70'}`}>Carbon Saved</div>
                <div className={`text-xl sm:text-2xl lg:text-3xl ${theme === 'ethereal' ? 'font-display text-primary' : ''}`}>{Math.max(0, 50 - weeklyState.totalEmissions).toFixed(1)} kg</div>
              </div>
              <div>
                <div className={`text-[9px] sm:text-[10px] uppercase mb-1 ${theme === 'ethereal' ? 'font-body text-secondary' : 'opacity-70'}`}>Choice Score</div>
                <div className={`text-xl sm:text-2xl lg:text-3xl ${theme === 'ethereal' ? 'font-display text-primary' : ''}`}>{Math.round(weeklyState.score)}%</div>
              </div>
              <div>
                <div className={`text-[9px] sm:text-[10px] uppercase mb-1 ${theme === 'ethereal' ? 'font-body text-secondary' : 'opacity-70'}`}>Consistency</div>
                <div className={`text-xl sm:text-2xl lg:text-3xl ${theme === 'ethereal' ? 'font-display text-primary' : ''}`}>{weeklyState.streakLength} Days</div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Editor Controls Column */}
        <div className="lg:col-span-5 space-y-12 animate-fade-rise-delayed-2">
          <section>
            <h3 className="font-body text-xs font-semibold text-secondary uppercase tracking-widest mb-6">Editor / Theme</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setTheme('ethereal')}
                className={`border p-4 text-left group transition-all rounded-xl ${theme === 'ethereal' ? 'border-black' : 'border-black/10 hover:border-black/30'}`}
              >
                <div className="w-full h-24 bg-white border border-black/10 mb-3 group-hover:opacity-80 transition-opacity rounded-lg"></div>
                <span className={`font-body font-semibold ${theme === 'ethereal' ? 'text-primary' : 'text-secondary'}`}>Classic Ethereal</span>
              </button>
              <button 
                onClick={() => setTheme('blueprint')}
                className={`border p-4 text-left group transition-all rounded-xl ${theme === 'blueprint' ? 'border-black' : 'border-black/10 hover:border-black/30'}`}
              >
                <div className="w-full h-24 bg-slate-900 border border-black/10 mb-3 group-hover:opacity-80 transition-opacity rounded-lg"></div>
                <span className={`font-body font-semibold ${theme === 'blueprint' ? 'text-primary' : 'text-secondary'}`}>Botanist Blueprint</span>
              </button>
            </div>
          </section>

          <section>
            <h3 className="font-body text-xs font-semibold text-secondary uppercase tracking-widest mb-6">Data Layers</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border border-black/5 bg-surface-container-low cursor-pointer hover:bg-surface-variant transition-colors rounded-xl">
                <span className="font-body text-primary font-semibold">Botanical Illustration</span>
                <input 
                  type="checkbox" 
                  checked={showIllustration} 
                  onChange={(e) => setShowIllustration(e.target.checked)}
                  className="form-checkbox text-primary border-black/20 focus:ring-0 rounded w-5 h-5" 
                />
              </label>
              <label className="flex items-center justify-between p-4 border border-black/5 bg-surface-container-low cursor-pointer hover:bg-surface-variant transition-colors rounded-xl">
                <span className="font-body text-primary font-semibold">Weekly Impact Metrics</span>
                <input 
                  type="checkbox" 
                  checked={showMetrics}
                  onChange={(e) => setShowMetrics(e.target.checked)}
                  className="form-checkbox text-primary border-black/20 focus:ring-0 rounded w-5 h-5" 
                />
              </label>
            </div>
          </section>

          <section className="pt-8 border-t border-black/10 flex flex-col gap-4">
            <button 
              onClick={handleDownload}
              className="w-full bg-primary text-on-primary py-5 font-body rounded-xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.99] transition-all"
            >
              <Download size={20} />
              Export High-Res Card
            </button>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleShare}
                className="border border-black py-4 font-body rounded-xl flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all"
              >
                <Share2 size={20} />
                Share Link
              </button>
              <button 
                onClick={handleSaveToGallery}
                className="border border-black py-4 font-body rounded-xl flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all"
              >
                <Archive size={20} />
                Save to Gallery
              </button>
            </div>
          </section>
        </div>
      </div>

      {savedToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-800 text-white px-6 py-3.5 rounded-full font-body text-sm font-semibold shadow-2xl flex items-center gap-2 animate-bounce border border-green-700">
          <span>🌱</span> Card saved to your Garden Gallery successfully!
        </div>
      )}
    </div>
  );
}

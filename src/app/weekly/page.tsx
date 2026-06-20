'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage';
import {
  computeWeeklyEmissions,
  computeRollingScore,
  computeStreaks,
  computePlantStage,
} from '@/lib/logic';
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
      ctx.font =
        theme === 'blueprint' ? '100px monospace' : '100px "Instrument Serif"';
      ctx.fillText(weeklyState.plantStage.replace('-', ' '), 600, 450);
    }

    if (showMetrics) {
      ctx.font =
        theme === 'blueprint' ? '60px monospace' : '60px "Instrument Serif"';
      ctx.fillText(`Score: ${Math.round(weeklyState.score)} / 100`, 600, 600);

      ctx.font = theme === 'blueprint' ? '40px monospace' : '40px Inter';
      ctx.fillText(`Streak: ${weeklyState.streakLength} Days`, 600, 700);
      ctx.fillText(
        `Footprint: ${weeklyState.totalEmissions.toFixed(1)} kg CO2e`,
        600,
        800,
      );
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
    const isShareSupported =
      typeof navigator !== 'undefined' && typeof navigator.share === 'function';
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
    const formatDate = (d: Date) =>
      d.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
    <div className="max-w-container-max px-margin-mobile md:px-margin-desktop animate-fade-rise mx-auto pt-32 pb-24">
      {/* Hidden canvas for actual export */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Hero Title Section */}
      <div className="mb-16 max-w-3xl">
        <span className="font-body text-secondary mb-4 block text-xs font-semibold tracking-widest uppercase">
          The Reflection
        </span>
        <h1 className="font-display text-primary mb-6 text-6xl leading-tight">
          &ldquo;This week, my choices helped my garden bloom.&rdquo;
        </h1>
        <p className="font-body text-secondary max-w-xl text-lg">
          A digital keepsake of your environmental impact and botanical growth.
          Export your weekly progress as a piece of high-fidelity digital art.
        </p>
      </div>

      {/* Main Card Editor Grid */}
      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
        {/* Card Preview Column */}
        <div className="animate-fade-rise-delayed flex flex-col items-center justify-center lg:col-span-7">
          <div
            className={`relative flex aspect-square w-full max-w-[600px] flex-col justify-between overflow-hidden rounded-xl border p-6 shadow-2xl transition-colors duration-500 sm:p-8 md:p-10 lg:p-12 ${theme === 'ethereal' ? 'text-primary border-black/5 bg-white' : 'border-white/10 bg-slate-900 font-mono text-white'} `}
          >
            {/* Top Branding */}
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div
                  className={`mb-1 text-2xl leading-none ${theme === 'ethereal' ? 'font-display' : 'font-mono tracking-tighter'}`}
                >
                  Aethera®
                </div>
                <div
                  className={`text-[10px] tracking-[0.2em] uppercase ${theme === 'ethereal' ? 'font-body text-secondary' : 'opacity-70'}`}
                >
                  Weekly Eco Report
                </div>
              </div>
              <div className="text-right">
                <div
                  className={
                    theme === 'ethereal'
                      ? 'font-body text-secondary'
                      : 'text-sm opacity-70'
                  }
                >
                  {dateRange}
                </div>
                <div
                  className={`mt-1 text-[10px] tracking-widest uppercase ${theme === 'ethereal' ? 'font-body text-secondary' : 'opacity-50'}`}
                >
                  {new Date().getFullYear()} Edition
                </div>
              </div>
            </div>

            {/* Visual Centerpiece: The Plant */}
            <div className="relative z-10 flex flex-col items-center text-center">
              {showIllustration && (
                <div
                  className={`transition-opacity duration-500 ${theme === 'blueprint' ? 'brightness-200 contrast-125 invert filter' : 'drop-shadow-xl'}`}
                >
                  <PlantVisual
                    stage={weeklyState.plantStage}
                    className="mb-3 h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 lg:mb-4 lg:h-48 lg:w-48"
                  />
                </div>
              )}
              <h2
                className={`text-3xl capitalize sm:text-4xl lg:text-5xl ${theme === 'ethereal' ? 'font-display italic' : 'font-mono'}`}
              >
                {weeklyState.plantStage.replace('-', ' ')}
              </h2>
              <p
                className={`mt-1.5 text-[10px] tracking-widest uppercase sm:text-xs ${theme === 'ethereal' ? 'font-body text-secondary' : 'opacity-70'}`}
              >
                Stage: Juvenile Growth
              </p>
            </div>

            {/* Bottom Achievements */}
            <div
              className={`relative z-10 grid grid-cols-3 gap-4 border-t pt-4 transition-opacity duration-500 sm:gap-6 sm:pt-6 lg:gap-8 lg:pt-8 ${showMetrics ? 'opacity-100' : 'pointer-events-none opacity-0'} ${theme === 'ethereal' ? 'border-black/10' : 'border-white/20'}`}
            >
              <div>
                <div
                  className={`mb-1 text-[9px] uppercase sm:text-[10px] ${theme === 'ethereal' ? 'font-body text-secondary' : 'opacity-70'}`}
                >
                  Carbon Saved
                </div>
                <div
                  className={`text-xl sm:text-2xl lg:text-3xl ${theme === 'ethereal' ? 'font-display text-primary' : ''}`}
                >
                  {Math.max(0, 50 - weeklyState.totalEmissions).toFixed(1)} kg
                </div>
              </div>
              <div>
                <div
                  className={`mb-1 text-[9px] uppercase sm:text-[10px] ${theme === 'ethereal' ? 'font-body text-secondary' : 'opacity-70'}`}
                >
                  Choice Score
                </div>
                <div
                  className={`text-xl sm:text-2xl lg:text-3xl ${theme === 'ethereal' ? 'font-display text-primary' : ''}`}
                >
                  {Math.round(weeklyState.score)}%
                </div>
              </div>
              <div>
                <div
                  className={`mb-1 text-[9px] uppercase sm:text-[10px] ${theme === 'ethereal' ? 'font-body text-secondary' : 'opacity-70'}`}
                >
                  Consistency
                </div>
                <div
                  className={`text-xl sm:text-2xl lg:text-3xl ${theme === 'ethereal' ? 'font-display text-primary' : ''}`}
                >
                  {weeklyState.streakLength} Days
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Controls Column */}
        <div className="animate-fade-rise-delayed-2 space-y-12 lg:col-span-5">
          <section>
            <h3 className="font-body text-secondary mb-6 text-xs font-semibold tracking-widest uppercase">
              Editor / Theme
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTheme('ethereal')}
                className={`group rounded-xl border p-4 text-left transition-all ${theme === 'ethereal' ? 'border-black' : 'border-black/10 hover:border-black/30'}`}
              >
                <div className="mb-3 h-24 w-full rounded-lg border border-black/10 bg-white transition-opacity group-hover:opacity-80"></div>
                <span
                  className={`font-body font-semibold ${theme === 'ethereal' ? 'text-primary' : 'text-secondary'}`}
                >
                  Classic Ethereal
                </span>
              </button>
              <button
                onClick={() => setTheme('blueprint')}
                className={`group rounded-xl border p-4 text-left transition-all ${theme === 'blueprint' ? 'border-black' : 'border-black/10 hover:border-black/30'}`}
              >
                <div className="mb-3 h-24 w-full rounded-lg border border-black/10 bg-slate-900 transition-opacity group-hover:opacity-80"></div>
                <span
                  className={`font-body font-semibold ${theme === 'blueprint' ? 'text-primary' : 'text-secondary'}`}
                >
                  Botanist Blueprint
                </span>
              </button>
            </div>
          </section>

          <section>
            <h3 className="font-body text-secondary mb-6 text-xs font-semibold tracking-widest uppercase">
              Data Layers
            </h3>
            <div className="space-y-4">
              <label className="bg-surface-container-low hover:bg-surface-variant flex cursor-pointer items-center justify-between rounded-xl border border-black/5 p-4 transition-colors">
                <span className="font-body text-primary font-semibold">
                  Botanical Illustration
                </span>
                <input
                  type="checkbox"
                  checked={showIllustration}
                  onChange={(e) => setShowIllustration(e.target.checked)}
                  className="form-checkbox text-primary h-5 w-5 rounded border-black/20 focus:ring-0"
                />
              </label>
              <label className="bg-surface-container-low hover:bg-surface-variant flex cursor-pointer items-center justify-between rounded-xl border border-black/5 p-4 transition-colors">
                <span className="font-body text-primary font-semibold">
                  Weekly Impact Metrics
                </span>
                <input
                  type="checkbox"
                  checked={showMetrics}
                  onChange={(e) => setShowMetrics(e.target.checked)}
                  className="form-checkbox text-primary h-5 w-5 rounded border-black/20 focus:ring-0"
                />
              </label>
            </div>
          </section>

          <section className="flex flex-col gap-4 border-t border-black/10 pt-8">
            <button
              onClick={handleDownload}
              className="bg-primary text-on-primary font-body flex w-full items-center justify-center gap-3 rounded-xl py-5 transition-all hover:opacity-90 active:scale-[0.99]"
            >
              <Download size={20} />
              Export High-Res Card
            </button>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleShare}
                className="font-body flex items-center justify-center gap-3 rounded-xl border border-black py-4 transition-all hover:bg-black hover:text-white"
              >
                <Share2 size={20} />
                Share Link
              </button>
              <button
                onClick={handleSaveToGallery}
                className="font-body flex items-center justify-center gap-3 rounded-xl border border-black py-4 transition-all hover:bg-black hover:text-white"
              >
                <Archive size={20} />
                Save to Gallery
              </button>
            </div>
          </section>
        </div>
      </div>

      {savedToast && (
        <div className="font-body fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 animate-bounce items-center gap-2 rounded-full border border-green-700 bg-green-800 px-6 py-3.5 text-sm font-semibold text-white shadow-2xl">
          <span>🌱</span> Card saved to your Garden Gallery successfully!
        </div>
      )}
    </div>
  );
}

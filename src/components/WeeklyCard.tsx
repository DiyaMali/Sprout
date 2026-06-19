"use client";

import { useEffect, useRef, useState } from 'react';
import { WeeklyState } from '@/lib/types';
import { Share2, Download } from 'lucide-react';

export function WeeklyCard({ state }: { state: WeeklyState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = useState<string>('');
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
    }, 0);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the card
    canvas.width = 600;
    canvas.height = 800;

    // Background
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative border
    ctx.strokeStyle = '#e2e2e2';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Title
    ctx.fillStyle = '#1b1b1b';
    ctx.font = '64px "Instrument Serif", serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sprout®', canvas.width / 2, 120);

    ctx.font = '32px Inter, sans-serif';
    ctx.fillStyle = '#6F6F6F';
    ctx.fillText('Weekly Review', canvas.width / 2, 170);

    // Score
    ctx.fillStyle = '#1b1b1b';
    ctx.font = 'bold 120px Inter, sans-serif';
    ctx.fillText(state.score.toString(), canvas.width / 2, 350);
    
    ctx.font = '24px Inter, sans-serif';
    ctx.fillStyle = '#6F6F6F';
    ctx.fillText('Eco Score', canvas.width / 2, 400);

    // Plant Stage
    ctx.fillStyle = '#1b1b1b';
    ctx.font = 'italic 48px "Instrument Serif", serif';
    ctx.fillText(`Your plant is ${state.plantStage}.`, canvas.width / 2, 550);

    // Streaks
    ctx.font = '24px Inter, sans-serif';
    ctx.fillStyle = '#6F6F6F';
    ctx.fillText(`${state.streakLength} day streak!`, canvas.width / 2, 620);

    // Footer
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = '#a0a0a0';
    ctx.fillText('beyond silence, we build the eternal.', canvas.width / 2, 720);

    try {
      const url = canvas.toDataURL('image/png');
      setImgUrl(url);
    } catch (e) {
      console.error('Failed to generate image URL from canvas', e);
    }

  }, [state]);

  const handleShare = async () => {
    if (!imgUrl) return;

    // Try native share first
    if (navigator.share) {
      try {
        const blob = await (await fetch(imgUrl)).blob();
        const file = new File([blob], 'sprout-weekly.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'My Sprout Weekly Score',
          text: `I scored ${state.score} this week and my plant is ${state.plantStage}!`,
          files: [file],
        });
        return;
      } catch (err) {
        console.log('Share failed or was cancelled', err);
      }
    }

    // Fallback: download
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = 'sprout-weekly.png';
    a.click();
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Hidden canvas used for generation */}
      <canvas ref={canvasRef} className="hidden" />
      
      {imgUrl ? (
        <div className="rounded-2xl overflow-hidden shadow-lg border border-primary/10 max-w-sm w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imgUrl} 
            alt="Weekly Sprout Card" 
            className="w-full h-auto" 
          />
        </div>
      ) : (
        <div className="w-64 h-80 bg-surface-variant/30 rounded-2xl animate-pulse"></div>
      )}

      <button
        onClick={handleShare}
        className="flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity active:scale-95"
      >
        {canShare ? <Share2 size={18} /> : <Download size={18} />}
        {canShare ? 'Share to Social' : 'Download Image'}
      </button>
    </div>
  );
}

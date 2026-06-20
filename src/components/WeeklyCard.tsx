'use client';

import { useEffect, useRef, useState } from 'react';
import { WeeklyState } from '@/lib/types';
import { Share2, Download } from 'lucide-react';

/**
 * Properties for the WeeklyCard component.
 */
interface WeeklyCardProps {
  /** The calculated environmental and botanical metrics state to compile into the card. */
  state: WeeklyState;
}

/**
 * WeeklyCard component generates a visually beautiful review card utilizing HTML Canvas,
 * permitting downloading or sharing on mobile social networks.
 */
export function WeeklyCard({ state }: WeeklyCardProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setCanShare(
        typeof navigator !== 'undefined' &&
          typeof navigator.share === 'function',
      );
    }, 0);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) return;

    // Draw the card
    canvas.width = 600;
    canvas.height = 800;

    // Background
    canvasContext.fillStyle = '#f9f9f9';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative border
    canvasContext.strokeStyle = '#e2e2e2';
    canvasContext.lineWidth = 10;
    canvasContext.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Title
    canvasContext.fillStyle = '#1b1b1b';
    canvasContext.font = '64px "Instrument Serif", serif';
    canvasContext.textAlign = 'center';
    canvasContext.fillText('Sprout®', canvas.width / 2, 120);

    canvasContext.font = '32px Inter, sans-serif';
    canvasContext.fillStyle = '#6F6F6F';
    canvasContext.fillText('Weekly Review', canvas.width / 2, 170);

    // Score
    canvasContext.fillStyle = '#1b1b1b';
    canvasContext.font = 'bold 120px Inter, sans-serif';
    canvasContext.fillText(state.score.toString(), canvas.width / 2, 350);

    canvasContext.font = '24px Inter, sans-serif';
    canvasContext.fillStyle = '#6F6F6F';
    canvasContext.fillText('Eco Score', canvas.width / 2, 400);

    // Plant Stage
    canvasContext.fillStyle = '#1b1b1b';
    canvasContext.font = 'italic 48px "Instrument Serif", serif';
    canvasContext.fillText(
      `Your plant is ${state.plantStage}.`,
      canvas.width / 2,
      550,
    );

    // Streaks
    canvasContext.font = '24px Inter, sans-serif';
    canvasContext.fillStyle = '#6F6F6F';
    canvasContext.fillText(
      `${state.streakLength} day streak!`,
      canvas.width / 2,
      620,
    );

    // Footer
    canvasContext.font = '16px Inter, sans-serif';
    canvasContext.fillStyle = '#a0a0a0';
    canvasContext.fillText(
      'beyond silence, we build the eternal.',
      canvas.width / 2,
      720,
    );

    try {
      const url = canvas.toDataURL('image/png');
      setImageUrl(url);
    } catch (error) {
      console.error('Failed to generate image URL from canvas', error);
    }
  }, [state]);

  const handleShare = async () => {
    if (!imageUrl) return;

    // Try native share first
    if (navigator.share) {
      try {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], 'sprout-weekly.png', {
          type: 'image/png',
        });

        await navigator.share({
          title: 'My Sprout Weekly Score',
          text: `I scored ${state.score} this week and my plant is ${state.plantStage}!`,
          files: [file],
        });
        return;
      } catch (error) {
        console.log('Share failed or was cancelled', error);
      }
    }

    // Fallback: download
    const anchorElement = document.createElement('a');
    anchorElement.href = imageUrl;
    anchorElement.download = 'sprout-weekly.png';
    anchorElement.click();
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Hidden canvas used for generation */}
      <canvas ref={canvasRef} className="hidden" />

      {imageUrl ? (
        <div className="border-primary/10 w-full max-w-sm overflow-hidden rounded-2xl border shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Weekly Sprout Card"
            className="h-auto w-full"
          />
        </div>
      ) : (
        <div className="bg-surface-variant/30 h-80 w-64 animate-pulse rounded-2xl"></div>
      )}

      <button
        onClick={handleShare}
        className="bg-primary text-on-primary flex items-center gap-2 rounded-full px-8 py-3 font-medium transition-opacity hover:opacity-90 active:scale-95"
      >
        {canShare ? <Share2 size={18} /> : <Download size={18} />}
        {canShare ? 'Share to Social' : 'Download Image'}
      </button>
    </div>
  );
}

'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage';
import { PlantVisual } from '@/components/PlantVisual';
import { Trash2 } from 'lucide-react';

export default function GardenGallery() {
  const { state, deleteSavedCard } = useApp();
  const router = useRouter();

  // Redirect to login if not logged in
  useEffect(() => {
    if (!state.user) {
      router.push('/login');
    }
  }, [state.user, router]);

  const savedCards = useMemo(() => {
    return state.savedCards || [];
  }, [state.savedCards]);

  if (!state.user) {
    return null;
  }

  return (
    <div className="max-w-container-max px-margin-mobile md:px-margin-desktop animate-fade-rise mx-auto pt-32 pb-24">
      {/* Header reflection */}
      <div className="mb-16 max-w-3xl">
        <span className="font-body text-secondary mb-4 block text-xs font-semibold tracking-widest uppercase">
          The Collection
        </span>
        <h1 className="font-display text-primary mb-6 text-6xl leading-tight">
          Your Garden Keepsakes
        </h1>
        <p className="font-body text-secondary max-w-xl text-lg">
          A physical archive of your botanical progress and ecological
          footprints, curated week by week.
        </p>
      </div>

      {savedCards.length === 0 ? (
        /* Empty State */
        <div className="border-primary/5 mx-auto flex max-w-xl flex-col items-center gap-6 rounded-2xl border bg-white/40 p-16 text-center shadow-sm backdrop-blur-md">
          <span className="text-5xl">🏺</span>
          <div>
            <h3 className="font-display text-primary mb-2 text-2xl">
              Shelf is Empty
            </h3>
            <p className="font-body text-secondary text-sm leading-relaxed">
              No weekly cards have been saved to your gallery yet. Visit the
              Weekly Card page at the end of your week, configure your styles,
              and click &ldquo;Save to Gallery&rdquo;!
            </p>
          </div>
          <button
            onClick={() => router.push('/weekly')}
            className="bg-primary text-on-primary rounded-full px-8 py-3 text-sm font-medium transition-all hover:opacity-90 active:scale-95"
          >
            Go to Weekly Card
          </button>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 lg:grid-cols-3">
          {savedCards.map((card) => {
            const isBlueprint = card.theme === 'blueprint';

            return (
              <div
                key={card.id}
                className={`group relative flex aspect-[3/4] w-full flex-col justify-between overflow-hidden rounded-xl border shadow-lg transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl ${isBlueprint ? 'border-white/10 bg-slate-900 font-mono text-white' : 'text-primary border-black/5 bg-white'} `}
              >
                {/* Branding header */}
                <div className="border-primary/5 flex items-start justify-between border-b p-6 pb-2">
                  <div>
                    <div
                      className={`mb-0.5 text-lg leading-none ${isBlueprint ? 'font-mono tracking-tighter' : 'font-display font-semibold'}`}
                    >
                      Aethera®
                    </div>
                    <div
                      className={`text-[8px] tracking-[0.2em] uppercase ${isBlueprint ? 'opacity-70' : 'font-body text-secondary'}`}
                    >
                      Weekly Report
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-[10px] ${isBlueprint ? 'opacity-70' : 'font-body text-secondary font-medium'}`}
                    >
                      {card.dateRange}
                    </div>
                  </div>
                </div>

                {/* Plant representation */}
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                  {card.showIllustration && (
                    <div
                      className={`mb-2 transition-all duration-500 ${isBlueprint ? 'brightness-200 contrast-125 invert filter' : 'drop-shadow-lg'}`}
                    >
                      <PlantVisual
                        stage={card.plantStage}
                        className="h-24 w-24 sm:h-28 sm:w-28"
                      />
                    </div>
                  )}
                  <h2
                    className={`text-2xl capitalize ${isBlueprint ? 'font-mono' : 'font-display font-semibold italic'}`}
                  >
                    {card.plantStage.replace('-', ' ')}
                  </h2>
                  <p
                    className={`mt-1 text-[9px] tracking-widest uppercase ${isBlueprint ? 'opacity-70' : 'font-body text-secondary'}`}
                  >
                    Score: {Math.round(card.score)}%
                  </p>
                </div>

                {/* Footer metrics */}
                <div
                  className={`flex items-center justify-between border-t p-6 pt-4 transition-all ${isBlueprint ? 'border-white/10' : 'border-black/10'}`}
                >
                  {card.showMetrics ? (
                    <div className="grid flex-1 grid-cols-2 gap-4">
                      <div>
                        <div
                          className={`text-[8px] uppercase ${isBlueprint ? 'opacity-70' : 'font-body text-secondary font-semibold'}`}
                        >
                          Saved
                        </div>
                        <div
                          className={`text-sm ${isBlueprint ? '' : 'font-semibold'}`}
                        >
                          {Math.max(0, 50 - card.totalEmissions).toFixed(1)} kg
                        </div>
                      </div>
                      <div>
                        <div
                          className={`text-[8px] uppercase ${isBlueprint ? 'opacity-70' : 'font-body text-secondary font-semibold'}`}
                        >
                          Streak
                        </div>
                        <div
                          className={`text-sm ${isBlueprint ? '' : 'font-semibold'}`}
                        >
                          {card.streakLength} Days
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 text-[10px] italic opacity-60">
                      Metrics Hidden
                    </div>
                  )}

                  {/* Delete Keepsake Button */}
                  <button
                    onClick={() => deleteSavedCard(card.id)}
                    className="text-secondary/40 rounded-lg p-2 opacity-0 transition-colors transition-opacity group-hover:opacity-100 hover:bg-red-50/50 hover:text-red-500 focus:opacity-100"
                    title="Remove card"
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
  );
}

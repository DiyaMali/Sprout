"use client";

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/storage';
import { PlantVisual } from '@/components/PlantVisual';
import { Trash2, Calendar, Award, Sparkles } from 'lucide-react';

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
    <div className="pt-32 pb-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop animate-fade-rise">
      {/* Header reflection */}
      <div className="max-w-3xl mb-16">
        <span className="font-body text-xs font-semibold text-secondary uppercase tracking-widest block mb-4">The Collection</span>
        <h1 className="font-display text-6xl leading-tight mb-6 text-primary">Your Garden Keepsakes</h1>
        <p className="font-body text-lg text-secondary max-w-xl">
          A physical archive of your botanical progress and ecological footprints, curated week by week.
        </p>
      </div>

      {savedCards.length === 0 ? (
        /* Empty State */
        <div className="border border-primary/5 bg-white/40 backdrop-blur-md rounded-2xl p-16 text-center max-w-xl mx-auto shadow-sm flex flex-col items-center gap-6">
          <span className="text-5xl">🏺</span>
          <div>
            <h3 className="font-display text-2xl text-primary mb-2">Shelf is Empty</h3>
            <p className="font-body text-secondary text-sm leading-relaxed">
              No weekly cards have been saved to your gallery yet. Visit the Weekly Card page at the end of your week, configure your styles, and click "Save to Gallery"!
            </p>
          </div>
          <button 
            onClick={() => router.push('/weekly')}
            className="bg-primary text-on-primary px-8 py-3 rounded-full font-medium text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Go to Weekly Card
          </button>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-start">
          {savedCards.map((card) => {
            const isBlueprint = card.theme === 'blueprint';

            return (
              <div 
                key={card.id} 
                className={`relative aspect-[3/4] w-full border shadow-lg flex flex-col justify-between overflow-hidden rounded-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] group
                  ${isBlueprint ? 'bg-slate-900 border-white/10 text-white font-mono' : 'bg-white border-black/5 text-primary'}
                `}
              >
                
                {/* Branding header */}
                <div className="p-6 pb-2 flex justify-between items-start border-b border-primary/5">
                  <div>
                    <div className={`text-lg leading-none mb-0.5 ${isBlueprint ? 'font-mono tracking-tighter' : 'font-display font-semibold'}`}>Aethera®</div>
                    <div className={`text-[8px] tracking-[0.2em] uppercase ${isBlueprint ? 'opacity-70' : 'font-body text-secondary'}`}>Weekly Report</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[10px] ${isBlueprint ? 'opacity-70' : 'font-body text-secondary font-medium'}`}>{card.dateRange}</div>
                  </div>
                </div>

                {/* Plant representation */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  {card.showIllustration && (
                    <div className={`transition-all duration-500 mb-2 ${isBlueprint ? 'filter invert brightness-200 contrast-125' : 'drop-shadow-lg'}`}>
                      <PlantVisual stage={card.plantStage} className="w-24 h-24 sm:w-28 sm:h-28" />
                    </div>
                  )}
                  <h2 className={`text-2xl capitalize ${isBlueprint ? 'font-mono' : 'font-display italic font-semibold'}`}>
                    {card.plantStage.replace('-', ' ')}
                  </h2>
                  <p className={`text-[9px] tracking-widest uppercase mt-1 ${isBlueprint ? 'opacity-70' : 'font-body text-secondary'}`}>
                    Score: {Math.round(card.score)}%
                  </p>
                </div>

                {/* Footer metrics */}
                <div className={`p-6 pt-4 border-t flex justify-between items-center transition-all ${isBlueprint ? 'border-white/10' : 'border-black/10'}`}>
                  {card.showMetrics ? (
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div>
                        <div className={`text-[8px] uppercase ${isBlueprint ? 'opacity-70' : 'font-body text-secondary font-semibold'}`}>Saved</div>
                        <div className={`text-sm ${isBlueprint ? '' : 'font-semibold'}`}>
                          {Math.max(0, 50 - card.totalEmissions).toFixed(1)} kg
                        </div>
                      </div>
                      <div>
                        <div className={`text-[8px] uppercase ${isBlueprint ? 'opacity-70' : 'font-body text-secondary font-semibold'}`}>Streak</div>
                        <div className={`text-sm ${isBlueprint ? '' : 'font-semibold'}`}>{card.streakLength} Days</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 text-[10px] italic opacity-60">Metrics Hidden</div>
                  )}
                  
                  {/* Delete Keepsake Button */}
                  <button 
                    onClick={() => deleteSavedCard(card.id)}
                    className="text-secondary/40 hover:text-red-500 p-2 rounded-lg hover:bg-red-50/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
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

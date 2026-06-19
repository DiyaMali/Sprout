"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  


  useEffect(() => {
    const video = videoRef.current;
    const fadeDuration = 0.5; // in seconds

    if (!video) return;

    const handlePlaying = () => {
      video.classList.add('fade-in');
    };

    const handleTimeUpdate = () => {
      const timeLeft = video.duration - video.currentTime;
      if (timeLeft <= fadeDuration && !video.classList.contains('fade-out')) {
        video.classList.remove('fade-in');
        video.classList.add('fade-out');
      }
    };

    const handleEnded = () => {
      video.currentTime = 0;
      video.classList.remove('fade-out');
      video.play().catch(e => console.log('Autoplay blocked', e));
    };

    video.play().catch(() => console.log('Autoplay blocked, waiting for interaction'));
    
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const scrollToApp = () => {
    router.push('/journey');
  };

  return (
    <>
      {/* Video Background Container */}
      <div className="video-container">
        <video ref={videoRef} muted playsInline preload="auto">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white pointer-events-none z-10" />

      {/* Hero Content */}
      <section className="relative z-20 flex flex-col items-center justify-start text-center pt-[calc(8rem-75px)] pb-40 px-margin-mobile md:px-margin-desktop min-h-[90vh]">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          {/* Headline */}
          <h1 className="animate-fade-rise font-display text-7xl md:text-[128px] leading-[0.95] tracking-[-0.03em] text-primary" style={{ textShadow: "0 2px 4px rgba(255,255,255,0.5)" }}>
            Your footprint leaves a mark. <br className="hidden md:block" /> 
            Why not leave a <span className="italic" style={{ color: "rgb(107, 203, 119)" }}>garden?</span>
          </h1>
          {/* Description */}
          <p className="animate-fade-rise-delayed mt-8 text-aethera-gray text-lg md:text-xl max-w-2xl font-body leading-relaxed">
            Sprout transforms everyday decisions into something you can see, nurture, and grow. No guilt. No overwhelming numbers. Just awareness that blooms.
          </p>
          {/* CTA */}
          <div className="animate-fade-rise-delayed-2 mt-12">
            <button 
              onClick={scrollToApp}
              className="bg-primary text-on-primary px-14 py-5 rounded-full text-lg font-medium hover:scale-[1.02] transition-transform duration-300 shadow-lg shadow-black/5"
            >
              Start Growing
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

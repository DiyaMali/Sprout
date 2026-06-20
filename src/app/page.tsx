'use client';

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
      video.play().catch((e) => console.log('Autoplay blocked', e));
    };

    video
      .play()
      .catch(() => console.log('Autoplay blocked, waiting for interaction'));

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
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-white via-transparent to-white" />

      {/* Hero Content */}
      <section className="px-margin-mobile md:px-margin-desktop relative z-20 flex min-h-[90vh] flex-col items-center justify-start pt-[calc(8rem-75px)] pb-40 text-center">
        <div className="mx-auto flex max-w-6xl flex-col items-center">
          {/* Headline */}
          <h1
            className="animate-fade-rise font-display text-primary text-7xl leading-[0.95] tracking-[-0.03em] md:text-[128px]"
            style={{ textShadow: '0 2px 4px rgba(255,255,255,0.5)' }}
          >
            Your footprint leaves a mark. <br className="hidden md:block" />
            Why not leave a{' '}
            <span className="italic" style={{ color: 'rgb(107, 203, 119)' }}>
              garden?
            </span>
          </h1>
          {/* Description */}
          <p className="animate-fade-rise-delayed text-aethera-gray font-body mt-8 max-w-2xl text-lg leading-relaxed md:text-xl">
            Sprout transforms everyday decisions into something you can see,
            nurture, and grow. No guilt. No overwhelming numbers. Just awareness
            that blooms.
          </p>
          {/* CTA */}
          <div className="animate-fade-rise-delayed-2 mt-12">
            <button
              onClick={scrollToApp}
              className="bg-primary text-on-primary rounded-full px-14 py-5 text-lg font-medium shadow-lg shadow-black/5 transition-transform duration-300 hover:scale-[1.02]"
            >
              Start Growing
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

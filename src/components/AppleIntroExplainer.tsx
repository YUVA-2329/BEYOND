import React, { useState, useEffect } from 'react';
import { MountainLogo } from './MountainLogo';
import { Sparkles, MapPin, Camera, Map, Award, Bookmark, ArrowRight, CheckCircle2, ChevronRight, Compass } from 'lucide-react';
import { BeyondImage } from './BeyondImage';

interface AppleIntroExplainerProps {
  onEnterApp: (selectedCity?: string) => void;
  onExitToBeyond?: () => void;
}

export const AppleIntroExplainer: React.FC<AppleIntroExplainerProps> = ({ onEnterApp, onExitToBeyond }) => {
  const [phase, setPhase] = useState<'cinematic_intro' | 'five_points'>('cinematic_intro');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [activePointIndex, setActivePointIndex] = useState<number>(0);
  const [logoScale, setLogoScale] = useState<number>(0.85);

  // Keyboard 'Enter' key listener to advance or enter app
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (phase === 'cinematic_intro') {
          setPhase('five_points');
        } else {
          onEnterApp(selectedCity);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, selectedCity, onEnterApp]);

  // Subtle breathing animation on logo during cinematic intro
  useEffect(() => {
    const timer = setTimeout(() => {
      setLogoScale(1.0);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const fivePoints = [
    {
      id: 1,
      title: '1. Find Secret Places',
      subtitle: 'Like finding a hidden treasure!',
      description: 'Regular maps only show big shops and traffic. BEYOND shows secret sunset hills, cozy tree cafes, and quiet lakes hidden right in your city.',
      icon: MapPin,
      badge: 'Treasure Map',
      color: '#00E599',
      image: '/intro/assets/golconda_sunset.jpg',
    },
    {
      id: 2,
      title: '2. Take a Cool Picture',
      subtitle: 'Leave your mark on the map!',
      description: 'When you find a magical viewpoint or secret cafe, snap a picture! It is like sticking your own shiny star on the world map for your friends to see.',
      icon: Camera,
      badge: 'Share Adventure',
      color: '#38BDF8',
      image: '/intro/assets/durgam_cheruvu.jpg',
    },
    {
      id: 3,
      title: '3. Tap the Magic Map',
      subtitle: 'See how close each adventure is!',
      description: 'Tap any glowing green dot on the map. It tells you how far it is and shows you the path. A real-life adventure map in your hands!',
      icon: Map,
      badge: 'Interactive GPS',
      color: '#A855F7',
      image: '/intro/assets/nandi_hills.jpg',
    },
    {
      id: 4,
      title: '4. Win Shiny Badges',
      subtitle: 'Level up like your favorite game!',
      description: 'Every time you explore, like a spot, or write a friendly comment, you earn stars, get XP points, and level up from Explorer to City Legend!',
      icon: Award,
      badge: 'Level Up',
      color: '#F59E0B',
      image: '/intro/assets/cubbon_park.jpg',
    },
    {
      id: 5,
      title: '5. Keep Your Favorites',
      subtitle: 'Never forget your dream spots!',
      description: 'Tap the green bookmark on places you love. Put them into cute collections like "Sunset Escapes" so you always know where to visit on the weekend.',
      icon: Bookmark,
      badge: 'Save Forever',
      color: '#10B981',
      image: '/intro/assets/roastery_cafe.jpg',
    },
  ];

  return (
    <div className="relative w-full min-h-screen bg-[#050706] text-white flex flex-col justify-between overflow-x-hidden select-none font-sans">
      {/* Ambient Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-[#00E599]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#38BDF8]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* PHASE 1: APPLE-STYLE CINEMATIC INTRO */}
      {phase === 'cinematic_intro' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-xl mx-auto animate-fadeIn">
          {/* Subtle Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-emerald-400 tracking-wider uppercase mb-8 backdrop-blur-md">
            <Sparkles size={13} className="text-[#00E599]" />
            Apple-Grade Exploration
          </div>

          {/* Logo with smooth scale and ambient glow */}
          <div
            className="transition-all duration-1000 ease-out transform mb-6"
            style={{ transform: `scale(${logoScale})` }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-[#00E599]/20 rounded-full blur-xl animate-pulse" />
              <MountainLogo size={96} className="relative drop-shadow-[0_0_35px_rgba(0,229,153,0.45)]" />
            </div>
          </div>

          {/* Apple-Style Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-[0.25em] text-white uppercase mb-3">
            B E Y O N D
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl font-light text-slate-300 max-w-md mx-auto leading-relaxed mb-4">
            Discover places.{' '}
            <span className="text-[#00E599] font-normal">Become the reason others discover them.</span>
          </p>

          <p className="text-xs md:text-sm text-slate-400 max-w-sm mx-auto font-light leading-relaxed mb-10">
            A quiet viewpoint behind a hill. A tranquil lakeside boardwalk. An artisanal courtyard cafe. The world is full of extraordinary spots waiting for you.
          </p>

          {/* CTA to Step 2 */}
          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
            <button
              onClick={() => setPhase('five_points')}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00E599] to-[#00C280] text-black font-semibold text-base shadow-[0_0_30px_rgba(0,229,153,0.35)] hover:shadow-[0_0_45px_rgba(0,229,153,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>See How It Works</span>
              <ArrowRight size={18} />
            </button>
            <span className="text-[11px] text-slate-400">or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">ENTER</kbd> on your keyboard</span>
            {onExitToBeyond && (
              <button
                onClick={onExitToBeyond}
                className="mt-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>← Return to Original BEYOND</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* PHASE 2: 5-POINT EXPLAINER (SO SIMPLE A 4-YEAR-OLD UNDERSTANDS) */}
      {phase === 'five_points' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 md:px-8 py-8 max-w-2xl mx-auto w-full animate-fadeIn">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E599]/10 border border-[#00E599]/30 text-xs font-medium text-[#00E599] mb-2">
              <Compass size={13} />
              5 Simple Steps
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              What is <span className="text-[#00E599]">BEYOND</span>?
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Super simple rules to find cool spots in Hyderabad, Bangalore & beyond.
            </p>
          </div>

          {/* Step Selector Tabs (Dots/Pills) */}
          <div className="flex items-center justify-center gap-2 mb-4 w-full">
            {fivePoints.map((pt, idx) => (
              <button
                key={pt.id}
                onClick={() => setActivePointIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activePointIndex === idx ? 'w-8 bg-[#00E599]' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Active Featured Card with Image & Simple Language */}
          <div className="w-full bg-[#111715]/90 border border-white/10 rounded-3xl p-5 md:p-6 mb-6 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-500">
            {/* Background Image Preview with Gradient Overlay */}
            <div className="relative w-full h-40 md:h-48 rounded-2xl overflow-hidden mb-4 border border-white/5">
              <BeyondImage
                src={fivePoints[activePointIndex].image}
                alt={fivePoints[activePointIndex].title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111715] via-transparent to-black/20" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-[#00E599] flex items-center gap-1.5">
                {React.createElement(fivePoints[activePointIndex].icon, { size: 14 })}
                {fivePoints[activePointIndex].badge}
              </div>
            </div>

            {/* Title & Simple Explainer */}
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-black font-bold shadow-md"
                style={{ backgroundColor: fivePoints[activePointIndex].color }}
              >
                {React.createElement(fivePoints[activePointIndex].icon, { size: 20 })}
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white">
                  {fivePoints[activePointIndex].title}
                </h3>
                <p className="text-xs text-emerald-400 font-medium">
                  {fivePoints[activePointIndex].subtitle}
                </p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light mt-2">
              {fivePoints[activePointIndex].description}
            </p>

            {/* Step navigation buttons */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-xs text-slate-400">
              <button
                onClick={() => setActivePointIndex((prev) => (prev > 0 ? prev - 1 : fivePoints.length - 1))}
                className="hover:text-white transition-colors"
              >
                ← Previous
              </button>
              <span className="font-mono text-emerald-400">
                {activePointIndex + 1} of {fivePoints.length}
              </span>
              <button
                onClick={() => setActivePointIndex((prev) => (prev < fivePoints.length - 1 ? prev + 1 : 0))}
                className="text-[#00E599] font-medium hover:underline flex items-center gap-1"
              >
                Next Step →
              </button>
            </div>
          </div>

          {/* Location Selector (Hyderabad / Bangalore / Mysuru / All) */}
          <div className="w-full bg-[#111715]/60 border border-white/5 rounded-2xl p-4 mb-6 text-center">
            <p className="text-xs text-slate-300 font-medium mb-2.5">
              📍 Choose your starting city:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { name: 'Hyderabad', tag: 'Golconda & Durgam Cheruvu' },
                { name: 'Bangalore', tag: 'Nandi Hills & Cubbon Park' },
                { name: 'Mysuru', tag: 'Chamundi & Vintage Cafe' },
                { name: 'All', tag: 'All Discovery Spots' },
              ].map((city) => (
                <button
                  key={city.name}
                  onClick={() => setSelectedCity(city.name)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedCity === city.name
                      ? 'bg-[#00E599] text-black shadow-[0_0_15px_rgba(0,229,153,0.3)] font-semibold'
                      : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>

          {/* THE ENTER ACTION BUTTON */}
          <div className="w-full flex flex-col items-center gap-2">
            <button
              onClick={() => onEnterApp(selectedCity)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00E599] via-[#00F0A0] to-[#00C280] text-black font-extrabold text-base tracking-wide shadow-[0_0_35px_rgba(0,229,153,0.45)] hover:shadow-[0_0_55px_rgba(0,229,153,0.7)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>ENTER APPLE EXPERIENCE</span>
              <ArrowRight size={20} className="stroke-[3]" />
            </button>
            <p className="text-[11px] text-slate-400">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">ENTER</kbd> on your keyboard or tap above to enter
            </p>
            {onExitToBeyond && (
              <button
                onClick={onExitToBeyond}
                className="mt-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>← Return to Original BEYOND</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="relative z-10 py-4 text-center border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-center gap-4">
        <span>BEYOND v1.0.0</span>
        <span>•</span>
        <span>Keyboard PIN: Type <strong className="text-emerald-400 font-mono">0000</strong> to unlock Editor Mode</span>
      </div>
    </div>
  );
};

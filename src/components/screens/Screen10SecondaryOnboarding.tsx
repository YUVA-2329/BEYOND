import React from 'react';
import { ScreenId } from '../../types';
import { BeyondImage } from '../BeyondImage';

interface Screen10Props {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen10SecondaryOnboarding: React.FC<Screen10Props> = ({ onNavigate }) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-end text-white overflow-hidden bg-[#080E18] p-6 pb-8">
      {/* Background Photographic Hero (Lone explorer overlooking mountain ridge) */}
      <div className="absolute inset-0 z-0">
        <BeyondImage
          src="/intro/assets/hero_onboarding_2.png"
          fallbackSrc="/intro/assets/hero_onboarding_2.png"
          alt="Explorer overlooking scenic mountain landscape"
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Dark Vignettes & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080E18] via-[#080E18]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080E18]/50 via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-start w-full">
        {/* Primary Statement */}
        <div className="space-y-1 mb-3">
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-white leading-tight">
            Real People
          </h1>
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-white leading-tight">
            Real Places
          </h1>
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-[#00E599] leading-tight">
            Hidden Gems
          </h1>
        </div>

        {/* Subtext */}
        <p className="text-xs text-slate-300 font-normal leading-relaxed max-w-[280px] mb-6">
          Join a community of explorers sharing the best spots around you.
        </p>

        {/* Action Button */}
        <button
          onClick={() => onNavigate('screen_02_home_feed')}
          className="w-full py-3.5 px-6 rounded-full bg-white text-[#080E18] font-bold text-sm tracking-wide shadow-xl hover:bg-slate-100 active:scale-98 transition-all cursor-pointer text-center mb-3"
        >
          Get Started
        </button>

        {/* Secondary Link */}
        <div className="w-full text-center">
          <button
            onClick={() => onNavigate('screen_02_home_feed')}
            className="text-xs text-slate-300 hover:text-white font-medium cursor-pointer"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { MountainLogo } from '../MountainLogo';
import { ScreenId } from '../../types';

import { BeyondImage } from '../BeyondImage';

interface Screen01Props {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen01SplashOnboarding: React.FC<Screen01Props> = ({ onNavigate }) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between text-white overflow-hidden bg-[#080E18]">
      {/* Background Cinematic Photography */}
      <div className="absolute inset-0 z-0">
        <BeyondImage
          src="/intro/assets/hero_onboarding_sunset.png"
          fallbackSrc="/intro/assets/hero_onboarding_sunset.png"
          alt="Explorer on Mountain Peak at Sunset"
          className="w-full h-full object-cover object-center scale-105"
        />
        {/* Cinematic Vignette & Bottom Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080E18] via-[#080E18]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080E18]/50 via-transparent to-transparent" />
      </div>

      {/* Top Brand Identity */}
      <div className="relative z-10 pt-10 flex flex-col items-center justify-center text-center px-6">
        <MountainLogo size={42} />
        <h1 className="text-3xl font-extrabold tracking-wider font-display mt-2 text-white">
          BEYOND
        </h1>
        <div className="mt-4 max-w-[260px]">
          <p className="text-sm font-medium text-slate-200/90 leading-snug">
            Discover places.
            <br />
            Become the reason
            <br />
            others discover them.
          </p>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="relative z-10 px-6 pb-6 flex flex-col items-center gap-3 w-full">
        <button
          onClick={() => onNavigate('screen_02_home_feed')}
          className="w-full py-3.5 px-6 rounded-full bg-white text-[#080E18] font-bold text-sm tracking-wide shadow-xl hover:bg-slate-100 active:scale-98 transition-all cursor-pointer text-center"
        >
          Get Started
        </button>

        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('screen_02_home_feed')}
            className="text-white hover:text-[#00E599] font-medium underline underline-offset-2 transition-colors cursor-pointer"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

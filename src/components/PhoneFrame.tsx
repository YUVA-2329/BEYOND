import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
  compact?: boolean;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  label,
  className = '',
  compact = false,
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Outer Phone Bezel */}
      <div
        className={`relative ${
          compact
            ? 'w-[230px] sm:w-[250px] h-[510px] sm:h-[550px] rounded-[38px] p-2'
            : 'w-[340px] sm:w-[360px] h-[720px] sm:h-[750px] rounded-[48px] p-2.5'
        } bg-[#0A121F] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.12)] border border-[#1E2D44] overflow-hidden flex flex-col`}
      >
        {/* Subtle Screen Bezel Rim */}
        <div
          className={`relative w-full h-full bg-[#080E18] ${
            compact ? 'rounded-[30px]' : 'rounded-[40px]'
          } overflow-hidden flex flex-col`}
        >
          {/* iOS Status Bar */}
          <div
            className={`${
              compact ? 'h-7 px-4 pt-1.5' : 'h-10 px-6 pt-2.5'
            } flex items-center justify-between text-white text-[11px] font-semibold z-50 select-none bg-transparent`}
          >
            <span>9:41</span>
            
            {/* Dynamic Island Pill */}
            <div className={`${compact ? 'w-14 h-3' : 'w-20 h-4'} bg-black rounded-full mx-auto`} />

            <div className="flex items-center gap-1.5 opacity-90">
              <svg className="w-3.5 h-3 fill-current" viewBox="0 0 16 16">
                <path d="M1 11h2v3H1v-3zm4-3h2v6H5V8zm4-4h2v10H9V4zm4-3h2v13h-2V1z"/>
              </svg>
              <Wifi size={13} strokeWidth={2.5} />
              <Battery size={15} strokeWidth={2.5} />
            </div>
          </div>

          {/* Screen Content Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar relative flex flex-col">
            {children}
          </div>

          {/* Home Indicator Bar */}
          <div className="h-4 w-full flex items-center justify-center bg-transparent z-50 pointer-events-none pb-1">
            <div className="w-32 h-1 bg-white/40 rounded-full" />
          </div>
        </div>
      </div>

      {/* Screen Caption Label */}
      {label && (
        <span className="mt-3 text-xs font-medium tracking-wide text-[#94A3B8] select-none text-center">
          {label}
        </span>
      )}
    </div>
  );
};

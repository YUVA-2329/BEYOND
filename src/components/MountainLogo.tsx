import React from 'react';

interface MountainLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const MountainLogo: React.FC<MountainLogoProps> = ({
  className = '',
  size = 28,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white drop-shadow-sm"
      >
        {/* Stylized Triple Mountain Peaks matching BEYOND reference logo */}
        <path
          d="M20 2L28 17H12L20 2Z"
          fill="currentColor"
        />
        <path
          d="M8 12L15 25H1L8 12Z"
          fill="currentColor"
          fillOpacity="0.85"
        />
        <path
          d="M32 12L39 25H25L32 12Z"
          fill="currentColor"
          fillOpacity="0.85"
        />
        <path
          d="M20 18L24 26H16L20 18Z"
          fill="currentColor"
          fillOpacity="0.5"
        />
      </svg>
      {showText && (
        <span className="font-extrabold tracking-wider text-white text-lg font-display">
          BEYOND
        </span>
      )}
    </div>
  );
};

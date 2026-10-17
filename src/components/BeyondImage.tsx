import React, { useState } from 'react';

export interface BeyondImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  isAvatar?: boolean;
  containerClassName?: string;
}

const DEFAULT_LANDMARK_FALLBACK = '/intro/assets/chamundi_hills_sunset.png';
const DEFAULT_AVATAR_FALLBACK = '/intro/assets/rohit_avatar.png';

export const BeyondImage: React.FC<BeyondImageProps> = ({
  src,
  alt = 'BEYOND asset',
  fallbackSrc,
  isAvatar = false,
  className = '',
  containerClassName = '',
  loading = 'lazy',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const defaultFallback = isAvatar ? DEFAULT_AVATAR_FALLBACK : DEFAULT_LANDMARK_FALLBACK;
  const effectiveFallback = fallbackSrc || defaultFallback;

  // Determine actual image source
  const imageSrc = hasError || !src ? effectiveFallback : src;

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Loading Skeleton / Shimmer */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-800/60 animate-pulse pointer-events-none" />
      )}

      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setIsLoaded(true);
          }
        }}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...props}
      />
    </div>
  );
};

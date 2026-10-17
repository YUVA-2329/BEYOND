import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Link2, MoreHorizontal, Check, MapPin } from 'lucide-react';
import { MountainLogo } from '../MountainLogo';
import { Discovery, ScreenId } from '../../types';
import { api } from '../../services/api';
import { BeyondImage } from '../BeyondImage';

interface Screen09Props {
  discoveryId?: string;
  onNavigate: (screen: ScreenId, params?: any) => void;
}

export const Screen09ShareableCard: React.FC<Screen09Props> = ({
  discoveryId = 'chamundi-hills-viewpoint',
  onNavigate,
}) => {
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getDiscoveryById(discoveryId).then((d) => setDiscovery(d));
  }, [discoveryId]);

  if (!discovery) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#080E18] text-white">
        <div className="w-6 h-6 border-2 border-[#00E599] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/discovery/${discovery.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Explore "${discovery.title}" on BEYOND: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: discovery.title,
        text: discovery.description,
        url: shareUrl,
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#080E18] text-white overflow-y-auto hide-scrollbar p-4">
      {/* Top Back Action */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => onNavigate('screen_02_home_feed')}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xs font-semibold text-slate-400">Shareable Card</span>
        <div className="w-6" />
      </div>

      {/* The Central Shareable Card (matches Screen 09) */}
      <div className="bg-[#0B1525] border border-[#16253C] rounded-3xl overflow-hidden shadow-2xl my-auto">
        {/* Top Header with BEYOND logo */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#142236] bg-[#0E1A2C]">
          <div className="flex items-center gap-1.5">
            <MountainLogo size={18} />
            <span className="text-xs font-extrabold tracking-wider font-display">BEYOND</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Spot Card</span>
        </div>

        {/* Hero Photo */}
        <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
          <BeyondImage src={discovery.imageUrl} alt={discovery.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1525] via-transparent to-black/30" />

          {/* Location badge on photo */}
          <div className="absolute bottom-2.5 left-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-0.5 flex items-center gap-1 text-[10px] text-white">
            <MapPin size={10} className="text-[#00E599]" />
            <span>{discovery.location}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3.5">
          <h2 className="text-sm font-bold text-white font-display tracking-tight">
            {discovery.title}
          </h2>

          <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            "{discovery.description}"
          </p>

          {/* Tags */}
          <div className="flex items-center gap-1.5 mt-2.5">
            {discovery.categories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#112035] text-slate-300 border border-[#182C48]"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Creator Attribution Row */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#142236]">
            <div className="flex items-center gap-2">
              <BeyondImage
                src={discovery.author.avatarUrl}
                alt={discovery.author.name}
                isAvatar={true}
                className="w-6 h-6 rounded-full object-cover border border-white/20"
              />
              <div className="text-[11px] font-semibold text-slate-200">
                {discovery.author.name}
                <span className="text-[9px] text-slate-400 ml-1.5">{discovery.createdAt}</span>
              </div>
            </div>

            <Heart size={16} className="text-slate-400 hover:text-rose-500 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Share Actions Sheet (matching bottom of Screen 09) */}
      <div className="mt-4 pt-2">
        <div className="text-center text-xs font-semibold text-slate-400 mb-3">Share</div>

        <div className="flex items-center justify-around px-4 pb-2">
          {/* Instagram */}
          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <span className="text-[10px] text-slate-300 font-medium">Instagram</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </div>
            <span className="text-[10px] text-slate-300 font-medium">WhatsApp</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-[#16273F] border border-[#203756] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              {copied ? (
                <Check size={18} className="text-[#00E599]" />
              ) : (
                <Link2 size={18} className="text-slate-300" />
              )}
            </div>
            <span className="text-[10px] text-slate-300 font-medium">
              {copied ? 'Copied!' : 'Copy Link'}
            </span>
          </button>

          {/* More */}
          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-1.5 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-[#16273F] border border-[#203756] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <MoreHorizontal size={18} className="text-slate-300" />
            </div>
            <span className="text-[10px] text-slate-300 font-medium">More</span>
          </button>
        </div>
      </div>
    </div>
  );
};

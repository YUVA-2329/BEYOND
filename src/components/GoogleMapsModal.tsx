import React, { useState } from 'react';
import { X, Navigation, ExternalLink, Layers, MapPin, Globe } from 'lucide-react';
import { getGoogleMapsEmbedUrl, getGoogleMapsDirectionsUrl, getGoogleMapsSearchUrl } from '../services/googleMaps';

interface GoogleMapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  title: string;
  location: string;
}

export const GoogleMapsModal: React.FC<GoogleMapsModalProps> = ({
  isOpen,
  onClose,
  lat,
  lng,
  title,
  location,
}) => {
  const [mapType, setMapType] = useState<'satellite' | 'roadmap' | 'terrain'>('satellite');

  if (!isOpen) return null;

  const embedUrl = getGoogleMapsEmbedUrl(lat, lng, mapType);
  const directionsUrl = getGoogleMapsDirectionsUrl(lat, lng, `${title} ${location}`);
  const searchUrl = getGoogleMapsSearchUrl(lat, lng, `${title} ${location}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div
        className="relative w-full max-w-4xl h-[85vh] bg-[#080E18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-[#0B1525]/90 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00E599]/15 border border-[#00E599]/30 flex items-center justify-center text-[#00E599]">
              <Globe size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white font-display">{title}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00E599]/20 text-[#00E599] border border-[#00E599]/40">
                  Google Maps API
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin size={11} className="text-[#00E599]" />
                <span>{location}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[11px] text-slate-300">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Google Directions Link */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-[#00E599] hover:bg-[#00C883] text-[#07130F] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Navigation size={13} />
              <span className="hidden sm:inline">Get Directions</span>
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
              aria-label="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Floating Google View Layer Switcher */}
        <div className="absolute top-20 right-6 z-20 bg-black/80 backdrop-blur-xl border border-white/15 p-1 rounded-2xl flex items-center gap-1 shadow-2xl">
          <button
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mapType === 'satellite'
                ? 'bg-[#00E599] text-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🛰️</span>
            <span>Satellite</span>
          </button>

          <button
            onClick={() => setMapType('roadmap')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mapType === 'roadmap'
                ? 'bg-[#00E599] text-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🗺️</span>
            <span>Roadmap</span>
          </button>

          <button
            onClick={() => setMapType('terrain')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              mapType === 'terrain'
                ? 'bg-[#00E599] text-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🏔️</span>
            <span>Terrain</span>
          </button>
        </div>

        {/* Real Interactive Google Maps Iframe */}
        <div className="flex-1 w-full h-full relative bg-black">
          <iframe
            title={`Google Map - ${title}`}
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        </div>

        {/* Bottom Status & Open In Google Bar */}
        <div className="px-5 py-3 bg-[#0B1525]/95 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
            <span>Real Google Maps satellite & telemetry live stream</span>
          </div>

          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00E599] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <span>Open in Google Maps App</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Compass,
  MapPin,
  Radio,
  Navigation,
  Shield,
  ChevronRight,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import {
  locationService,
  LocationState,
  LocationCoordinates,
  RadarScanResult,
  KNOWN_CITY_FALLBACKS,
} from '../services/locationService';
import { Discovery, ScreenId } from '../types';
import { BeyondImage } from './BeyondImage';
import { getGoogleMapsDirectionsUrl } from '../services/googleMaps';

interface RadarScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlace?: (discoveryId: string) => void;
  onNavigate?: (screen: ScreenId, params?: any) => void;
}

export const RadarScanModal: React.FC<RadarScanModalProps> = ({
  isOpen,
  onClose,
  onSelectPlace,
  onNavigate,
}) => {
  const [scanResult, setScanResult] = useState<RadarScanResult>({
    state: locationService.getState(),
    coordinates: locationService.getCoordinates(),
    discoveries: [],
    message: locationService.getStateDescription(locationService.getState()),
    timestamp: new Date().toISOString(),
  });

  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [isSweepActive, setIsSweepActive] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = locationService.subscribe((result) => {
      setScanResult(result);
      if (result.state === 'scanning') {
        setIsSweepActive(true);
      } else {
        setIsSweepActive(false);
      }
    });

    return () => unsubscribe();
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEnableLocation = async () => {
    await locationService.requestBrowserLocation();
    await locationService.performRadarScan({ radiusKm });
  };

  const handleStartScan = async () => {
    await locationService.performRadarScan({ radiusKm });
  };

  const handleStopScan = () => {
    locationService.cancelScan();
  };

  const handleSelectCityFallback = async (cityName: string) => {
    locationService.setManualLocation(cityName);
    await locationService.performRadarScan({ radiusKm });
  };

  const { state, coordinates, discoveries, message } = scanResult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#080E18] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden font-sans flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Radar Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-48 bg-[#00E599]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00E599]/15 border border-[#00E599]/30 flex items-center justify-center text-[#00E599]">
              <Radio size={18} className={isSweepActive ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white font-display tracking-tight">
                  RADAR SCAN
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30">
                  Live Range: {radiusKm} km
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {coordinates ? `${coordinates.city || 'Located'} (±${coordinates.accuracyMeters || 50}m accuracy)` : 'Explicit, privacy-preserving local radar'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Radar Graphic & State Control */}
        <div className="py-4 flex flex-col sm:flex-row items-center gap-6 shrink-0 border-b border-white/10">
          {/* Radar Screen Visual */}
          <div className="relative w-44 h-44 rounded-full bg-[#050911] border-2 border-[#00E599]/40 shadow-inner flex items-center justify-center overflow-hidden shrink-0">
            {/* Concentric Distance Rings */}
            <div className="absolute w-32 h-32 rounded-full border border-[#00E599]/20" />
            <div className="absolute w-20 h-20 rounded-full border border-[#00E599]/25" />
            <div className="absolute w-8 h-8 rounded-full border border-[#00E599]/30" />

            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-[#00E599]/20" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-[#00E599]/20" />

            {/* Rotating Radar Sweep Beam */}
            {isSweepActive && (
              <div
                className="absolute inset-0 origin-center rounded-full pointer-events-none"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(0,229,153,0.4) 0deg, rgba(0,229,153,0.05) 60deg, transparent 90deg, transparent 360deg)',
                  animation: 'radarSweep 2s linear infinite',
                }}
              />
            )}

            {/* Center User Dot */}
            <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-[#00E599] border-2 border-white shadow-lg shadow-[#00E599]" />

            {/* Blips for Detected Places */}
            {discoveries.slice(0, 6).map((d, idx) => {
              const angles = [35, 110, 195, 260, 315, 75];
              const dists = [30, 48, 62, 54, 40, 68];
              const angle = angles[idx % angles.length];
              const dist = dists[idx % dists.length];
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad) * dist;
              const y = Math.sin(rad) * dist;

              return (
                <div
                  key={d.id}
                  className="absolute z-20 w-2.5 h-2.5 rounded-full bg-emerald-300 border border-white shadow-sm animate-ping"
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    animationDuration: `${2 + idx * 0.5}s`,
                  }}
                  title={d.title}
                />
              );
            })}
          </div>

          {/* Controls & Status Explanation */}
          <div className="flex-1 space-y-3 w-full">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  state === 'scanning'
                    ? 'bg-[#00E599] animate-ping'
                    : state === 'results_found'
                    ? 'bg-[#00E599]'
                    : state === 'permission_denied' || state === 'provider_failure'
                    ? 'bg-rose-500'
                    : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {state.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Real-time Message */}
            <p className="text-xs text-slate-300 leading-relaxed bg-[#0B1525] p-3 rounded-2xl border border-white/5">
              {message}
            </p>

            {/* Radius Range Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <Sliders size={12} />
                <span>Radius:</span>
              </span>
              {[5, 15, 25, 50].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                    radiusKm === r
                      ? 'bg-[#00E599] text-[#050911] shadow-md shadow-[#00E599]/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {!coordinates && state === 'permission_not_requested' && (
                <button
                  onClick={handleEnableLocation}
                  className="px-4 py-2 rounded-2xl bg-[#00E599] hover:bg-[#00C883] text-[#07130F] font-bold text-xs shadow-lg shadow-[#00E599]/25 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Navigation size={13} />
                  <span>ENABLE LOCATION</span>
                </button>
              )}

              {coordinates && state !== 'scanning' && (
                <button
                  onClick={handleStartScan}
                  className="px-4 py-2 rounded-2xl bg-[#00E599] hover:bg-[#00C883] text-[#07130F] font-bold text-xs shadow-lg shadow-[#00E599]/25 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <RefreshCw size={13} />
                  <span>START RADAR SCAN</span>
                </button>
              )}

              {state === 'scanning' && (
                <button
                  onClick={handleStopScan}
                  className="px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  STOP SCAN
                </button>
              )}

              {/* Privacy Notice */}
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Shield size={11} className="text-[#00E599]" />
                <span>Zero background tracking. 4-decimal coordinate truncation.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Destination Fallbacks (Crucial if permission denied or desktop without GPS) */}
        {(state === 'permission_denied' || state === 'location_unavailable' || state === 'permission_not_requested') && (
          <div className="py-3 px-3 bg-[#0D182A] rounded-2xl border border-white/5 my-2 shrink-0">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Manual Destination Fallback:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(KNOWN_CITY_FALLBACKS).map(([city, coords]) => (
                <button
                  key={city}
                  onClick={() => handleSelectCityFallback(city)}
                  className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin size={11} className="text-[#00E599]" />
                  <span>{city}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Discovered Spots List */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1 hide-scrollbar">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-1">
            <span>Discovered Nearby Spots ({discoveries.length})</span>
            {coordinates && (
              <span className="text-[10px] text-[#00E599] font-normal">
                Centered near {coordinates.city || `${coordinates.lat}, ${coordinates.lng}`}
              </span>
            )}
          </div>

          {discoveries.length === 0 && state !== 'scanning' && (
            <div className="text-center py-8 text-xs text-slate-400">
              No spots scanned yet. Tap "ENABLE LOCATION" or "START RADAR SCAN" above to sweep your region.
            </div>
          )}

          {discoveries.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (onSelectPlace) onSelectPlace(item.id);
                if (onNavigate) onNavigate('screen_04_place_details', { discoveryId: item.id });
                onClose();
              }}
              className="p-2.5 rounded-2xl bg-[#0F1A2D]/80 hover:bg-[#15243E] border border-white/10 flex items-center gap-3 transition-all cursor-pointer group"
            >
              <BeyondImage
                src={item.imageUrl}
                alt={item.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate font-display group-hover:text-[#00E599] transition-colors">
                    {item.title}
                  </h4>
                  {item.isHiddenGem && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Hidden Gem
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                  <span className="text-[#00E599] font-bold">{item.distanceKm} km away</span>
                  <span>•</span>
                  <span>{item.categories[0]}</span>
                </div>

                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {item.location}
                </p>
              </div>

              {/* Navigation Action */}
              <a
                href={getGoogleMapsDirectionsUrl(item.coordinates.lat, item.coordinates.lng, item.title)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-xl bg-white/5 hover:bg-[#00E599]/20 text-[#00E599] border border-white/10 transition-colors shrink-0"
                title="Google Maps Navigation"
              >
                <Navigation size={14} />
              </a>

              <ChevronRight size={15} className="text-slate-500 group-hover:text-white shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Discovery, ScreenId, Comment, AchievementTier, UserProfile } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  MapPin,
  Compass,
  ArrowLeft,
  Navigation,
  Globe,
  Star,
  MessageCircle,
  Share2,
  Bookmark,
  Sparkles,
  SlidersHorizontal,
  Smartphone,
  Laptop,
  CheckCircle2,
  Award,
  Layers,
  Search,
  X,
  Play,
  Shield,
  LogIn,
  Heart,
  ChevronRight,
  ExternalLink,
  Radio,
} from 'lucide-react';
import { GOOGLE_MAP_LAYERS, GoogleMapLayerType, getGoogleMapsDirectionsUrl } from '../../services/googleMaps';
import { GoogleMapsModal } from '../GoogleMapsModal';
import { PlaceReviewsAndComments } from '../PlaceReviewsAndComments';
import { BeyondImage } from '../BeyondImage';

interface AppleExperienceLayoutProps {
  onExitToBeyond: () => void;
  onOpenAI: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onReplayIntro: () => void;
  isEditorUnlocked: boolean;
  onPromptUnlock: () => void;
  initialCity?: string;
  onOpenRadar?: () => void;
}

const CITIES = [
  { id: 'All', label: 'All Places', badge: '17 Spots' },
  { id: 'Hyderabad', label: 'Hyderabad', badge: 'Historic Gems' },
  { id: 'Bangalore', label: 'Bangalore', badge: 'Garden Sanctuaries' },
  { id: 'Mysuru', label: 'Mysuru', badge: 'Royal Estates' },
];

const CATEGORIES = ['All', 'Viewpoint', 'Heritage', 'Nature', 'Cafés', 'Food', 'Hangout', 'Photography'];

const CITY_COORDS: Record<string, [number, number]> = {
  Hyderabad: [17.385, 78.4867],
  Bangalore: [12.9716, 77.5946],
  Mysuru: [12.2958, 76.6394],
};

export const AppleExperienceLayout: React.FC<AppleExperienceLayoutProps> = ({
  onExitToBeyond,
  onOpenAI,
  onOpenAuth,
  onOpenAdmin,
  onReplayIntro,
  isEditorUnlocked,
  onPromptUnlock,
  initialCity = 'All',
  onOpenRadar,
}) => {
  const { user, profile, isAuthenticated } = useAuth();

  // State
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Discovery | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [mapLayer, setMapLayer] = useState<GoogleMapLayerType>('googleHybrid');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  // Map References
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const tileLayerRef = useRef<any>(null);

  // Load Discoveries
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.getDiscoveries()
      .then((data) => {
        if (!isMounted) return;
        setDiscoveries(data);
        if (data.length > 0 && !selectedPlace) {
          setSelectedPlace(data[0]);
        }
      })
      .catch((err) => console.error('Failed to load discoveries in Apple Mode:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Comments for Selected Place
  useEffect(() => {
    if (!selectedPlace) return;
    let isMounted = true;
    api.getComments(selectedPlace.id)
      .then((c) => {
        if (isMounted) setComments(c);
      })
      .catch(() => {
        if (isMounted) setComments([]);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedPlace?.id]);

  // Filtered discoveries
  const filteredDiscoveries = discoveries.filter((d) => {
    const matchesCity =
      selectedCity === 'All' ||
      d.location.toLowerCase().includes(selectedCity.toLowerCase()) ||
      d.title.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      d.categories.some((c) => c.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesCategory && matchesSearch;
  });

  // Initialize & Update Leaflet / Google Map
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    const centerCoords: [number, number] = selectedPlace
      ? [selectedPlace.coordinates.lat, selectedPlace.coordinates.lng]
      : selectedCity !== 'All' && CITY_COORDS[selectedCity]
      ? CITY_COORDS[selectedCity]
      : [14.5, 77.5];

    const currentZoom = selectedPlace ? 14 : selectedCity !== 'All' ? 12 : 7;
    const layerConfig = GOOGLE_MAP_LAYERS[mapLayer];

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: centerCoords,
        zoom: currentZoom,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      tileLayerRef.current = L.tileLayer(layerConfig.url, {
        maxZoom: layerConfig.maxZoom || 20,
        subdomains: layerConfig.subdomains || ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      const map = mapInstanceRef.current;
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }
      tileLayerRef.current = L.tileLayer(layerConfig.url, {
        maxZoom: layerConfig.maxZoom || 20,
        subdomains: layerConfig.subdomains || ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);
    }

    // Refresh Map Markers
    const map = mapInstanceRef.current;
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    filteredDiscoveries.forEach((disc) => {
      const isSelected = selectedPlace?.id === disc.id;
      const markerHtml = `
        <div class="relative cursor-pointer transition-transform duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          <div class="w-8 h-8 rounded-full ${
            isSelected
              ? 'bg-[#0071E3] text-white ring-4 ring-white/30 shadow-[0_0_20px_rgba(0,113,227,0.8)]'
              : 'bg-[#1C1C1E]/90 text-white border border-white/20 shadow-md'
          } flex items-center justify-center font-bold text-xs backdrop-blur-md">
            ✦
          </div>
          ${isSelected ? '<div class="absolute -inset-1 rounded-full bg-[#0071E3]/40 animate-ping pointer-events-none"></div>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'apple-custom-pin',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([disc.coordinates.lat, disc.coordinates.lng], { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          setSelectedPlace(disc);
          map.flyTo([disc.coordinates.lat, disc.coordinates.lng], 14, {
            duration: 0.8,
            easeLinearity: 0.25,
          });
        });

      markersRef.current.push(marker);
    });

    if (selectedPlace) {
      map.panTo([selectedPlace.coordinates.lat, selectedPlace.coordinates.lng], {
        animate: true,
        duration: 0.6,
      });
    }
  }, [mapLayer, selectedCity, filteredDiscoveries.length, selectedPlace?.id]);

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    if (CITY_COORDS[cityId] && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(CITY_COORDS[cityId], 12, { duration: 1.0 });
    }
  };

  const handleSavePlace = async (place: Discovery) => {
    try {
      const updated = await api.toggleSave(place.id);
      setDiscoveries((prev) => prev.map((d) => (d.id === place.id ? { ...d, isSaved: updated.isSaved } : d)));
      if (selectedPlace?.id === place.id) {
        setSelectedPlace((prev) => (prev ? { ...prev, isSaved: updated.isSaved } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="apple-mode w-full min-h-screen bg-[#000000] text-[#FFFFFF] flex flex-col font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Helvetica_Neue',sans-serif] selection:bg-[#0071E3] selection:text-white">
      {/* 1. TOP TRANSLUCENT APPLE NAVIGATION BAR */}
      <header className="sticky top-0 z-50 apple-glass-chrome px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 border-b border-white/[0.12]">
        {/* Brand & Mode Identification */}
        <div className="flex items-center gap-3">
          {/* Apple Logo Silhouette / Insignia */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-white/20 to-white/5 border border-white/20 flex items-center justify-center text-white font-bold text-sm shadow-sm backdrop-blur-md">
            
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-sm text-white">BEYOND</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#0071E3]/20 text-[#2997FF] border border-[#0071E3]/40">
                Apple Experience
              </span>
            </div>
            <p className="text-[10px] text-[#86868B] font-normal tracking-normal hidden sm:block">
              WWDC Fluid Motion & Cupertino Design Language
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* CRITICAL EXIT BUTTON: RETURN TO ORIGINAL BEYOND */}
          <button
            onClick={onExitToBeyond}
            className="apple-press px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Exit Apple Mode and return to original BEYOND"
          >
            <ArrowLeft size={13} className="text-[#2997FF]" />
            <span>Return to BEYOND</span>
          </button>

          {/* Radar Scan Trigger */}
          {onOpenRadar && (
            <button
              onClick={onOpenRadar}
              className="apple-press px-3 py-1.5 rounded-full bg-[#0071E3]/20 hover:bg-[#0071E3]/35 border border-[#0071E3]/50 text-xs font-semibold text-[#2997FF] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Radar Scan Nearby Discoveries"
            >
              <Radio size={13} className="animate-pulse" />
              <span>Radar</span>
            </button>
          )}

          {/* Replay Apple Cinematic Intro */}
          <button
            onClick={onReplayIntro}
            className="apple-press px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#86868B] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer hidden md:flex"
            title="Replay Apple Cinematic Explainer"
          >
            <Play size={11} className="text-[#2997FF]" />
            <span>Intro</span>
          </button>

          {/* Google Maps Layer Dropdown */}
          <div className="relative group hidden sm:block">
            <button className="apple-press px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white flex items-center gap-1.5 transition-all cursor-pointer">
              <Layers size={13} className="text-[#2997FF]" />
              <span className="capitalize">{mapLayer.replace('google', 'Google ')}</span>
            </button>
            <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-[#1C1C1E] border border-white/15 p-1.5 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
              {(['googleHybrid', 'googleSatellite', 'googleRoad', 'googleTerrain', 'appleDark'] as GoogleMapLayerType[]).map((layer) => (
                <button
                  key={layer}
                  onClick={() => setMapLayer(layer)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    mapLayer === layer ? 'bg-[#0071E3] text-white font-semibold' : 'text-[#86868B] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{layer.replace('google', 'Google ')}</span>
                  {mapLayer === layer && <CheckCircle2 size={12} />}
                </button>
              ))}
            </div>
          </div>

          {/* Admin Command Center */}
          <button
            onClick={onOpenAdmin}
            className="apple-press px-3 py-1.5 rounded-full bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            title="Admin Command Center"
          >
            <Shield size={12} />
            <span className="hidden md:inline">Admin</span>
          </button>

          {/* Account Button */}
          <button
            onClick={onOpenAuth}
            className="apple-press px-3 py-1.5 rounded-full bg-gradient-to-r from-[#0071E3] to-[#0A84FF] text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <LogIn size={12} />
            <span>{isAuthenticated ? 'Account' : 'Sign In'}</span>
          </button>
        </div>
      </header>

      {/* 2. CUPERTINO SEGMENTED CITY FILTER BAR */}
      <section className="px-4 md:px-8 py-3 bg-[#0A0A0C] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        {/* City Pills */}
        <div className="flex items-center gap-1.5 bg-[#1C1C1E]/80 p-1 rounded-full border border-white/10 backdrop-blur-md">
          {CITIES.map((c) => {
            const isActive = selectedCity === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleCityChange(c.id)}
                className={`apple-press px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#0071E3] text-white font-semibold shadow-[0_2px_10px_rgba(0,113,227,0.4)]'
                    : 'text-[#86868B] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{c.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-[#86868B]'}`}>
                  {c.id === 'All' ? discoveries.length : discoveries.filter((d) => d.location.includes(c.id)).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input with Apple Glass Styling */}
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
          <input
            type="text"
            placeholder="Search Apple curated places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1C1C1E]/70 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-[#86868B] focus:outline-none focus:border-[#0071E3] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </section>

      {/* 3. APPLE WORKSPACE: FLUID MAP & INSPECTOR GRID */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* LEFT COLUMN: INTERACTIVE LEAFLET / GOOGLE MAP + CARDS (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-[calc(100vh-140px)]">
          {/* Map Surface */}
          <div className="relative flex-1 rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#1C1C1E]">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Floating Quick Action Overlay on Map */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-xl border border-white/15 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg">
                <Compass size={13} className="text-[#2997FF]" />
                <span>{filteredDiscoveries.length} Verified Landmarks</span>
              </span>
              <button
                onClick={() => setIsGoogleModalOpen(true)}
                className="apple-press px-3 py-1 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition-all shadow-md flex items-center gap-1 cursor-pointer"
              >
                <Globe size={12} />
                <span>3D Satellite View</span>
              </button>
            </div>
          </div>

          {/* Horizontal Card Carousel (WWDC Fluid Motion) */}
          <div className="h-44 overflow-x-auto hide-scrollbar flex items-center gap-3 py-1">
            {filteredDiscoveries.map((disc) => {
              const isSelected = selectedPlace?.id === disc.id;
              return (
                <div
                  key={disc.id}
                  onClick={() => {
                    setSelectedPlace(disc);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([disc.coordinates.lat, disc.coordinates.lng], 14, { duration: 0.7 });
                    }
                  }}
                  className={`apple-card apple-press min-w-[260px] max-w-[280px] h-full p-3 flex flex-col justify-between cursor-pointer border ${
                    isSelected
                      ? 'border-[#0071E3] ring-2 ring-[#0071E3]/40 bg-[#1C1C1E]'
                      : 'border-white/10 hover:border-white/25 bg-[#161618]/80'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <BeyondImage
                      src={disc.imageUrl}
                      alt={disc.title}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-white/10"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate tracking-tight">{disc.title}</h4>
                      <p className="text-[10px] text-[#86868B] flex items-center gap-1 mt-0.5 truncate">
                        <MapPin size={10} className="text-[#2997FF] shrink-0" />
                        <span>{disc.location}</span>
                      </p>
                      <span className="inline-block mt-1 text-[9px] font-semibold text-[#2997FF] px-2 py-0.2 rounded-full bg-[#0071E3]/15">
                        {disc.categories[0] || 'Discovery'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-[10px] text-[#86868B]">
                    <span className="flex items-center gap-1 text-white font-medium">
                      <Heart size={11} className="text-red-400 fill-red-400" />
                      <span>{disc.likesCount}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[#2997FF] font-semibold">
                      <span>Explore</span>
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: APPLE INSPECTOR SHEET & REVIEWS (5 Cols) */}
        <aside className="lg:col-span-5 h-[calc(100vh-140px)] overflow-y-auto hide-scrollbar rounded-3xl bg-[#141416]/90 border border-white/15 p-5 md:p-6 backdrop-blur-2xl shadow-2xl flex flex-col gap-6">
          {selectedPlace ? (
            <>
              {/* Place Hero Image & Header */}
              <div className="space-y-3">
                <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-white/15 group">
                  <BeyondImage
                    src={selectedPlace.imageUrl}
                    alt={selectedPlace.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-[#2997FF]">
                      {selectedPlace.categories.join(' • ')}
                    </span>
                    {selectedPlace.isHiddenGem && (
                      <span className="px-2.5 py-1 rounded-full bg-[#FF9F0A]/20 backdrop-blur-md border border-[#FF9F0A]/40 text-[10px] font-semibold text-[#FF9F0A]">
                        Hidden Gem
                      </span>
                    )}
                  </div>

                  {/* Bottom Title on Image */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h2 className="text-xl font-bold text-white tracking-tight leading-snug drop-shadow-md">
                      {selectedPlace.title}
                    </h2>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} className="text-[#2997FF]" />
                      <span>{selectedPlace.location}</span>
                    </p>
                  </div>
                </div>

                {/* Useful Info Cards */}
                {selectedPlace.usefulInfo && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center">
                      <span className="text-[9px] uppercase tracking-wider text-[#86868B] block font-semibold">Best Time</span>
                      <span className="text-[11px] font-bold text-white truncate block mt-0.5">{selectedPlace.usefulInfo.bestTime}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center">
                      <span className="text-[9px] uppercase tracking-wider text-[#86868B] block font-semibold">Entry Fee</span>
                      <span className="text-[11px] font-bold text-[#30D158] truncate block mt-0.5">{selectedPlace.usefulInfo.entryFee}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center">
                      <span className="text-[9px] uppercase tracking-wider text-[#86868B] block font-semibold">Crowd</span>
                      <span className="text-[11px] font-bold text-white truncate block mt-0.5">{selectedPlace.usefulInfo.crowdLevel}</span>
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-[#86868B] leading-relaxed font-normal">
                  {selectedPlace.description}
                </p>

                {/* Quick Action Navigation Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <a
                    href={getGoogleMapsDirectionsUrl(selectedPlace.coordinates.lat, selectedPlace.coordinates.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="apple-press flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Navigation size={13} />
                    <span>Navigate</span>
                  </a>

                  <button
                    onClick={() => setIsGoogleModalOpen(true)}
                    className="apple-press flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-white/15 cursor-pointer"
                  >
                    <Globe size={13} className="text-[#2997FF]" />
                    <span>3D Satellite</span>
                  </button>

                  <button
                    onClick={() => handleSavePlace(selectedPlace)}
                    className={`apple-press px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                      selectedPlace.isSaved
                        ? 'bg-[#30D158]/20 border-[#30D158]/40 text-[#30D158]'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <Bookmark size={13} className={selectedPlace.isSaved ? 'fill-[#30D158]' : ''} />
                    <span>{selectedPlace.isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>

              {/* 3 CURATED SPOTLIGHT REVIEWS + LIVE REAL COMMUNITY COMMENTS */}
              <div className="pt-4 border-t border-white/[0.08]">
                <PlaceReviewsAndComments
                  placeId={selectedPlace.id}
                  placeTitle={selectedPlace.title}
                  placeLocation={selectedPlace.location}
                  comments={comments}
                  onAddComment={async (text) => {
                    const added = await api.addComment(selectedPlace.id, text);
                    setComments([added, ...comments]);
                    setSelectedPlace({ ...selectedPlace, commentsCount: selectedPlace.commentsCount + 1 });
                  }}
                  isEditorUnlocked={isEditorUnlocked || isAuthenticated}
                  onPromptUnlock={onPromptUnlock}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Compass size={40} className="text-[#86868B] mb-3 animate-pulse" />
              <h3 className="text-sm font-semibold text-white">Select a Landmark</h3>
              <p className="text-xs text-[#86868B] mt-1 max-w-xs">
                Tap on any pin or card to inspect Apple curated reviews and live community notes.
              </p>
            </div>
          )}
        </aside>
      </main>

      {/* Embedded 3D Google Satellite Modal */}
      {selectedPlace && (
        <GoogleMapsModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          lat={selectedPlace.coordinates.lat}
          lng={selectedPlace.coordinates.lng}
          placeTitle={selectedPlace.title}
          placeLocation={selectedPlace.location}
        />
      )}
    </div>
  );
};

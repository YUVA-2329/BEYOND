import React, { useState, useEffect, useRef } from 'react';
import { Search, Crosshair, MapPin, ChevronRight, X, Layers, Navigation, Globe, Radio } from 'lucide-react';
import { BottomNav } from '../BottomNav';
import { BeyondImage } from '../BeyondImage';
import { Discovery, ScreenId } from '../../types';
import { api } from '../../services/api';
import {
  GOOGLE_MAP_LAYERS,
  GoogleMapLayerType,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsSearchUrl,
} from '../../services/googleMaps';
import { GoogleMapsModal } from '../GoogleMapsModal';

declare global {
  interface Window {
    L: any;
    google?: any;
  }
}

interface Screen03Props {
  onNavigate: (screen: ScreenId, params?: any) => void;
  selectedDiscoveryId?: string;
  initialCity?: string;
  isEditorUnlocked?: boolean;
  onPromptUnlock?: () => void;
  onOpenRadar?: () => void;
}

const CITY_COORDS: Record<string, [number, number]> = {
  Hyderabad: [17.3850, 78.4867],
  Bangalore: [12.9716, 77.5946],
  Mysuru: [12.2958, 76.6394],
};

const MAP_CATEGORIES = ['All', 'Food', 'Viewpoint', 'Hangout', 'Nature'];

export const Screen03MapView: React.FC<Screen03Props> = ({
  onNavigate,
  selectedDiscoveryId = 'chamundi-hills-viewpoint',
  initialCity = 'All',
  isEditorUnlocked = false,
  onPromptUnlock,
  onOpenRadar,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPlace, setSelectedPlace] = useState<Discovery | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState<GoogleMapLayerType>('googleHybrid');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Center coordinate: Mysuru
  const MYSURU_COORDS = [12.2958, 76.6394];

  useEffect(() => {
    api.getDiscoveries().then((data) => {
      setDiscoveries(data);
      const initial = data.find((d) => d.id === selectedDiscoveryId) || data[0];
      setSelectedPlace(initial || null);
    });
  }, [selectedDiscoveryId]);

  // Initialize Map with chosen Google Layer
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const L = window.L;

    if (!L) {
      console.warn('Map engine not ready on window');
      return;
    }

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: MYSURU_COORDS,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      const layerConfig = GOOGLE_MAP_LAYERS[selectedLayer];
      const tileLayer = L.tileLayer(layerConfig.url, {
        maxZoom: layerConfig.maxZoom,
        subdomains: layerConfig.subdomains || 'abcd',
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Dynamically swap real Google Maps layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const layerConfig = GOOGLE_MAP_LAYERS[selectedLayer];
    const newLayer = L.tileLayer(layerConfig.url, {
      maxZoom: layerConfig.maxZoom,
      subdomains: layerConfig.subdomains || 'abcd',
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [selectedLayer]);

  // Center on selected city if specified
  useEffect(() => {
    if (initialCity && CITY_COORDS[initialCity] && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(CITY_COORDS[initialCity], 12, { duration: 1.2 });
    }
  }, [initialCity]);

  // Update map markers when discoveries or category changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Filter by category and search
    const filtered = discoveries.filter((d) => {
      const matchesCat = activeCategory === 'All' || d.categories.includes(activeCategory);
      const matchesQ = !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQ;
    });

    // 1. Center pulsing radar beacon
    const radarIcon = L.divIcon({
      className: 'beyond-radar-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 rounded-full border border-[#00E599]/40 animate-ping opacity-75"></div>
          <div class="absolute w-24 h-24 rounded-full border border-[#00E599]/20 animate-pulse"></div>
          <div class="w-4 h-4 rounded-full bg-[#00E599] border-2 border-white shadow-lg shadow-[#00E599]"></div>
          <div class="absolute -bottom-5 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-[#00E599] font-bold border border-[#00E599]/30">Mysuru</div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    const centerMarker = L.marker(MYSURU_COORDS, { icon: radarIcon }).addTo(map);
    markersRef.current.push(centerMarker);

    // 2. Discoveries Markers with Circular Photo Previews
    filtered.forEach((item) => {
      const isSelected = selectedPlace?.id === item.id;
      const markerHtml = `
        <div class="group relative cursor-pointer transform transition-transform hover:scale-110 ${
          isSelected ? 'scale-115' : ''
        }">
          <div class="w-8 h-8 rounded-full border-2 ${
            isSelected ? 'border-[#00E599] shadow-[0_0_15px_#00E599]' : 'border-white/80'
          } overflow-hidden bg-slate-900 shadow-md">
            <img src="${item.imageUrl}" onerror="this.onerror=null;this.src='/intro/assets/chamundi_hills_sunset.png';" class="w-full h-full object-cover" />
          </div>
          <div class="w-2.5 h-2.5 mx-auto -mt-1 rotate-45 ${
            isSelected ? 'bg-[#00E599]' : 'bg-white'
          }"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'beyond-photo-marker',
        html: markerHtml,
        iconSize: [32, 36],
        iconAnchor: [16, 36],
      });

      const marker = L.marker([item.coordinates.lat, item.coordinates.lng], { icon: customIcon })
        .addTo(map)
        .on('click', () => {
          setSelectedPlace(item);
          map.panTo([item.coordinates.lat, item.coordinates.lng], { animate: true });
        });

      markersRef.current.push(marker);
    });
  }, [discoveries, activeCategory, searchQuery, selectedPlace]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(MYSURU_COORDS, 13, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#080E18] text-white overflow-hidden">
      {/* Top Floating Search & Category Controls */}
      <div className="absolute top-2 inset-x-3 z-30 flex flex-col gap-2 pointer-events-none">
        {/* Search Bar */}
        <div className="pointer-events-auto bg-[#0B1525]/90 backdrop-blur-md border border-[#182942] rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search nearby places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto hide-scrollbar select-none">
          {MAP_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all shadow-md cursor-pointer ${
                  isActive
                    ? 'bg-[#00E599] text-[#080E18] font-bold shadow-[#00E599]/30'
                    : 'bg-[#0B1525]/90 text-slate-200 border border-[#182942] hover:bg-[#12223B]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Real Google Maps Layer Switcher */}
        <div className="pointer-events-auto flex items-center gap-1 overflow-x-auto hide-scrollbar select-none pt-0.5">
          <span className="text-[10px] text-slate-400 font-bold px-1 flex items-center gap-1">
            <Globe size={11} className="text-[#00E599]" />
            <span>Google:</span>
          </span>
          {([
            { id: 'googleHybrid', label: '🌐 Hybrid' },
            { id: 'googleSatellite', label: '🛰️ Satellite' },
            { id: 'googleRoadmap', label: '🗺️ Road' },
            { id: 'googleTerrain', label: '🏔️ Terrain' },
            { id: 'appleDark', label: '🌑 Dark' },
          ] as const).map((layer) => (
            <button
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap shadow-md ${
                selectedLayer === layer.id
                  ? 'bg-[#00E599] text-[#080E18] shadow-[#00E599]/30'
                  : 'bg-black/60 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>

        {/* Quick City Jumps */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto hide-scrollbar select-none pt-0.5">
          {Object.entries(CITY_COORDS).map(([city, coords]) => (
            <button
              key={city}
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo(coords, 12, { duration: 1.2 });
                }
              }}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 hover:bg-black/90 text-emerald-400 border border-[#00E599]/30 backdrop-blur-md transition-all flex items-center gap-1 shadow"
            >
              <MapPin size={9} />
              <span>{city}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Real Interactive Map Canvas */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full beyond-dark-map z-10" />

      {/* Floating Radar Scan Action */}
      {onOpenRadar && (
        <button
          onClick={onOpenRadar}
          className="absolute bottom-44 right-4 z-30 px-3.5 py-2 rounded-full bg-[#00E599] hover:bg-[#00C883] text-[#07130F] font-bold text-xs flex items-center gap-1.5 shadow-xl shadow-[#00E599]/30 active:scale-95 transition-all cursor-pointer border border-[#00E599]"
          aria-label="Radar Scan"
          title="RADAR SCAN — Discover nearby places"
        >
          <Radio size={14} className="animate-pulse" />
          <span>RADAR SCAN</span>
        </button>
      )}

      {/* Floating Re-center Action */}
      <button
        onClick={handleRecenter}
        className="absolute bottom-32 right-4 z-30 w-10 h-10 rounded-full bg-[#0B1525]/90 backdrop-blur-md border border-[#182942] text-white flex items-center justify-center shadow-lg hover:border-[#00E599] active:scale-95 transition-all cursor-pointer"
        aria-label="Re-center map"
      >
        <Crosshair size={18} className="text-[#00E599]" />
      </button>

      {/* Bottom Selected Place Preview Card with Google Maps actions */}
      {selectedPlace && (
        <div className="absolute bottom-16 inset-x-3 z-30 space-y-1.5">
          <div
            onClick={() => onNavigate('screen_04_place_details', { discoveryId: selectedPlace.id })}
            className="bg-[#0B1525]/95 backdrop-blur-md border border-[#182942] rounded-2xl p-2.5 flex items-center gap-3 shadow-2xl hover:border-[#00E599]/60 transition-all cursor-pointer group"
          >
            <BeyondImage
              src={selectedPlace.imageUrl}
              alt={selectedPlace.title}
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-white truncate font-display group-hover:text-[#00E599] transition-colors">
                {selectedPlace.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {selectedPlace.distanceKm} km • {selectedPlace.categories[0]}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-[#00E599] font-medium">
                <MapPin size={10} />
                <span>{selectedPlace.location}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsGoogleModalOpen(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-[#00E599]/20 text-[#00E599] border border-white/10 transition-colors cursor-pointer"
                title="Google 3D Satellite View"
              >
                <Globe size={15} />
              </button>

              <a
                href={getGoogleMapsDirectionsUrl(selectedPlace.coordinates.lat, selectedPlace.coordinates.lng, selectedPlace.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-[#00E599]/15 hover:bg-[#00E599]/25 text-[#00E599] border border-[#00E599]/30 transition-colors cursor-pointer"
                title="Google Maps Navigation"
              >
                <Navigation size={15} />
              </a>

              <div className="p-1 rounded-full bg-white/5 text-slate-400 group-hover:text-white transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Maps Interactive Modal */}
      {selectedPlace && (
        <GoogleMapsModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          lat={selectedPlace.coordinates.lat}
          lng={selectedPlace.coordinates.lng}
          title={selectedPlace.title}
          location={selectedPlace.location}
        />
      )}

      {/* Persistent Bottom Navigation */}
      <BottomNav
        currentScreen="screen_03_map_view"
        onNavigate={onNavigate}
        isEditorUnlocked={isEditorUnlocked}
        onPromptUnlock={onPromptUnlock}
      />
    </div>
  );
};

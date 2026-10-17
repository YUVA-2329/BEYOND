import React, { useState, useEffect, useRef } from 'react';
import { MountainLogo } from './MountainLogo';
import { Discovery, ScreenId, UserProfile, Collection, AchievementTier } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Search,
  MapPin,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Compass,
  Map,
  Award,
  User,
  Plus,
  Lock,
  Unlock,
  Sparkles,
  LogOut,
  LogIn,
  SlidersHorizontal,
  Smartphone,
  ChevronRight,
  Clock,
  Ticket,
  Users,
  Send,
  Navigation,
  X,
  CheckCircle2,
  FolderPlus,
  QrCode,
  Star,
  Shield,
  Gem,
  ArrowRight,
  ExternalLink,
  Globe,
  Radio,
} from 'lucide-react';
import {
  GOOGLE_MAP_LAYERS,
  GoogleMapLayerType,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsSearchUrl,
} from '../services/googleMaps';
import { GoogleMapsModal } from './GoogleMapsModal';
import { PlaceReviewsAndComments } from './PlaceReviewsAndComments';
import { BeyondImage } from './BeyondImage';

interface DesktopLayoutProps {
  onNavigate: (screen: ScreenId, params?: any) => void;
  onOpenAI: () => void;
  onOpenAuth: () => void;
  onSwitchToMobile: () => void;
  isEditorUnlocked: boolean;
  onPromptUnlock: () => void;
  initialCity?: string;
  onOpenAdmin?: () => void;
  onActivateAppleMode?: () => void;
  onOpenRadar?: () => void;
}

const CITIES = [
  { id: 'All', name: '🌍 All Locations', subtitle: 'Hyderabad, Bangalore & Mysuru' },
  { id: 'Hyderabad', name: '📍 Hyderabad', subtitle: 'Charminar, Golconda, Durgam Cheruvu' },
  { id: 'Bangalore', name: '📍 Bangalore', subtitle: 'Cubbon Park, Palace, Lalbagh, Nandi Hills' },
  { id: 'Mysuru', name: '📍 Mysuru', subtitle: 'Mysore Palace, Chamundi Hills, Gardens' },
];

const CATEGORIES = ['All', 'Viewpoint', 'Heritage', 'Nature', 'Cafés', 'Food', 'Hangout', 'Photography'];

const CITY_COORDS: Record<string, [number, number]> = {
  Hyderabad: [17.3850, 78.4867],
  Bangalore: [12.9716, 77.5946],
  Mysuru: [12.2958, 76.6394],
};

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  onNavigate,
  onOpenAI,
  onOpenAuth,
  onSwitchToMobile,
  isEditorUnlocked,
  onPromptUnlock,
  initialCity = 'All',
  onOpenAdmin,
  onActivateAppleMode,
  onOpenRadar,
}) => {
  const { user, profile, isAuthenticated, logout } = useAuth();

  // Navigation & Platform States
  const [activeNav, setActiveNav] = useState<'feed' | 'map' | 'saved' | 'levels' | 'profile'>('feed');
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlace, setSelectedPlace] = useState<Discovery | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Inspector & Comments State
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  // Mini Map Ref for Right Inspector
  const inspectorMapRef = useRef<HTMLDivElement>(null);
  const inspectorMapInstance = useRef<any>(null);
  const inspectorMarker = useRef<any>(null);
  const inspectorTileLayer = useRef<any>(null);

  // Full Map Ref for 'map' view
  const fullMapRef = useRef<HTMLDivElement>(null);
  const fullMapInstance = useRef<any>(null);
  const fullMapMarkers = useRef<any[]>([]);
  const fullMapTileLayer = useRef<any>(null);

  // Google Maps Layer & Modal State
  const [desktopMapLayer, setDesktopMapLayer] = useState<GoogleMapLayerType>('googleHybrid');
  const [isDesktopGoogleModalOpen, setIsDesktopGoogleModalOpen] = useState(false);

  // Modals inside Desktop
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [shareModalPlace, setShareModalPlace] = useState<Discovery | null>(null);
  const [copyToast, setCopyToast] = useState(false);

  // Saved & Collections State
  const [savedTab, setSavedTab] = useState<'places' | 'collections'>('places');
  const [savedPlaces, setSavedPlaces] = useState<Discovery[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Levels & Badges State
  const [achievements, setAchievements] = useState<AchievementTier[]>([]);
  const [userStanding, setUserStanding] = useState<UserProfile | null>(null);

  // Profile Bio Editing State
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');

  // Create Discovery Form State
  const [createPhoto, setCreatePhoto] = useState('/intro/assets/charminar_hyderabad.jpg');
  const [createTitle, setCreateTitle] = useState('');
  const [createLocation, setCreateLocation] = useState('Hyderabad, Telangana');
  const [createCategory, setCreateCategory] = useState('Viewpoint');
  const [createDescription, setCreateDescription] = useState('');
  const [isAiPolishing, setIsAiPolishing] = useState(false);
  const [isSubmittingPlace, setIsSubmittingPlace] = useState(false);

  // Load Feed Data
  const loadDiscoveries = async () => {
    try {
      setLoading(true);
      const data = await api.getDiscoveries();
      setDiscoveries(data);
      if (data.length > 0 && !selectedPlace) {
        setSelectedPlace(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscoveries();
  }, []);

  // Sync Saved Places and Collections
  useEffect(() => {
    if (activeNav === 'saved') {
      api.getSavedPlaces().then(setSavedPlaces).catch(() => {});
      api.getCollections().then(setCollections).catch(() => {});
    } else if (activeNav === 'levels') {
      api.getAchievements().then((res) => {
        setAchievements(res.achievements || []);
        setUserStanding(res.currentUser || null);
      }).catch(() => {});
    }
  }, [activeNav]);

  // Load comments when selected place changes
  useEffect(() => {
    if (selectedPlace) {
      api.getComments(selectedPlace.id).then((c) => setComments(c)).catch(() => setComments([]));
    }
  }, [selectedPlace?.id]);

  // Update Inspector Mini Map
  useEffect(() => {
    if (activeNav !== 'feed' || !inspectorMapRef.current || !selectedPlace) return;
    const L = (window as any).L;
    if (!L) return;

    const coords: [number, number] = [selectedPlace.coordinates.lat, selectedPlace.coordinates.lng];
    const layerConfig = GOOGLE_MAP_LAYERS[desktopMapLayer];

    if (!inspectorMapInstance.current) {
      const map = L.map(inspectorMapRef.current, {
        center: coords,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(layerConfig.url, {
        maxZoom: layerConfig.maxZoom,
        subdomains: layerConfig.subdomains || 'abcd',
      }).addTo(map);

      inspectorTileLayer.current = tileLayer;
      inspectorMapInstance.current = map;
    } else {
      inspectorMapInstance.current.flyTo(coords, 14, { duration: 0.8 });
    }

    if (inspectorMarker.current) inspectorMarker.current.remove();

    const customIcon = L.divIcon({
      className: 'beyond-desktop-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-7 h-7 rounded-full border border-[#00E599]/60 animate-ping opacity-75"></div>
          <div class="w-4 h-4 rounded-full bg-[#00E599] border-2 border-white shadow-xl shadow-[#00E599]"></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    inspectorMarker.current = L.marker(coords, { icon: customIcon }).addTo(inspectorMapInstance.current);
  }, [selectedPlace, activeNav]);

  // Update Full Map View when activeNav === 'map'
  useEffect(() => {
    if (activeNav !== 'map' || !fullMapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const centerCoords = selectedCity !== 'All' && CITY_COORDS[selectedCity]
      ? CITY_COORDS[selectedCity]
      : [17.3850, 78.4867];
    const layerConfig = GOOGLE_MAP_LAYERS[desktopMapLayer];

    if (!fullMapInstance.current) {
      const map = L.map(fullMapRef.current, {
        center: centerCoords,
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(layerConfig.url, {
        maxZoom: layerConfig.maxZoom,
        subdomains: layerConfig.subdomains || 'abcd',
      }).addTo(map);

      fullMapTileLayer.current = tileLayer;
      fullMapInstance.current = map;
    } else {
      fullMapInstance.current.flyTo(centerCoords, selectedCity === 'All' ? 8 : 12, { duration: 1.0 });
    }

    // Clear old markers
    fullMapMarkers.current.forEach((m) => m.remove());
    fullMapMarkers.current = [];

    // Add markers for discoveries
    discoveries.forEach((d) => {
      const isSel = selectedPlace?.id === d.id;
      const markerIcon = L.divIcon({
        className: 'beyond-full-marker',
        html: `
          <div class="group relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125">
            <div class="w-8 h-8 rounded-full ${isSel ? 'bg-[#00E599] text-black shadow-lg shadow-[#00E599]/50' : 'bg-black/80 text-[#00E599] border border-white/20'} flex items-center justify-center text-xs font-bold backdrop-blur-md">
              📍
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              ${d.title}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([d.coordinates.lat, d.coordinates.lng], { icon: markerIcon })
        .addTo(fullMapInstance.current)
        .on('click', () => {
          setSelectedPlace(d);
        });

      fullMapMarkers.current.push(marker);
    });
  }, [activeNav, selectedCity, discoveries, selectedPlace]);

  // Dynamically swap real Google Maps tile layers when user switches layer
  useEffect(() => {
    const L = (window as any).L;
    if (!L) return;
    const cfg = GOOGLE_MAP_LAYERS[desktopMapLayer];

    // Swap Full Map Layer
    if (fullMapInstance.current && fullMapTileLayer.current) {
      fullMapInstance.current.removeLayer(fullMapTileLayer.current);
      const newLayer = L.tileLayer(cfg.url, {
        maxZoom: cfg.maxZoom,
        subdomains: cfg.subdomains || 'abcd',
      }).addTo(fullMapInstance.current);
      fullMapTileLayer.current = newLayer;
    }

    // Swap Inspector Mini Map Layer
    if (inspectorMapInstance.current && inspectorTileLayer.current) {
      inspectorMapInstance.current.removeLayer(inspectorTileLayer.current);
      const newInspectorLayer = L.tileLayer(cfg.url, {
        maxZoom: cfg.maxZoom,
        subdomains: cfg.subdomains || 'abcd',
      }).addTo(inspectorMapInstance.current);
      inspectorTileLayer.current = newInspectorLayer;
    }
  }, [desktopMapLayer]);

  // Filtered discoveries
  const displayedDiscoveries = discoveries.filter((d) => {
    const matchesCity =
      selectedCity === 'All' || d.location.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesCat =
      selectedCategory === 'All' || d.categories.includes(selectedCategory);
    const matchesSearch =
      !searchQuery.trim() ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesCat && matchesSearch;
  });

  const handleLike = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await api.toggleLike(id);
      setDiscoveries((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isLiked: res.isLiked, likesCount: res.likesCount } : d))
      );
      if (selectedPlace?.id === id) {
        setSelectedPlace((prev) => prev ? { ...prev, isLiked: res.isLiked, likesCount: res.likesCount } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await api.toggleSave(id);
      setDiscoveries((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isSaved: res.isSaved } : d))
      );
      if (selectedPlace?.id === id) {
        setSelectedPlace((prev) => prev ? { ...prev, isSaved: res.isSaved } : null);
      }
      if (activeNav === 'saved') {
        setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPlace) return;
    if (!isEditorUnlocked && !isAuthenticated) {
      onPromptUnlock();
      return;
    }
    try {
      const added = await api.addComment(selectedPlace.id, newComment);
      setComments([added, ...comments]);
      setSelectedPlace({ ...selectedPlace, commentsCount: selectedPlace.commentsCount + 1 });
      setDiscoveries((prev) =>
        prev.map((d) =>
          d.id === selectedPlace.id ? { ...d, commentsCount: d.commentsCount + 1 } : d
        )
      );
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim() || !createDescription.trim()) return;
    try {
      setIsSubmittingPlace(true);
      const newPlace = await api.createDiscovery({
        title: createTitle.trim(),
        location: createLocation.trim(),
        description: createDescription.trim(),
        categories: [createCategory, 'Photography'],
        imageUrl: createPhoto,
        distanceKm: 1.8,
        coordinates: { lat: 17.3850, lng: 78.4867 },
        isHiddenGem: true,
      });
      setDiscoveries([newPlace, ...discoveries]);
      setSelectedPlace(newPlace);
      setIsCreateModalOpen(false);
      setCreateTitle('');
      setCreateDescription('');
      setActiveNav('feed');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPlace(false);
    }
  };

  const handleAiPolish = async () => {
    if (!createTitle.trim()) return;
    try {
      setIsAiPolishing(true);
      const res = await api.describeWithAI(createTitle, createCategory, createDescription || 'A breathtaking must-visit spot.');
      setCreateDescription(res.polishedDescription);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiPolishing(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#05070A] text-slate-100 font-sans overflow-hidden select-none">
      {/* 1. LEFT APPLE NAVIGATION SIDEBAR */}
      <aside className="w-72 bg-[#080D15]/95 backdrop-blur-3xl border-r border-white/[0.08] flex flex-col justify-between p-5 shrink-0 z-30">
        <div>
          {/* Brand Header */}
          <div
            onClick={() => setActiveNav('feed')}
            className="flex items-center gap-2.5 mb-7 cursor-pointer group"
          >
            <MountainLogo size={30} />
            <div>
              <h1 className="font-extrabold tracking-widest text-base font-display text-white group-hover:text-[#00E599] transition-colors">
                BEYOND
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                Discover Places • Explore India
              </p>
            </div>
          </div>

          {/* User Status / Account Capsule */}
          <div className="mb-6 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BeyondImage
                src={profile?.avatarUrl || '/intro/assets/rohit_avatar.png'}
                fallbackSrc="/intro/assets/rohit_avatar.png"
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-[#00E599]/60"
              />
              <div className="overflow-hidden">
                <span className="block text-xs font-bold text-white truncate max-w-[110px]">
                  {profile?.name || (isAuthenticated ? 'Explorer' : 'Guest Explorer')}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {isAuthenticated ? '🛡️ Explorer I' : 'View-Only'}
                </span>
              </div>
            </div>

            <div>
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="p-1.5 rounded-xl hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-2.5 py-1 rounded-xl bg-[#00E599]/15 hover:bg-[#00E599]/25 text-[#00E599] text-[11px] font-bold border border-[#00E599]/30 transition-colors cursor-pointer"
                >
                  Log In
                </button>
              )}
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="space-y-1 mb-6">
            <button
              onClick={() => setActiveNav('feed')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'feed'
                  ? 'bg-[#00E599] text-[#050911] shadow-lg shadow-[#00E599]/20 font-bold'
                  : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <Compass size={17} />
              <span>Discover Feed</span>
            </button>

            <button
              onClick={() => setActiveNav('map')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'map'
                  ? 'bg-[#00E599] text-[#050911] shadow-lg shadow-[#00E599]/20 font-bold'
                  : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <Map size={17} />
              <span>Full Interactive Map</span>
            </button>

            <button
              onClick={() => setActiveNav('saved')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'saved'
                  ? 'bg-[#00E599] text-[#050911] shadow-lg shadow-[#00E599]/20 font-bold'
                  : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <Bookmark size={17} />
              <span>Saved Places</span>
            </button>

            <button
              onClick={() => setActiveNav('levels')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'levels'
                  ? 'bg-[#00E599] text-[#050911] shadow-lg shadow-[#00E599]/20 font-bold'
                  : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <Award size={17} />
              <span>Explorer Levels</span>
            </button>

            <button
              onClick={() => setActiveNav('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeNav === 'profile'
                  ? 'bg-[#00E599] text-[#050911] shadow-lg shadow-[#00E599]/20 font-bold'
                  : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <User size={17} />
              <span>Profile & Badges</span>
            </button>
          </nav>

          {/* City Quick Filter */}
          <div className="mb-6">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Destinations
            </span>
            <div className="space-y-1">
              {CITIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCity(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                    selectedCity === c.id
                      ? 'bg-white/10 text-[#00E599] font-bold border border-[#00E599]/30'
                      : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {selectedCity === c.id && <span className="text-[11px] font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="space-y-2.5 pt-4 border-t border-white/[0.08]">
          {onActivateAppleMode && (
            <button
              onClick={onActivateAppleMode}
              className="w-full py-2.5 px-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-between group active:scale-98"
              title="Activate Apple Design experience"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm"></span>
                <span>APPLE</span>
              </div>
              <span className="text-[10px] text-sky-400 font-semibold px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 group-hover:bg-sky-500/25">
                Explore ➔
              </span>
            </button>
          )}

          <button
            onClick={() => {
              if (!isEditorUnlocked && !isAuthenticated) {
                onPromptUnlock();
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            className="w-full py-2.5 rounded-2xl bg-[#00E599] hover:bg-[#00C883] text-[#07130F] font-bold text-xs shadow-lg shadow-[#00E599]/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Plus size={16} />
            <span>Post a Discovery</span>
          </button>

          <button
            onClick={onSwitchToMobile}
            className="w-full py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Smartphone size={14} className="text-[#00E599]" />
            <span>Switch to Mobile View</span>
          </button>
        </div>
      </aside>

      {/* 2. CENTER CONTENT CANVAS (Switches dynamically based on activeNav) */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#05070A] relative">
        {/* Top Floating App Bar */}
        <header className="h-16 border-b border-white/[0.08] px-6 flex items-center justify-between gap-4 bg-[#080D15]/80 backdrop-blur-xl shrink-0 z-20">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search Charminar, Nandi Hills, cafes... (type 'apple' or 'radar')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0F1724] border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E599] transition-all"
              />
            </div>
            {searchQuery.toLowerCase().includes('apple') && onActivateAppleMode && (
              <button
                onClick={onActivateAppleMode}
                className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 text-white text-xs font-bold flex items-center gap-1.5 animate-pulse cursor-pointer shrink-0"
              >
                <span></span>
                <span>Launch Apple</span>
              </button>
            )}
            {searchQuery.toLowerCase().includes('radar') && onOpenRadar && (
              <button
                onClick={onOpenRadar}
                className="px-3 py-1.5 rounded-full bg-cyan-500/25 hover:bg-cyan-500/35 border border-cyan-400 text-cyan-300 text-xs font-bold flex items-center gap-1.5 animate-pulse cursor-pointer shrink-0"
              >
                <Radio size={12} className="animate-spin" />
                <span>Open Radar</span>
              </button>
            )}
          </div>

          {/* Action Pills */}
          <div className="flex items-center gap-3">
            {onOpenRadar && (
              <button
                onClick={onOpenRadar}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                title="Scan nearby discoveries with Radar"
              >
                <Radio size={13} className="animate-pulse" />
                <span>Radar</span>
              </button>
            )}

            <button
              onClick={onPromptUnlock}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                isEditorUnlocked || isAuthenticated
                  ? 'bg-[#00E599]/15 border-[#00E599]/40 text-[#00E599] shadow-sm shadow-[#00E599]/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              {isEditorUnlocked || isAuthenticated ? <Unlock size={13} /> : <Lock size={13} />}
              <span>{isEditorUnlocked || isAuthenticated ? 'Editor Active' : 'View-Only (Type login)'}</span>
            </button>

            <button
              onClick={onOpenAI}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00E599]/15 hover:bg-[#00E599]/25 text-[#00E599] border border-[#00E599]/30 text-xs font-bold transition-all cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Local AI</span>
            </button>

            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
                title="Admin Command Center"
              >
                <Shield size={13} />
                <span>Admin</span>
              </button>
            )}
          </div>
        </header>

        {/* VIEW 1: FEED VIEW */}
        {activeNav === 'feed' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Category Filter Bar */}
            <div className="px-6 py-3 border-b border-white/[0.05] bg-[#070B12] flex items-center gap-2 overflow-x-auto hide-scrollbar shrink-0">
              <SlidersHorizontal size={14} className="text-slate-400 shrink-0 mr-1" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#00E599] text-[#050911] shadow-md shadow-[#00E599]/20 font-bold'
                      : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Discoveries Responsive Grid */}
            <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white font-display uppercase tracking-wider flex items-center gap-2">
                  <span>
                    {selectedCity === 'All'
                      ? 'Famous Landmarks in Hyderabad, Bangalore & Mysuru'
                      : `Landmarks in ${selectedCity}`}
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">
                    ({displayedDiscoveries.length} spots)
                  </span>
                </h3>
              </div>

              {loading ? (
                <div className="py-32 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <div className="w-8 h-8 border-2 border-[#00E599] border-t-transparent rounded-full animate-spin mb-3" />
                  Loading real destinations...
                </div>
              ) : displayedDiscoveries.length === 0 ? (
                <div className="py-32 text-center text-slate-400 text-xs">
                  No places found matching your filter in {selectedCity}.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {displayedDiscoveries.map((item) => {
                    const isSelected = selectedPlace?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedPlace(item)}
                        className={`group bg-[#0B121E] border rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-2xl hover:scale-[1.01] ${
                          isSelected
                            ? 'border-[#00E599] shadow-[0_0_25px_rgba(0,229,153,0.2)]'
                            : 'border-white/[0.08] hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                            <BeyondImage
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B121E] via-transparent to-black/30" />
                            <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                              {item.isHiddenGem ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md border border-white/10 text-[#00E599] flex items-center gap-1">
                                  <MapPin size={10} /> Hidden Gem
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md border border-white/10 text-sky-400">
                                  Famous Landmark
                                </span>
                              )}
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md border border-white/10 text-slate-200">
                                {item.distanceKm} km
                              </span>
                            </div>
                          </div>

                          <div className="p-4">
                            <h4 className="text-sm font-bold text-white font-display group-hover:text-[#00E599] transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <MapPin size={11} className="text-[#00E599]" />
                              <span>{item.location}</span>
                            </p>
                            <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                              {item.categories.map((c) => (
                                <span
                                  key={c}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-slate-300 border border-white/[0.06]"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => handleLike(e, item.id)}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Heart
                                size={14}
                                className={item.isLiked ? 'text-rose-500 fill-rose-500' : ''}
                              />
                              <span className="text-[11px] font-semibold">{item.likesCount}</span>
                            </button>

                            <button
                              onClick={() => setSelectedPlace(item)}
                              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
                            >
                              <MessageCircle size={14} />
                              <span className="text-[11px] font-semibold">{item.commentsCount}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShareModalPlace(item);
                              }}
                              className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
                              title="Generate Card"
                            >
                              <Share2 size={13} />
                            </button>
                          </div>

                          <button
                            onClick={(e) => handleSave(e, item.id)}
                            className="text-slate-400 hover:text-[#00E599] transition-colors p-1 cursor-pointer"
                            title="Save Place"
                          >
                            <Bookmark
                              size={15}
                              className={item.isSaved ? 'text-[#00E599] fill-[#00E599]' : ''}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: FULL INTERACTIVE MAP VIEW */}
        {activeNav === 'map' && (
          <div className="relative flex-1 w-full h-full bg-slate-950 overflow-hidden">
            <div ref={fullMapRef} className="w-full h-full beyond-dark-map z-10" />

            {/* Top Google Maps & City Controls */}
            <div className="absolute top-4 left-6 z-20 flex flex-wrap items-center gap-2">
              {/* City selector */}
              <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl">
                {['All', 'Hyderabad', 'Bangalore', 'Mysuru'].map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedCity === city
                        ? 'bg-[#00E599] text-[#050911] shadow'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {city === 'All' ? '🌍 All Regions' : `📍 ${city}`}
                  </button>
                ))}
              </div>

              {/* Real Google Maps Layer Switcher */}
              <div className="flex items-center gap-1 bg-black/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl">
                <span className="text-[10px] text-slate-400 font-bold px-2 flex items-center gap-1">
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
                    onClick={() => setDesktopMapLayer(layer.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-md ${
                      desktopMapLayer === layer.id
                        ? 'bg-[#00E599] text-[#080E18] shadow-[#00E599]/30'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {layer.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Floating Selected Place Drawer in Map */}
            {selectedPlace && (
              <div className="absolute bottom-6 left-6 z-20 max-w-sm bg-[#080D15]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl flex items-center gap-4 animate-slideUp">
                <BeyondImage
                  src={selectedPlace.imageUrl}
                  alt={selectedPlace.title}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-[#00E599] font-bold uppercase tracking-wider block">
                    {selectedPlace.location}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate font-display">
                    {selectedPlace.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {selectedPlace.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <button
                      onClick={() => setActiveNav('feed')}
                      className="px-2.5 py-1 rounded-lg bg-[#00E599] text-[#050911] text-[10px] font-bold cursor-pointer"
                    >
                      View in Feed
                    </button>
                    <button
                      onClick={() => setIsDesktopGoogleModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-[#00E599]/15 hover:bg-[#00E599]/25 text-[#00E599] border border-[#00E599]/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Globe size={11} />
                      <span>Google 3D</span>
                    </button>
                    <a
                      href={getGoogleMapsDirectionsUrl(selectedPlace.coordinates.lat, selectedPlace.coordinates.lng, selectedPlace.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation size={11} />
                      <span>Navigate</span>
                    </a>
                    <button
                      onClick={() => setShareModalPlace(selectedPlace)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-semibold cursor-pointer"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: SAVED PLACES & COLLECTIONS VIEW */}
        {activeNav === 'saved' && (
          <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white font-display">Your Saved Treasures</h2>
                  <p className="text-xs text-slate-400 mt-1">Bookmarked viewpoints, cafes, and private collections.</p>
                </div>
                <div className="flex gap-2 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
                  <button
                    onClick={() => setSavedTab('places')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      savedTab === 'places' ? 'bg-[#00E599] text-black shadow' : 'text-slate-300'
                    }`}
                  >
                    Saved Places ({savedPlaces.length})
                  </button>
                  <button
                    onClick={() => setSavedTab('collections')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      savedTab === 'collections' ? 'bg-[#00E599] text-black shadow' : 'text-slate-300'
                    }`}
                  >
                    Collections ({collections.length})
                  </button>
                </div>
              </div>

              {savedTab === 'places' ? (
                savedPlaces.length === 0 ? (
                  <div className="py-24 text-center">
                    <Bookmark size={36} className="mx-auto text-slate-500 mb-3" />
                    <h3 className="text-sm font-bold text-white">No saved spots yet</h3>
                    <p className="text-xs text-slate-400 mt-1">Bookmark spots in the feed to plan your next weekend trip.</p>
                    <button
                      onClick={() => setActiveNav('feed')}
                      className="mt-4 px-4 py-2 rounded-xl bg-[#00E599] text-[#050911] text-xs font-bold"
                    >
                      Browse Discover Feed
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {savedPlaces.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedPlace(item);
                          setActiveNav('feed');
                        }}
                        className="group bg-[#0B121E] border border-white/[0.08] hover:border-[#00E599]/60 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                      >
                        <div className="relative aspect-[16/10] w-full">
                          <BeyondImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          <button
                            onClick={(e) => handleSave(e, item.id)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-[#00E599]"
                          >
                            <Bookmark size={14} className="fill-[#00E599]" />
                          </button>
                        </div>
                        <div className="p-4">
                          <span className="text-[10px] text-[#00E599] font-bold">{item.location}</span>
                          <h4 className="text-sm font-bold text-white mt-1 group-hover:text-[#00E599] transition-colors">{item.title}</h4>
                          <p className="text-xs text-slate-300 mt-1.5 line-clamp-2">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {collections.map((col) => (
                    <div key={col.id} className="bg-[#0B121E] border border-white/[0.08] rounded-3xl p-4">
                      <div className="relative aspect-video rounded-2xl overflow-hidden mb-3">
                        <BeyondImage src={col.coverImageUrl} alt={col.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-[10px] font-bold text-white px-2 py-0.5 rounded-full">
                          {col.itemCount} places
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{col.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{col.description || 'Personal exploration list'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: EXPLORER LEVELS & BADGES VIEW */}
        {activeNav === 'levels' && (
          <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Hero Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0E2018] to-[#0A121F] border border-[#00E599]/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#00E599] uppercase tracking-wider block mb-1">
                    Current Explorer Rank
                  </span>
                  <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
                    <span>🛡️ Hidden Gem Hunter</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">23,865 XP accumulated across Karnataka & Telangana.</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#00E599]/20 border border-[#00E599]/50 flex items-center justify-center text-3xl shadow-lg shadow-[#00E599]/20">
                  🛡️
                </div>
              </div>

              {/* Achievement Tiers Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Honorary Tiers</h3>
                {[
                  { level: 1, title: 'Explorer', badge: '🧭', xp: '50 / 50 XP', desc: 'First steps into the wild. Published 1 discovery.', status: 'Unlocked' },
                  { level: 2, title: 'Local Scout', badge: '⭐', xp: '500 / 500 XP', desc: 'Active discoverer with verified local contributions.', status: 'Unlocked' },
                  { level: 3, title: 'Hidden Gem Hunter', badge: '🛡️', xp: '1,000 / 1,000 XP', desc: 'Discovered 5 unmapped viewpoints or secret spots.', status: 'Unlocked' },
                  { level: 4, title: 'City Legend', badge: '👑', xp: '2,000 / 2,000 XP', desc: 'Top-tier regional knowledge trusted by hundreds of explorers.', status: 'Unlocked' },
                  { level: 5, title: 'Grand Curator', badge: '💎', xp: '5,000 XP', desc: 'Architect of city culture and explorer community leader.', status: 'In Progress' },
                ].map((tier) => (
                  <div key={tier.level} className="p-4 rounded-2xl bg-[#0B121E] border border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-2xl">
                        {tier.badge}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{tier.title}</span>
                          <span className="text-[10px] text-[#00E599] bg-[#00E599]/15 px-2 py-0.5 rounded-full font-semibold">{tier.status}</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">{tier.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-300">{tier.xp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: USER PROFILE VIEW */}
        {activeNav === 'profile' && (
          <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Profile Card */}
              <div className="p-6 rounded-3xl bg-[#0B121E] border border-white/[0.08] flex flex-col md:flex-row items-center gap-6">
                <BeyondImage
                  src={profile?.avatarUrl || '/intro/assets/rohit_avatar.png'}
                  fallbackSrc="/intro/assets/rohit_avatar.png"
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#00E599] shadow-xl"
                />
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h2 className="text-xl font-extrabold text-white font-display">
                      {profile?.name || 'Explorer'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30">
                      Verified Member
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{profile?.handle || '@explorer'}</p>
                  <p className="text-xs text-slate-300 mt-2 italic max-w-lg">
                    "{profile?.bio || 'Discovering hidden viewpoints, secret cafes, and architectural gems across India.'}"
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-6 mt-4 pt-3 border-t border-white/[0.06] text-xs">
                    <div>
                      <span className="font-extrabold text-white text-sm block">17</span>
                      <span className="text-[10px] text-slate-400">Discoveries</span>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div>
                      <span className="font-extrabold text-white text-sm block">1,420</span>
                      <span className="text-[10px] text-slate-400">Followers</span>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div>
                      <span className="font-extrabold text-white text-sm block">384</span>
                      <span className="text-[10px] text-slate-400">Following</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Published Landmarks Grid */}
              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Your Curated Gems</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {discoveries.slice(0, 8).map((d) => (
                    <div
                      key={d.id}
                      onClick={() => {
                        setSelectedPlace(d);
                        setActiveNav('feed');
                      }}
                      className="group aspect-square rounded-2xl overflow-hidden relative cursor-pointer border border-white/10 hover:border-[#00E599]"
                    >
                      <BeyondImage src={d.imageUrl} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-xs font-bold text-white truncate">{d.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. RIGHT INSPECTOR & MAP DRAWER (Visible when in Feed view) */}
      {activeNav === 'feed' && selectedPlace && (
        <aside className="w-96 bg-[#080D15]/95 backdrop-blur-2xl border-l border-white/[0.08] flex flex-col overflow-hidden shrink-0 z-30">
          <div className="relative h-56 w-full bg-slate-950 shrink-0">
            <div ref={inspectorMapRef} className="w-full h-full beyond-dark-map" />
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-[11px] font-bold text-white flex items-center gap-1.5 shadow-lg">
              <Navigation size={12} className="text-[#00E599]" />
              <span>GPS: {selectedPlace.coordinates.lat.toFixed(4)}, {selectedPlace.coordinates.lng.toFixed(4)}</span>
            </div>

            {/* Google Maps Actions Overlay on Mini Map */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
              <button
                onClick={() => setIsDesktopGoogleModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-black/80 hover:bg-[#00E599]/25 text-[#00E599] border border-white/15 backdrop-blur-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-lg"
                title="Google 3D Satellite View"
              >
                <Globe size={11} />
                <span>3D</span>
              </button>
              <a
                href={getGoogleMapsDirectionsUrl(selectedPlace.coordinates.lat, selectedPlace.coordinates.lng, selectedPlace.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-xl bg-[#00E599] hover:bg-[#00C883] text-[#050911] text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-lg"
                title="Google Maps Navigation"
              >
                <Navigation size={11} />
                <span>Navigate</span>
              </a>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar p-5 space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#00E599] font-bold mb-1">
                <MapPin size={13} />
                <span>{selectedPlace.location}</span>
              </div>
              <h3 className="text-lg font-extrabold text-white font-display">
                {selectedPlace.title}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {selectedPlace.description}
              </p>
            </div>

            {selectedPlace.usefulInfo && (
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] text-center">
                  <Clock size={14} className="text-[#00E599] mx-auto mb-1" />
                  <span className="block text-[10px] text-slate-400 font-semibold">Best Time</span>
                  <span className="text-[11px] font-bold text-white truncate block">
                    {selectedPlace.usefulInfo.bestTime.split('(')[0]}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] text-center">
                  <Ticket size={14} className="text-[#00E599] mx-auto mb-1" />
                  <span className="block text-[10px] text-slate-400 font-semibold">Entry Fee</span>
                  <span className="text-[11px] font-bold text-white truncate block">
                    {selectedPlace.usefulInfo.entryFee.split('(')[0]}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] text-center">
                  <Users size={14} className="text-[#00E599] mx-auto mb-1" />
                  <span className="block text-[10px] text-slate-400 font-semibold">Crowd</span>
                  <span className="text-[11px] font-bold text-white truncate block">
                    {selectedPlace.usefulInfo.crowdLevel.split('(')[0]}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <BeyondImage
                  src={selectedPlace.author.avatarUrl}
                  fallbackSrc="/intro/assets/rohit_avatar.png"
                  alt={selectedPlace.author.name}
                  className="w-8 h-8 rounded-full object-cover border border-white/20"
                />
                <div>
                  <span className="block text-xs font-bold text-white">
                    {selectedPlace.author.name}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {selectedPlace.createdAt} • Verified Contributor
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShareModalPlace(selectedPlace)}
                className="px-3 py-1.5 rounded-xl bg-[#00E599]/15 hover:bg-[#00E599]/25 text-[#00E599] border border-[#00E599]/30 text-xs font-bold transition-all cursor-pointer"
              >
                Share Card
              </button>
            </div>

            {/* 3 Curated Spotlight Reviews & Live Community Comments Stream */}
            <div className="pt-2">
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
          </div>
        </aside>
      )}

      {/* 4. APPLE CREATE DISCOVERY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0C121E] border border-white/15 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white font-display mb-1">Post a New Discovery</h3>
            <p className="text-xs text-slate-400 mb-4">Publish a secret viewpoint, rooftop cafe, or hidden trail.</p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Place Name</label>
                <input
                  type="text"
                  placeholder="e.g. Qutb Shahi Tombs Sunset View"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full bg-[#111A29] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E599]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Territory</label>
                  <select
                    value={createLocation}
                    onChange={(e) => setCreateLocation(e.target.value)}
                    className="w-full bg-[#111A29] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E599]"
                  >
                    <option value="Hyderabad, Telangana">Hyderabad, Telangana</option>
                    <option value="Bangalore, Karnataka">Bangalore, Karnataka</option>
                    <option value="Mysuru, Karnataka">Mysuru, Karnataka</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={createCategory}
                    onChange={(e) => setCreateCategory(e.target.value)}
                    className="w-full bg-[#111A29] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E599]"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-300">Experience & Traveler Tip</label>
                  <button
                    type="button"
                    onClick={handleAiPolish}
                    disabled={isAiPolishing || !createTitle}
                    className="text-[10px] text-[#00E599] font-bold flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={11} />
                    <span>{isAiPolishing ? 'Polishing...' : 'AI Enhance'}</span>
                  </button>
                </div>
                <textarea
                  placeholder="Tell other explorers why this place is magical..."
                  rows={3}
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  className="w-full bg-[#111A29] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00E599]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPlace}
                  className="px-5 py-2 rounded-xl bg-[#00E599] hover:bg-[#00C883] text-[#050911] text-xs font-bold shadow-lg shadow-[#00E599]/20"
                >
                  {isSubmittingPlace ? 'Publishing...' : 'Publish Spot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. APPLE CARD SHARE MODAL */}
      {shareModalPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0D1422] border border-white/15 rounded-3xl p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setShareModalPlace(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <span className="text-[10px] font-bold text-[#00E599] uppercase tracking-wider block mb-1">
              BEYOND Discovery Card
            </span>
            <h3 className="text-base font-extrabold text-white font-display">{shareModalPlace.title}</h3>
            <p className="text-xs text-slate-400 mb-4">{shareModalPlace.location}</p>

            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-lg">
              <BeyondImage src={shareModalPlace.imageUrl} alt={shareModalPlace.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <p className="text-[11px] text-slate-200 italic line-clamp-2 text-left">
                  "{shareModalPlace.description}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-white text-black">
                <QrCode size={40} />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Scan to Open</span>
                <span className="text-[10px] text-slate-400">Share with explorer friends</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopyToast(true);
                  setTimeout(() => setCopyToast(false), 2500);
                }}
                className="py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                {copyToast ? '✓ Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={() => setShareModalPlace(null)}
                className="py-2 rounded-xl bg-[#00E599] text-[#050911] text-xs font-bold shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. REAL GOOGLE MAPS SATELLITE & 3D MODAL */}
      {selectedPlace && (
        <GoogleMapsModal
          isOpen={isDesktopGoogleModalOpen}
          onClose={() => setIsDesktopGoogleModalOpen(false)}
          lat={selectedPlace.coordinates.lat}
          lng={selectedPlace.coordinates.lng}
          title={selectedPlace.title}
          location={selectedPlace.location}
        />
      )}
    </div>
  );
};

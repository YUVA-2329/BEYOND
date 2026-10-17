import React, { useState, useEffect } from 'react';
import { MountainLogo } from '../MountainLogo';
import { BottomNav } from '../BottomNav';
import { BeyondImage } from '../BeyondImage';
import { Search, Heart, MessageCircle, Bookmark, ChevronDown, MoreVertical, MapPin, Share2, Navigation, Radio } from 'lucide-react';
import { Discovery, ScreenId } from '../../types';
import { api } from '../../services/api';
import { getGoogleMapsDirectionsUrl } from '../../services/googleMaps';

interface Screen02Props {
  onNavigate: (screen: ScreenId, params?: any) => void;
  onOpenAI: () => void;
  onActivateAppleMode?: () => void;
  onOpenRadar?: () => void;
  initialCity?: string;
  isEditorUnlocked?: boolean;
  onPromptUnlock?: () => void;
}

const CATEGORIES = ['All', 'Food', 'Viewpoint', 'Hangout', 'Nature', 'Cafés', 'Adventure', 'Heritage', 'Photography'];

export const Screen02HomeFeed: React.FC<Screen02Props> = ({
  onNavigate,
  onOpenAI,
  onActivateAppleMode,
  onOpenRadar,
  initialCity = 'All',
  isEditorUnlocked = false,
  onPromptUnlock,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFeed = async (category = selectedCategory, q = searchQuery) => {
    try {
      setLoading(true);
      const data = await api.getDiscoveries(category, q);
      setDiscoveries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed(selectedCategory, searchQuery);
  }, [selectedCategory]);

  const handleLike = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await api.toggleLike(id);
      setDiscoveries((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isLiked: res.isLiked, likesCount: res.likesCount } : d))
      );
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
    } catch (err) {
      console.error(err);
    }
  };

  const displayedDiscoveries = selectedCity === 'All'
    ? discoveries
    : discoveries.filter((d) => d.location.toLowerCase().includes(selectedCity.toLowerCase()));

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#080E18] text-white overflow-hidden">
      {/* Top Header */}
      <div className="px-4 pt-2 pb-2 bg-[#080E18]/90 backdrop-blur-md z-20 border-b border-[#142033]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MountainLogo size={24} />
            <span className="font-extrabold tracking-wider text-base font-display">BEYOND</span>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenRadar && (
              <button
                onClick={onOpenRadar}
                className="px-2.5 py-1 rounded-full bg-[#00E599]/15 hover:bg-[#00E599]/25 text-[#00E599] transition-all cursor-pointer text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
                title="RADAR SCAN — Discover nearby places"
              >
                <Radio size={13} className="animate-pulse" />
                <span>Radar</span>
              </button>
            )}

            {onActivateAppleMode && (
              <button
                onClick={onActivateAppleMode}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer text-xs font-bold flex items-center gap-1 border border-white/10 active:scale-95"
                title="Switch to Apple Experience"
              >
                <span className="text-xs"></span>
                <span>Apple</span>
              </button>
            )}

            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
            <button
              onClick={onOpenAI}
              className="p-1.5 rounded-full bg-[#00E599]/15 hover:bg-[#00E599]/25 text-[#00E599] transition-colors cursor-pointer text-xs font-semibold px-2 flex items-center gap-1"
              aria-label="AI Search"
            >
              <span className="text-[11px]">✨ AI</span>
            </button>
          </div>
        </div>

        {/* Location Picker with Interactive City Menu */}
        <div className="mt-1 relative flex items-center gap-1 select-none">
          <button
            onClick={() => setShowCityMenu(!showCityMenu)}
            className="flex items-center gap-1 text-sm font-semibold text-white hover:text-[#00E599] transition-colors"
          >
            <MapPin size={13} className="text-[#00E599]" />
            <span>{selectedCity === 'All' ? 'All Locations' : selectedCity}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showCityMenu && (
            <div className="absolute top-7 left-0 z-50 bg-[#0F1C2E]/95 border border-white/10 rounded-2xl p-1.5 shadow-2xl min-w-[180px] backdrop-blur-xl animate-fadeIn">
              {[
                { name: 'All', label: '🌍 All Locations' },
                { name: 'Hyderabad', label: '📍 Hyderabad' },
                { name: 'Bangalore', label: '📍 Bangalore' },
                { name: 'Mysuru', label: '📍 Mysuru' },
              ].map((c) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setSelectedCity(c.name);
                    setShowCityMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCity === c.name
                      ? 'bg-[#00E599]/20 text-[#00E599] font-bold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{c.label}</span>
                  {selectedCity === c.name && <span className="text-[11px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar Input (Collapsible) */}
        {showSearchInput && (
          <div className="mt-2 relative">
            <input
              type="text"
              placeholder="Search viewpoints, cafés, nature, or type 'apple'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (searchQuery.trim().toLowerCase() === 'apple' && onActivateAppleMode) {
                    onActivateAppleMode();
                  } else {
                    loadFeed(selectedCategory, searchQuery);
                  }
                }
              }}
              className="w-full bg-[#0F1C2E] border border-[#1E2E46] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00E599]"
            />

            {/* Apple Mode Banner when typing apple */}
            {searchQuery.toLowerCase().includes('apple') && onActivateAppleMode && (
              <div
                onClick={onActivateAppleMode}
                className="mt-1.5 p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 flex items-center justify-between text-xs cursor-pointer transition-all animate-fadeIn"
              >
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <span className="text-sm"></span>
                  <span>Apple Experience Available</span>
                </div>
                <span className="text-[10px] text-sky-400 font-semibold px-2 py-0.5 rounded-full bg-sky-500/20">
                  Switch ➔
                </span>
              </div>
            )}
          </div>
        )}

        {/* Horizontal Category Chips */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 select-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00E599] text-[#080E18] font-bold shadow-md shadow-[#00E599]/20'
                    : 'bg-[#0F1B2C] text-slate-300 hover:bg-[#16273F] border border-[#182940]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed Cards List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-3 py-3 space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-[#00E599] border-t-transparent rounded-full animate-spin mb-2" />
            Loading discoveries...
          </div>
        ) : displayedDiscoveries.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            No discoveries found in {selectedCity} for {selectedCategory}.
          </div>
        ) : (
          displayedDiscoveries.map((item) => (
            <div
                key={item.id}
                onClick={() => onNavigate('screen_04_place_details', { discoveryId: item.id })}
                className="bg-[#0B1525] border border-[#162438] rounded-2xl overflow-hidden hover:border-[#1F334E] transition-all cursor-pointer shadow-md group"
              >
              {/* Card Image with Badges */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                <BeyondImage
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1525] via-transparent to-black/30" />

                {/* Hidden Gem Badge */}
                {item.isHiddenGem && (
                  <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-0.5 flex items-center gap-1 text-[11px] font-medium text-white shadow-sm">
                    <MapPin size={11} className="text-[#00E599]" />
                    <span>Hidden Gem</span>
                  </div>
                )}

                {/* Distance Badge */}
                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-slate-200 shadow-sm">
                  {item.distanceKm} km
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3">
                {/* Author row */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <BeyondImage
                      src={item.author.avatarUrl}
                      alt={item.author.name}
                      isAvatar={true}
                      className="w-6 h-6 rounded-full object-cover border border-white/20"
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200">
                        {item.author.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.createdAt} • Mysuru
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('screen_09_shareable_discovery_card', { discoveryId: item.id });
                    }}
                    className="text-slate-400 hover:text-white p-1"
                    aria-label="Options"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>

                {/* Title */}
                <h2 className="text-sm font-bold text-white tracking-tight font-display">
                  {item.title}
                </h2>

                {/* Short Description */}
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Category Tags */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {item.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#112035] text-slate-300 border border-[#192F4D]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Engagement Action Row */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#142236]">
                  <div className="flex items-center gap-4">
                    {/* Like Button */}
                    <button
                      onClick={(e) => handleLike(e, item.id)}
                      className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Heart
                        size={15}
                        className={item.isLiked ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}
                      />
                      <span className="text-[11px] font-semibold">{item.likesCount}</span>
                    </button>

                    {/* Comment Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('screen_04_place_details', { discoveryId: item.id, openComments: true });
                      }}
                      className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <MessageCircle size={15} className="text-slate-400" />
                      <span className="text-[11px] font-semibold">{item.commentsCount}</span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('screen_09_shareable_discovery_card', { discoveryId: item.id });
                      }}
                      className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
                      title="Share Card"
                    >
                      <Share2 size={14} />
                    </button>

                    {/* Google Maps Directions */}
                    <a
                      href={getGoogleMapsDirectionsUrl(item.coordinates.lat, item.coordinates.lng, item.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-[#00E599] transition-colors p-0.5 cursor-pointer"
                      title="Google Maps Navigation"
                    >
                      <Navigation size={14} />
                    </a>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => handleSave(e, item.id)}
                    className="text-slate-400 hover:text-[#00E599] transition-colors p-1 cursor-pointer"
                    aria-label="Save Place"
                  >
                    <Bookmark
                      size={16}
                      className={item.isSaved ? 'text-[#00E599] fill-[#00E599]' : ''}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Persistent Bottom Navigation */}
      <BottomNav
        currentScreen="screen_02_home_feed"
        onNavigate={onNavigate}
        isEditorUnlocked={isEditorUnlocked}
        onPromptUnlock={onPromptUnlock}
      />
    </div>
  );
};

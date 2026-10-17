import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark, MoreVertical, Heart, MessageCircle, Share2, MapPin, Clock, Ticket, Users, Send, Navigation, Globe, ExternalLink } from 'lucide-react';
import { Discovery, Comment, ScreenId } from '../../types';
import { api } from '../../services/api';
import { GoogleMapsModal } from '../GoogleMapsModal';
import { PlaceReviewsAndComments } from '../PlaceReviewsAndComments';
import { BeyondImage } from '../BeyondImage';
import { getGoogleMapsDirectionsUrl, getGoogleMapsSearchUrl } from '../../services/googleMaps';

interface Screen04Props {
  discoveryId?: string;
  openComments?: boolean;
  onNavigate: (screen: ScreenId, params?: any) => void;
  isEditorUnlocked?: boolean;
  onPromptUnlock?: () => void;
}

export const Screen04PlaceDetails: React.FC<Screen04Props> = ({
  discoveryId = 'chamundi-hills-viewpoint',
  openComments = false,
  onNavigate,
  isEditorUnlocked = false,
  onPromptUnlock,
}) => {
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(openComments);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getDiscoveryById(discoveryId)
      .then((data) => {
        setDiscovery(data);
        setIsFollowing(!!data.author.isFollowing);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    api.getComments(discoveryId).then((c) => setComments(c));
  }, [discoveryId]);

  if (loading || !discovery) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#080E18] text-white">
        <div className="w-6 h-6 border-2 border-[#00E599] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLike = async () => {
    try {
      const res = await api.toggleLike(discovery.id);
      setDiscovery({ ...discovery, isLiked: res.isLiked, likesCount: res.likesCount });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.toggleSave(discovery.id);
      setDiscovery({ ...discovery, isSaved: res.isSaved });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async () => {
    try {
      const res = await api.toggleFollow(discovery.author.id);
      setIsFollowing(res.isFollowing);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isEditorUnlocked) {
      if (onPromptUnlock) onPromptUnlock();
      return;
    }
    try {
      const added = await api.addComment(discovery.id, newComment);
      setComments([added, ...comments]);
      setDiscovery({ ...discovery, commentsCount: discovery.commentsCount + 1 });
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#080E18] text-white overflow-y-auto hide-scrollbar">
      {/* Top Floating App Bar */}
      <div className="absolute top-2 inset-x-3 z-30 flex items-center justify-between text-white pointer-events-none">
        <button
          onClick={() => onNavigate('screen_02_home_feed')}
          className="pointer-events-auto p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="pointer-events-auto p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors cursor-pointer"
            aria-label="Save"
          >
            <Bookmark
              size={16}
              className={discovery.isSaved ? 'text-[#00E599] fill-[#00E599]' : 'text-white'}
            />
          </button>
          <button
            onClick={() => onNavigate('screen_09_shareable_discovery_card', { discoveryId: discovery.id })}
            className="pointer-events-auto p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors cursor-pointer"
            aria-label="More"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Hero Cinematic Image */}
      <div className="relative w-full h-64 shrink-0 overflow-hidden bg-slate-900 rounded-b-[28px] shadow-lg">
        <BeyondImage
          src={discovery.imageUrl}
          alt={discovery.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080E18] via-transparent to-black/30" />
      </div>

      {/* Content Area */}
      <div className="px-4 py-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Author Row with Follow Button */}
          <div className="flex items-center justify-between py-2 border-b border-[#142033]">
            <div className="flex items-center gap-2.5">
              <BeyondImage
                src={discovery.author.avatarUrl}
                alt={discovery.author.name}
                isAvatar={true}
                className="w-8 h-8 rounded-full object-cover border border-white/20"
              />
              <div>
                <div className="text-xs font-bold text-white leading-tight">
                  {discovery.author.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {discovery.createdAt} • Mysuru
                </div>
              </div>
            </div>

            <button
              onClick={handleFollow}
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                isFollowing
                  ? 'bg-[#122236] text-slate-300 border border-[#1E3554]'
                  : 'bg-transparent text-[#00E599] border border-[#00E599] hover:bg-[#00E599]/15'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          {/* Place Title & Location */}
          <div className="mt-3">
            <h1 className="text-lg font-bold font-display tracking-tight text-white">
              {discovery.title}
            </h1>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
              <MapPin size={12} className="text-[#00E599]" />
              <span>{discovery.distanceKm} km • {discovery.location}</span>
            </div>
          </div>

          {/* Description */}
          <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
            {discovery.description}
          </p>

          {/* Category Tags */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {discovery.categories.map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#0E1A2C] text-slate-300 border border-[#182C48]"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Social Stats Row */}
          <div className="flex items-center gap-5 mt-4 py-2 border-y border-[#142033]">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Heart
                size={16}
                className={discovery.isLiked ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}
              />
              <span className="font-semibold text-xs">{discovery.likesCount}</span>
            </button>

            <button
              onClick={() => setShowCommentsDrawer(!showCommentsDrawer)}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <MessageCircle size={16} className="text-slate-400" />
              <span className="font-semibold text-xs">{discovery.commentsCount}</span>
            </button>

            <button
              onClick={() => onNavigate('screen_09_shareable_discovery_card', { discoveryId: discovery.id })}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Share"
            >
              <Share2 size={15} />
            </button>
          </div>

          {/* Useful Info Card */}
          <div className="mt-4 bg-[#0B1525] border border-[#162438] rounded-2xl p-3">
            <h3 className="text-xs font-bold text-white mb-2 font-display">Useful Info</h3>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock size={13} className="text-[#00E599]" />
                <span className="font-medium text-slate-400">Best Time:</span>
                <span className="text-white">{discovery.usefulInfo?.bestTime || 'Sunset (4:30 - 6:30 PM)'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Ticket size={13} className="text-[#00E599]" />
                <span className="font-medium text-slate-400">Entry Fee:</span>
                <span className="text-white">{discovery.usefulInfo?.entryFee || 'Free'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users size={13} className="text-[#00E599]" />
                <span className="font-medium text-slate-400">Crowd Level:</span>
                <span className="text-white">{discovery.usefulInfo?.crowdLevel || 'Low (on weekdays)'}</span>
              </div>
            </div>
          </div>

          {/* Google Maps Real Integration Card */}
          <div className="mt-4 bg-[#0B1525] border border-[#162438] rounded-2xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white font-display">
                <Globe size={14} className="text-[#00E599]" />
                <span>Google Maps Real-Time API</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {discovery.coordinates.lat.toFixed(4)}, {discovery.coordinates.lng.toFixed(4)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsGoogleModalOpen(true)}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-[#00E599]/15 text-[#00E599] border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>🛰️</span>
                <span>3D Satellite View</span>
              </button>

              <a
                href={getGoogleMapsDirectionsUrl(discovery.coordinates.lat, discovery.coordinates.lng, discovery.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#00E599] hover:bg-[#00C883] text-[#07130F] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Navigation size={13} />
                <span>Navigate</span>
              </a>
            </div>
          </div>

          {/* 3 Curated Spotlight Reviews & Live Community Comments Stream */}
          <div className="mt-5">
            <PlaceReviewsAndComments
              placeId={discovery.id}
              placeTitle={discovery.title}
              placeLocation={discovery.location}
              comments={comments}
              onAddComment={async (text) => {
                const added = await api.addComment(discovery.id, text);
                setComments([added, ...comments]);
                setDiscovery({ ...discovery, commentsCount: discovery.commentsCount + 1 });
              }}
              isEditorUnlocked={isEditorUnlocked}
              onPromptUnlock={onPromptUnlock ? onPromptUnlock : () => {}}
            />
          </div>
        </div>

          {/* Primary Bottom Button: Save Place */}
        <div className="mt-6 mb-2">
          <button
            onClick={handleSave}
            className={`w-full py-3 rounded-full font-bold text-xs tracking-wide transition-all shadow-lg cursor-pointer ${
              discovery.isSaved
                ? 'bg-[#112338] text-[#00E599] border border-[#00E599]/60'
                : 'bg-[#00E599] text-[#080E18] hover:bg-[#00C883] shadow-[#00E599]/25'
            }`}
          >
            {discovery.isSaved ? '✓ Saved to Places' : 'Save Place'}
          </button>
        </div>
      </div>

      {/* Google Maps Real-Time Interactive Modal */}
      <GoogleMapsModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        lat={discovery.coordinates.lat}
        lng={discovery.coordinates.lng}
        title={discovery.title}
        location={discovery.location}
      />
    </div>
  );
};

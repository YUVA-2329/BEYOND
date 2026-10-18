import React, { useState } from 'react';
import {
  ArrowLeft,
  X,
  MapPin,
  Sparkles,
  Upload,
  Lock,
  CheckCircle2,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { ScreenId } from '../../types';
import { api } from '../../services/api';
import { BeyondImage } from '../BeyondImage';
import { useAuth } from '../../contexts/AuthContext';

interface Screen05Props {
  onNavigate: (screen: ScreenId, params?: any) => void;
  isEditorUnlocked?: boolean;
  onPromptUnlock?: () => void;
}

const CATEGORIES = ['Food', 'Viewpoint', 'Hangout', 'Nature', 'Cafés', 'Photography'];

export const Screen05CreateDiscovery: React.FC<Screen05Props> = ({
  onNavigate,
  isEditorUnlocked = false,
  onPromptUnlock,
}) => {
  const { user, profile, isAuthenticated, loginWithGoogle } = useAuth();

  const [photoUrl, setPhotoUrl] = useState<string>('/intro/assets/chamundi_hills_sunset.png');
  const [placeName, setPlaceName] = useState('Chamundi Hills Viewpoint');
  const [selectedCategory, setSelectedCategory] = useState('Viewpoint');
  const [location, setLocation] = useState('Mysuru, Karnataka');
  const [experience, setExperience] = useState(
    'Peaceful spot with an amazing view of Mysuru city. Best during sunset. 🌅'
  );
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // User is allowed to upload if authenticated via Google / Supabase or PIN-unlocked
  const canUpload = isAuthenticated || isEditorUnlocked;

  // Real backend photo upload handler
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUri = reader.result as string;
      setPhotoUrl(dataUri); // Local preview

      // Real server upload to /api/upload
      try {
        setIsUploadingPhoto(true);
        const uploadRes = await api.uploadImage(dataUri, file.name);
        if (uploadRes && uploadRes.url) {
          setPhotoUrl(uploadRes.url);
        }
      } catch (err) {
        console.warn('Direct upload fallback to dataUri:', err);
      } finally {
        setIsUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // AI Assistant Enhancement
  const handleAiPolish = async () => {
    if (!placeName) return;
    try {
      setIsAiLoading(true);
      setAiMessage(null);
      const res = await api.describeWithAI(placeName, selectedCategory, experience);
      setExperience(res.polishedDescription);
      setAiMessage('✨ Polished with Local BEYOND AI!');
      setTimeout(() => setAiMessage(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Google Login helper
  const handleGoogleSignIn = async () => {
    try {
      setErrorMessage(null);
      const res = await loginWithGoogle();
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google authentication failed');
    }
  };

  // Submit Discovery
  const handlePost = async () => {
    if (!canUpload) {
      if (onPromptUnlock) onPromptUnlock();
      return;
    }

    if (!placeName.trim() || !experience.trim()) {
      setErrorMessage('Please fill out the destination name and experience description.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Determine authenticated author
      const authorPayload = {
        id: user?.id || profile?.id || 'explorer-user',
        name: profile?.name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Google Explorer',
        handle: profile?.handle || `@${(user?.email || 'explorer').split('@')[0].toLowerCase()}`,
        avatarUrl: profile?.avatarUrl || user?.user_metadata?.avatar_url || '/intro/assets/rohit_avatar.png',
      };

      const created = await api.createDiscovery({
        title: placeName.trim(),
        location: location.trim() || 'Mysuru, Karnataka',
        description: experience.trim(),
        categories: [selectedCategory, 'Photography'],
        imageUrl: photoUrl,
        distanceKm: 1.2,
        coordinates: { lat: 12.2743, lng: 76.6710 },
        isHiddenGem: true,
        author: authorPayload,
      });

      setSuccessMessage('🎉 Discovery successfully verified & published!');
      setTimeout(() => {
        onNavigate('screen_04_place_details', { discoveryId: created.id });
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Failed to post discovery to verified backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#080E18] text-white overflow-y-auto hide-scrollbar p-4">
      {/* Top Header */}
      <div>
        {/* Authentication & Verification Banner */}
        {isAuthenticated ? (
          <div className="mb-3 px-3 py-2 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/30 text-[#00E599] text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#00E599] shrink-0" />
              <span className="truncate">
                Verified Explorer: <strong>{profile?.name || user?.email}</strong>
              </span>
            </div>
            <span className="text-[10px] bg-[#00E599]/20 text-[#00E599] font-bold px-2 py-0.5 rounded-full shrink-0">
              READY TO UPLOAD
            </span>
          </div>
        ) : (
          <div className="mb-3 p-3 rounded-2xl bg-[#0D182A] border border-amber-400/30 text-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Lock size={15} className="text-amber-400 shrink-0" />
              <span>Sign in with Google to publish real discoveries to BEYOND.</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-white text-black font-extrabold text-[11px] hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              >
                <LogIn size={13} />
                <span>Continue with Google</span>
              </button>
              {onPromptUnlock && (
                <button
                  type="button"
                  onClick={onPromptUnlock}
                  className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] border border-white/10 transition-colors cursor-pointer"
                  title="PIN Unlock"
                >
                  PIN
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pb-3 border-b border-[#142236]">
          <button
            onClick={() => onNavigate('screen_02_home_feed')}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-sm font-bold tracking-tight font-display text-white">
            Create a Discovery
          </h1>
        </div>

        {/* Photo Upload & Preview Container */}
        <div className="mt-3">
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#0B1525] border border-[#162438] group">
            {photoUrl ? (
              <>
                <BeyondImage
                  src={photoUrl}
                  fallbackSrc="/intro/assets/chamundi_hills_sunset.png"
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
                  aria-label="Remove photo"
                >
                  <X size={14} />
                </button>
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-xs text-[#00E599]">
                    <div className="w-4 h-4 border-2 border-[#00E599] border-t-transparent rounded-full animate-spin" />
                    <span>Uploading to verified backend...</span>
                  </div>
                )}
              </>
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-[#0E1A2C] transition-colors">
                <Upload size={24} className="text-[#00E599] mb-1.5" />
                <span className="text-xs text-slate-300">Tap to upload destination photo</span>
                <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WEBP accepted</span>
                <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
              </label>
            )}
          </div>

          {/* Change Photo Button */}
          {photoUrl && (
            <div className="mt-2 flex justify-center">
              <label className="px-3.5 py-1 rounded-full bg-[#122033] border border-[#1B2F4C] text-[11px] font-semibold text-slate-200 hover:bg-[#1A2E49] transition-colors cursor-pointer flex items-center gap-1.5">
                <Upload size={12} className="text-[#00E599]" />
                <span>Change Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="mt-3 space-y-3">
          {/* Place Name */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Place Name</label>
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="e.g. Chamundi Hills Viewpoint"
              className="w-full bg-[#0B1525] border border-[#162438] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E599]"
            />
          </div>

          {/* Category Selector Chips */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Category</label>
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#00E599] text-[#080E18] shadow-sm'
                        : 'bg-[#0B1525] text-slate-300 border border-[#162438] hover:bg-[#112035]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Location</label>
            <div className="relative">
              <MapPin size={13} className="absolute left-3 top-2.5 text-[#00E599]" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
                className="w-full bg-[#0B1525] border border-[#162438] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E599]"
              />
            </div>
          </div>

          {/* Experience Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-400">Share your experience...</label>
              <button
                type="button"
                onClick={handleAiPolish}
                disabled={isAiLoading}
                className="flex items-center gap-1 text-[10px] text-[#00E599] hover:underline cursor-pointer font-medium"
              >
                <Sparkles size={11} />
                <span>{isAiLoading ? 'Polishing...' : 'AI Enhance'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Tell other explorers what makes this spot unique..."
              className="w-full bg-[#0B1525] border border-[#162438] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E599] resize-none leading-relaxed"
            />

            {aiMessage && (
              <p className="text-[10px] text-[#00E599] mt-0.5 animate-pulse">{aiMessage}</p>
            )}
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-[#00E599]/15 border border-[#00E599]/40 text-[#00E599] text-xs flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Post Action Button */}
      <div className="mt-4 pt-2">
        <button
          onClick={handlePost}
          disabled={isSubmitting}
          className="w-full py-3 rounded-full bg-[#00E599] text-[#080E18] font-bold text-xs tracking-wide hover:bg-[#00C883] active:scale-98 transition-all shadow-lg shadow-[#00E599]/20 cursor-pointer text-center"
        >
          {isSubmitting ? 'Verifying & Publishing...' : 'Post Discovery'}
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Star, Shield, Award, MessageCircle, Send, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';
import { Comment, SpotlightReview } from '../types';
import { getSpotlightReviews } from '../services/spotlightReviews';
import { BeyondImage } from './BeyondImage';

interface PlaceReviewsAndCommentsProps {
  placeId: string;
  placeTitle: string;
  placeLocation: string;
  comments: Comment[];
  onAddComment: (text: string) => Promise<void>;
  isEditorUnlocked: boolean;
  onPromptUnlock: () => void;
}

export const PlaceReviewsAndComments: React.FC<PlaceReviewsAndCommentsProps> = ({
  placeId,
  placeTitle,
  placeLocation,
  comments,
  onAddComment,
  isEditorUnlocked,
  onPromptUnlock,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const spotlightReviews: [SpotlightReview, SpotlightReview, SpotlightReview] = getSpotlightReviews(
    placeId,
    placeTitle,
    placeLocation
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    if (!isEditorUnlocked) {
      onPromptUnlock();
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddComment(commentInput.trim());
      setCommentInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. CURATED SPOTLIGHT REVIEWS (EXACTLY 3) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-gradient-to-b from-[#D4AF37] to-[#00E599] rounded-full" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Curated Master Reviews (3)
            </h4>
          </div>
          <span className="text-[10px] font-semibold text-[#D4AF37] px-2 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center gap-1">
            <Award size={11} />
            <span>Royal Standard</span>
          </span>
        </div>

        {/* The 3 Luxury Review Cards */}
        <div className="space-y-2.5">
          {spotlightReviews.map((rev, idx) => (
            <div
              key={rev.id}
              className="p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-[#D4AF37]/40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group"
            >
              {/* Header: Author & Star Rating */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <BeyondImage
                    src={rev.author.avatarUrl}
                    fallbackSrc="/intro/assets/rohit_avatar.png"
                    alt={rev.author.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#D4AF37]/50 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-white group-hover:text-[#D4AF37] transition-colors">
                        {rev.author.name}
                      </span>
                      <UserCheck size={11} className="text-[#00E599]" />
                    </div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {rev.author.badge}
                    </span>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-[11px] font-extrabold shrink-0">
                  <Star size={11} className="fill-[#D4AF37]" />
                  <span>{rev.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Review Highlight Tag */}
              <div className="mb-1.5">
                <span className="text-[10px] font-bold text-[#00E599] uppercase tracking-wider block">
                  ✦ {rev.highlight}
                </span>
              </div>

              {/* Review Prose */}
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                "{rev.reviewText}"
              </p>

              {/* Footer Timestamp */}
              <div className="mt-2 text-right">
                <span className="text-[9px] text-slate-500 font-medium">{rev.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. LIVE EXPLORER COMMUNITY DISCUSSIONS */}
      <section className="space-y-3 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-[#00E599] rounded-full" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Real Community Discussion ({comments.length})
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] animate-pulse" />
            <span>Live Stream</span>
          </span>
        </div>

        {/* Comment Submission Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder={isEditorUnlocked ? "Share a field note or recommendation..." : "Log in to post comments..."}
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="flex-1 bg-[#0A101A] border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E599] transition-all"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3.5 py-2 rounded-2xl bg-[#00E599] hover:bg-[#00C883] text-[#07130F] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-[#07130F] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send size={12} />
                <span className="hidden sm:inline">Post</span>
              </>
            )}
          </button>
        </form>

        {/* Live Comments Feed */}
        <div className="space-y-2 max-h-64 overflow-y-auto hide-scrollbar">
          {comments.length === 0 ? (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
              <MessageCircle size={20} className="text-slate-500 mx-auto mb-1 opacity-50" />
              <p className="text-xs text-slate-400 font-medium">No community field notes yet.</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Be the first verified explorer to leave a tip!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <BeyondImage
                      src={c.author.avatarUrl || '/intro/assets/sarath_reddy_avatar.png'}
                      fallbackSrc="/intro/assets/sarath_reddy_avatar.png"
                      alt={c.author.name}
                      className="w-5 h-5 rounded-full object-cover border border-white/15"
                    />
                    <span className="text-xs font-bold text-slate-200">{c.author.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium">{c.createdAt}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-7">{c.text}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

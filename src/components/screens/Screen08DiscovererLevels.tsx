import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Compass, Star, Gem, Award, CheckCircle2 } from 'lucide-react';
import { AchievementTier, UserProfile, ScreenId } from '../../types';
import { api } from '../../services/api';

interface Screen08Props {
  onNavigate: (screen: ScreenId, params?: any) => void;
}

export const Screen08DiscovererLevels: React.FC<Screen08Props> = ({ onNavigate }) => {
  const [achievements, setAchievements] = useState<AchievementTier[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAchievements().then((data) => {
      setAchievements(data.achievements);
      setCurrentUser(data.currentUser);
      setTransactions(data.transactions);
      setLoading(false);
    });
  }, []);

  const getTierIcon = (level: number, color: string) => {
    switch (level) {
      case 1:
        return <Compass size={22} className="text-slate-300" />;
      case 2:
        return <Star size={22} className="text-[#00E599] fill-[#00E599]/30" />;
      case 3:
        return <Gem size={22} className="text-purple-400" />;
      case 4:
        return <Award size={22} className="text-amber-400" />;
      case 5:
        return <Shield size={22} className="text-sky-400" />;
      default:
        return <Star size={22} style={{ color }} />;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#080E18] text-white overflow-hidden p-4">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-3 pb-3 border-b border-[#142236]">
          <button
            onClick={() => onNavigate('screen_07_user_profile')}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-sm font-bold tracking-tight font-display text-white">
            Discoverer Levels
          </h1>
        </div>

        {/* Current Standing Banner */}
        {currentUser && (
          <div className="mt-3 p-3 bg-gradient-to-r from-[#00E599]/15 to-transparent border border-[#00E599]/30 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Current Rank
              </span>
              <div className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                <span className="text-[#00E599]">🛡️</span>
                <span>{currentUser.level}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#00E599]">{currentUser.xp} XP</span>
              <div className="text-[10px] text-slate-400">Total earned</div>
            </div>
          </div>
        )}

        {/* Level Tiers Cards */}
        <div className="mt-4 space-y-3 overflow-y-auto max-h-[460px] hide-scrollbar pr-0.5">
          {loading ? (
            <div className="py-20 flex justify-center text-slate-400 text-xs">
              <div className="w-5 h-5 border-2 border-[#00E599] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            achievements.map((tier) => {
              const isCurrent = currentUser?.level === tier.title;
              const isUnlocked = tier.status === 'unlocked';

              return (
                <div
                  key={tier.id}
                  className={`relative bg-[#0B1525] rounded-2xl p-3 border transition-all ${
                    isCurrent
                      ? 'border-[#00E599] shadow-lg shadow-[#00E599]/15'
                      : 'border-[#16253C]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Badge Emblem */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${tier.badgeColor}15`,
                        borderColor: `${tier.badgeColor}40`,
                      }}
                    >
                      {getTierIcon(tier.level, tier.badgeColor)}
                    </div>

                    {/* Tier Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-white font-display">
                          {tier.title}
                        </h3>
                        {isUnlocked && (
                          <div className="flex items-center gap-1 text-[10px] text-[#00E599] font-medium">
                            <CheckCircle2 size={12} />
                            <span>Unlocked</span>
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        {tier.description}
                      </p>

                      {/* XP Progress Bar */}
                      {tier.level < 5 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>Progress</span>
                            <span className="font-semibold text-slate-200">
                              {tier.currentXp} / {tier.requiredXp} XP
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#142338] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, (tier.currentXp / tier.requiredXp) * 100)}%`,
                                backgroundColor: tier.badgeColor,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {tier.level === 5 && (
                        <div className="mt-1 text-[10px] text-sky-400 font-medium">
                          Earned by consistent useful contributions
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Back Button */}
      <div className="pt-2">
        <button
          onClick={() => onNavigate('screen_07_user_profile')}
          className="w-full py-2.5 rounded-full bg-[#0F1C2E] border border-[#1A2D48] text-xs font-semibold text-slate-200 hover:bg-[#152740] transition-colors cursor-pointer text-center"
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
};

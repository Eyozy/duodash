import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAchievementStats } from '../../hooks/useAchievementStats';
import { AchievementIconMap, type AchievementIconType } from './AchievementIcons';
import { DuoColors, AchievementTiers } from '../../styles/duolingoColors';

interface Achievement {
  id: string;
  icon: AchievementIconType;
  name: string;
  description: string;
  threshold: number;
  unit: string;
  category: 'streak' | 'dailyXp' | 'totalDays' | 'totalXp';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

type TierKey = Achievement['tier'];

const ACHIEVEMENTS: Achievement[] = [
  { id: 'streak7', icon: 'flame', name: '初露锋芒', description: '连续学习 7 天', threshold: 7, unit: '天', category: 'streak', tier: 'bronze' },
  { id: 'streak30', icon: 'flame', name: '持之以恒', description: '连续学习 30 天', threshold: 30, unit: '天', category: 'streak', tier: 'silver' },
  { id: 'streak60', icon: 'star', name: '坚韧不拔', description: '连续学习 60 天', threshold: 60, unit: '天', category: 'streak', tier: 'gold' },
  { id: 'streak100', icon: 'boxer', name: '百日征程', description: '连续学习 100 天', threshold: 100, unit: '天', category: 'streak', tier: 'platinum' },
  { id: 'streak365', icon: 'calendar', name: '全年无休', description: '连续学习 365 天', threshold: 365, unit: '天', category: 'streak', tier: 'diamond' },
  { id: 'xp500', icon: 'bolt', name: '小试牛刀', description: '单日获得 500 XP', threshold: 500, unit: 'XP', category: 'dailyXp', tier: 'bronze' },
  { id: 'xp1000', icon: 'bolt', name: '势如破竹', description: '单日获得 1000 XP', threshold: 1000, unit: 'XP', category: 'dailyXp', tier: 'silver' },
  { id: 'xp2000', icon: 'rocket', name: '一日千里', description: '单日获得 2000 XP', threshold: 2000, unit: 'XP', category: 'dailyXp', tier: 'gold' },
  { id: 'xp5000', icon: 'crown', name: '登峰造极', description: '单日获得 5000 XP', threshold: 5000, unit: 'XP', category: 'dailyXp', tier: 'diamond' },
  { id: 'days50', icon: 'book', name: '学海泛舟', description: '累计学习 50 天', threshold: 50, unit: '天', category: 'totalDays', tier: 'bronze' },
  { id: 'days100', icon: 'book', name: '百日积累', description: '累计学习 100 天', threshold: 100, unit: '天', category: 'totalDays', tier: 'silver' },
  { id: 'days200', icon: 'duo', name: '学富五车', description: '累计学习 200 天', threshold: 200, unit: '天', category: 'totalDays', tier: 'gold' },
  { id: 'days365', icon: 'explorer', name: '一年之约', description: '累计学习 365 天', threshold: 365, unit: '天', category: 'totalDays', tier: 'platinum' },
  { id: 'totalXp10000', icon: 'medal', name: '万里长征', description: '累计获得 1 万 XP', threshold: 10000, unit: 'XP', category: 'totalXp', tier: 'bronze' },
  { id: 'totalXp50000', icon: 'medal', name: '五万大关', description: '累计获得 5 万 XP', threshold: 50000, unit: 'XP', category: 'totalXp', tier: 'silver' },
  { id: 'totalXp100000', icon: 'legend', name: '十万雄师', description: '累计获得 10 万 XP', threshold: 100000, unit: 'XP', category: 'totalXp', tier: 'gold' },
  { id: 'totalXp500000', icon: 'diamond', name: '语言大师', description: '累计获得 50 万 XP', threshold: 500000, unit: 'XP', category: 'totalXp', tier: 'diamond' },
];

const TIER_STYLES: Record<TierKey, { bg: string; bgLight: string; border: string; text: string; label: string }> = {
  bronze: { bg: AchievementTiers.bronze.primary, bgLight: AchievementTiers.bronze.bg, border: AchievementTiers.bronze.secondary, text: AchievementTiers.bronze.text, label: '青铜' },
  silver: { bg: AchievementTiers.silver.primary, bgLight: AchievementTiers.silver.bg, border: AchievementTiers.silver.secondary, text: AchievementTiers.silver.text, label: '白银' },
  gold: { bg: AchievementTiers.gold.primary, bgLight: AchievementTiers.gold.bg, border: AchievementTiers.gold.secondary, text: AchievementTiers.gold.text, label: '黄金' },
  platinum: { bg: AchievementTiers.platinum.primary, bgLight: AchievementTiers.platinum.bg, border: AchievementTiers.platinum.secondary, text: AchievementTiers.platinum.text, label: '铂金' },
  diamond: { bg: AchievementTiers.diamond.primary, bgLight: AchievementTiers.diamond.bg, border: AchievementTiers.diamond.secondary, text: AchievementTiers.diamond.text, label: '钻石' },
};

interface AchievementsSectionProps {
  data: { date: string; xp: number; time?: number }[];
}

function renderIcon(iconName: AchievementIconType, className?: string): React.ReactNode {
  const IconComponent = AchievementIconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
}

export function AchievementsSection({ data }: AchievementsSectionProps): React.ReactElement {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [displayedId, setDisplayedId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const achievementStats = useAchievementStats(data);

  const badgeStatus = useMemo(() => {
    return ACHIEVEMENTS.map(achievement => {
      let current = 0;
      let unlockedDate: string | null = null;

      switch (achievement.category) {
        case 'streak':
          current = achievementStats.maxStreak;
          unlockedDate = achievementStats.streakMilestones[achievement.threshold] || null;
          break;
        case 'dailyXp':
          current = achievementStats.maxDailyXp;
          unlockedDate = achievementStats.dailyXpMilestones[achievement.threshold] || null;
          break;
        case 'totalDays':
          current = achievementStats.totalDays;
          unlockedDate = achievementStats.totalDaysMilestones[achievement.threshold] || null;
          break;
        case 'totalXp':
          current = achievementStats.totalXp;
          unlockedDate = achievementStats.totalXpMilestones[achievement.threshold] || null;
          break;
      }

      const unlocked = current >= achievement.threshold;

      return {
        ...achievement,
        current,
        unlocked,
        progress: Math.min(current / achievement.threshold, 1),
        unlockedDate,
      };
    });
  }, [achievementStats]);

  const totalUnlocked = badgeStatus.filter(b => b.unlocked).length;
  const totalBadges = badgeStatus.length;
  const displayedBadge = displayedId ? badgeStatus.find(b => b.id === displayedId) : null;
  const isExpanded = selectedId !== null;

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (selectedId) {
      setDisplayedId(selectedId);
    } else {
      timeoutRef.current = setTimeout(() => setDisplayedId(null), 300);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [selectedId]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border-2 border-b-4 border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8">
              {renderIcon('trophy')}
            </div>
            <h2 className="text-lg font-bold text-gray-800">奖项</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* 当前连续天数 */}
            {achievementStats.currentStreak > 0 && (
              <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: DuoColors.foxOrange }}>
                <div className="w-5 h-5">{renderIcon('flame')}</div>
                <span>{achievementStats.currentStreak} 天</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">
                {totalUnlocked}/{totalBadges}
              </span>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(totalUnlocked / totalBadges) * 100}%`,
                    backgroundColor: DuoColors.featherGreen
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {badgeStatus.map((badge) => {
              const tierStyle = TIER_STYLES[badge.tier];
              const isSelected = selectedId === badge.id;

              return (
                <button
                  key={badge.id}
                  onClick={() => setSelectedId(isSelected ? null : badge.id)}
                  className="flex flex-col items-center gap-2 group focus:outline-none"
                >
                  <div
                    className={`
                      relative w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20
                      flex items-center justify-center transition-all duration-200
                      ${isSelected ? 'scale-110' : 'hover:scale-105'}
                    `}
                  >
                    <div
                      className={`w-full h-full ${badge.unlocked ? '' : 'opacity-30 grayscale'}`}
                    >
                      {renderIcon(badge.icon)}
                    </div>

                    {!badge.unlocked && (
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                        style={{ backgroundColor: '#AFAFAF' }}
                      >
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                        </svg>
                      </div>
                    )}

                    {badge.unlocked && (
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                        style={{ backgroundColor: DuoColors.featherGreen }}
                      >
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-xs font-medium text-center leading-tight ${badge.unlocked ? 'text-gray-700' : 'text-gray-400'}`}
                  >
                    {badge.name}
                  </span>

                  {!badge.unlocked && (
                    <span className="text-[10px] text-gray-400">
                      {Math.round(badge.progress * 100)}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`
            grid transition-all duration-300 ease-in-out border-t border-gray-100
            ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 border-t-0'}
          `}
        >
          <div className="overflow-hidden">
             {displayedBadge && (
              <div className="p-4 sm:p-5 bg-gray-50/80">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: displayedBadge.unlocked
                        ? TIER_STYLES[displayedBadge.tier].bgLight
                        : '#F5F5F5',
                      borderWidth: '3px',
                      borderStyle: 'solid',
                      borderColor: displayedBadge.unlocked
                        ? TIER_STYLES[displayedBadge.tier].border
                        : '#E5E5E5',
                    }}
                  >
                    <div className={`w-10 h-10 ${displayedBadge.unlocked ? '' : 'opacity-30 grayscale'}`}>
                      {renderIcon(displayedBadge.icon)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800">{displayedBadge.name}</h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: TIER_STYLES[displayedBadge.tier].bg }}
                      >
                        {TIER_STYLES[displayedBadge.tier].label}
                      </span>
                      {displayedBadge.unlocked && (
                        <span
                          className="text-xs font-medium flex items-center gap-0.5"
                          style={{ color: DuoColors.featherGreen }}
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                          已解锁
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{displayedBadge.description}</p>
                  </div>
                </div>

                <div className="sm:w-64 flex-shrink-0">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-500">进度</span>
                    <span className="font-medium text-gray-700">
                      {displayedBadge.current.toLocaleString()} / {displayedBadge.threshold.toLocaleString()} {displayedBadge.unit}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(displayedBadge.progress * 100, 100)}%`,
                        backgroundColor: displayedBadge.unlocked
                          ? DuoColors.featherGreen
                          : DuoColors.beeYellow
                      }}
                    />
                  </div>

                  {displayedBadge.unlocked && displayedBadge.unlockedDate && (
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <div className="w-4 h-4">{renderIcon('calendar')}</div>
                      <span>达成于 {displayedBadge.unlockedDate}</span>
                    </div>
                  )}

                  {!displayedBadge.unlocked && (
                    <div className="text-xs text-gray-400 mt-2">
                      还差 {(displayedBadge.threshold - displayedBadge.current).toLocaleString()} {displayedBadge.unit}
                    </div>
                  )}
                </div>
              </div>
            </div>
           )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsSection;

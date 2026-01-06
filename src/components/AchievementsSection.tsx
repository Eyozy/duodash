import React, { useState, useMemo } from 'react';
import { useAchievementStats } from '../hooks/useAchievementStats';

// Duolingo 风格的 SVG 图标组件
const AchievementIcons = {
  // 火焰 - 连续学习
  flame: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.52 1.17-4.83 3.15-6.37.94-.73 2.35-.39 2.85.69.24.52.17 1.12-.18 1.57-.63.81-1.01 1.79-1.01 2.86 0 2.48 2.02 4.5 4.5 4.5s4.5-2.02 4.5-4.5c0-1.07-.38-2.05-1.01-2.86-.35-.45-.42-1.05-.18-1.57.5-1.08 1.91-1.42 2.85-.69C20.83 10.17 22 12.48 22 15c0 4.42-4.03 8-10 8z"/>
      <path d="M12 2c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1s1-.45 1-1V3c0-.55-.45-1-1-1z"/>
      <path d="M8.5 7.5c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l2.12 2.12c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L8.5 7.5z"/>
      <path d="M15.5 7.5l-2.12 2.12c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l2.12-2.12c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0z"/>
    </svg>
  ),
  // 闪电 - 经验值
  bolt: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/>
    </svg>
  ),
  // 火箭 - 高成就
  rocket: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2.5c-2.18 0-4.24.85-5.78 2.4L4.1 7.02c-.34.34-.34.89 0 1.23l2.12 2.12c-.45.99-.71 2.09-.71 3.25 0 1.93.68 3.78 1.92 5.24l1.5-1.5c-.96-1.06-1.49-2.42-1.49-3.84 0-3.16 2.57-5.73 5.73-5.73s5.73 2.57 5.73 5.73c0 1.42-.53 2.78-1.49 3.84l1.5 1.5c1.24-1.46 1.92-3.31 1.92-5.24 0-1.16-.26-2.26-.71-3.25l2.12-2.12c.34-.34.34-.89 0-1.23l-2.12-2.12C16.24 3.35 14.18 2.5 12 2.5z"/>
      <circle cx="12" cy="13.5" r="2.5"/>
      <path d="M12 18v3.5"/>
    </svg>
  ),
  // 皇冠 - 顶级成就
  crown: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 3h14v2H5v-2z"/>
    </svg>
  ),
  // 书本 - 学习天数
  book: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M21 4H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1zM4 18V6h7v12H4zm16 0h-7V6h7v12z"/>
      <path d="M6 8h3v1H6V8zm0 2h3v1H6v-1zm0 2h3v1H6v-1zm8-4h3v1h-3V8zm0 2h3v1h-3v-1z"/>
    </svg>
  ),
  // 学士帽 - 学习里程碑
  graduate: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
    </svg>
  ),
  // 奖杯 - 累计成就
  trophy: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
    </svg>
  ),
  // 奖牌 - 铜/银/金
  medal: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2a3 3 0 00-3 3c0 1.09.59 2.05 1.47 2.57L9 14h6l-1.47-6.43A2.99 2.99 0 0015 5a3 3 0 00-3-3z"/>
      <circle cx="12" cy="17" r="5"/>
      <path d="M12 14.5l1.12 2.27 2.5.36-1.81 1.77.43 2.5L12 20.27l-2.24 1.18.43-2.5-1.81-1.77 2.5-.36L12 14.5z" fill="white" opacity="0.3"/>
    </svg>
  ),
  // 星星 - 特殊成就
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  // 彗星 - 坚韧不拔
  comet: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9z"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.45-.31-2.82-.86-4.06l-1.77 1.77c.39.88.63 1.85.63 2.89 0 3.87-3.13 7-7 7s-7-3.13-7-7 3.13-7 7-7c1.04 0 2.01.24 2.89.63l1.77-1.77C15.42 2.31 13.75 2 12 2z"/>
    </svg>
  ),
  // 日历 - 全年无休
  calendar: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
    </svg>
  ),
  // 目标 - 达成目标
  target: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  // 钻石
  diamond: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M19 3H5L2 9l10 12L22 9l-3-6zM9.62 8l1.5-3h1.76l1.5 3H9.62zM11 10v6.68L5.44 10H11zm2 0h5.56L13 16.68V10zm6.26-2h-2.65l-1.5-3h2.65l1.5 3zM6.24 5h2.65l-1.5 3H4.74l1.5-3z"/>
    </svg>
  ),
  // 图书馆/殿堂
  temple: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2L2 7v2h20V7L12 2zm0 2.5L18.5 7h-13L12 4.5zM4 10v7h2v-7H4zm5 0v7h2v-7H9zm5 0v7h2v-7h-2zm5 0v7h2v-7h-2zM2 19v2h20v-2H2z"/>
    </svg>
  ),
  // 爆炸/突破
  burst: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2l1.5 5.5L19 6l-1.5 5.5L23 12l-5.5 1.5L19 19l-5.5-1.5L12 23l-1.5-5.5L5 19l1.5-5.5L1 12l5.5-1.5L5 5l5.5 1.5L12 2z"/>
    </svg>
  ),
  // 无限/持续
  infinity: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 9.17 8.15C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53L12 13.34l2.83 2.51c.97.97 2.33 1.53 3.77 1.53 2.98 0 5.4-2.42 5.4-5.38s-2.42-5.38-5.4-5.38zm-13.2 8.5c-1.68 0-3.02-1.34-3.02-3s1.34-3 3.02-3c.8 0 1.58.32 2.14.88L10.66 12l-3.12 2.88c-.56.56-1.34.88-2.14.88zm13.2 0c-.8 0-1.58-.32-2.14-.88L13.34 12l3.12-2.88c.56-.56 1.34-.88 2.14-.88 1.68 0 3.02 1.34 3.02 3s-1.34 3-3.02 3z"/>
    </svg>
  ),
};

// 成就徽章配置
interface Achievement {
  id: string;
  icon: keyof typeof AchievementIcons;
  name: string;
  description: string;
  threshold: number;
  unit: string;
  category: 'streak' | 'dailyXp' | 'totalDays' | 'totalXp';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

// 按展示顺序排列的成就列表
const ACHIEVEMENTS: Achievement[] = [
  // 连续学习系列
  { id: 'streak7', icon: 'flame', name: '初露锋芒', description: '连续学习 7 天', threshold: 7, unit: '天', category: 'streak', tier: 'bronze' },
  { id: 'streak30', icon: 'flame', name: '持之以恒', description: '连续学习 30 天', threshold: 30, unit: '天', category: 'streak', tier: 'silver' },
  { id: 'streak60', icon: 'comet', name: '坚韧不拔', description: '连续学习 60 天', threshold: 60, unit: '天', category: 'streak', tier: 'gold' },
  { id: 'streak100', icon: 'star', name: '百日征程', description: '连续学习 100 天', threshold: 100, unit: '天', category: 'streak', tier: 'platinum' },
  { id: 'streak365', icon: 'calendar', name: '全年无休', description: '连续学习 365 天', threshold: 365, unit: '天', category: 'streak', tier: 'diamond' },
  // 单日 XP 系列
  { id: 'xp500', icon: 'bolt', name: '小试牛刀', description: '单日获得 500 XP', threshold: 500, unit: 'XP', category: 'dailyXp', tier: 'bronze' },
  { id: 'xp1000', icon: 'burst', name: '势如破竹', description: '单日获得 1000 XP', threshold: 1000, unit: 'XP', category: 'dailyXp', tier: 'silver' },
  { id: 'xp2000', icon: 'rocket', name: '一日千里', description: '单日获得 2000 XP', threshold: 2000, unit: 'XP', category: 'dailyXp', tier: 'gold' },
  { id: 'xp5000', icon: 'crown', name: '登峰造极', description: '单日获得 5000 XP', threshold: 5000, unit: 'XP', category: 'dailyXp', tier: 'diamond' },
  // 累计学习天数系列
  { id: 'days50', icon: 'book', name: '学海泛舟', description: '累计学习 50 天', threshold: 50, unit: '天', category: 'totalDays', tier: 'bronze' },
  { id: 'days100', icon: 'book', name: '百日积累', description: '累计学习 100 天', threshold: 100, unit: '天', category: 'totalDays', tier: 'silver' },
  { id: 'days200', icon: 'graduate', name: '学富五车', description: '累计学习 200 天', threshold: 200, unit: '天', category: 'totalDays', tier: 'gold' },
  { id: 'days365', icon: 'temple', name: '一年之约', description: '累计学习 365 天', threshold: 365, unit: '天', category: 'totalDays', tier: 'platinum' },
  // 累计 XP 系列
  { id: 'totalXp10000', icon: 'medal', name: '万里长征', description: '累计获得 1 万 XP', threshold: 10000, unit: 'XP', category: 'totalXp', tier: 'bronze' },
  { id: 'totalXp50000', icon: 'medal', name: '五万大关', description: '累计获得 5 万 XP', threshold: 50000, unit: 'XP', category: 'totalXp', tier: 'silver' },
  { id: 'totalXp100000', icon: 'medal', name: '十万雄师', description: '累计获得 10 万 XP', threshold: 100000, unit: 'XP', category: 'totalXp', tier: 'gold' },
  { id: 'totalXp500000', icon: 'trophy', name: '语言大师', description: '累计获得 50 万 XP', threshold: 500000, unit: 'XP', category: 'totalXp', tier: 'diamond' },
];

// 等级样式配置 - Duolingo 风格的纯色背景
const TIER_CONFIG = {
  bronze: {
    bg: 'bg-amber-600',
    bgHover: 'hover:bg-amber-500',
    shadow: 'shadow-amber-700/50',
    ring: 'ring-amber-400',
    label: '青铜',
    labelBg: 'bg-amber-700',
    iconColor: 'text-amber-100',
  },
  silver: {
    bg: 'bg-slate-400',
    bgHover: 'hover:bg-slate-300',
    shadow: 'shadow-slate-500/50',
    ring: 'ring-slate-300',
    label: '白银',
    labelBg: 'bg-slate-500',
    iconColor: 'text-slate-100',
  },
  gold: {
    bg: 'bg-yellow-500',
    bgHover: 'hover:bg-yellow-400',
    shadow: 'shadow-yellow-600/50',
    ring: 'ring-yellow-400',
    label: '黄金',
    labelBg: 'bg-yellow-600',
    iconColor: 'text-yellow-100',
  },
  platinum: {
    bg: 'bg-cyan-500',
    bgHover: 'hover:bg-cyan-400',
    shadow: 'shadow-cyan-600/50',
    ring: 'ring-cyan-300',
    label: '铂金',
    labelBg: 'bg-cyan-600',
    iconColor: 'text-cyan-100',
  },
  diamond: {
    bg: 'bg-purple-500',
    bgHover: 'hover:bg-purple-400',
    shadow: 'shadow-purple-600/50',
    ring: 'ring-purple-400',
    label: '钻石',
    labelBg: 'bg-purple-600',
    iconColor: 'text-purple-100',
  },
};

interface AchievementsSectionProps {
  data: { date: string; xp: number; time?: number }[];
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ data }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 使用共享 hook 计算成就统计数据
  const achievementStats = useAchievementStats(data);

  // 计算每个徽章的状态
  const badgeStatus = useMemo(() => {
    return ACHIEVEMENTS.map(achievement => {
      let current = 0;
      let unlocked = false;
      let unlockedDate: string | null = null;

      switch (achievement.category) {
        case 'streak':
          current = achievementStats.maxStreak;
          unlocked = current >= achievement.threshold;
          unlockedDate = achievementStats.streakMilestones[achievement.threshold] || null;
          break;
        case 'dailyXp':
          current = achievementStats.maxDailyXp;
          unlocked = current >= achievement.threshold;
          unlockedDate = achievementStats.dailyXpMilestones[achievement.threshold] || null;
          break;
        case 'totalDays':
          current = achievementStats.totalDays;
          unlocked = current >= achievement.threshold;
          unlockedDate = achievementStats.totalDaysMilestones[achievement.threshold] || null;
          break;
        case 'totalXp':
          current = achievementStats.totalXp;
          unlocked = current >= achievement.threshold;
          unlockedDate = achievementStats.totalXpMilestones[achievement.threshold] || null;
          break;
      }

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
  const selectedBadge = selectedId ? badgeStatus.find(b => b.id === selectedId) : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-b-4 border-gray-200 overflow-hidden">
      {/* 头部 */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#58cc02] rounded-lg flex items-center justify-center text-white">
            {AchievementIcons.trophy}
          </div>
          <h2 className="text-lg font-bold text-gray-800">成就殿堂</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* 当前连续天数 */}
          {achievementStats.currentStreak > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-bold text-orange-500">
              <div className="w-4 h-4">{AchievementIcons.flame}</div>
              <span>{achievementStats.currentStreak} 天</span>
            </div>
          )}

          {/* 解锁进度 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">
              {totalUnlocked}/{totalBadges}
            </span>
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#58cc02] rounded-full transition-all duration-500"
                style={{ width: `${(totalUnlocked / totalBadges) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 徽章网格 - 自适应填满 */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-3 sm:gap-4">
          {badgeStatus.map((badge) => {
            const tierStyle = TIER_CONFIG[badge.tier];
            const isSelected = selectedId === badge.id;

            return (
              <button
                key={badge.id}
                onClick={() => setSelectedId(isSelected ? null : badge.id)}
                className="flex flex-col items-center gap-1.5 group focus:outline-none"
              >
                {/* 徽章图标 - Duolingo 风格 */}
                <div
                  className={`
                    relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl
                    flex items-center justify-center transition-all duration-200
                    border-2 border-b-4
                    ${badge.unlocked
                      ? `${tierStyle.bg} ${tierStyle.bgHover} border-black/10 shadow-md ${tierStyle.shadow}`
                      : 'bg-gray-100 border-gray-200'
                    }
                    ${isSelected
                      ? `ring-2 ${tierStyle.ring} ring-offset-2 scale-105`
                      : 'hover:scale-105'
                    }
                  `}
                >
                  {/* 图标 */}
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${badge.unlocked ? tierStyle.iconColor : 'text-gray-300'}`}>
                    {AchievementIcons[badge.icon]}
                  </div>

                  {/* 未解锁锁定标识 */}
                  {!badge.unlocked && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* 名称 */}
                <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight truncate w-full ${badge.unlocked ? 'text-gray-700' : 'text-gray-400'}`}>
                  {badge.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 底部详情面板 */}
      <div
        className={`
          border-t border-gray-100 overflow-hidden transition-all duration-300 ease-out
          ${selectedBadge ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        {selectedBadge && (
          <div className="p-4 sm:p-5 bg-gray-50/80">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* 左侧：图标和基本信息 */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0
                    border-2 border-b-4 border-black/10
                    ${selectedBadge.unlocked
                      ? `${TIER_CONFIG[selectedBadge.tier].bg} shadow-md`
                      : 'bg-gray-200'
                    }
                  `}
                >
                  <div className={`w-8 h-8 ${selectedBadge.unlocked ? TIER_CONFIG[selectedBadge.tier].iconColor : 'text-gray-400'}`}>
                    {AchievementIcons[selectedBadge.icon]}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-800">{selectedBadge.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${TIER_CONFIG[selectedBadge.tier].labelBg}`}>
                      {TIER_CONFIG[selectedBadge.tier].label}
                    </span>
                    {selectedBadge.unlocked && (
                      <span className="text-xs text-[#58cc02] font-medium flex items-center gap-0.5">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                        已解锁
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedBadge.description}</p>
                </div>
              </div>

              {/* 右侧：进度信息 */}
              <div className="sm:w-64 flex-shrink-0">
                {/* 进度条 */}
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-gray-500">进度</span>
                  <span className="font-medium text-gray-700">
                    {selectedBadge.current.toLocaleString()} / {selectedBadge.threshold.toLocaleString()} {selectedBadge.unit}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedBadge.unlocked
                        ? 'bg-[#58cc02]'
                        : 'bg-[#ffc800]'
                    }`}
                    style={{ width: `${Math.min(selectedBadge.progress * 100, 100)}%` }}
                  />
                </div>

                {/* 达成日期 */}
                {selectedBadge.unlocked && selectedBadge.unlockedDate && (
                  <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <div className="w-3 h-3">{AchievementIcons.calendar}</div>
                    <span>达成于 {selectedBadge.unlockedDate}</span>
                  </div>
                )}

                {/* 未解锁时显示差距 */}
                {!selectedBadge.unlocked && (
                  <div className="text-xs text-gray-400 mt-2">
                    还差 {(selectedBadge.threshold - selectedBadge.current).toLocaleString()} {selectedBadge.unit}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsSection;

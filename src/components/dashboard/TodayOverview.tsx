import { memo } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { UserData } from '../../types';
import { SnowflakeIcon, TimeIcon } from '../icons';

interface TodayOverviewProps {
  userData: UserData | null;
}

function getTodayMinutes(userData: UserData | null): number | null {
  const lastEntry = userData?.dailyTimeHistory?.[userData.dailyTimeHistory.length - 1];
  if (!lastEntry || lastEntry.time <= 0) {
    return null;
  }
  return lastEntry.time;
}

export const TodayOverview = memo(function TodayOverview({ userData }: TodayOverviewProps): ReactElement {
  const todayMinutes = getTodayMinutes(userData);
  const todayTime = todayMinutes ?? '-';
  const stats = [
    { label: '今日 XP', value: userData ? (userData.xpToday ?? '-') : '—', accentClass: 'text-brand-500', dotClass: 'bg-brand-500' },
    { label: '今日课程', value: userData ? (userData.lessonsToday ?? '-') : '—', accentClass: 'text-blue-500', dotClass: 'bg-blue-500' },
    { label: '连胜天数', value: userData ? userData.streak : '—', accentClass: 'text-orange-500', dotClass: 'bg-orange-500' },
    { label: '学习分钟', value: todayTime, accentClass: 'text-purple-500', dotClass: 'bg-purple-500' },
  ];

  function renderTodayStatus(): ReactNode {
    if (!userData) {
      return <span className="flex items-center gap-1 text-xs text-neutral-500"><TimeIcon className="w-3.5 h-3.5" /> 今日还未学习</span>;
    }

    if (userData.streakExtendedToday && (!userData.xpToday || userData.xpToday === 0)) {
      return <span className="flex items-center gap-1 text-xs text-blue-500"><SnowflakeIcon className="w-3.5 h-3.5" /> 使用了连胜冻结卡</span>;
    }

    if (userData.xpToday && userData.xpToday > 0) return null;

    return <span className="flex items-center gap-1 text-xs text-neutral-500"><TimeIcon className="w-3.5 h-3.5" /> 今日还未学习</span>;
  }

  return (
    <div className="panel-card animate-fade-in-up">
      <div className="panel-header">
        <h2 className="panel-title">
          <span className="leading-none">今日概览</span>
        </h2>
        {renderTodayStatus()}
      </div>
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="panel-card-muted min-w-0 p-3 sm:p-4 text-center transition-colors hover:border-[#58cc02]">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-pill flex-shrink-0 ${stat.dotClass}`} />
                <span className="font-bold text-neutral-800 text-[10px] sm:text-xs md:text-sm">{stat.label}</span>
              </div>
              <div className={`text-xl sm:text-2xl font-black tabular-nums ${stat.accentClass}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

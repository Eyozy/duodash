import type { ReactElement } from 'react';
import type { UserData } from '../../types';
import { GemsIcon, LeagueIcon, StreakIcon, SuperIcon } from '../icons';

interface PageHeaderProps {
  userData: UserData | null;
  viewData: UserData;
}

function normalizeLeagueLabel(league: string): string {
  return league.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

export function PageHeader({ userData, viewData }: PageHeaderProps): ReactElement {
  const leagueLabel = normalizeLeagueLabel(viewData.league);

  return (
    <div className="mb-4 sm:mb-6 md:mb-8 animate-fade-in-up text-left">
      <h1 className="mb-2 break-words text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-neutral-800">学习数据概览</h1>
      <p className="text-xs sm:text-sm md:text-base text-neutral-500 mb-3 sm:mb-4">
        {userData ? (
          <>
            已加入多邻国 <span className="font-bold text-neutral-800">{viewData.accountAgeDays}</span> 天 · 当前重点：
            <span className="font-bold text-brand-500"> {viewData.learningLanguage}</span>
          </>
        ) : (
          <>正在加载你的学习数据…</>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {viewData.isPlus && (
          <span className="pill-badge border border-brand-100 bg-brand-50 text-brand-500 font-black shadow-sm text-[10px] sm:text-xs">
            <SuperIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Super
          </span>
        )}
        <span className="pill-badge border border-orange-100 bg-orange-50 text-orange-600 shadow-sm text-[10px] sm:text-xs">
          <StreakIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {userData ? viewData.streak : '—'} 天连胜
        </span>
        <span className="pill-badge border border-blue-100 bg-blue-50 text-blue-600 shadow-sm text-[10px] sm:text-xs">
          <GemsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {userData ? viewData.gems.toLocaleString() : '—'} 宝石
        </span>
        <span className="pill-badge border border-yellow-100 bg-yellow-50 text-yellow-700 shadow-sm text-[10px] sm:text-xs">
          <LeagueIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="truncate max-w-[100px] sm:max-w-[150px]" title={leagueLabel}>
            {leagueLabel}
          </span>
          {userData && viewData.leagueTier >= 0 && (
            <span className="text-[9px] sm:text-xs text-neutral-500 font-semibold">T{viewData.leagueTier + 1}</span>
          )}
        </span>
      </div>
    </div>
  );
}

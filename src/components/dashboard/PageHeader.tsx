import React from 'react';
import type { UserData } from '../../types';

interface PageHeaderProps {
  userData: UserData | null;
  viewData: UserData;
}

export function PageHeader({ userData, viewData }: PageHeaderProps): React.ReactElement {
  return (
    <div className="mb-10 animate-fade-in-up delay-1">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-2">学习数据概览</h1>
      <p className="text-base text-gray-600 mb-4">
        {userData ? (
          <>
            已加入多邻国 <span className="font-semibold text-gray-800">{viewData.accountAgeDays}</span> 天 · 当前重点：
            <span className="font-semibold text-[#58cc02]"> {viewData.learningLanguage}</span>
          </>
        ) : (
          <>正在加载你的学习数据…</>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {viewData.isPlus && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-sm">
            <span className="text-white text-base">👑</span>
            <span className="font-bold text-white text-sm">Super</span>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-red-500 text-base">🔥</span>
          <span className="font-bold text-gray-700 text-sm">{userData ? viewData.streak : '—'}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-blue-400 text-base">💎</span>
          <span className="font-bold text-gray-700 text-sm">{userData ? viewData.gems.toLocaleString() : '—'}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-yellow-500 text-base">🏆</span>
          <span className="font-bold text-gray-700 text-sm truncate max-w-[150px]" title={viewData.league}>
            {viewData.league}
          </span>
          {userData && viewData.leagueTier >= 0 && (
            <span className="text-xs text-gray-600 font-semibold">T{viewData.leagueTier + 1}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;

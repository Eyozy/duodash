import React, { useState } from 'react';
import type { Achievement } from '../types';

interface AchievementsProps {
  achievements: Achievement[];
}

export const AchievementsList: React.FC<AchievementsProps> = ({ achievements }) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  if (!achievements || achievements.length === 0) {
    return <div className="text-gray-400 text-sm">暂无成就数据。</div>;
  }

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('streak') || n.includes('wildfire')) return '🔥';
    if (n.includes('xp') || n.includes('sage')) return '⚡';
    if (n.includes('scholar')) return '🎓';
    if (n.includes('champion')) return '🏆';
    if (n.includes('friendly')) return '🤝';
    if (n.includes('weekend')) return '📅';
    if (n.includes('sharpshooter')) return '🎯';
    return '🎖️';
  };

  const renderIcon = (ach: Achievement, large = false) => {
    if (ach.icon) {
      const url = ach.icon.startsWith('//') ? `https:${ach.icon}` : ach.icon;
      const highResUrl = large ? url.replace('/medium/', '/large/') : url;
      return <img src={highResUrl} alt={ach.name} className="w-full h-full object-contain" />;
    }
    return <span>{getIcon(ach.name)}</span>;
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {achievements.map((ach, idx) => (
          <div key={idx} onClick={() => setSelectedAchievement(ach)}
            className="bg-gray-50 rounded-xl p-3 flex flex-col items-center text-center border border-gray-100 hover:shadow-md hover:border-yellow-400 cursor-pointer transition-all active:scale-95 group">
            <div className="w-12 h-12 mb-2 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              {renderIcon(ach)}
            </div>
            <h4 className="font-bold text-gray-700 text-xs mb-1 break-words w-full">{ach.name}</h4>
            <div className="flex gap-0.5 mb-1">
              {Array.from({ length: ach.totalStars || 1 }).map((_, i) => (
                <span key={i} className={`text-xs ${i < ach.stars ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedAchievement && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedAchievement(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-b from-yellow-100 to-white w-full absolute top-0 z-0"></div>
            <button onClick={() => setSelectedAchievement(null)} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 font-bold">✕</button>
            <div className="relative z-10 flex flex-col items-center pt-8 pb-8 px-6">
              <div className="w-32 h-32 mb-4 drop-shadow-lg flex items-center justify-center text-7xl bg-white rounded-full p-2 border-4 border-yellow-400">
                {renderIcon(selectedAchievement, true)}
              </div>
              <h2 className="text-2xl font-extrabold text-gray-700 mb-2">{selectedAchievement.name}</h2>
              <div className="flex gap-1 mb-2 text-xl">
                {Array.from({ length: selectedAchievement.totalStars || 1 }).map((_, i) => (
                  <span key={i} className={`${i < selectedAchievement.stars ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'}`}>★</span>
                ))}
              </div>
              <div className="w-full max-w-[120px] bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${(selectedAchievement.stars / (selectedAchievement.totalStars || 1)) * 100}%` }}></div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 w-full text-center border-2 border-gray-100">
                <p className="text-gray-600 font-semibold">{selectedAchievement.description || "暂无详细描述"}</p>
                <div className="mt-4 flex justify-between items-center text-xs text-gray-400 font-bold uppercase border-t border-gray-200 pt-2">
                  <span>星级进度</span>
                  <span className="text-yellow-500">{selectedAchievement.stars} / {selectedAchievement.totalStars}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

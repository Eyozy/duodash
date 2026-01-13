import React, { forwardRef } from 'react';

interface WeeklySummaryCardProps {
  daysLearned: number;
  totalXp: number;
  totalTime: string;
  dailyXp: number[];
  dateRange: string;
  isFutureFlags?: boolean[];
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export const WeeklySummaryCard = forwardRef<HTMLDivElement, WeeklySummaryCardProps>(
  ({ daysLearned, totalXp, totalTime, dailyXp, dateRange, isFutureFlags = [] }, ref) => {
    // 确保有数据，避免除以 0（只考虑非未来的数据）
    const pastXp = dailyXp.filter((_, i) => !isFutureFlags[i]);
    const maxXp = Math.max(...pastXp, 10); 

    return (
      <div
        ref={ref}
        className="relative w-full max-w-[320px] aspect-[4/5] mx-auto rounded-3xl overflow-hidden bg-green-500 p-6 flex flex-col justify-between"
      >
        {/* Decorative Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <svg width="100%" height="100%">
             <pattern id="dotPatternGreen" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
               <circle cx="2" cy="2" r="2" fill="currentColor" className="text-white"/>
             </pattern>
             <rect width="100%" height="100%" fill="url(#dotPatternGreen)" />
           </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex flex-col items-center gap-1 mb-2 shrink-0">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-xl text-xs font-bold text-white/90 border border-white/20">
                    {dateRange}
                </div>
            </div>

            {/* Main Stats - XP */}
            <div className="flex flex-col items-center mb-3 shrink-0">
                 <div className="transform hover:scale-105 transition-transform duration-300">
                    <svg className="w-8 h-8 mb-0.5 drop-shadow-sm text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L14.09 8.26L20.18 8.63L15.54 12.74L16.91 19.37L12 15.77L7.09 19.37L8.46 12.74L3.82 8.63L9.91 8.26L12 2Z" />
                    </svg>
                 </div>
                 <span className="text-4xl font-black text-white tracking-tight">{totalXp.toLocaleString()}</span>
                 <span className="text-xs font-bold text-green-100 uppercase tracking-widest">本周 XP</span>
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3 shrink-0">
                <div className="bg-white/10 rounded-xl p-2 flex flex-col items-center border border-white/10">
                    <span className="text-xl font-black text-white">{daysLearned}</span>
                    <span className="text-[9px] font-bold text-green-100 uppercase">天数</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2 flex flex-col items-center border border-white/10">
                    <span className="text-xl font-black text-white">{totalTime}</span>
                    <span className="text-[9px] font-bold text-green-100 uppercase">时长</span>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 flex flex-col justify-center w-full">
                <div className="flex items-end justify-between h-20 px-1 gap-2">
                    {dailyXp.map((xp, i) => {
                        const isFuture = isFutureFlags[i] ?? false;
                        const heightPercent = isFuture ? 0 : (xp === 0 ? 0 : Math.max(15, (xp / maxXp) * 100));
                        return (
                            <div key={i} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end group">
                                <div className="w-full relative flex items-end justify-center h-full">
                                   {/* Background bar */}
                                   <div className="absolute bottom-0 w-full max-w-[8px] h-full bg-black/10 rounded-full" />

                                   {/* Active bar or future placeholder */}
                                   {isFuture ? (
                                     <div className="w-full max-w-[8px] h-2 rounded-full z-10 bg-white/20 border border-dashed border-white/40" />
                                   ) : (
                                     <div
                                       style={{ height: xp > 0 ? `${heightPercent}%` : '8px' }}
                                       className={`w-full max-w-[8px] rounded-full z-10 transition-all duration-500 ${xp > 0 ? 'bg-white' : 'bg-white/20'}`}
                                     />
                                   )}
                                </div>
                                <span className={`text-[9px] font-bold uppercase ${isFuture ? 'text-green-200/50' : 'text-green-100'}`}>{WEEKDAYS[i]}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 shrink-0 pt-4 flex justify-center">
                <div className="flex items-center gap-2 text-white/80 font-bold text-sm">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    DuoDash
                </div>
            </div>
        </div>
      </div>
    );
  }
);

WeeklySummaryCard.displayName = 'WeeklySummaryCard';

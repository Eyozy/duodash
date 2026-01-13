import React, { forwardRef } from 'react';

interface MilestoneCardProps {
  type: 'streak' | 'xp';
  value: number;
  date?: string;
}

const CONFIG = {
  streak: {
    icon: (
      <svg className="w-24 h-24 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="none">
        <path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" fill="#FFC800" />
        <path d="M12 8C12 8 10 10 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10 12 8 12 8Z" fill="#FFF" fillOpacity="0.4" />
      </svg>
    ),
    label: '连续打卡',
    unit: '天',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-600',
    textColor: 'text-white',
    accentColor: 'text-yellow-200'
  },
  xp: {
    icon: (
      <svg className="w-24 h-24 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="none">
        <path d="M12 2L14.09 8.26L20.18 8.63L15.54 12.74L16.91 19.37L12 15.77L7.09 19.37L8.46 12.74L3.82 8.63L9.91 8.26L12 2Z" fill="#FFC800" />
      </svg>
    ),
    label: '总经验值',
    unit: 'XP',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-600',
    textColor: 'text-white',
    accentColor: 'text-blue-200'
  },
};

export const MilestoneCard = forwardRef<HTMLDivElement, MilestoneCardProps>(
  ({ type, value, date }, ref) => {
    const { icon, label, unit, bgColor, borderColor, textColor, accentColor } = CONFIG[type];
    const displayDate = date || new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' });
    const displayValue = value.toLocaleString();

    return (
      <div
        ref={ref}
        className={`relative w-full max-w-[320px] aspect-[4/5] mx-auto rounded-3xl overflow-hidden ${bgColor} p-6 flex flex-col items-center justify-between`}
      >
        {/* Decorative Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <svg width="100%" height="100%">
             <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
               <circle cx="2" cy="2" r="2" fill="currentColor" className="text-white"/>
             </pattern>
             <rect width="100%" height="100%" fill="url(#dotPattern)" />
           </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full flex flex-col items-center flex-1 justify-center gap-6">
           {/* Top Date Badge */}
           <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-xl text-sm font-bold text-white/90 border border-white/20">
             {displayDate}
           </div>

           {/* Icon & Value */}
           <div className="flex flex-col items-center gap-2">
             <div className="transform hover:scale-105 transition-transform duration-300">
               {icon}
             </div>
             <div className="flex flex-col items-center">
               <span className={`text-6xl font-black ${textColor} tracking-tight`}>
                 {displayValue}
               </span>
               <span className={`text-xl font-bold ${accentColor} uppercase tracking-wider`}>
                 {unit}
               </span>
             </div>
           </div>

           {/* Label */}
           <div className="bg-white rounded-2xl px-8 py-3">
             <span className={`text-lg font-bold ${type === 'streak' ? 'text-orange-500' : 'text-blue-500'}`}>
               {label}
             </span>
           </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-auto pt-4 opacity-80">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
             <span className="w-2 h-2 bg-green-400 rounded-full"></span>
             DuoDash
          </div>
        </div>
      </div>
    );
  }
);

MilestoneCard.displayName = 'MilestoneCard';

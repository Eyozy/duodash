import type React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
  subtext?: string;
  isSpecial?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, colorClass, subtext, isSpecial }) => {
  return (
    <div className={`rounded-2xl p-6 shadow-sm border-2 border-b-4 transition-all ${isSpecial ? 'bg-gradient-to-br from-indigo-900 to-slate-900 border-slate-800' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`${isSpecial ? 'text-indigo-200' : 'text-gray-500'} font-bold uppercase tracking-wider text-xs`}>{title}</h3>
        <div className={`${colorClass} p-2 rounded-full bg-opacity-20 text-xl`}>
          {icon}
        </div>
      </div>
      <div className="flex flex-col">
        <span className={`text-3xl font-extrabold ${isSpecial ? 'text-white' : colorClass.replace('bg-', 'text-')}`}>
          {value}
        </span>
        {subtext && <span className={`${isSpecial ? 'text-indigo-300' : 'text-gray-400'} text-xs mt-1 font-semibold`}>{subtext}</span>}
      </div>
    </div>
  );
};

import { memo } from 'react';
import type { ReactElement, ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  colorClass?: string;
  iconBgClass?: string;
}

export const StatCard = memo(function StatCard({
  icon,
  value,
  label,
  colorClass,
  iconBgClass = 'bg-neutral-100',
}: StatCardProps): ReactElement {
  return (
    <div className="panel-card animate-fade-in-up p-2.5 min-[400px]:p-3 sm:p-4 lg:p-5">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-pill flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shrink-0 ${iconBgClass}`}>
        {icon}
      </div>
      <div
        className={`text-base max-[425px]:text-sm max-[360px]:text-xs sm:text-xl lg:text-2xl font-black mb-1 tabular-nums ${colorClass ?? ''}`}
      >
        {value}
      </div>
      <div className="text-[9px] sm:text-[10px] lg:text-xs text-neutral-500 font-bold uppercase tracking-wide">{label}</div>
    </div>
  );
});

import React from 'react';
import {
  Award,
  BadgeCheck,
  Gem,
  ChartNoAxesCombined,
  ChartNoAxesColumnIncreasing,
  Coins,
  BookOpen,
  CalendarDays,
  Clock3,
  Crown,
  Download,
  Flame,
  Frown,
  Languages,
  LayoutGrid,
  LockKeyhole,
  MessageSquareQuote,
  Medal,
  RefreshCw,
  Share2,
  Snowflake,
  Trophy,
} from 'lucide-react';

interface IconProps {
  className?: string;
}

function SvgIcon({
  className = 'w-5 h-5',
  children,
  viewBox = '0 0 24 24',
}: IconProps & { children: React.ReactNode; viewBox?: string }): React.ReactElement {
  return (
    <svg viewBox={viewBox} fill="none" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function TotalXpIcon({ className = 'w-5 h-5' }: IconProps): React.ReactElement {
  return <Coins className={className} strokeWidth={2.2} />;
}

export function CourseIcon({ className = 'w-5 h-5' }: IconProps): React.ReactElement {
  return <BookOpen className={className} strokeWidth={2.2} />;
}

export function AccountAgeIcon({ className = 'w-5 h-5' }: IconProps): React.ReactElement {
  return <CalendarDays className={className} strokeWidth={2.2} />;
}

export function SuperIcon({ className = 'w-4 h-4' }: IconProps): React.ReactElement {
  return <Crown className={className} strokeWidth={2.2} />;
}

export function StreakIcon({ className = 'w-4 h-4' }: IconProps): React.ReactElement {
  return <Flame className={className} strokeWidth={2.2} />;
}

export function GemsIcon({ className = 'w-4 h-4' }: IconProps): React.ReactElement {
  return <Gem className={className} strokeWidth={2.2} />;
}

export function LeagueIcon({ className = 'w-4 h-4' }: IconProps): React.ReactElement {
  return <Trophy className={className} strokeWidth={2.2} />;
}

export function CoachIcon({ className = 'w-5 h-5' }: IconProps): React.ReactElement {
  return <MessageSquareQuote className={className} strokeWidth={2.2} />;
}

export function TimeIcon({ className = 'w-5 h-5' }: IconProps): React.ReactElement {
  return <Clock3 className={className} strokeWidth={2.2} />;
}

export function ShareIcon({ className = 'w-4 h-4' }: IconProps): React.ReactElement {
  return <Share2 className={className} strokeWidth={2.2} />;
}

export function RefreshIcon({ className = 'w-4 h-4' }: IconProps): React.ReactElement {
  return <RefreshCw className={className} strokeWidth={2.2} />;
}

export function SnowflakeIcon({ className = 'w-4 h-4' }: IconProps): React.ReactElement {
  return <Snowflake className={className} strokeWidth={2.2} />;
}

export function SadFaceIcon({ className = 'w-16 h-16' }: IconProps): React.ReactElement {
  return <Frown className={className} strokeWidth={1.8} />;
}

export function TrendIcon({ className = 'w-5 h-5' }: IconProps): React.ReactElement {
  return <ChartNoAxesCombined className={className} strokeWidth={2.2} />;
}

export function HeatmapIcon({ className = 'w-5 h-5' }: IconProps): React.ReactElement {
  return <LayoutGrid className={className} strokeWidth={2.2} />;
}

export function TrophyBadgeIcon({ className = 'w-5 h-5' }: IconProps): React.ReactElement {
  return <Award className={className} strokeWidth={2.2} />;
}

export function WeeklyReportIcon({ className = 'w-5 h-5' }: IconProps): React.ReactElement {
  return <ChartNoAxesColumnIncreasing className={className} strokeWidth={2.2} />;
}

export function DistributionIcon({ className = 'w-5 h-5' }: IconProps): React.ReactElement {
  return <Languages className={className} strokeWidth={2.2} />;
}

export function AwardCheckIcon({ className = 'w-4 h-4' }: IconProps): React.ReactElement {
  return <BadgeCheck className={className} strokeWidth={2.2} />;
}

export function AwardLockIcon({ className = 'w-4 h-4' }: IconProps): React.ReactElement {
  return <LockKeyhole className={className} strokeWidth={2.2} />;
}

export function JsonIcon({ className = 'w-5 h-5' }: IconProps): React.ReactElement {
  return (
    <SvgIcon className={className}>
      <path d="M9 4.5c-1.92 0-3 1.08-3 3v1.25c0 .9-.35 1.38-1 1.63.65.25 1 .73 1 1.62V13.25c0 1.92 1.08 3 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 4.5c1.92 0 3 1.08 3 3v1.25c0 .9.35 1.38 1 1.63-.65.25-1 .73-1 1.62V13.25c0 1.92-1.08 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10.5" r="1.2" fill="currentColor" />
    </SvgIcon>
  );
}

export function StreakCardIcon({ className = 'w-5 h-5' }: IconProps): React.ReactElement {
  return <Flame className={className} strokeWidth={2.2} />;
}

export function MilestoneXpIcon({ className = 'w-5 h-5' }: IconProps): React.ReactElement {
  return <Medal className={className} strokeWidth={2.2} />;
}

export function DownloadImageIcon({ className = 'w-5 h-5' }: IconProps): React.ReactElement {
  return <Download className={className} strokeWidth={2.2} />;
}

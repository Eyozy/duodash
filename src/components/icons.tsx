import type { ReactElement } from 'react';
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

export function TotalXpIcon({ className = 'w-5 h-5' }: IconProps): ReactElement {
  return <Coins className={className} strokeWidth={2.2} />;
}

export function CourseIcon({ className = 'w-5 h-5' }: IconProps): ReactElement {
  return <BookOpen className={className} strokeWidth={2.2} />;
}

export function AccountAgeIcon({ className = 'w-5 h-5' }: IconProps): ReactElement {
  return <CalendarDays className={className} strokeWidth={2.2} />;
}

export function SuperIcon({ className = 'w-4 h-4' }: IconProps): ReactElement {
  return <Crown className={className} strokeWidth={2.2} />;
}

export function StreakIcon({ className = 'w-4 h-4' }: IconProps): ReactElement {
  return <Flame className={className} strokeWidth={2.2} />;
}

export function GemsIcon({ className = 'w-4 h-4' }: IconProps): ReactElement {
  return <Gem className={className} strokeWidth={2.2} />;
}

export function LeagueIcon({ className = 'w-4 h-4' }: IconProps): ReactElement {
  return <Trophy className={className} strokeWidth={2.2} />;
}

export function CoachIcon({ className = 'w-5 h-5' }: IconProps): ReactElement {
  return <MessageSquareQuote className={className} strokeWidth={2.2} />;
}

export function TimeIcon({ className = 'w-5 h-5' }: IconProps): ReactElement {
  return <Clock3 className={className} strokeWidth={2.2} />;
}

export function ShareIcon({ className = 'w-4 h-4' }: IconProps): ReactElement {
  return <Share2 className={className} strokeWidth={2.2} />;
}

export function RefreshIcon({ className = 'w-4 h-4' }: IconProps): ReactElement {
  return <RefreshCw className={className} strokeWidth={2.2} />;
}

export function SnowflakeIcon({ className = 'w-4 h-4' }: IconProps): ReactElement {
  return <Snowflake className={className} strokeWidth={2.2} />;
}

export function SadFaceIcon({ className = 'w-16 h-16' }: IconProps): ReactElement {
  return <Frown className={className} strokeWidth={1.8} />;
}

export function TrendIcon({ className = 'w-5 h-5' }: IconProps): ReactElement {
  return <ChartNoAxesCombined className={className} strokeWidth={2.2} />;
}

export function HeatmapIcon({ className = 'w-5 h-5' }: IconProps): ReactElement {
  return <LayoutGrid className={className} strokeWidth={2.2} />;
}

export function TrophyBadgeIcon({ className = 'w-5 h-5' }: IconProps): ReactElement {
  return <Award className={className} strokeWidth={2.2} />;
}

export function WeeklyReportIcon({ className = 'w-5 h-5' }: IconProps): ReactElement {
  return <ChartNoAxesColumnIncreasing className={className} strokeWidth={2.2} />;
}

export function DistributionIcon({ className = 'w-5 h-5' }: IconProps): ReactElement {
  return <Languages className={className} strokeWidth={2.2} />;
}

export function AwardCheckIcon({ className = 'w-4 h-4' }: IconProps): ReactElement {
  return <BadgeCheck className={className} strokeWidth={2.2} />;
}

export function AwardLockIcon({ className = 'w-4 h-4' }: IconProps): ReactElement {
  return <LockKeyhole className={className} strokeWidth={2.2} />;
}

export function StreakCardIcon({ className = 'w-5 h-5' }: IconProps): ReactElement {
  return <Flame className={className} strokeWidth={2.2} />;
}

export function MilestoneXpIcon({ className = 'w-5 h-5' }: IconProps): ReactElement {
  return <Medal className={className} strokeWidth={2.2} />;
}

export function DownloadImageIcon({ className = 'w-5 h-5' }: IconProps): ReactElement {
  return <Download className={className} strokeWidth={2.2} />;
}

import type { FC } from 'react';
import { Flame, Zap, Bird, Dumbbell, Calendar, Rocket, Crown, Star, Gem, Medal, BookOpen, Map, Award } from 'lucide-react';

interface IconProps {
  className?: string;
}

const GOLD = '#FFC800';
const COLORS = {
  flame: '#FF9600',
  bolt: GOLD,
  bird: '#58CC02',
  boxer: '#FF4B4B',
  calendar: '#CE82FF',
  rocket: '#1CB0F6',
  crown: GOLD,
  star: GOLD,
  diamond: '#CE82FF',
  medal: GOLD,
  book: '#1CB0F6',
  explorer: '#FF9600',
  legend: GOLD,
};

const FlameIcon: FC<IconProps> = ({ className = "w-full h-full" }) => (
  <Flame className={className} strokeWidth={1.5} fill={COLORS.flame} stroke={COLORS.flame} />
);

const BoltBirdIcon: FC<IconProps> = ({ className = "w-full h-full" }) => (
  <Zap className={className} strokeWidth={1.5} fill={COLORS.bolt} stroke={COLORS.bolt} />
);

const DuoOwlIcon: FC<IconProps> = ({ className = "w-full h-full" }) => (
  <Bird className={className} strokeWidth={1.5} fill={COLORS.bird} stroke={COLORS.bird} />
);

const BoxerIcon: FC<IconProps> = ({ className = "w-full h-full" }) => (
  <Dumbbell className={className} strokeWidth={1.5} fill={COLORS.boxer} stroke={COLORS.boxer} />
);

const CalendarIcon: FC<IconProps> = ({ className = "w-full h-full" }) => (
  <Calendar className={className} strokeWidth={1.5} fill={COLORS.calendar} stroke={COLORS.calendar} />
);

const RocketIcon: FC<IconProps> = ({ className = "w-full h-full" }) => (
  <Rocket className={className} strokeWidth={1.5} fill={COLORS.rocket} stroke={COLORS.rocket} />
);

const CrownIcon: FC<IconProps> = ({ className = "w-full h-full" }) => (
  <Crown className={className} strokeWidth={1.5} fill={COLORS.crown} stroke={COLORS.crown} />
);

const StarIcon: FC<IconProps> = ({ className = "w-full h-full" }) => (
  <Star className={className} strokeWidth={1.5} fill={COLORS.star} stroke={COLORS.star} />
);

const DiamondIcon: FC<IconProps> = ({ className = "w-full h-full" }) => (
  <Gem className={className} strokeWidth={1.5} fill={COLORS.diamond} stroke={COLORS.diamond} />
);

const MedalIcon: FC<IconProps> = ({ className = "w-full h-full" }) => (
  <Medal className={className} strokeWidth={1.5} fill={COLORS.medal} stroke={COLORS.medal} />
);

const BookIcon: FC<IconProps> = ({ className = "w-full h-full" }) => (
  <BookOpen className={className} strokeWidth={1.5} fill={COLORS.book} stroke={COLORS.book} />
);

const ExplorerIcon: FC<IconProps> = ({ className = "w-full h-full" }) => (
  <Map className={className} strokeWidth={1.5} fill={COLORS.explorer} stroke={COLORS.explorer} />
);

const LegendIcon: FC<IconProps> = ({ className = "w-full h-full" }) => (
  <Award className={className} strokeWidth={1.5} fill={COLORS.legend} stroke={COLORS.legend} />
);

export const AchievementIconMap = {
  flame: FlameIcon,
  bolt: BoltBirdIcon,
  duo: DuoOwlIcon,
  boxer: BoxerIcon,
  explorer: ExplorerIcon,
  legend: LegendIcon,
  crown: CrownIcon,
  calendar: CalendarIcon,
  rocket: RocketIcon,
  star: StarIcon,
  diamond: DiamondIcon,
  medal: MedalIcon,
  book: BookIcon,
} as const;

export type AchievementIconType = keyof typeof AchievementIconMap;

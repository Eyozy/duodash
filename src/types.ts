export interface Course {
  title: string;
  xp: number;
  fromLanguage: string;
  learningLanguage: string;
  crowns: number;
  id: string;
}

export interface DailyStats {
  date: string;
  xp: number;
  time: number; // 学习时间（分钟）
}

export interface UserData {
  streak: number;
  totalXp: number;
  gems: number;
  league: string;
  leagueTier: number;
  courses: Course[];
  dailyXpHistory: { date: string; xp: number }[];
  dailyTimeHistory?: { date: string; time: number }[];
  yearlyXpHistory?: { date: string; xp: number; time?: number }[];
  weeklyXpHistory?: { date: string; xp: number; isFuture: boolean }[];
  weeklyTimeHistory?: { date: string; time: number; isFuture: boolean }[];
  learningLanguage: string;
  creationDate: string;
  accountAgeDays: number;
  isPlus: boolean;
  dailyGoal: number;

  estimatedLearningTime: string;
  // 今日数据
  xpToday?: number;
  lessonsToday?: number;
  streakExtendedToday?: boolean;
  streakExtendedTime?: string;
  // 统计数据
  numSessionsCompleted?: number;
  streakFreezeCount?: number;
  weeklyXp?: number;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type AiProvider = 'gemini' | 'openrouter' | 'deepseek' | 'siliconflow' | 'moonshot' | 'custom';

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface DuolingoCalendarEvent {
  datetime: number;
  improvement: number;
  event_type?: string;
}

/** API 返回的原始课程数据，与 Course 结构相同 */
export type DuolingoRawCourse = Course;

export interface DuolingoLanguageDataDetail {
  points: number;
  crowns?: number;
  language_string: string;
  level: number;
  streak?: number;
  learning_language?: string;
  from_language?: string;
  current_learning?: boolean;
}

// V1 API language entry
export interface DuolingoLanguage {
  language: string;
  language_string: string;
  points: number;
  crowns?: number;
  current_learning?: boolean;
}

// Tracking properties from API
export interface DuolingoTrackingProperties {
  gems?: number;
  league_tier?: number;
  leaderboard_league?: number;
  user_id?: number;
}

// Inventory data
export interface DuolingoInventory {
  premium_subscription?: boolean;
  super_subscription?: boolean;
}

// Streak data
export interface DuolingoStreakData {
  currentStreak?: {
    startDate?: string;
    endDate?: string;
    lastExtendedDate?: string;
  };
}

// XP gain event
export interface DuolingoXpGain {
  time: number;
  xp: number;
  skillId?: string;
  eventType?: string;
}

// XP summary from xp_summaries API
export interface DuolingoXpSummary {
  date: number | string;
  numSessions?: number;
  gainedXp?: number;
  gained_xp?: number;
  frozen?: boolean;
  streakExtended?: boolean;
  totalSessionTime?: number;
  total_session_time?: number;
}

export interface DuolingoRawUser {
  username: string;
  name?: string;
  fullname?: string;
  picture?: string;
  avatar?: string;
  streak: number;
  site_streak?: number;
  totalXp?: number;
  total_xp?: number;
  gems?: number;
  lingots?: number;
  rupees?: number;
  tier?: number;
  courses?: DuolingoRawCourse[];
  language_data?: { [key: string]: DuolingoLanguageDataDetail };
  currentCourse?: DuolingoRawCourse;
  calendar?: DuolingoCalendarEvent[];
  creationDate?: number;
  created?: string;
  creation_date?: number;
  hasPlus?: boolean;
  hasSuper?: boolean;
  plusStatus?: string;
  dailyGoal?: number;
  daily_goal?: number;
  // Extended fields from various API versions
  id?: number;
  user_id?: number;
  xpGoal?: number;
  gemsTotalCount?: number;
  totalGems?: number;
  has_plus?: boolean;
  is_plus?: boolean;
  xp_today?: number;
  streak_extended_today?: boolean;
  streakExtendedToday?: boolean;
  numSessionsCompleted?: number;
  streakFreezeCount?: number;
  weeklyXp?: number;
  languages?: DuolingoLanguage[];
  tracking_properties?: DuolingoTrackingProperties;
  trackingProperties?: DuolingoTrackingProperties;
  inventory?: DuolingoInventory;
  has_item_premium_subscription?: boolean;
  has_item_immersive_subscription?: boolean;
  streakData?: DuolingoStreakData;
  xpGains?: DuolingoXpGain[];
  _xpSummaries?: DuolingoXpSummary[];
  _leaderboardHistory?: unknown;
}

// XP Summary from API
export interface XpSummary {
  date: string;
  numSessions: number;
  gainedXp: number;
  frozen: boolean;
  streakExtended: boolean;
  totalSessionTime: number;
}

/** 标准化的 XP 获取事件，与 DuolingoXpGain 结构相同 */
export type XpGain = DuolingoXpGain;

// Cache entry for API responses
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Tooltip props for charts
export interface TooltipPayload {
  payload: {
    title: string;
    xp: number;
    [key: string]: unknown;
  };
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

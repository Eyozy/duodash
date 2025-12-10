export interface Course {
  title: string;
  xp: number;
  fromLanguage: string;
  learningLanguage: string;
  crowns: number;
  id: string;
}

export interface Skill {
  name: string;
  strength: number;
  learned: boolean;
  mastered: boolean;
}

export interface Certificate {
  language: string;
  score: number;
  date: string;
}

export interface InventoryItem {
  name: string;
  quantity: number;
}

export interface FriendRanking {
  displayName: string;
  xp: number;
  rank: number;
}

export interface Achievement {
  name: string;
  stars: number;
  totalStars: number;
  description: string;
  icon?: string;
}

export interface NextLesson {
  skillTitle: string;
  skillUrl: string;
  lessonNumber: number;
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
  learningLanguage: string;
  creationDate: string;
  accountAgeDays: number;
  isPlus: boolean;
  dailyGoal: number;
  achievements: Achievement[];
  estimatedLearningTime: string;
  // 今日数据
  xpToday?: number;
  lessonsToday?: number;
  streakExtendedToday?: boolean;
  streakExtendedTime?: string;
  // 统计数据
  numSessionsCompleted?: number; // 完成课程数
  streakFreezeCount?: number; // 连胜冻结卡数量
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

export interface DuolingoRawCourse {
  title: string;
  xp: number;
  fromLanguage: string;
  learningLanguage: string;
  crowns: number;
  id: string;
}

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

export interface DuolingoRawAchievement {
  name: string;
  stars: number;
  totalStars: number;
  description: string;
  imageUrl?: string;
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
  achievements?: DuolingoRawAchievement[];
}

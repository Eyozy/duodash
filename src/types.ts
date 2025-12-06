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
  username: string;
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
  username: string;
  fullname: string;
  avatarUrl: string;
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
  // 新增字段
  fluencyScore?: number;
  currentLevel?: number;
  levelProgress?: number;
  levelPercent?: number;
  levelLeft?: number;
  languageStrength?: number;
  skills?: Skill[];
  numSkillsLearned?: number;
  knownWords?: number;
  xpToday?: number;
  lessonsToday?: number;
  sessionTime?: number;
  friendsRanking?: FriendRanking[];
  inventory?: InventoryItem[];
  certificates?: Certificate[];
  nextLesson?: NextLesson;
  streakExtendedToday?: boolean;
  streakExtendedTime?: string;
  // 排行榜和成就
  podiumFinishes?: number; // 前 3 名次数
  monthlyXp?: number; // 本月 XP
  weeklyXp?: number; // 本周 XP
  lingots?: number; // 宝石（旧版）
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

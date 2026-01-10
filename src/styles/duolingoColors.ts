/**
 * 多邻国官方设计系统配色
 * 参考：https://design.duolingo.com
 */

export const DuoColors = {
  // 主色调
  featherGreen: '#58CC02',
  maskGreen: '#89E219',

  // 功能色
  cardinalRed: '#FF4B4B',
  beeYellow: '#FFC800',
  foxOrange: '#FF9600',
  macawBlue: '#1CB0F6',

  // 扩展色板
  beetroot: '#CE82FF',
  arcticBlue: '#2B70C9',

  // 中性色
  eelBlack: '#4B4B4B',
  humpback: '#777777',
  swan: '#AFAFAF',
  polar: '#E5E5E5',
  snow: '#F7F7F7',
  white: '#FFFFFF',

  // 深色背景
  owlPurple: '#235390',
} as const;

export const AchievementTiers = {
  bronze: { primary: '#CD7F32', secondary: '#B8723A', bg: '#FFF5EB', text: '#8B5A2B' },
  silver: { primary: '#C0C0C0', secondary: '#A8A8A8', bg: '#F5F5F5', text: '#6B6B6B' },
  gold: { primary: '#FFC800', secondary: '#E5B400', bg: '#FFFBEB', text: '#B8860B' },
  platinum: { primary: '#1CB0F6', secondary: '#1899D6', bg: '#EBF8FF', text: '#0C7BB3' },
  diamond: { primary: '#CE82FF', secondary: '#B35FE0', bg: '#F9F0FF', text: '#8B4FC7' },
} as const;

export const AchievementCategories = {
  streak: { color: '#FF9600', bgColor: '#FFF3E0', icon: 'flame' },
  dailyXp: { color: '#FFC800', bgColor: '#FFFDE7', icon: 'bolt' },
  totalDays: { color: '#58CC02', bgColor: '#E8F5E9', icon: 'calendar' },
  totalXp: { color: '#1CB0F6', bgColor: '#E3F2FD', icon: 'trophy' },
} as const;

export const ChartColors = {
  xp: { primary: '#58CC02', gradient: ['#58CC02', '#89E219'] },
  time: { primary: '#1CB0F6', gradient: ['#1CB0F6', '#7DD3FC'] },
  heatmap: { empty: '#EBEDF0', levels: ['#9BE9A8', '#40C463', '#30A14E', '#216E39'] },
} as const;

export const StatCardColors = {
  totalXp: '#FFC800',
  accountAge: '#1CB0F6',
  courses: '#58CC02',
  learningTime: '#CE82FF',
  streak: '#FF9600',
  gems: '#1CB0F6',
} as const;

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

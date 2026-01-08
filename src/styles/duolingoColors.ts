/**
 * 多邻国官方设计系统配色
 * 参考：https://design.duolingo.com
 */

// 核心品牌色
export const DuoColors = {
  // 主色调
  featherGreen: '#58CC02',    // 主品牌绿色 - 按钮、成功状态
  maskGreen: '#89E219',       // 辅助绿色 - 高亮、渐变

  // 功能色
  cardinalRed: '#FF4B4B',     // 错误、心形、警告
  beeYellow: '#FFC800',       // 经验值、奖励、进度
  foxOrange: '#FF9600',       // 连续天数、次要警告
  macawBlue: '#1CB0F6',       // 链接、信息、交互元素

  // 扩展色板
  beetroot: '#CE82FF',        // 紫色 - 特殊成就、钻石等级
  arcticBlue: '#2B70C9',      // 深蓝色 - 背景

  // 中性色
  eelBlack: '#4B4B4B',        // 主要文字
  humpback: '#777777',        // 次要文字
  swan: '#AFAFAF',            // 禁用状态
  polar: '#E5E5E5',           // 边框
  snow: '#F7F7F7',            // 页面背景
  white: '#FFFFFF',           // 卡片背景

  // 深色背景
  owlPurple: '#235390',       // 登录页/加载页背景
} as const;

// 成就等级配色 - 基于多邻国官方风格
export const AchievementTiers = {
  bronze: {
    primary: '#CD7F32',       // 青铜主色
    secondary: '#B8723A',     // 青铜深色
    bg: '#FFF5EB',            // 青铜浅背景
    text: '#8B5A2B',          // 青铜文字
  },
  silver: {
    primary: '#C0C0C0',       // 白银主色
    secondary: '#A8A8A8',     // 白银深色
    bg: '#F5F5F5',            // 白银浅背景
    text: '#6B6B6B',          // 白银文字
  },
  gold: {
    primary: '#FFC800',       // 黄金主色 (多邻国官方)
    secondary: '#E5B400',     // 黄金深色
    bg: '#FFFBEB',            // 黄金浅背景
    text: '#B8860B',          // 黄金文字
  },
  platinum: {
    primary: '#1CB0F6',       // 铂金主色 (多邻国蓝)
    secondary: '#1899D6',     // 铂金深色
    bg: '#EBF8FF',            // 铂金浅背景
    text: '#0C7BB3',          // 铂金文字
  },
  diamond: {
    primary: '#CE82FF',       // 钻石主色 (多邻国紫)
    secondary: '#B35FE0',     // 钻石深色
    bg: '#F9F0FF',            // 钻石浅背景
    text: '#8B4FC7',          // 钻石文字
  },
} as const;

// 成就类别配色
export const AchievementCategories = {
  streak: {
    color: '#FF9600',         // 橙色 - 连续天数
    bgColor: '#FFF3E0',
    icon: 'flame',
  },
  dailyXp: {
    color: '#FFC800',         // 黄色 - 单日经验
    bgColor: '#FFFDE7',
    icon: 'bolt',
  },
  totalDays: {
    color: '#58CC02',         // 绿色 - 累计天数
    bgColor: '#E8F5E9',
    icon: 'calendar',
  },
  totalXp: {
    color: '#1CB0F6',         // 蓝色 - 累计经验
    bgColor: '#E3F2FD',
    icon: 'trophy',
  },
} as const;

// 图表配色
export const ChartColors = {
  xp: {
    primary: '#58CC02',
    gradient: ['#58CC02', '#89E219'],
  },
  time: {
    primary: '#1CB0F6',
    gradient: ['#1CB0F6', '#7DD3FC'],
  },
  heatmap: {
    empty: '#EBEDF0',
    levels: ['#9BE9A8', '#40C463', '#30A14E', '#216E39'],
  },
} as const;

// 统计卡片图标配色
export const StatCardColors = {
  totalXp: '#FFC800',         // 经验值 - 金黄色
  accountAge: '#1CB0F6',      // 注册天数 - 蓝色
  courses: '#58CC02',         // 课程数 - 绿色
  learningTime: '#CE82FF',    // 学习时间 - 紫色
  streak: '#FF9600',          // 连续天数 - 橙色
  gems: '#1CB0F6',            // 宝石 - 蓝色
} as const;

export default DuoColors;

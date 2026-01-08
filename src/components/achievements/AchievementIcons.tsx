import React from 'react';

/** 多邻国官方风格成就图标组件 */

interface IconProps {
  className?: string;
}

// 多邻国官方配色方案
const C = {
  // 主品牌色
  green: '#58CC02',
  greenShadow: '#46A302',
  greenLight: '#89E219',
  greenDark: '#2B8700',

  // 功能色
  blue: '#1CB0F6',
  blueShadow: '#1899D6',
  blueLight: '#84D8FF',

  orange: '#FF9600',
  orangeShadow: '#D67D00',
  orangeLight: '#FFB84D',

  yellow: '#FFC800',
  yellowShadow: '#E5A000',
  yellowLight: '#FFE066',

  red: '#FF4B4B',
  redShadow: '#D43232',
  redLight: '#FF7A7A',

  purple: '#CE82FF',
  purpleShadow: '#A568CC',
  purpleLight: '#E0B3FF',

  pink: '#FF86D0',
  pinkShadow: '#CC6BA6',

  // 中性色
  black: '#3C3C3C',
  white: '#FFFFFF',
  grey: '#E5E5E5',
  greyDark: '#AFAFAF',

  // 角色肤色
  skinLight: '#FFEFC7',
  skinMedium: '#E6D5C3',
  skinDark: '#C4A484',
  skinPink: '#FFD4D4',
};

// ==================== 成就图标 ====================

// 🔥 火焰图标 - Duo 风格火焰角色
// 参考多邻国的火焰吉祥物，圆润可爱
export const FlameIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 阴影层 */}
    <ellipse cx="50" cy="58" rx="28" ry="32" fill={C.orangeShadow} transform="translate(0, 3)"/>
    {/* 外层火焰 - 橙色圆润身体 */}
    <ellipse cx="50" cy="55" rx="28" ry="32" fill={C.orange}/>
    {/* 火焰顶部尖角 */}
    <path d="M50 8 C42 20 38 32 38 40 C38 50 44 55 50 55 C56 55 62 50 62 40 C62 32 58 20 50 8 Z" fill={C.orange}/>
    <path d="M50 8 C42 20 38 32 38 40 C38 50 44 55 50 55 C56 55 62 50 62 40 C62 32 58 20 50 8 Z" fill={C.orangeShadow} transform="translate(0, 3)"/>
    {/* 内层火焰 - 黄色 */}
    <ellipse cx="50" cy="58" rx="20" ry="24" fill={C.yellow}/>
    <path d="M50 22 C45 30 42 38 42 45 C42 52 46 55 50 55 C54 55 58 52 58 45 C58 38 55 30 50 22 Z" fill={C.yellow}/>
    {/* 眼睛 - 大豆豆眼 */}
    <ellipse cx="41" cy="52" rx="7" ry="8" fill={C.white}/>
    <ellipse cx="59" cy="52" rx="7" ry="8" fill={C.white}/>
    <circle cx="43" cy="54" r="4.5" fill={C.black}/>
    <circle cx="61" cy="54" r="4.5" fill={C.black}/>
    {/* 高光 */}
    <circle cx="44.5" cy="52" r="2" fill={C.white}/>
    <circle cx="62.5" cy="52" r="2" fill={C.white}/>
    {/* 微笑嘴巴 */}
    <path d="M44 68 Q50 74 56 68" stroke={C.orangeShadow} strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* 腮红 */}
    <ellipse cx="32" cy="60" rx="5" ry="3" fill={C.red} opacity="0.3"/>
    <ellipse cx="68" cy="60" rx="5" ry="3" fill={C.red} opacity="0.3"/>
  </svg>
);

// ⚡ 闪电小鸟 - Bea 蜜蜂风格
// 黄色圆润身体配闪电翅膀
export const BoltBirdIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 阴影层 */}
    <ellipse cx="50" cy="55" rx="30" ry="32" fill={C.yellowShadow} transform="translate(0, 3)"/>
    {/* 身体 - 黄色圆润 */}
    <ellipse cx="50" cy="52" rx="30" ry="32" fill={C.yellow}/>
    {/* 闪电翅膀左 */}
    <path d="M18 35 L10 55 L20 50 L8 75 L28 48 L18 52 Z" fill={C.orange}/>
    {/* 闪电翅膀右 */}
    <path d="M82 35 L90 55 L80 50 L92 75 L72 48 L82 52 Z" fill={C.orange}/>
    {/* 条纹 - 蜜蜂风格 */}
    <ellipse cx="50" cy="70" rx="22" ry="10" fill={C.black} opacity="0.15"/>
    {/* 眼睛 - 大豆豆眼 */}
    <ellipse cx="38" cy="48" rx="9" ry="10" fill={C.white}/>
    <ellipse cx="62" cy="48" rx="9" ry="10" fill={C.white}/>
    <circle cx="40" cy="50" r="5" fill={C.black}/>
    <circle cx="64" cy="50" r="5" fill={C.black}/>
    {/* 高光 */}
    <circle cx="42" cy="48" r="2.5" fill={C.white}/>
    <circle cx="66" cy="48" r="2.5" fill={C.white}/>
    {/* 嘴巴 - 橙色小嘴 */}
    <ellipse cx="50" cy="64" rx="6" ry="4" fill={C.orange}/>
    <path d="M47 63 Q50 66 53 63" stroke={C.orangeShadow} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* 触角/头顶装饰 */}
    <circle cx="42" cy="22" r="4" fill={C.orange}/>
    <circle cx="58" cy="22" r="4" fill={C.orange}/>
    <line x1="42" y1="26" x2="44" y2="36" stroke={C.black} strokeWidth="2"/>
    <line x1="58" y1="26" x2="56" y2="36" stroke={C.black} strokeWidth="2"/>
  </svg>
);

// 🦉 Duo 猫头鹰 - 多邻国经典吉祥物
export const DuoOwlIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 阴影层 */}
    <ellipse cx="50" cy="55" rx="38" ry="40" fill={C.greenShadow} transform="translate(0, 3)"/>
    {/* 主体 - 绿色圆润身体 */}
    <ellipse cx="50" cy="52" rx="38" ry="40" fill={C.green}/>
    {/* 耳朵尖角 */}
    <path d="M18 30 Q12 15 22 20 L28 32 Z" fill={C.green}/>
    <path d="M82 30 Q88 15 78 20 L72 32 Z" fill={C.green}/>
    {/* 肚子 - 浅绿色 */}
    <ellipse cx="50" cy="65" rx="22" ry="20" fill={C.greenLight} opacity="0.5"/>
    {/* 眼睛白色区域 - 超大圆眼 */}
    <circle cx="35" cy="45" r="16" fill={C.white}/>
    <circle cx="65" cy="45" r="16" fill={C.white}/>
    {/* 眼珠 */}
    <circle cx="38" cy="47" r="9" fill={C.black}/>
    <circle cx="68" cy="47" r="9" fill={C.black}/>
    {/* 大高光 */}
    <circle cx="41" cy="44" r="4" fill={C.white}/>
    <circle cx="71" cy="44" r="4" fill={C.white}/>
    {/* 小高光 */}
    <circle cx="35" cy="50" r="2" fill={C.white}/>
    <circle cx="65" cy="50" r="2" fill={C.white}/>
    {/* 橙色嘴巴 */}
    <path d="M42 68 L50 80 L58 68 Z" fill={C.orange}/>
    <path d="M44 68 L50 76 L56 68 Z" fill={C.yellow}/>
    {/* 眉毛 - 自信表情 */}
    <path d="M24 32 Q30 28 40 32" stroke={C.greenDark} strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M76 32 Q70 28 60 32" stroke={C.greenDark} strokeWidth="3" strokeLinecap="round" fill="none"/>
  </svg>
);

// 🥊 拳击手 Falstaff 风格 - 红色圆润角色
export const BoxerIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 阴影层 */}
    <ellipse cx="50" cy="55" rx="32" ry="35" fill={C.redShadow} transform="translate(0, 3)"/>
    {/* 主体 - 红色圆润 */}
    <ellipse cx="50" cy="52" rx="32" ry="35" fill={C.red}/>
    {/* 拳套效果 - 手臂 */}
    <ellipse cx="22" cy="60" rx="12" ry="14" fill={C.redShadow} transform="translate(0, 3)"/>
    <ellipse cx="78" cy="60" rx="12" ry="14" fill={C.redShadow} transform="translate(0, 3)"/>
    <ellipse cx="22" cy="58" rx="12" ry="14" fill={C.red}/>
    <ellipse cx="78" cy="58" rx="12" ry="14" fill={C.red}/>
    {/* 拳套高光 */}
    <ellipse cx="20" cy="55" rx="6" ry="8" fill={C.redLight} opacity="0.5"/>
    <ellipse cx="76" cy="55" rx="6" ry="8" fill={C.redLight} opacity="0.5"/>
    {/* 头带 */}
    <rect x="22" y="28" width="56" height="8" rx="4" fill={C.white}/>
    {/* 眼睛 - 坚定表情 */}
    <ellipse cx="38" cy="48" rx="8" ry="9" fill={C.white}/>
    <ellipse cx="62" cy="48" rx="8" ry="9" fill={C.white}/>
    <circle cx="40" cy="50" r="5" fill={C.black}/>
    <circle cx="64" cy="50" r="5" fill={C.black}/>
    <circle cx="42" cy="48" r="2" fill={C.white}/>
    <circle cx="66" cy="48" r="2" fill={C.white}/>
    {/* 愤怒眉毛 */}
    <path d="M28 40 L42 44" stroke={C.black} strokeWidth="4" strokeLinecap="round"/>
    <path d="M72 40 L58 44" stroke={C.black} strokeWidth="4" strokeLinecap="round"/>
    {/* 坚定嘴巴 */}
    <path d="M42 68 L58 68" stroke={C.black} strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

// 📅 日历 Lily 风格 - 紫色可爱角色
export const CalendarIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 阴影层 */}
    <rect x="18" y="20" width="64" height="70" rx="10" fill={C.greyDark} transform="translate(0, 3)"/>
    {/* 主体 */}
    <rect x="18" y="17" width="64" height="70" rx="10" fill={C.white}/>
    {/* 紫色头部 - Lily 配色 */}
    <path d="M18 27 C18 21.5 22.5 17 28 17 H72 C77.5 17 82 21.5 82 27 V36 H18 V27 Z" fill={C.purple}/>
    {/* 环扣 */}
    <rect x="30" y="10" width="8" height="16" rx="4" fill={C.purpleShadow}/>
    <rect x="62" y="10" width="8" height="16" rx="4" fill={C.purpleShadow}/>
    {/* Lily 脸部在日历上 */}
    <ellipse cx="50" cy="60" rx="20" ry="22" fill={C.purpleLight}/>
    {/* 眼睛 - Lily 风格半闭眼 */}
    <path d="M40 56 Q44 52 48 56" stroke={C.black} strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M52 56 Q56 52 60 56" stroke={C.black} strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* 微笑 */}
    <path d="M44 68 Q50 73 56 68" stroke={C.purpleShadow} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    {/* 腮红 */}
    <ellipse cx="36" cy="62" rx="4" ry="2.5" fill={C.pink} opacity="0.5"/>
    <ellipse cx="64" cy="62" rx="4" ry="2.5" fill={C.pink} opacity="0.5"/>
  </svg>
);

// 🚀 火箭 - Duo 驾驶火箭
export const RocketIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 火焰 */}
    <path d="M50 82 L38 98 L50 92 L62 98 Z" fill={C.orange}/>
    <path d="M50 84 L42 96 L50 91 L58 96 Z" fill={C.yellow}/>
    {/* 翅膀阴影 */}
    <path d="M28 55 L12 80 H32 Z" fill={C.redShadow} transform="translate(0, 2)"/>
    <path d="M72 55 L88 80 H68 Z" fill={C.redShadow} transform="translate(0, 2)"/>
    {/* 翅膀 */}
    <path d="M28 55 L12 80 H32 Z" fill={C.red}/>
    <path d="M72 55 L88 80 H68 Z" fill={C.red}/>
    {/* 火箭身体阴影 */}
    <ellipse cx="50" cy="48" rx="22" ry="42" fill={C.grey} transform="translate(0, 3)"/>
    {/* 火箭身体 */}
    <ellipse cx="50" cy="45" rx="22" ry="42" fill={C.white}/>
    {/* 窗口 - Duo 脸 */}
    <circle cx="50" cy="38" r="16" fill={C.blueShadow}/>
    <circle cx="50" cy="36" r="14" fill={C.blue}/>
    {/* Duo 在窗口里 */}
    <circle cx="44" cy="34" r="4" fill={C.white}/>
    <circle cx="56" cy="34" r="4" fill={C.white}/>
    <circle cx="45" cy="35" r="2.5" fill={C.black}/>
    <circle cx="57" cy="35" r="2.5" fill={C.black}/>
    <circle cx="46" cy="34" r="1" fill={C.white}/>
    <circle cx="58" cy="34" r="1" fill={C.white}/>
    {/* 小嘴 */}
    <path d="M48 42 L50 45 L52 42 Z" fill={C.orange}/>
    {/* 装饰条纹 */}
    <rect x="46" y="60" width="8" height="10" rx="4" fill={C.red}/>
  </svg>
);

// 👑 皇冠 - 金色可爱皇冠角色
export const CrownIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 阴影层 */}
    <path
      d="M18 72 L8 28 L28 48 L50 12 L72 48 L92 28 L82 72 Z"
      fill={C.yellowShadow}
      transform="translate(0, 3)"
    />
    {/* 主体 */}
    <path
      d="M18 72 L8 28 L28 48 L50 12 L72 48 L92 28 L82 72 Z"
      fill={C.yellow}
    />
    {/* 内部高光 */}
    <path
      d="M24 68 L16 35 L30 50 L50 22 L70 50 L84 35 L76 68 Z"
      fill={C.yellowLight}
      opacity="0.5"
    />
    {/* 底座阴影 */}
    <rect x="18" y="72" width="64" height="16" rx="5" fill={C.yellowShadow} transform="translate(0, 3)"/>
    {/* 底座 */}
    <rect x="18" y="72" width="64" height="16" rx="5" fill={C.yellow}/>
    {/* 宝石 */}
    <circle cx="30" cy="79" r="5" fill={C.red}/>
    <circle cx="50" cy="79" r="6" fill={C.red}/>
    <circle cx="70" cy="79" r="5" fill={C.red}/>
    {/* 宝石高光 */}
    <circle cx="31" cy="77" r="2" fill={C.white} opacity="0.6"/>
    <circle cx="51" cy="77" r="2.5" fill={C.white} opacity="0.6"/>
    <circle cx="71" cy="77" r="2" fill={C.white} opacity="0.6"/>
    {/* 眼睛 */}
    <ellipse cx="40" cy="50" rx="6" ry="7" fill={C.white}/>
    <ellipse cx="60" cy="50" rx="6" ry="7" fill={C.white}/>
    <circle cx="42" cy="52" r="4" fill={C.black}/>
    <circle cx="62" cy="52" r="4" fill={C.black}/>
    <circle cx="43" cy="50" r="1.5" fill={C.white}/>
    <circle cx="63" cy="50" r="1.5" fill={C.white}/>
    {/* 开心嘴巴 */}
    <path d="M44 62 Q50 68 56 62" stroke={C.yellowShadow} strokeWidth="3" strokeLinecap="round" fill="none"/>
  </svg>
);

// ⭐ 星星 - 可爱星星角色
export const StarIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 阴影层 */}
    <path
      d="M50 8 L59 38 H90 L65 56 L74 88 L50 68 L26 88 L35 56 L10 38 H41 Z"
      fill={C.yellowShadow}
      transform="translate(0, 3)"
    />
    {/* 主体 */}
    <path
      d="M50 8 L59 38 H90 L65 56 L74 88 L50 68 L26 88 L35 56 L10 38 H41 Z"
      fill={C.yellow}
    />
    {/* 内部高光 */}
    <path
      d="M50 18 L56 40 H76 L60 52 L66 74 L50 62 L34 74 L40 52 L24 40 H44 Z"
      fill={C.yellowLight}
      opacity="0.5"
    />
    {/* 眼睛 */}
    <ellipse cx="42" cy="48" rx="6" ry="7" fill={C.white}/>
    <ellipse cx="58" cy="48" rx="6" ry="7" fill={C.white}/>
    <circle cx="44" cy="50" r="4" fill={C.black}/>
    <circle cx="60" cy="50" r="4" fill={C.black}/>
    <circle cx="45" cy="48" r="1.5" fill={C.white}/>
    <circle cx="61" cy="48" r="1.5" fill={C.white}/>
    {/* 开心嘴巴 */}
    <path d="M45 60 Q50 66 55 60" stroke={C.yellowShadow} strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* 腮红 */}
    <ellipse cx="34" cy="54" rx="4" ry="2.5" fill={C.orange} opacity="0.4"/>
    <ellipse cx="66" cy="54" rx="4" ry="2.5" fill={C.orange} opacity="0.4"/>
  </svg>
);

// 💎 钻石 - Zari 风格紫色钻石角色
export const DiamondIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 阴影层 */}
    <path
      d="M16 36 L50 92 L84 36 L70 10 H30 Z"
      fill={C.purpleShadow}
      transform="translate(0, 3)"
    />
    {/* 主体 */}
    <path
      d="M16 36 L50 92 L84 36 L70 10 H30 Z"
      fill={C.purple}
    />
    {/* 高光面 */}
    <path d="M30 10 L50 36 L70 10" fill="#F0D4FF"/>
    <path d="M16 36 L30 10 L50 36" fill={C.purpleLight}/>
    <path d="M84 36 L70 10 L50 36" fill={C.purpleLight}/>
    {/* 内部反射 */}
    <path d="M50 36 L40 55 L50 75 L60 55 Z" fill={C.white} opacity="0.2"/>
    {/* 眼睛 - 闪亮眼睛 */}
    <ellipse cx="40" cy="48" rx="7" ry="8" fill={C.white}/>
    <ellipse cx="60" cy="48" rx="7" ry="8" fill={C.white}/>
    <circle cx="42" cy="50" r="4.5" fill={C.purpleShadow}/>
    <circle cx="62" cy="50" r="4.5" fill={C.purpleShadow}/>
    <circle cx="44" cy="48" r="2" fill={C.white}/>
    <circle cx="64" cy="48" r="2" fill={C.white}/>
    {/* 优雅微笑 */}
    <path d="M44 64 Q50 70 56 64" stroke={C.white} strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* 闪光装饰 */}
    <circle cx="25" cy="25" r="3" fill={C.white} opacity="0.8"/>
    <circle cx="78" cy="20" r="2" fill={C.white} opacity="0.6"/>
  </svg>
);

// 🏆 奖杯 - 金色可爱奖杯
export const TrophyIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 把手阴影 */}
    <path d="M22 30 H12 C6 30 6 52 14 52 H24" stroke={C.yellowShadow} strokeWidth="8" strokeLinecap="round" fill="none" transform="translate(0, 3)"/>
    <path d="M78 30 H88 C94 30 94 52 86 52 H76" stroke={C.yellowShadow} strokeWidth="8" strokeLinecap="round" fill="none" transform="translate(0, 3)"/>
    {/* 把手 */}
    <path d="M22 30 H12 C6 30 6 52 14 52 H24" stroke={C.yellow} strokeWidth="8" strokeLinecap="round" fill="none"/>
    <path d="M78 30 H88 C94 30 94 52 86 52 H76" stroke={C.yellow} strokeWidth="8" strokeLinecap="round" fill="none"/>
    {/* 杯身阴影 */}
    <path d="M26 16 H74 V32 C74 56 64 66 50 66 C36 66 26 56 26 32 V16 Z" fill={C.yellowShadow} transform="translate(0, 3)"/>
    {/* 杯身 */}
    <path d="M26 16 H74 V32 C74 56 64 66 50 66 C36 66 26 56 26 32 V16 Z" fill={C.yellow}/>
    {/* 杯身高光 */}
    <path d="M32 20 H68 V32 C68 50 60 58 50 60 C40 58 32 50 32 32 V20 Z" fill={C.yellowLight} opacity="0.5"/>
    {/* 眼睛 */}
    <ellipse cx="40" cy="38" rx="7" ry="8" fill={C.white}/>
    <ellipse cx="60" cy="38" rx="7" ry="8" fill={C.white}/>
    <circle cx="42" cy="40" r="4.5" fill={C.black}/>
    <circle cx="62" cy="40" r="4.5" fill={C.black}/>
    <circle cx="44" cy="38" r="2" fill={C.white}/>
    <circle cx="64" cy="38" r="2" fill={C.white}/>
    {/* 开心嘴巴 */}
    <path d="M44 52 Q50 58 56 52" stroke={C.yellowShadow} strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* 底座 */}
    <rect x="38" y="68" width="24" height="8" rx="3" fill={C.yellowShadow} transform="translate(0, 2)"/>
    <rect x="38" y="66" width="24" height="8" rx="3" fill={C.yellow}/>
    <rect x="30" y="76" width="40" height="12" rx="4" fill={C.yellowShadow} transform="translate(0, 2)"/>
    <rect x="30" y="74" width="40" height="12" rx="4" fill={C.yellow}/>
  </svg>
);

// 🏅 奖牌 - 可爱奖牌角色
export const MedalIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 丝带 */}
    <path d="M32 5 L26 45 L50 55 L74 45 L68 5 H32 Z" fill={C.redShadow} transform="translate(0, 2)"/>
    <path d="M32 5 L26 45 L50 55 L74 45 L68 5 H32 Z" fill={C.red}/>
    {/* 丝带条纹 */}
    <path d="M38 5 L34 45 L50 52 L50 5 H38 Z" fill={C.redLight}/>
    <path d="M62 5 L66 45 L50 52 L50 5 H62 Z" fill={C.redLight}/>
    {/* 奖牌阴影 */}
    <circle cx="50" cy="68" r="28" fill={C.yellowShadow} transform="translate(0, 3)"/>
    {/* 奖牌主体 */}
    <circle cx="50" cy="65" r="28" fill={C.yellow}/>
    {/* 奖牌内圈 */}
    <circle cx="50" cy="65" r="22" fill={C.yellowLight}/>
    {/* 眼睛 */}
    <ellipse cx="42" cy="62" rx="6" ry="7" fill={C.white}/>
    <ellipse cx="58" cy="62" rx="6" ry="7" fill={C.white}/>
    <circle cx="44" cy="64" r="4" fill={C.black}/>
    <circle cx="60" cy="64" r="4" fill={C.black}/>
    <circle cx="45" cy="62" r="1.5" fill={C.white}/>
    <circle cx="61" cy="62" r="1.5" fill={C.white}/>
    {/* 开心嘴巴 */}
    <path d="M45 75 Q50 81 55 75" stroke={C.yellowShadow} strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* 腮红 */}
    <ellipse cx="34" cy="68" rx="4" ry="2.5" fill={C.orange} opacity="0.4"/>
    <ellipse cx="66" cy="68" rx="4" ry="2.5" fill={C.orange} opacity="0.4"/>
  </svg>
);

// 📚 书本 - Duo 读书
export const BookIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 书皮阴影 */}
    <rect x="14" y="28" width="72" height="65" rx="6" fill={C.blueShadow} transform="translate(0, 3)"/>
    {/* 书皮 */}
    <rect x="14" y="25" width="72" height="65" rx="6" fill={C.blue}/>
    {/* 书页 */}
    <rect x="18" y="30" width="64" height="57" rx="4" fill={C.white}/>
    {/* Duo 从书后面探出头 */}
    <ellipse cx="50" cy="24" rx="24" ry="22" fill={C.greenShadow} transform="translate(0, 2)"/>
    <ellipse cx="50" cy="22" rx="24" ry="22" fill={C.green}/>
    {/* 耳朵 */}
    <path d="M30 12 Q26 4 32 8 L36 16 Z" fill={C.green}/>
    <path d="M70 12 Q74 4 68 8 L64 16 Z" fill={C.green}/>
    {/* Duo 眼睛 */}
    <circle cx="42" cy="18" r="8" fill={C.white}/>
    <circle cx="58" cy="18" r="8" fill={C.white}/>
    <circle cx="44" cy="20" r="5" fill={C.black}/>
    <circle cx="60" cy="20" r="5" fill={C.black}/>
    <circle cx="46" cy="18" r="2" fill={C.white}/>
    <circle cx="62" cy="18" r="2" fill={C.white}/>
    {/* Duo 嘴巴 */}
    <path d="M46 30 L50 36 L54 30 Z" fill={C.orange}/>
    {/* 文字线条 */}
    <line x1="26" y1="50" x2="74" y2="50" stroke={C.grey} strokeWidth="4" strokeLinecap="round"/>
    <line x1="26" y1="62" x2="74" y2="62" stroke={C.grey} strokeWidth="4" strokeLinecap="round"/>
    <line x1="26" y1="74" x2="58" y2="74" stroke={C.grey} strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

// 🗺️ 探险家 - Eddy 风格探险家
export const ExplorerIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 阴影层 */}
    <ellipse cx="50" cy="58" rx="30" ry="34" fill={C.yellowShadow} transform="translate(0, 3)"/>
    {/* 身体 - 黄橙色圆润 */}
    <ellipse cx="50" cy="55" rx="30" ry="34" fill={C.skinLight}/>
    {/* 头发 */}
    <ellipse cx="50" cy="28" rx="26" ry="14" fill="#8B4513"/>
    {/* 探险帽阴影 */}
    <path d="M16 35 H84 V42 C84 45 80 48 76 48 H24 C20 48 16 45 16 42 V35 Z" fill="#8B6914" transform="translate(0, 2)"/>
    <ellipse cx="50" cy="28" rx="22" ry="12" fill="#8B6914" transform="translate(0, 2)"/>
    {/* 探险帽 */}
    <path d="M16 35 H84 V42 C84 45 80 48 76 48 H24 C20 48 16 45 16 42 V35 Z" fill="#C9A227"/>
    <ellipse cx="50" cy="26" rx="22" ry="12" fill="#C9A227"/>
    {/* 帽带 */}
    <rect x="28" y="28" width="44" height="5" fill="#8B4513"/>
    {/* 眼睛 */}
    <ellipse cx="40" cy="55" rx="8" ry="9" fill={C.white}/>
    <ellipse cx="60" cy="55" rx="8" ry="9" fill={C.white}/>
    <circle cx="42" cy="57" r="5" fill={C.black}/>
    <circle cx="62" cy="57" r="5" fill={C.black}/>
    <circle cx="44" cy="55" r="2" fill={C.white}/>
    <circle cx="64" cy="55" r="2" fill={C.white}/>
    {/* 微笑 */}
    <path d="M42 72 Q50 80 58 72" stroke="#C4A484" strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* 领巾 */}
    <path d="M35 88 L50 98 L65 88 Z" fill={C.redShadow} transform="translate(0, 2)"/>
    <path d="M35 86 L50 96 L65 86 Z" fill={C.red}/>
  </svg>
);

// 💪 传奇 - 举起奖杯的 Duo
export const LegendIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 手臂阴影 */}
    <path d="M15 95 V60 C15 52 22 50 28 55 V45" stroke={C.greenShadow} strokeWidth="14" strokeLinecap="round" fill="none" transform="translate(0, 2)"/>
    <path d="M85 95 V60 C85 52 78 50 72 55 V45" stroke={C.greenShadow} strokeWidth="14" strokeLinecap="round" fill="none" transform="translate(0, 2)"/>
    {/* 手臂 - Duo 绿色 */}
    <path d="M15 95 V60 C15 52 22 50 28 55 V45" stroke={C.green} strokeWidth="14" strokeLinecap="round" fill="none"/>
    <path d="M85 95 V60 C85 52 78 50 72 55 V45" stroke={C.green} strokeWidth="14" strokeLinecap="round" fill="none"/>
    {/* 奖杯阴影 */}
    <path d="M30 10 H70 V22 C70 38 62 44 50 44 C38 44 30 38 30 22 V10 Z" fill={C.yellowShadow} transform="translate(0, 3)"/>
    {/* 奖杯 */}
    <path d="M30 10 H70 V22 C70 38 62 44 50 44 C38 44 30 38 30 22 V10 Z" fill={C.yellow}/>
    {/* 奖杯高光 */}
    <path d="M36 14 H64 V22 C64 34 58 38 50 40 C42 38 36 34 36 22 V14 Z" fill={C.yellowLight} opacity="0.5"/>
    {/* 奖杯眼睛 */}
    <ellipse cx="43" cy="24" rx="5" ry="6" fill={C.white}/>
    <ellipse cx="57" cy="24" rx="5" ry="6" fill={C.white}/>
    <circle cx="44" cy="26" r="3.5" fill={C.black}/>
    <circle cx="58" cy="26" r="3.5" fill={C.black}/>
    <circle cx="45.5" cy="24.5" r="1.5" fill={C.white}/>
    <circle cx="59.5" cy="24.5" r="1.5" fill={C.white}/>
    {/* 奖杯嘴巴 */}
    <path d="M46 34 Q50 38 54 34" stroke={C.yellowShadow} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    {/* 奖杯底座 */}
    <rect x="40" y="46" width="20" height="6" rx="3" fill={C.yellowShadow} transform="translate(0, 2)"/>
    <rect x="40" y="44" width="20" height="6" rx="3" fill={C.yellow}/>
  </svg>
);

// 🎨 画家 - 艺术家角色（保留）
export const CrafterIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 阴影层 */}
    <ellipse cx="50" cy="58" rx="30" ry="34" fill={C.pinkShadow} transform="translate(0, 3)"/>
    {/* 身体 */}
    <ellipse cx="50" cy="55" rx="30" ry="34" fill={C.skinPink}/>
    {/* 头发 */}
    <ellipse cx="50" cy="28" rx="28" ry="16" fill={C.purple}/>
    {/* 贝雷帽阴影 */}
    <ellipse cx="50" cy="22" rx="28" ry="12" fill={C.redShadow} transform="translate(0, 2)"/>
    {/* 贝雷帽 */}
    <ellipse cx="50" cy="20" rx="28" ry="12" fill={C.red}/>
    <circle cx="50" cy="10" r="5" fill={C.red}/>
    {/* 眼睛 */}
    <ellipse cx="40" cy="52" rx="8" ry="9" fill={C.white}/>
    <ellipse cx="60" cy="52" rx="8" ry="9" fill={C.white}/>
    <circle cx="42" cy="54" r="5" fill={C.black}/>
    <circle cx="62" cy="54" r="5" fill={C.black}/>
    <circle cx="44" cy="52" r="2" fill={C.white}/>
    <circle cx="64" cy="52" r="2" fill={C.white}/>
    {/* 微笑 */}
    <path d="M42 70 Q50 78 58 70" stroke={C.pinkShadow} strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* 腮红 */}
    <ellipse cx="30" cy="60" rx="5" ry="3" fill={C.pink} opacity="0.5"/>
    <ellipse cx="70" cy="60" rx="5" ry="3" fill={C.pink} opacity="0.5"/>
  </svg>
);

// 🎊 啦啦队 - Zari 风格
export const CheerleaderIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 阴影层 */}
    <ellipse cx="50" cy="58" rx="30" ry="34" fill="#A0826D" transform="translate(0, 3)"/>
    {/* 身体 */}
    <ellipse cx="50" cy="55" rx="30" ry="34" fill={C.skinDark}/>
    {/* 头发 */}
    <ellipse cx="50" cy="26" rx="32" ry="18" fill={C.black}/>
    {/* 大蝴蝶结 */}
    <path d="M18 18 L40 32 L30 42 Z" fill={C.pink}/>
    <path d="M82 18 L60 32 L70 42 Z" fill={C.pink}/>
    <circle cx="50" cy="25" r="10" fill={C.pink}/>
    <circle cx="50" cy="25" r="6" fill={C.pinkShadow}/>
    {/* 眼睛 */}
    <ellipse cx="40" cy="52" rx="8" ry="9" fill={C.white}/>
    <ellipse cx="60" cy="52" rx="8" ry="9" fill={C.white}/>
    <circle cx="42" cy="54" r="5" fill={C.black}/>
    <circle cx="62" cy="54" r="5" fill={C.black}/>
    <circle cx="44" cy="52" r="2" fill={C.white}/>
    <circle cx="64" cy="52" r="2" fill={C.white}/>
    {/* 开心嘴巴 */}
    <path d="M42 70 Q50 78 58 70" stroke="#A0826D" strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* 腮红 */}
    <ellipse cx="30" cy="60" rx="5" ry="3" fill={C.pink} opacity="0.5"/>
    <ellipse cx="70" cy="60" rx="5" ry="3" fill={C.pink} opacity="0.5"/>
  </svg>
);

// 🐻 早晨熊 - 可爱睡熊（保留）
export const MorningBearIcon: React.FC<IconProps> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    {/* 耳朵阴影 */}
    <circle cx="26" cy="25" r="12" fill="#8B6914" transform="translate(0, 2)"/>
    <circle cx="74" cy="25" r="12" fill="#8B6914" transform="translate(0, 2)"/>
    {/* 耳朵 */}
    <circle cx="26" cy="23" r="12" fill="#C49A6C"/>
    <circle cx="74" cy="23" r="12" fill="#C49A6C"/>
    <circle cx="26" cy="23" r="7" fill="#E8D4C4"/>
    <circle cx="74" cy="23" r="7" fill="#E8D4C4"/>
    {/* 身体阴影 */}
    <ellipse cx="50" cy="58" rx="32" ry="36" fill="#A67C52" transform="translate(0, 3)"/>
    {/* 身体 */}
    <ellipse cx="50" cy="55" rx="32" ry="36" fill="#C49A6C"/>
    {/* 嘴部区域 */}
    <ellipse cx="50" cy="68" rx="16" ry="12" fill="#E8D4C4"/>
    {/* 鼻子 */}
    <ellipse cx="50" cy="62" rx="5" ry="3.5" fill={C.black}/>
    {/* 嘴巴 */}
    <path d="M50 65 V70 M44 70 Q50 74 56 70" stroke={C.black} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    {/* 闭着的眼睛 - 睡觉 */}
    <path d="M34 50 Q40 46 46 50" stroke={C.black} strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M54 50 Q60 46 66 50" stroke={C.black} strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* 睡帽 */}
    <path d="M28 28 Q42 5 62 12 Q75 18 78 30" fill={C.blueShadow} transform="translate(0, 2)"/>
    <path d="M28 26 Q42 3 62 10 Q75 16 78 28" fill={C.blue}/>
    <circle cx="78" cy="26" r="6" fill={C.white}/>
    {/* Zzz */}
    <path d="M82 48 L90 48 L82 58 L90 58" stroke={C.blue} strokeWidth="3" fill="none"/>
  </svg>
);

// ==================== 导出配置 ====================

export const AchievementIconMap = {
  flame: FlameIcon,
  bolt: BoltBirdIcon,
  duo: DuoOwlIcon,
  boxer: BoxerIcon,
  bear: MorningBearIcon,
  explorer: ExplorerIcon,
  crafter: CrafterIcon,
  cheerleader: CheerleaderIcon,
  legend: LegendIcon,
  trophy: TrophyIcon,
  crown: CrownIcon,
  calendar: CalendarIcon,
  rocket: RocketIcon,
  star: StarIcon,
  diamond: DiamondIcon,
  medal: MedalIcon,
  book: BookIcon,
} as const;

export type AchievementIconType = keyof typeof AchievementIconMap;

export default AchievementIconMap;

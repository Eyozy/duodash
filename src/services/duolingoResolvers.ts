import type { DuolingoRawUser, Course } from "../types";

/**
 * 从原始数据中解析课程列表
 */
export function resolveCourses(rawData: DuolingoRawUser): Course[] {
  let courses: Course[] = [];

  // 从 courses 字段解析
  if (rawData.courses?.length) {
    courses = rawData.courses
      .filter((c) => (c.xp || 0) > 0 || c.current_learning)
      .map(c => ({
        title: c.title || c.subject?.replace(/^\w/, s => s.toUpperCase()) || c.id,
        xp: c.xp,
        fromLanguage: c.fromLanguage,
        learningLanguage: c.learningLanguage,
        crowns: c.crowns || 0,
        id: c.id,
        subject: c.subject,
      }));
  }

  // 从 languages 字段补充（V1 API）
  if (rawData.languages?.length) {
    const v1Courses = rawData.languages
      .filter((l) => l.points > 0 || l.current_learning)
      .map((l) => ({
        id: l.language,
        title: l.language_string,
        xp: l.points || 0,
        crowns: l.crowns || 0,
        fromLanguage: 'en',
        learningLanguage: l.language,
      }));

    for (const v1c of v1Courses) {
      const exists = courses.some(c =>
        c.title === v1c.title ||
        c.learningLanguage === v1c.learningLanguage ||
        (c.id && v1c.id && c.id.includes(v1c.id))
      );
      if (!exists) courses.push(v1c);
    }
  }

  // 从 language_data 字段解析（备用）
  if (courses.length === 0 && rawData.language_data) {
    courses = Object.entries(rawData.language_data)
      .filter(([_, langDetail]) => {
        const xp = langDetail.points || langDetail.level_progress || 0;
        return xp > 0 || langDetail.current_learning;
      })
      .map(([langCode, langDetail]) => {
        let crowns = langDetail.crowns || 0;
        if (crowns === 0 && langDetail.skills?.length) {
          crowns = langDetail.skills.reduce((acc, skill) =>
            acc + (skill.levels_finished || skill.crowns || skill.finishedLevels || 0), 0);
        }
        return {
          id: langDetail.learning_language || langCode,
          title: langDetail.language_string,
          xp: langDetail.points || langDetail.level_progress || 0,
          crowns,
          fromLanguage: langDetail.from_language || 'en',
          learningLanguage: langDetail.learning_language || langCode,
        };
      });
  }

  return courses;
}

/**
 * 解析当前学习的语言
 */
export function resolveLearningLanguage(rawData: DuolingoRawUser, courses: Course[]): string {
  // 新接口顶层 learningLanguage 是语言代码，从 courses 中找对应名称
  const langCode = rawData.learningLanguage
    || rawData.currentCourse?.learningLanguage;

  if (langCode) {
    const matched = courses.find(c => c.learningLanguage === langCode || c.id === langCode);
    if (matched) return matched.title;
  }

  if (rawData.language_data) {
    const current = Object.values(rawData.language_data).find(l => l.current_learning);
    return current?.language_string ?? courses[0]?.title ?? 'None';
  }

  if (rawData.currentCourse?.title) {
    return rawData.currentCourse.title;
  }

  return courses[0]?.title ?? 'None';
}

/**
 * 解析联赛等级索引
 */
export function resolveTierIndex(rawData: DuolingoRawUser): number {
  if (rawData.tier !== undefined && rawData.tier >= 0 && rawData.tier <= 10) return rawData.tier;
  if (rawData.trackingProperties?.league_tier !== undefined) return rawData.trackingProperties.league_tier;
  if (rawData.trackingProperties?.leaderboard_league !== undefined) return rawData.trackingProperties.leaderboard_league;
  if (rawData.tracking_properties?.league_tier !== undefined) return rawData.tracking_properties.league_tier;
  if (rawData.tracking_properties?.leaderboard_league !== undefined) return rawData.tracking_properties.leaderboard_league;

  if (rawData.language_data) {
    const currentLang = Object.values(rawData.language_data).find((l) => l.current_learning);
    if (currentLang?.tier !== undefined) return currentLang.tier;
  }

  return -1;
}

/**
 * 解析账号创建日期
 */
export function parseCreationDate(
  creationTs: number | undefined,
  created: string | undefined,
  calcDaysSince: (date: Date, timeZone?: string) => number,
  timeZone?: string
): { dateStr: string; ageDays: number } {
  if (creationTs) {
    const ts = creationTs < 10000000000 ? creationTs * 1000 : creationTs;
    const cDate = new Date(ts);
    if (!isNaN(cDate.getTime())) {
      return {
        dateStr: cDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', timeZone }),
        ageDays: calcDaysSince(cDate, timeZone)
      };
    }
  }

  if (created) {
    const cDate = new Date(created);
    if (!isNaN(cDate.getTime())) {
      return {
        dateStr: cDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', timeZone }),
        ageDays: calcDaysSince(cDate, timeZone)
      };
    }
  }

  return { dateStr: '未知', ageDays: 0 };
}

/**
 * 解析 Plus 订阅状态
 */
export function resolveIsPlus(rawData: DuolingoRawUser): boolean {
  const hasInventoryPremium = rawData.inventory?.premium_subscription || rawData.inventory?.super_subscription;
  const hasItemPremium = rawData.has_item_premium_subscription || rawData.has_item_immersive_subscription;

  return !!(
    rawData.hasPlus ||
    rawData.hasSuper ||
    rawData.plusStatus === 'active' ||
    rawData.has_plus ||
    rawData.is_plus ||
    hasInventoryPremium ||
    hasItemPremium
  );
}

/**
 * 计算总 XP
 */
export function resolveTotalXp(rawData: DuolingoRawUser): number {
  let totalXp = rawData.total_xp ?? rawData.totalXp ?? 0;

  if (totalXp === 0) {
    totalXp = sumPoints(rawData.languages);
  }

  if (totalXp === 0 && rawData.language_data) {
    totalXp = sumPoints(Object.values(rawData.language_data));
  }

  if (totalXp === 0) {
    totalXp = sumPoints(rawData.courses);
  }

  return totalXp;
}

/**
 * 辅助函数：求和 points/xp
 */
function sumPoints(items: Array<{ points?: number; xp?: number }> | undefined): number {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (item.points || item.xp || 0), 0);
}

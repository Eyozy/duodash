const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_TIMEZONE = typeof Intl !== 'undefined'
  ? Intl.DateTimeFormat().resolvedOptions().timeZone
  : 'Asia/Shanghai';

export function resolveTimeZone(timeZone?: string): string {
  if (!timeZone) {
    return DEFAULT_TIMEZONE;
  }

  try {
    Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
    return timeZone;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/**
 * 获取日期格式化器
 */
function getDateFormatter(timeZone: string = DEFAULT_TIMEZONE): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone
  });
}

/**
 * 将 Date 对象转换为 YYYY-MM-DD 格式的本地日期键
 * 使用用户浏览器的本地时区
 */
export function toLocalDateKey(date: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  const resolvedTimeZone = resolveTimeZone(timeZone);
  try {
    const formatter = getDateFormatter(resolvedTimeZone);
    return formatter.format(date);
  } catch {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * 获取指定时区的当天开始时间戳（毫秒）
 */
export function getStartOfDayInTimezone(date: Date, timeZone: string = DEFAULT_TIMEZONE): number {
  const resolvedTimeZone = resolveTimeZone(timeZone);
  const dateKey = toLocalDateKey(date, resolvedTimeZone);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: resolvedTimeZone,
    timeZoneName: 'shortOffset'
  });
  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value || '+08:00';
  const offsetMatch = offsetPart.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  const offset = offsetMatch
    ? `${offsetMatch[1]}${offsetMatch[2].padStart(2, '0')}:${(offsetMatch[3] || '00').padStart(2, '0')}`
    : '+08:00';
  return new Date(`${dateKey}T00:00:00${offset}`).getTime();
}

function isSameLocalDay(
  firstTimestamp: number,
  secondTimestamp: number,
  timeZone: string = DEFAULT_TIMEZONE
): boolean {
  return toLocalDateKey(new Date(firstTimestamp), timeZone) === toLocalDateKey(new Date(secondTimestamp), timeZone);
}

export function isFreshSameDayCache(
  timestamp: number,
  ttlMs: number,
  now: number = Date.now(),
  timeZone: string = DEFAULT_TIMEZONE
): boolean {
  return now - timestamp < ttlMs && isSameLocalDay(timestamp, now, timeZone);
}

/**
 * 将 xpSummary 的日期字段解析为日期键
 */
export function parseSummaryDateKey(date: number | string, timeZone: string = DEFAULT_TIMEZONE): string | null {
  const resolvedTimeZone = resolveTimeZone(timeZone);
  if (typeof date === 'number') {
    const d = new Date(date * 1000);
    if (isNaN(d.getTime())) return null;
    return toLocalDateKey(d, resolvedTimeZone);
  }
  const utcDate = new Date(String(date).replace(/\//g, '-') + 'T00:00:00Z');
  if (isNaN(utcDate.getTime())) return null;
  return toLocalDateKey(utcDate, resolvedTimeZone);
}

/**
 * 获取指定日期的开始时间（00:00:00）
 */
function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 获取指定日期所在自然周的周一
 */
export function getMonday(date: Date, timeZone: string = DEFAULT_TIMEZONE): Date {
  const resolvedTimeZone = resolveTimeZone(timeZone);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    timeZone: resolvedTimeZone
  });

  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '2024');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');

  const localDate = new Date(year, month, day);
  const dayOfWeek = localDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(localDate);
  monday.setDate(localDate.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);

  return monday;
}

/**
 * 计算从指定日期到今天的天数
 */
export function calcDaysSince(createdAt: Date, timeZone: string = DEFAULT_TIMEZONE): number {
  const diffMs = getStartOfDayInTimezone(new Date(), timeZone) - getStartOfDayInTimezone(createdAt, timeZone);
  return Math.max(0, Math.floor(diffMs / MS_PER_DAY));
}

/**
 * 格式化日期为"月/日"格式
 */
export function formatMonthDay(date: Date): string {
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
}

export function formatMonthDayInTimeZone(date: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  return date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    timeZone: resolveTimeZone(timeZone)
  });
}

export function formatFullDateInTimeZone(date: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: resolveTimeZone(timeZone)
  });
}

/**
 * 格式化时长（分钟）为"X 小时 Y 分钟"格式
 */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) {
    return `${minutes}分钟`;
  }
  return minutes > 0 ? `${hours}小时 ${minutes}分钟` : `${hours}小时`;
}

export { MS_PER_DAY };
